package com.lumapse.app;

import android.app.Instrumentation;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Process;
import android.os.SystemClock;
import android.util.AtomicFile;
import android.webkit.TracingConfig;
import android.webkit.TracingController;
import android.webkit.WebView;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import org.json.JSONObject;
import org.junit.Assume;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.MessageDigest;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/** Opt-in diagnostic only: never measures or accepts an RNF. No production hooks. */
@RunWith(AndroidJUnit4.class)
public class WebViewTracePilotTest {
    private static final String TARGET = "com.lumapse.app";
    private static final String HELPER = TARGET + ".test";
    private static final long PREPARE_MS = 120_000;
    private static final long FLUSH_SECONDS = 30;
    private File directory;
    private final JSONObject metadata = new JSONObject();

    @Test
    public void capturePilot() throws Exception {
        Bundle args = InstrumentationRegistry.getArguments();
        // Ordinary Android test runs must not start a recording or launch the app.
        Assume.assumeTrue("Explicit pilot opt-in required", "yes".equals(args.getString("f3Pilot")));
        if (Build.VERSION.SDK_INT < 28) throw new IllegalStateException("API_BELOW_28");
        String runId = args.getString("runId", "");
        if (!runId.matches("[a-f0-9]{32}")) throw new IllegalArgumentException("INVALID_RUN_ID");
        int captureMs = Integer.parseInt(args.getString("captureMs", "8000"));
        // Reserve two seconds for scheduling/stop; observed overrun >10s invalidates the pilot.
        if (captureMs < 1000 || captureMs > 8000) throw new IllegalArgumentException("INVALID_DURATION");
        Instrumentation instrumentation = InstrumentationRegistry.getInstrumentation();
        Context target = instrumentation.getTargetContext();
        if (!TARGET.equals(target.getPackageName())
                || !HELPER.equals(instrumentation.getContext().getPackageName())
                || Process.myUid() != target.getApplicationInfo().uid
                || !TARGET.equals(android.app.Application.getProcessName())) {
            throw new IllegalStateException("WRONG_TARGET_PROCESS");
        }
        directory = new File(target.getCacheDir(), "f3-webview-pilot/" + runId);
        if (directory.exists() || !directory.mkdirs()) throw new IOException("RUN_DIRECTORY_EXISTS_OR_UNAVAILABLE");
        metadata.put("run_id", runId).put("target_package", TARGET).put("helper_package", HELPER)
                .put("target_pid", Process.myPid()).put("target_uid", Process.myUid())
                .put("process_name", android.app.Application.getProcessName())
                .put("api", Build.VERSION.SDK_INT).put("android", Build.VERSION.RELEASE)
                .put("model", Build.MODEL).put("requested_capture_ms", captureMs)
                .put("instrumentation_may_restart_target", true)
                .put("scope", "WebViews of the instrumented Lumapse process and its WebView renderer")
                .put("categories", "FRAME_VIEWER|INPUT_LATENCY|RENDERING")
                .put("tracing_mode", "RECORD_UNTIL_FULL").put("custom_categories", new org.json.JSONArray())
                .put("overhead", "uncalibrated; instrumentation, WebView tracing and status polling")
                .put("rnf_002", "PENDING").put("rnf_004", "PENDING");

        final TracingController[] controller = new TracingController[1];
        final boolean[] owned = {false};
        ClosedTrace output = null;
        ExecutorService executor = Executors.newSingleThreadExecutor(r -> {
            Thread thread = new Thread(r, "f3-trace-writer");
            thread.setDaemon(true);
            return thread;
        });
        try {
            onMain(instrumentation, () -> {
                controller[0] = TracingController.getInstance();
                if (controller[0].isTracing()) throw new IllegalStateException("TRACE_ALREADY_ACTIVE");
            });
            Intent launch = target.getPackageManager().getLaunchIntentForPackage(TARGET);
            if (launch == null) throw new IllegalStateException("NO_TARGET_ACTIVITY");
            instrumentation.startActivitySync(launch);
            onMain(instrumentation, () -> {
                try {
                    metadata.put("webview_package", WebView.getCurrentWebViewPackage().packageName)
                            .put("webview_version", WebView.getCurrentWebViewPackage().versionName);
                } catch (Exception e) {
                    throw new IllegalStateException("WEBVIEW_IDENTITY_UNAVAILABLE", e);
                }
            });
            status("READY");
            long deadline = SystemClock.elapsedRealtime() + PREPARE_MS;
            File signal = new File(directory, "start.signal");
            while (!signal.isFile()) {
                if (SystemClock.elapsedRealtime() >= deadline) throw new IOException("PREPARATION_TIMEOUT");
                SystemClock.sleep(100);
            }
            if (!runId.equals(new String(Files.readAllBytes(signal.toPath()), StandardCharsets.US_ASCII).trim())) {
                throw new IOException("INVALID_START_SIGNAL");
            }
            output = new ClosedTrace(new File(directory, "trace.json"), executor);
            long startCallBefore = SystemClock.elapsedRealtimeNanos();
            metadata.put("start_call_before_elapsed_ns", startCallBefore);
            onMain(instrumentation, () -> {
                // Recheck after preparation. Never stop a recording owned by another caller.
                if (controller[0].isTracing()) throw new IllegalStateException("TRACE_ALREADY_ACTIVE");
                controller[0].start(new TracingConfig.Builder()
                        .addCategories(TracingConfig.CATEGORIES_FRAME_VIEWER,
                                TracingConfig.CATEGORIES_INPUT_LATENCY, TracingConfig.CATEGORIES_RENDERING)
                        .setTracingMode(TracingConfig.RECORD_UNTIL_FULL).build());
                owned[0] = true;
            });
            long started = SystemClock.elapsedRealtime();
            metadata.put("start_call_after_elapsed_ns", SystemClock.elapsedRealtimeNanos());
            status("CAPTURING");
            long remaining = captureMs - (SystemClock.elapsedRealtime() - started);
            if (remaining > 0) SystemClock.sleep(remaining);
            metadata.put("stop_call_before_elapsed_ns", SystemClock.elapsedRealtimeNanos());
            stopOwned(instrumentation, controller[0], owned, output, executor);
            long stopped = SystemClock.elapsedRealtime();
            long stopCallAfter = SystemClock.elapsedRealtimeNanos();
            long captureCallSpanNs = stopCallAfter - startCallBefore;
            metadata.put("stop_call_after_elapsed_ns", stopCallAfter)
                    .put("observed_start_return_to_stop_return_ms", stopped - started)
                    .put("capture_call_span_ms", captureCallSpanNs / 1_000_000.0);
            if (!output.closed.await(FLUSH_SECONDS, TimeUnit.SECONDS)) throw new IOException("FLUSH_TIMEOUT");
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) throw new IOException("EXECUTOR_TIMEOUT");
            if (output.failure != null) throw output.failure;
            if (captureCallSpanNs > TimeUnit.SECONDS.toNanos(10)) throw new IOException("CAPTURE_OVERRUN");
            if (output.bytes == 0) throw new IOException("EMPTY_TRACE");
            metadata.put("output_stream_closed", true).put("trace_bytes", output.bytes)
                    .put("trace_sha256", output.sha256()).put("flush_closed_elapsed_ns", output.closedAt);
            status("CAPTURED"); // Successful transfer candidate, not valid CRUD/FPS evidence.
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().matches("[A-Z_]+")) metadata.put("error_code", e.getMessage());
            try { status("ERROR", e.getClass().getSimpleName()); } catch (Exception ignored) { /* original error wins */ }
            throw e;
        } finally {
            if (owned[0] && output != null) {
                // Error path owns this recording only. Do not close its stream during SDK writes.
                stopOwned(instrumentation, controller[0], owned, output, executor);
                output.closed.await(FLUSH_SECONDS, TimeUnit.SECONDS);
            } else if (output != null && !output.handedToSdk) {
                output.close();
            }
            // A late SDK close() shuts down its own executor. A timeout must not reject
            // still-arriving callbacks or close their stream concurrently.
            if (output == null || !output.handedToSdk) executor.shutdown();
        }
    }

    private static void stopOwned(Instrumentation instrumentation, TracingController controller,
            boolean[] owned, ClosedTrace output, ExecutorService executor) throws Exception {
        onMain(instrumentation, () -> {
            if (!owned[0]) return;
            // A failed stop cannot be retried against a later, unrelated recording.
            owned[0] = false;
            output.handedToSdk = controller.stop(output, executor);
            if (!output.handedToSdk) throw new IllegalStateException("OWNED_TRACE_NOT_ACTIVE");
        });
    }

    private interface MainAction { void run() throws Exception; }

    private static void onMain(Instrumentation instrumentation, MainAction action) throws Exception {
        // runOnMainSync does not transport callback exceptions back to the test thread.
        // Never let an exception kill the UI thread or strand its SyncRunnable wait.
        final Throwable[] error = {null};
        instrumentation.runOnMainSync(() -> {
            try { action.run(); } catch (Throwable e) { error[0] = e; }
        });
        if (error[0] instanceof Exception) throw (Exception) error[0];
        if (error[0] != null) throw new IllegalStateException("MAIN_CALLBACK_FAILED", error[0]);
    }

    private void status(String state) throws Exception { status(state, null); }

    private void status(String state, String error) throws Exception {
        metadata.put("state", state);
        if (error != null) metadata.put("error_class", error);
        AtomicFile file = new AtomicFile(new File(directory, "status.json"));
        FileOutputStream stream = file.startWrite();
        try {
            stream.write(metadata.toString(2).getBytes(StandardCharsets.UTF_8));
            file.finishWrite(stream);
        } catch (Exception e) {
            file.failWrite(stream);
            throw e;
        }
    }

    private static final class ClosedTrace extends OutputStream {
        final CountDownLatch closed = new CountDownLatch(1);
        final FileOutputStream file;
        final MessageDigest digest;
        final ExecutorService executor;
        volatile IOException failure;
        volatile long closedAt;
        volatile long bytes;
        boolean handedToSdk;
        ClosedTrace(File path, ExecutorService executor) throws Exception {
            this.executor = executor;
            if (!path.createNewFile()) throw new IOException("TRACE_FILE_EXISTS");
            file = new FileOutputStream(path);
            digest = MessageDigest.getInstance("SHA-256");
        }
        @Override public synchronized void write(int value) throws IOException {
            write(new byte[]{(byte) value}, 0, 1);
        }
        @Override public synchronized void write(byte[] buffer, int offset, int count) throws IOException {
            try {
                if (closed.getCount() == 0) throw new IOException("WRITE_AFTER_CLOSE");
                if (bytes + count > 64L * 1024 * 1024) throw new IOException("TRACE_SIZE_LIMIT");
                file.write(buffer, offset, count);
                digest.update(buffer, offset, count);
                bytes += count;
            } catch (IOException e) { failure = e; throw e; }
        }
        @Override public synchronized void close() throws IOException {
            if (closed.getCount() == 0) return;
            try { file.getFD().sync(); }
            catch (IOException e) { failure = e; }
            finally {
                try { file.close(); } catch (IOException e) { failure = e; }
                closedAt = SystemClock.elapsedRealtimeNanos();
                executor.shutdown(); // SDK close() is last; queued callbacks are not cancelled.
                closed.countDown();
            }
            if (failure != null) throw failure;
        }
        String sha256() {
            StringBuilder hex = new StringBuilder();
            for (byte value : digest.digest()) hex.append(String.format("%02x", value & 0xff));
            return hex.toString();
        }
    }
}
