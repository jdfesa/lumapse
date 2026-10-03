"""Regresiones host del guard/orquestador. No compilan Java ni prueban Android."""

import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
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
                patch.object(pilot, "build_helper", side_effect=PILOT.PilotError("BUILD_FAILED")), \
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
                patch.object(pilot, "build_helper", side_effect=PILOT.PilotError("BUILD_FAILED")), \
                patch.object(pilot, "target_identity", return_value=IDENTITY) as after, \
                patch.object(pilot, "adb") as adb:
            with self.assertRaisesRegex(PILOT.PilotError, "BUILD_FAILED"):
                pilot.execute()
            after.assert_called_once()
            adb.assert_not_called()
            self.assertTrue(pilot.report["target_apk_unchanged"])

    def test_only_auxiliary_apk_is_installed_and_postcheck_detects_change(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic"))
        with patch.object(pilot, "preflight", return_value=IDENTITY), \
                patch.object(pilot, "build_helper"), patch.object(pilot, "capture"), \
                patch.object(pilot, "target_identity", return_value=dict(IDENTITY, apk_sha256="e" * 64)), \
                patch.object(pilot, "adb", return_value=subprocess.CompletedProcess([], 0, "Success")) as adb:
            with self.assertRaisesRegex(PILOT.PilotError, "CRITICAL"):
                pilot.execute()
            self.assertEqual(adb.call_args.args, ("install", "-t", str(pilot.helper_apk)))
            self.assertFalse(pilot.report["target_apk_unchanged"])

    def test_same_binary_at_new_install_path_is_not_unchanged(self):
        pilot = PILOT.UsbPilot(arguments(), Path("/tmp/synthetic"))
        before = dict(IDENTITY, installed_apk_path="/data/app/before/base.apk")
        after = dict(IDENTITY, installed_apk_path="/data/app/after/base.apk")
        with patch.object(pilot, "preflight", return_value=before), \
                patch.object(pilot, "build_helper"), patch.object(pilot, "capture"), \
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
