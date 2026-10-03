"""Regresiones host del guard/orquestador. No compilan Java ni prueban Android."""

import importlib.util
import json
import os
from pathlib import Path
import pty
import subprocess
import sys
import tempfile
import termios
import time
import tty
import unittest
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("webview_pilot", ROOT / "scripts/capture-webview-pilot-android.py")
PILOT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PILOT)
IDENTITY = dict(package=PILOT.TARGET, version_name="0.5.0", version_code=500,
                certificate_sha256="a" * 64, apk_sha256="b" * 64)
MANIFEST = '''E: manifest (line=1)
  E: instrumentation (line=2)
    A: android:name(0x01010003)="androidx.test.runner.AndroidJUnitRunner" (Raw: "androidx.test.runner.AndroidJUnitRunner")
    A: android:targetPackage(0x01010021)="com.lumapse.app" (Raw: "com.lumapse.app")
  E: application (line=3)
'''


def arguments():
    return PILOT.parser().parse_args([
        "--serial", "synthetic-usb", "--expected-head", "c" * 40, "--app-source-sha", "d" * 40,
        "--expected-app-sha256", "b" * 64, "--expected-app-cert-sha256", "a" * 64,
        "--aapt", "aapt", "--apksigner", "apksigner", "--output", "/tmp/synthetic-pilot",
        "--gradle-user-home", "/tmp/synthetic-gradle-cache",
        "--yes-pilot", "--acknowledge-restart",
    ])


class PilotGuardTests(unittest.TestCase):
    def test_explicit_authorization_and_restart_acknowledgment(self):
        for flag in ("yes_pilot", "acknowledge_restart"):
            args = arguments()
            setattr(args, flag, False)
            with self.assertRaises(PILOT.PilotError):
                PILOT.validate_args(args)

    def test_serial_never_allows_network_or_shell_input(self):
        for serial in ("", "host:5555", "abc;id", "a b", "--transport", "abc\n"):
            args = arguments()
            args.serial = serial
            with self.subTest(serial=serial), self.assertRaises(PILOT.PilotError):
                PILOT.validate_args(args)

    def test_duration_and_api_limits(self):
        for value in (0, 999, 8001, 10_001):
            args = arguments()
            args.capture_ms = value
            with self.assertRaises(PILOT.PilotError):
                PILOT.validate_args(args)
        args = arguments()
        args.expected_api = 27
        with self.assertRaises(PILOT.PilotError):
            PILOT.validate_args(args)

    def test_source_sha_is_separate_from_helper_sha(self):
        args = arguments()
        PILOT.validate_args(args)
        pilot = PILOT.UsbPilot(args, Path("/tmp/synthetic"))
        self.assertNotEqual(pilot.report["app_source_sha"], pilot.report["helper_source_sha"])
        self.assertEqual(pilot.report["rnf_002"], "PENDING")

    def test_exact_wrapper_cache_is_required_not_any_same_version_directory(self):
        properties = (ROOT / "android/gradle/wrapper/gradle-wrapper.properties").read_text()
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            for locator in ("wrong-url-hash", "10utluxaxniiv4wxiphsi49nj"):
                cache = home / "wrapper/dists/gradle-8.14.3-all" / locator
                root = cache / "gradle-8.14.3"
                (root / "bin").mkdir(parents=True)
                (root / "lib").mkdir()
                (root / "bin/gradle").touch()
                (root / "lib/gradle-launcher-8.14.3.jar").touch()
                (cache / "gradle-8.14.3-all.zip.ok").touch()
                if locator == "wrong-url-hash":
                    with self.assertRaises(PILOT.PilotError):
                        PILOT.cached_gradle(home, properties)
                else:
                    self.assertEqual(PILOT.cached_gradle(home, properties), "8.14.3")

    def test_wrapper_cache_with_missing_marker_or_foreign_configuration_is_rejected(self):
        properties = (ROOT / "android/gradle/wrapper/gradle-wrapper.properties").read_text()
        with tempfile.TemporaryDirectory() as directory:
            for text in (properties, properties.replace("services.gradle.org", "other.example"),
                         properties.replace("distributionBase=GRADLE_USER_HOME", "distributionBase=PROJECT")):
                with self.assertRaises(PILOT.PilotError):
                    PILOT.cached_gradle(Path(directory), text)

    def test_helper_requires_package_runner_target_and_matching_certificate(self):
        helper = dict(IDENTITY, package=PILOT.HELPER)
        PILOT.verify_helper(MANIFEST, helper, IDENTITY)
        for manifest, identity in (
            (MANIFEST.replace('targetPackage(0x01010021)="com.lumapse.app"', 'targetPackage(0x01010021)="other.app"'), helper),
            (MANIFEST + "  E: receiver (line=4)\n", helper),
            (MANIFEST.replace("instrumentation (", "activity ("), helper),
            (MANIFEST, dict(helper, package=PILOT.TARGET)),
            (MANIFEST, dict(helper, certificate_sha256="0" * 64)),
        ):
            with self.assertRaises(PILOT.PilotError):
                PILOT.verify_helper(manifest, identity, IDENTITY)

    def test_unversioned_helper_never_relaxes_target_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            apk = Path(directory) / "synthetic.apk"
            apk.write_bytes(b"synthetic-only")
            for package, code, name, allow, valid in (
                (PILOT.HELPER, "", "", True, True),
                (PILOT.HELPER, "", "", False, False),
                (PILOT.TARGET, "", "", True, False),
                (PILOT.TARGET, "500", "0.5.0", False, True),
                ("other.app", "", "", True, False),
            ):
                badging = f"package: name='{package}' versionCode='{code}' versionName='{name}'"
                cert = "Signer #1 certificate SHA-256 digest: " + "a" * 64
                with self.subTest(package=package, allow=allow), patch.object(PILOT, "run", side_effect=[
                        subprocess.CompletedProcess([], 0, badging), subprocess.CompletedProcess([], 0, cert)]):
                    if valid:
                        identity = PILOT.apk_identity(apk, "aapt", "apksigner", allow_unversioned=allow)
                        self.assertEqual(identity["version_code"], int(code) if code else None)
                        self.assertEqual(identity["version_name"], name or None)
                    else:
                        with self.assertRaises(PILOT.PilotError):
                            PILOT.apk_identity(apk, "aapt", "apksigner", allow_unversioned=allow)

    def test_target_identity_includes_install_path_and_rejects_splits(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "target.apk"
            destination.write_bytes(b"synthetic")
            pilot = PILOT.UsbPilot(arguments(), Path(directory))
            with patch.object(pilot, "adb", side_effect=[
                    subprocess.CompletedProcess([], 0, "package:/data/app/synthetic/base.apk\n"),
                    subprocess.CompletedProcess([], 0, "")]), \
                    patch.object(PILOT, "apk_identity", return_value=dict(IDENTITY)):
                result = pilot.target_identity(destination)
                self.assertEqual(result["installed_apk_path"], "/data/app/synthetic/base.apk")
            with patch.object(pilot, "adb", return_value=subprocess.CompletedProcess(
                    [], 0, "package:/data/app/base.apk\npackage:/data/app/split.apk\n")) as adb:
                with self.assertRaises(PILOT.PilotError):
                    pilot.target_identity(destination)
                self.assertEqual(adb.call_count, 1)

    def test_native_status_scope_and_shape_fail_closed(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic"))
        state = dict(run_id=pilot.run_id, state="READY", target_package=PILOT.TARGET,
                     helper_package=PILOT.HELPER, process_name=PILOT.TARGET,
                     api=29, model="SM-G965F", requested_capture_ms=8000)
        self.assertEqual(pilot.read_status(json.dumps(state).encode()), state)
        invalid = [b"{", b"[]", b"x" * (64 * 1024 + 1)]
        for key, value in (("run_id", "wrong"), ("state", "PASS"), ("target_package", "other.app"),
                           ("helper_package", PILOT.TARGET), ("process_name", "other.app"),
                           ("api", 28), ("model", "other"), ("requested_capture_ms", 10000)):
            invalid.append(json.dumps(dict(state, **{key: value})).encode())
        for data in invalid:
            with self.assertRaises(PILOT.PilotError):
                pilot.read_status(data)

    def test_native_close_interval_and_hash_contract_without_clock_mapping(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic"))
        state = dict(state="CAPTURED", output_stream_closed=True,
                     start_call_before_elapsed_ns=0, start_call_after_elapsed_ns=100,
                     stop_call_before_elapsed_ns=8_000_000_000,
                     stop_call_after_elapsed_ns=8_010_000_000,
                     flush_closed_elapsed_ns=8_005_000_000, trace_bytes=10, trace_sha256="a" * 64)
        pilot.validate_captured(state)  # SDK close may precede stop return.
        for key, value in (("state", "ERROR"), ("output_stream_closed", False),
                           ("stop_call_after_elapsed_ns", 10_000_000_001),
                           ("stop_call_before_elapsed_ns", 0), ("flush_closed_elapsed_ns", -1),
                           ("start_call_before_elapsed_ns", True),
                           ("trace_bytes", 0), ("trace_bytes", PILOT.LIMIT + 1),
                           ("trace_bytes", True), ("trace_sha256", "not-a-hash")):
            with self.subTest(key=key, value=value), self.assertRaises(PILOT.PilotError):
                pilot.validate_captured(dict(state, **{key: value}))

    def test_local_adb_timeout_still_attempts_target_postcheck(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic"))
        pilot.process = Mock()
        pilot.process.poll.return_value = None
        pilot.process.wait.side_effect = subprocess.TimeoutExpired("synthetic-adb", 1)
        with patch.object(pilot, "preflight", return_value=IDENTITY), \
                patch.object(pilot, "prepare_helper", side_effect=PILOT.PilotError("BUILD_FAILED")), \
                patch.object(pilot, "target_identity", return_value=IDENTITY) as after:
            with self.assertRaisesRegex(PILOT.PilotError, "BUILD_FAILED"):
                pilot.execute()
            pilot.process.terminate.assert_called_once()
            after.assert_called_once()
            self.assertTrue(pilot.report["target_apk_unchanged"])
            self.assertIn("UNCONFIRMED", pilot.report["local_adb_cleanup"])

    def test_unignored_output_and_existing_directory_are_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaises(PILOT.PilotError):
                PILOT.prepare_output(Path(temp))
        with patch.object(PILOT, "run", return_value=subprocess.CompletedProcess([], 1)):
            with self.assertRaises(PILOT.PilotError):
                PILOT.prepare_output(ROOT / "not-private-pilot")

    def test_dirty_checkout_aborts_before_adb(self):
        with patch.object(PILOT, "run", return_value=subprocess.CompletedProcess([], 0, " M synthetic")) as mocked:
            with self.assertRaises(PILOT.PilotError):
                PILOT.UsbPilot(arguments(), Path("/tmp/synthetic")).preflight()
            self.assertEqual(mocked.call_count, 1)

    def test_build_failure_still_verifies_immutable_target_and_never_installs(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic"))
        with patch.object(pilot, "preflight", return_value=IDENTITY), \
                patch.object(pilot, "prepare_helper", side_effect=PILOT.PilotError("BUILD_FAILED")), \
                patch.object(pilot, "target_identity", return_value=IDENTITY) as after, \
                patch.object(pilot, "adb") as adb:
            with self.assertRaisesRegex(PILOT.PilotError, "BUILD_FAILED"):
                pilot.execute()
            after.assert_called_once()
            adb.assert_not_called()
            self.assertTrue(pilot.report["target_apk_unchanged"])

    def test_capture_postcheck_detects_changed_target(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic"))
        with patch.object(pilot, "preflight", return_value=IDENTITY), \
                patch.object(pilot, "prepare_helper"), patch.object(pilot, "capture"), \
                patch.object(pilot, "target_identity", return_value=dict(IDENTITY, apk_sha256="e" * 64)), \
                patch.object(pilot, "adb", return_value=subprocess.CompletedProcess([], 0, "Success")) as adb:
            with self.assertRaisesRegex(PILOT.PilotError, "CRITICAL"):
                pilot.execute()
            adb.assert_not_called()
            self.assertFalse(pilot.report["target_apk_unchanged"])

    def test_same_binary_at_new_install_path_is_not_unchanged(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic"))
        before = dict(IDENTITY, installed_apk_path="/data/app/before/base.apk")
        after = dict(IDENTITY, installed_apk_path="/data/app/after/base.apk")
        with patch.object(pilot, "preflight", return_value=before), \
                patch.object(pilot, "prepare_helper"), patch.object(pilot, "capture"), \
                patch.object(pilot, "target_identity", return_value=after), \
                patch.object(pilot, "adb", return_value=subprocess.CompletedProcess([], 0, "Success")):
            with self.assertRaisesRegex(PILOT.PilotError, "CRITICAL"):
                pilot.execute()
            self.assertFalse(pilot.report["target_apk_unchanged"])

    def test_native_source_guards_are_present_without_production_hooks(self):
        source = (ROOT / "android/app/src/androidTest/java/com/lumapse/app/WebViewTracePilotTest.java").read_text()
        self.assertIn('Assume.assumeTrue("Explicit pilot opt-in required"', source)
        self.assertGreaterEqual(source.count("controller[0].isTracing()"), 2)
        self.assertIn("if (!owned[0]) return;", source)
        self.assertIn("catch (Throwable e) { error[0] = e; }", source)
        self.assertIn("output.closed.await", source)
        self.assertIn("if (output == null || !output.handedToSdk) executor.shutdown();", source)
        self.assertIn("executor.shutdown(); // SDK close() is last", source)
        self.assertNotIn("evaluateJavascript", source)
        self.assertNotIn("shutdownNow();", source)
        self.assertNotIn("setWebContentsDebuggingEnabled", source)
        self.assertNotIn("new AtomicFile(", source)
        self.assertIn("StandardCopyOption.ATOMIC_MOVE", source)
        self.assertLess(source.index("stream.getFD().sync();"), source.index("Files.move(pending.toPath()"))


class TransportAndHelperTests(unittest.TestCase):
    def ready(self, pilot):
        return dict(run_id=pilot.run_id, state="READY", target_package=PILOT.TARGET,
                    helper_package=PILOT.HELPER, process_name=PILOT.TARGET,
                    api=29, model="SM-G965F", requested_capture_ms=8000)

    def result(self, data, code=0, stderr=b""):
        return subprocess.CompletedProcess([], code, data, stderr)

    def missing(self, pilot):
        return f"cat: {pilot.remote}/status.json: No such file or directory\n".encode()

    def test_observed_stdout_missing_exit_zero_then_verified_ready(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
            pilot.process.poll.return_value = None
            missing = self.missing(pilot)
            self.assertEqual(len(missing), 100)  # Synthetic run ID, not the private device bytes/hash.
            ready = self.ready(pilot)
            with patch.object(pilot, "private_read", side_effect=[self.result(missing), self.result(json.dumps(ready).encode())]) as read, \
                    patch.object(PILOT.time, "sleep"):
                self.assertEqual(pilot.wait_state({"READY"}, 2), ready)
                self.assertEqual(read.call_count, 2)
            diagnostics = json.loads((Path(directory) / "status-read-diagnostics.json").read_text())
            self.assertEqual(len(diagnostics), 1)
            self.assertEqual(diagnostics[0]["reason"], "STATUS_NOT_YET_PUBLISHED")
            self.assertEqual(diagnostics[0]["adb_exit"], 0)
            self.assertEqual(diagnostics[0]["stdout_sha256"], PILOT.hashlib.sha256(missing).hexdigest())
            self.assertEqual(diagnostics[0]["stderr_bytes"], 0)
            self.assertGreater(diagnostics[0]["deadline_monotonic_s"], diagnostics[0]["host_monotonic_s"])
            raw = Path(directory) / "status-read-0001.stdout.bin"
            self.assertEqual(raw.read_bytes(), missing)
            self.assertEqual(raw.stat().st_mode & 0o777, 0o600)

    def test_exact_missing_on_either_channel_and_exit_then_ready(self):
        for code in (0, 1):
            for channel in ("stdout", "stderr"):
                for ending in (b"", b"\n", b"\r\n"):
                    with self.subTest(code=code, channel=channel, ending=ending), tempfile.TemporaryDirectory() as directory:
                        pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
                        pilot.process.poll.return_value = None
                        missing = self.missing(pilot).removesuffix(b"\n") + ending
                        result = self.result(missing if channel == "stdout" else b"", code,
                                             missing if channel == "stderr" else b"")
                        ready = self.ready(pilot)
                        with patch.object(pilot, "private_read", side_effect=[result, self.result(json.dumps(ready).encode())]) as read, \
                                patch.object(PILOT.time, "sleep"):
                            self.assertEqual(pilot.wait_state({"READY"}, 2), ready)
                            self.assertEqual(read.call_count, 2)
                        self.assertEqual(pilot.report["status_read_failures"][0]["reason"], "STATUS_NOT_YET_PUBLISHED")

    def test_missing_persists_only_until_fixed_ready_deadline(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
            pilot.process.poll.return_value = None
            clock = [0.0]
            def sleep(seconds): clock[0] += seconds
            with patch.object(pilot, "private_read", return_value=self.result(self.missing(pilot))) as read, \
                    patch.object(PILOT.time, "monotonic", side_effect=lambda: clock[0]), \
                    patch.object(PILOT.time, "sleep", side_effect=sleep):
                with self.assertRaisesRegex(PILOT.PilotError, "READY deadline"):
                    pilot.wait_state({"READY"}, 1)
                self.assertEqual(read.call_count, 4)
                self.assertEqual([call.kwargs["timeout"] for call in read.call_args_list], [1, .75, .5, .25])
            self.assertEqual(clock[0], 1)
            self.assertTrue(pilot.report["status_waits"][-1]["deadline_exceeded"])
            diagnostics = json.loads((Path(directory) / "status-read-diagnostics.json").read_text())
            self.assertEqual(len(diagnostics), 4)
            self.assertTrue(all(row["deadline_monotonic_s"] == 1 and row["reason"] == "STATUS_NOT_YET_PUBLISHED" for row in diagnostics))

    def test_other_paths_errors_channels_and_exit_codes_are_not_missing(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
            missing = self.missing(pilot)
            wrong = (missing.replace(pilot.run_id.encode(), b"unknown-run"),
                     missing.replace(b"status.json", b"trace.json"),
                     missing.replace(b"cache/", b"../cache/"),
                     missing.replace(b"No such file or directory", b"Permission denied"),
                     b"run-as: package not debuggable\n", b"No such file or directory", b"{broken}",
                     missing + b"extra\n", b"prefix " + missing)
            for payload in wrong:
                for code in (0, 1):
                    with self.subTest(payload=payload, code=code), \
                            patch.object(pilot, "private_read", return_value=self.result(payload, code)) as read:
                        with self.assertRaises(PILOT.PilotError): pilot.wait_state({"READY"}, 2)
                        self.assertEqual(read.call_count, 1)
            for result in (self.result(missing, 2), self.result(missing, -1),
                           self.result(missing, 0, missing), self.result(missing, 0, b"permission denied"),
                           self.result(json.dumps(self.ready(pilot)).encode(), 1),
                           self.result(json.dumps(self.ready(pilot)).encode(), 0, b"permission denied")):
                with patch.object(pilot, "private_read", return_value=result) as read:
                    with self.assertRaises(PILOT.PilotError): pilot.wait_state({"READY"}, 2)
                    self.assertEqual(read.call_count, 1)

    def test_missing_never_masks_wrong_status_scope_after_publication(self):
        for key, value in (("run_id", "wrong"), ("target_package", "other.app"),
                           ("helper_package", "other.test"), ("process_name", "other.process"),
                           ("api", 30), ("model", "other"), ("requested_capture_ms", 9000), ("state", "UNKNOWN")):
            with self.subTest(key=key), tempfile.TemporaryDirectory() as directory:
                pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
                pilot.process.poll.return_value = None
                wrong = json.dumps(dict(self.ready(pilot), **{key: value})).encode()
                with patch.object(pilot, "private_read", side_effect=[self.result(self.missing(pilot)), self.result(wrong)]) as read, \
                        patch.object(PILOT.time, "sleep"):
                    with self.assertRaises(PILOT.PilotError): pilot.wait_state({"READY"}, 2)
                    self.assertEqual(read.call_count, 2)
                self.assertEqual(pilot.report["status_read_failures"][-1]["reason"], "PERMANENT_STATUS_REJECTION")

    def test_missing_after_a_snapshot_or_ready_stage_is_permanent(self):
        for stage in ("READY", "CAPTURING", "CAPTURED"):
            with self.subTest(stage=stage), tempfile.TemporaryDirectory() as directory:
                pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
                pilot.process.poll.return_value = None
                results = ([self.result(b"{")] if stage == "READY" else []) + [self.result(self.missing(pilot))]
                with patch.object(pilot, "private_read", side_effect=results) as read, patch.object(PILOT.time, "sleep"):
                    with self.assertRaisesRegex(PILOT.PilotError, "disappeared"): pilot.wait_state({stage}, 2)
                    self.assertEqual(read.call_count, len(results))
                self.assertEqual(pilot.report["status_read_failures"][-1]["reason"], "UNEXPECTED_STATUS_ABSENCE")

    def test_ready_arriving_after_deadline_is_preserved_but_never_accepted(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
            ready = json.dumps(self.ready(pilot)).encode()
            with patch.object(pilot, "private_read", return_value=self.result(ready)) as read, \
                    patch.object(PILOT.time, "monotonic", side_effect=[0, 0, 2, 2]):
                with self.assertRaisesRegex(PILOT.PilotError, "READY deadline"): pilot.wait_state({"READY"}, 1)
                self.assertEqual(read.call_count, 1)
            self.assertEqual(pilot.report["status_read_failures"][-1]["reason"], "STATUS_AFTER_DEADLINE")
            self.assertEqual((Path(directory) / "status-read-0001.stdout.bin").read_bytes(), ready)

    def test_capture_never_prompts_or_sends_start_when_ready_is_missing(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory))
            process = Mock(); process.poll.return_value = None
            original_wait = pilot.wait_state
            clock = [0.0]
            def sleep(seconds): clock[0] += seconds
            with patch.object(PILOT.subprocess, "Popen", return_value=process), \
                    patch.object(pilot, "wait_state", side_effect=lambda desired, timeout: original_wait(desired, .5)), \
                    patch.object(pilot, "private_read", return_value=self.result(self.missing(pilot))), \
                    patch.object(pilot, "adb") as adb, patch.object(PILOT.select, "select") as prompt, \
                    patch.object(PILOT.time, "monotonic", side_effect=lambda: clock[0]), \
                    patch.object(PILOT.time, "sleep", side_effect=sleep), patch("builtins.print") as display:
                with self.assertRaisesRegex(PILOT.PilotError, "READY deadline"): pilot.capture()
                adb.assert_not_called(); prompt.assert_not_called(); display.assert_not_called()

    def test_partial_snapshot_then_ready_preserves_private_diagnostics(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
            pilot.process.poll.return_value = None
            partial = b'{"run_id":"'
            ready = self.ready(pilot)
            with patch.object(pilot, "private_read", side_effect=[self.result(partial), self.result(json.dumps(ready).encode())]), \
                    patch.object(PILOT.time, "sleep"):
                self.assertEqual(pilot.wait_state({"READY"}, 2), ready)
            diagnostics = json.loads((Path(directory) / "status-read-diagnostics.json").read_text())
            self.assertEqual(len(diagnostics), 1)
            self.assertEqual(diagnostics[0]["stdout_bytes"], len(partial))
            self.assertEqual(diagnostics[0]["stdout_sha256"], PILOT.hashlib.sha256(partial).hexdigest())
            raw = Path(directory) / "status-read-0001.stdout.bin"
            self.assertEqual(raw.read_bytes(), partial)
            self.assertEqual(raw.stat().st_mode & 0o777, 0o600)
            self.assertIn("host_monotonic_s", diagnostics[0])

    def test_persistent_partial_json_aborts_after_three_reads(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
            pilot.process.poll.return_value = None
            with patch.object(pilot, "private_read", return_value=self.result(b"{")) as read, \
                    patch.object(PILOT.time, "sleep"):
                with self.assertRaisesRegex(PILOT.PilotError, "Persistent incomplete"):
                    pilot.wait_state({"READY"}, 2)
                self.assertEqual(read.call_count, 3)

    def test_malformed_or_wrong_scope_is_permanent_not_retryable(self):
        with tempfile.TemporaryDirectory() as directory:
            for data in (b"{broken}", b'[{"state":"READY"}]', b'{"x":NaN}',
                         b'{"run_id":"a","run_id":"b"}',
                         json.dumps(dict(self.ready(PILOT.UsbPilot(arguments(), Path(directory))), process_name="other.app")).encode()):
                pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
                with patch.object(pilot, "private_read", return_value=self.result(data)) as read:
                    with self.assertRaises(PILOT.PilotError):
                        pilot.wait_state({"READY"}, 2)
                    self.assertEqual(read.call_count, 1)

    def test_ready_deadline_and_transport_timeout_preserve_diagnostics(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
            pilot.process.poll.return_value = None
            ticks = iter([n / 10 for n in range(30)])
            with patch.object(pilot, "private_read", return_value=self.result(b"", 1, self.missing(pilot))), \
                    patch.object(PILOT.time, "monotonic", side_effect=lambda: next(ticks)), patch.object(PILOT.time, "sleep"):
                with self.assertRaisesRegex(PILOT.PilotError, "READY deadline"):
                    pilot.wait_state({"READY"}, 1)
            self.assertTrue(pilot.report["status_read_failures"])
            with patch.object(pilot, "private_read", side_effect=subprocess.TimeoutExpired("synthetic", 2, output=b"partial")):
                with self.assertRaisesRegex(PILOT.PilotError, "transport timeout"):
                    pilot.wait_state({"READY"}, 1)
            self.assertEqual(pilot.report["status_read_failures"][-1]["reason"], "STATUS_READ_TIMEOUT")

    def test_wrong_stage_or_captured_contract_aborts_immediately(self):
        with tempfile.TemporaryDirectory() as directory:
            for change in ({"state":"CAPTURING"}, {"state":"CAPTURED", "output_stream_closed":False}):
                pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
                data = json.dumps(dict(self.ready(pilot), **change)).encode()
                with patch.object(pilot, "private_read", return_value=self.result(data)) as read:
                    with self.assertRaises(PILOT.PilotError):
                        pilot.wait_state({"READY"}, 2)
                    self.assertEqual(read.call_count, 1)

    def test_reuse_update_require_explicit_hash_and_source_pins(self):
        for flag in ("reuse_helper", "update_helper"):
            args = arguments(); setattr(args, flag, True)
            with self.assertRaises(PILOT.PilotError): PILOT.validate_args(args)
            args.expected_installed_helper_sha256 = "b" * 64
            args.installed_helper_source_sha = "d" * 40
            PILOT.validate_args(args)
        args = arguments(); args.expected_installed_helper_sha256 = "b" * 64
        with self.assertRaises(PILOT.PilotError): PILOT.validate_args(args)
        with self.assertRaises(SystemExit), patch('sys.stderr'):
            PILOT.parser().parse_args(["--reuse-helper", "--update-helper"])

    def pinned(self, mode):
        args = arguments(); setattr(args, mode, True)
        args.expected_installed_helper_sha256 = "b" * 64; args.installed_helper_source_sha = "d" * 40
        return args

    def test_known_helper_reuse_verifies_manifest_hash_and_source(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(self.pinned("reuse_helper"), Path(directory))
            def adb(*args, **kwargs):
                if args[0] == "pull":
                        path = Path(args[2])
                        if path.exists(): path.chmod(0o600)
                        path.write_bytes(b"synthetic")
                return subprocess.CompletedProcess([], 0, "package:/data/app/test/base.apk" if args[0] == "shell" else "")
            helper = dict(IDENTITY, package=PILOT.HELPER)
            with patch.object(pilot, "adb", side_effect=adb) as calls, \
                    patch.object(PILOT, "apk_identity", return_value=helper), \
                    patch.object(PILOT, "run", side_effect=[subprocess.CompletedProcess([], 0, MANIFEST), subprocess.CompletedProcess([], 0)]), \
                    patch.object(pilot, "build_helper") as build:
                pilot.prepare_helper(IDENTITY)
                build.assert_not_called()
                self.assertFalse(any(c.args[0] == "install" for c in calls.call_args_list))
                self.assertEqual(pilot.report["helper_source_sha"], "d" * 40)
                self.assertEqual(pilot.report["script_source_sha"], "c" * 40)

    def test_unknown_helper_hash_or_certificate_and_changed_source_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            for helper, diffcode in ((dict(IDENTITY, package=PILOT.HELPER, apk_sha256="e"*64), 0),
                                     (dict(IDENTITY, package=PILOT.HELPER, certificate_sha256="e"*64), 0),
                                     (dict(IDENTITY, package=PILOT.HELPER), 1)):
                pilot = PILOT.UsbPilot(self.pinned("reuse_helper"), Path(directory))
                def adb(*args, **kwargs):
                    if args[0] == "pull":
                        path = Path(args[2])
                        if path.exists(): path.chmod(0o600)
                        path.write_bytes(b"synthetic")
                    return subprocess.CompletedProcess([], 0, "package:/data/app/test/base.apk" if args[0] == "shell" else "")
                with patch.object(pilot, "adb", side_effect=adb) as calls, patch.object(PILOT, "apk_identity", return_value=helper), \
                        patch.object(PILOT, "run", side_effect=[subprocess.CompletedProcess([], 0, MANIFEST), subprocess.CompletedProcess([], diffcode)]):
                    with self.assertRaises(PILOT.PilotError): pilot.prepare_helper(IDENTITY)
                    self.assertFalse(any(c.args[0] == "install" for c in calls.call_args_list))

    def test_existing_helper_without_opt_in_never_installs(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic"))
        with patch.object(pilot, "adb", return_value=subprocess.CompletedProcess([], 0, "package:/data/app/test/base.apk")) as adb:
            with self.assertRaises(PILOT.PilotError): pilot.prepare_helper(IDENTITY)
            self.assertEqual(adb.call_count, 1)

    def test_update_only_auxiliary_and_skip_identical_build(self):
        with tempfile.TemporaryDirectory() as directory:
            for changed in (True, False):
                pilot = PILOT.UsbPilot(self.pinned("update_helper"), Path(directory))
                previous = dict(IDENTITY, package=PILOT.HELPER)
                pilot.report["helper"] = dict(previous, apk_sha256="e" * 64 if changed else "b" * 64)
                def adb(*args, **kwargs):
                    if args[0] == "pull":
                        path = Path(args[2])
                        if path.exists(): path.chmod(0o600)
                        path.write_bytes(b"synthetic")
                    return subprocess.CompletedProcess([], 0, "Success" if args[0] == "install" else "package:/data/app/test/base.apk")
                with patch.object(pilot, "installed_helper", return_value=previous), patch.object(pilot, "build_helper"), \
                        patch.object(pilot, "adb", side_effect=adb) as calls, patch.object(PILOT, "sha256", side_effect=["b" * 64, "e" * 64] if changed else []):
                    pilot.prepare_helper(IDENTITY)
                    installs = [c.args for c in calls.call_args_list if c.args[0] == "install"]
                    self.assertEqual(installs, [("install", "-r", "-t", str(pilot.helper_apk))] if changed else [])
                    self.assertIn("helper", str(pilot.helper_apk))

    def test_helper_rejection_still_postchecks_unchanged_target(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic"))
        with patch.object(pilot, "preflight", return_value=IDENTITY), \
                patch.object(pilot, "prepare_helper", side_effect=PILOT.PilotError("UNKNOWN_HELPER")), \
                patch.object(pilot, "target_identity", return_value=IDENTITY) as after:
            with self.assertRaisesRegex(PILOT.PilotError, "UNKNOWN_HELPER"): pilot.execute()
            after.assert_called_once(); self.assertTrue(pilot.report["target_apk_unchanged"])


class PreparationInputTests(unittest.TestCase):
    def real_terminal(self, payload=b"", raw=False, extra="", deadline=.15):
        """A private PTY + supervised Python child, never ADB or the real stdin."""
        master, slave = pty.openpty()
        child = None
        code = f'''
import fcntl,json,os,sys,termios,time
from unittest.mock import Mock,patch
sys.path.insert(0,{str(Path(__file__).parent)!r})
from test_webview_pilot import PILOT,arguments
pilot=PILOT.UsbPilot(arguments(),PILOT.Path('/tmp/synthetic'))
pilot.process=Mock();pilot.process.poll.return_value=None
flags=fcntl.fcntl(0,fcntl.F_GETFL); attributes=termios.tcgetattr(0)
{extra}
started=time.monotonic()
try:
    pilot.confirm_preparation(started+{deadline})
    outcome='ACKNOWLEDGED'
except (PILOT.PilotError,KeyboardInterrupt) as error:
    outcome=pilot.report['preparation']['outcome']
print(json.dumps(dict(outcome=outcome,elapsed=time.monotonic()-started,preparation=pilot.report['preparation'],
    flags_preserved=flags==fcntl.fcntl(0,fcntl.F_GETFL),termios_preserved=attributes==termios.tcgetattr(0))))
'''
        try:
            if raw:
                tty.setraw(slave)  # Only this fixture terminal; production never changes termios.
            if payload:
                os.write(master, payload)
            child = subprocess.Popen([sys.executable, "-u", "-c", code], stdin=slave,
                                     stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            out, error = child.communicate(timeout=3)
            self.assertEqual(child.returncode, 0, error)
            result = json.loads(out)
            self.assertTrue(result["flags_preserved"])
            self.assertTrue(result["termios_preserved"])
            return result
        finally:
            if child is not None and child.poll() is None:
                child.terminate(); child.communicate(timeout=2)
            os.close(master); os.close(slave)

    def test_real_pty_enter_preserves_terminal_and_never_uses_text_readline(self):
        extra = "sys.stdin=Mock(wraps=sys.stdin); sys.stdin.readline.side_effect=AssertionError('blocking text reader used')"
        self.assertEqual(self.real_terminal(b"\n", extra=extra)["outcome"], "ACKNOWLEDGED")
        # Normal canonical terminal translates the Enter CR to LF without our intervention.
        self.assertEqual(self.real_terminal(b"\r")["outcome"], "ACKNOWLEDGED")

    def test_real_pty_split_crlf_uses_bounded_byte_reads(self):
        extra = "original_read=PILOT.os.read\nPILOT.os.read=lambda fd,count: original_read(fd,min(count,1))"
        result = self.real_terminal(b"\r\n", raw=True, extra=extra)
        self.assertEqual(result["outcome"], "ACKNOWLEDGED")
        self.assertEqual(result["preparation"]["bytes_received"], 2)

    def test_real_pty_partial_line_that_blocked_readline_now_rejects(self):
        result = self.real_terminal(b"partial\x04")  # Canonical VEOF releases bytes, not a newline.
        self.assertEqual(result["outcome"], "INVALID_INPUT")
        self.assertLess(result["elapsed"], 1)

    def test_real_pty_eof_is_not_enter(self):
        self.assertEqual(self.real_terminal(b"\x04")["outcome"], "EOF")

    def test_real_pty_silence_or_partial_cr_cannot_extend_deadline(self):
        for payload, raw in ((b"", False), (b"\r", True)):
            result = self.real_terminal(payload, raw=raw)
            self.assertEqual(result["outcome"], "DEADLINE_EXCEEDED")
            self.assertGreaterEqual(result["elapsed"], .15)
            self.assertLess(result["elapsed"], 1)

    def test_real_pty_readiness_consumed_by_other_reader_does_not_block(self):
        extra = '''original_select=PILOT.select.select
consumed=[False]
def competing_reader(*args):
    result=original_select(*args)
    if result[0] and not consumed[0]:
        os.read(0,2); consumed[0]=True
    return result
PILOT.select.select=competing_reader'''
        result = self.real_terminal(b"\n", extra=extra)
        self.assertEqual(result["outcome"], "DEADLINE_EXCEEDED")
        self.assertEqual(result["preparation"]["bytes_received"], 0)
        self.assertLess(result["elapsed"], 1)

    def test_real_child_gets_eof_without_consuming_parent_enter(self):
        extra = '''child_result=PILOT.run([sys.executable,'-c','import os; print(repr(os.read(0,1)))'],timeout=1)
assert child_result.stdout.strip()=="b''", child_result.stdout'''
        self.assertEqual(self.real_terminal(b"\n", extra=extra)["outcome"], "ACKNOWLEDGED")

    def test_real_pty_sigint_closes_reader_and_records_interruption(self):
        extra = '''import signal
def interrupt(*args): os.kill(os.getpid(),signal.SIGINT)
PILOT.select.select=interrupt'''
        self.assertEqual(self.real_terminal(extra=extra)["outcome"], "INTERRUPTED")

    def test_native_exit_is_detected_without_waiting_for_enter(self):
        result = self.real_terminal(extra="pilot.process.poll.return_value=0")
        self.assertEqual(result["outcome"], "NATIVE_ENDED")

    def ready(self, pilot):
        return TransportAndHelperTests().ready(pilot)

    def test_no_start_on_missing_ack_expired_deadline_or_native_exit(self):
        with tempfile.TemporaryDirectory() as directory:
            for outcome, deadline, exit_code in (("EOF", time.monotonic()+2, None),
                                                  ("INTERRUPTED", time.monotonic()+2, None),
                                                  ("ACKNOWLEDGED", 0, None),
                                                  ("ACKNOWLEDGED", time.monotonic()+2, 0)):
                pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
                pilot.process.poll.return_value = exit_code
                pilot.report["preparation"] = dict(outcome=outcome)
                with patch.object(pilot, "adb") as adb, patch.object(pilot, "private_read") as read:
                    with self.assertRaises(PILOT.PilotError): pilot.start_after_preparation(deadline)
                    adb.assert_not_called(); read.assert_not_called()

    def test_prestart_snapshot_must_be_fresh_strict_ready_and_process_alive(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
            ready = self.ready(pilot)
            for payload in (b"{", b"{broken}", TransportAndHelperTests().missing(pilot),
                            json.dumps(dict(ready, state="ERROR")).encode(),
                            json.dumps(dict(ready, run_id="wrong")).encode(), json.dumps(ready).encode()):
                pilot.report["preparation"] = dict(outcome="ACKNOWLEDGED")
                pilot.process.poll.side_effect = [None, 0]  # Even a valid READY cannot outlive its process.
                with patch.object(pilot, "private_read", return_value=subprocess.CompletedProcess([], 0, payload, b"")), \
                        patch.object(pilot, "adb") as adb:
                    with self.assertRaises(PILOT.PilotError): pilot.start_after_preparation(time.monotonic()+2)
                    adb.assert_not_called()

    def test_late_prestart_read_cannot_send_signal(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
            pilot.process.poll.return_value = None
            pilot.report["preparation"] = dict(outcome="ACKNOWLEDGED")
            clock = [0.0]
            def read(*args, **kwargs):
                clock[0] = 2.0
                return subprocess.CompletedProcess([], 0, json.dumps(self.ready(pilot)).encode(), b"")
            with patch.object(PILOT.time, "monotonic", side_effect=lambda: clock[0]), \
                    patch.object(pilot, "private_read", side_effect=read), patch.object(pilot, "adb") as adb:
                with self.assertRaisesRegex(PILOT.PilotError, "deadline"): pilot.start_after_preparation(1)
                adb.assert_not_called()

    def test_acknowledged_start_is_single_attempt_with_remaining_timeout(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory)); pilot.process = Mock()
            pilot.process.poll.return_value = None
            pilot.report["preparation"] = dict(outcome="ACKNOWLEDGED")
            with patch.object(pilot, "private_read", return_value=subprocess.CompletedProcess(
                    [], 0, json.dumps(self.ready(pilot)).encode(), b"")), patch.object(pilot, "adb") as adb:
                pilot.start_after_preparation(time.monotonic()+.5)
                self.assertLessEqual(adb.call_args.kwargs["timeout"], .5)
                self.assertIn("start.signal", adb.call_args.args[-1])
                with self.assertRaises(PILOT.PilotError): pilot.start_after_preparation(time.monotonic()+.5)
                self.assertEqual(adb.call_count, 1)

    def test_capture_child_has_no_stdin_and_delayed_ready_shortens_budget(self):
        with tempfile.TemporaryDirectory() as directory:
            pilot = PILOT.UsbPilot(arguments(), Path(directory)); process = Mock()
            clock = [0.0]
            def ready(*args): clock[0] = 39
            with patch.object(PILOT.subprocess, "Popen", return_value=process) as child, \
                    patch.object(pilot, "wait_state", side_effect=ready), patch("builtins.print"), \
                    patch.object(PILOT.time, "monotonic", side_effect=lambda: clock[0]), \
                    patch.object(pilot, "confirm_preparation", side_effect=PILOT.PilotError("STOP_FIXTURE")) as confirm, \
                    patch.object(pilot, "adb") as adb:
                with self.assertRaisesRegex(PILOT.PilotError, "STOP_FIXTURE"): pilot.capture()
                self.assertEqual(child.call_args.kwargs["stdin"], subprocess.DEVNULL)
                self.assertEqual(confirm.call_args.args, (110,))  # Not READY+90 =129 > native minimum120.
                adb.assert_not_called()


class InterruptionOutcomeTests(unittest.TestCase):
    def main_result(self, directory, exception):
        pilot = PILOT.UsbPilot(arguments(), Path(directory))
        args = arguments()
        with patch.object(PILOT, "validate_args"), patch.object(PILOT.sys.stdin, "isatty", return_value=True), \
                patch.object(PILOT, "prepare_output", return_value=Path(directory)), patch.object(PILOT, "UsbPilot", return_value=pilot), \
                patch.object(pilot, "execute", side_effect=exception), patch('sys.stderr'), \
                patch.object(PILOT.os, "umask"), patch.object(PILOT, "parser") as parser:
            parser.return_value.parse_args.return_value = args
            code = PILOT.main([])
        return code, json.loads((Path(directory) / "pilot-result.json").read_text())

    def test_keyboard_interrupt_is_aborted_exit130_not_pending_success(self):
        with tempfile.TemporaryDirectory() as directory:
            code, report = self.main_result(directory, KeyboardInterrupt())
            self.assertEqual(code, 130)
            self.assertEqual(report["status"], "ABORTED")
            self.assertEqual(report["exit_code"], 130)
            self.assertEqual(report["error_type"], "KeyboardInterrupt")
            self.assertEqual(report["rnf_002"], "PENDING")

    def test_unexpected_exception_is_error_not_pending_success(self):
        with tempfile.TemporaryDirectory() as directory:
            code, report = self.main_result(directory, RuntimeError("synthetic failure"))
            self.assertEqual(code, 1)
            self.assertEqual(report["status"], "ERROR")

    def test_postcheck_failure_never_masks_original_interrupt_or_error(self):
        for primary in (KeyboardInterrupt(), PILOT.PilotError("PRIMARY_FAILURE")):
            pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic"))
            with patch.object(pilot, "preflight", return_value=IDENTITY), patch.object(pilot, "prepare_helper"), \
                    patch.object(pilot, "capture", side_effect=primary), \
                    patch.object(pilot, "target_identity", side_effect=OSError("POSTCHECK_FAILURE")) as after:
                with self.assertRaises(type(primary)) as caught: pilot.execute()
                self.assertIs(caught.exception, primary)
                after.assert_called_once()
                self.assertEqual(pilot.report["target_postcheck_error"]["message"], "POSTCHECK_FAILURE")

    def test_cleanup_interruption_still_postchecks_and_does_not_mask_primary(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic")); pilot.process = Mock()
        pilot.process.poll.return_value = None
        pilot.process.wait.side_effect = KeyboardInterrupt()
        with patch.object(pilot, "preflight", return_value=IDENTITY), patch.object(pilot, "prepare_helper"), \
                patch.object(pilot, "capture", side_effect=PILOT.PilotError("PRIMARY_FAILURE")), \
                patch.object(pilot, "target_identity", return_value=IDENTITY) as after:
            with self.assertRaisesRegex(PILOT.PilotError, "PRIMARY_FAILURE"): pilot.execute()
            after.assert_called_once()
            self.assertEqual(pilot.report["instrumentation_cleanup_error"]["type"], "KeyboardInterrupt")

    def test_cleanup_failure_without_primary_cannot_return_success(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic")); pilot.process = Mock()
        pilot.process.poll.return_value = None
        pilot.process.wait.side_effect = [subprocess.TimeoutExpired("synthetic", 165), 0]
        with patch.object(pilot, "preflight", return_value=IDENTITY), patch.object(pilot, "prepare_helper"), \
                patch.object(pilot, "capture"), patch.object(pilot, "target_identity", return_value=IDENTITY) as after:
            with self.assertRaisesRegex(PILOT.PilotError, "cleanup unconfirmed"): pilot.execute()
            after.assert_called_once()
            self.assertTrue(pilot.report["target_apk_unchanged"])


class TraceInventoryTests(unittest.TestCase):
    def inventory(self, content):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "trace.json"
            path.write_text(content)
            return PILOT.inspect_trace(path)

    def test_real_event_names_or_inp_never_create_metrics(self):
        result = self.inventory(json.dumps({"traceEvents": [
            {"name": "INP", "ph": "X", "ts": 100, "dur": 195000},
            {"name": "DrawFrame", "ph": "X", "ts": 200, "dur": 100},
            {"name": "FramePresented", "ph": "I", "ts": 300},
        ]}))
        self.assertEqual(result["trace_event_count"], 3)
        for metric in ("input_to_correct_presented_frame_ms", "persistence_ms", "refresh_ms",
                       "complete_presented_frames", "partial_frames", "lost_frames", "fps"):
            self.assertIsNone(result[metric])
        self.assertEqual(result["semantic_validation"], "PENDING")
        self.assertTrue(result["loss_validation"].startswith("PENDING"))

    def test_invalid_or_empty_json_is_not_capture_success(self):
        for content in ('{', '[]', '{}', '{"traceEvents": []}', '{"traceEvents": [1]}',
                        '{"traceEvents":[{"ts":NaN}]}', '{"traceEvents":[{"ts":true}]}',
                        '{"traceEvents":[{"ts":"100"}]}'):
            with self.subTest(content=content), self.assertRaises(PILOT.PilotError):
                self.inventory(content)

    def test_no_clock_offset_is_invented(self):
        result = self.inventory('{"traceEvents":[{"ph":"M","name":"process_name"}]}')
        self.assertIsNone(result["timestamp_min"])
        self.assertIsNone(result["timestamp_max"])
        self.assertIn("requires review", result["clock"])


if __name__ == "__main__":
    unittest.main()
