#!/usr/bin/env python3
"""Piloto opt-in por USB: instala solo androidTest; nunca acredita CRUD/FPS."""

import argparse
import datetime
import hashlib
import json
import math
import os
from pathlib import Path
import re
import select
import shlex
import shutil
import subprocess
import sys
import time
import uuid

ROOT = Path(__file__).resolve().parents[1]
TARGET = "com.lumapse.app"
HELPER = TARGET + ".test"
RUNNER = "androidx.test.runner.AndroidJUnitRunner"
TEST = TARGET + ".WebViewTracePilotTest#capturePilot"
BRANCH = "test/android-performance-evidence"
APK = ROOT / "android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk"
LIMIT = 64 * 1024 * 1024
STATUS_LIMIT = 64 * 1024
PARTIAL_READ_LIMIT = 3
NATIVE_SOURCE = "android/app/src/androidTest/java/com/lumapse/app/WebViewTracePilotTest.java"


class PilotError(Exception):
    pass


class PartialStatusError(PilotError):
    """Only empty or recognizably incomplete JSON may receive bounded retries."""
    pass


def run(command, timeout=30, binary=False, check=True, cwd=ROOT):
    result = subprocess.run(command, cwd=cwd, capture_output=True,
                            text=not binary, timeout=timeout, check=False)
    if check and result.returncode:
        # Do not dump arbitrary device/build output into public summaries.
        raise PilotError(f"Command failed: {Path(command[0]).name} (exit {result.returncode})")
    return result


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def cached_gradle(home, properties):
    config = dict(line.split("=", 1) for line in properties.splitlines() if "=" in line and not line.startswith("#"))
    url = config.get("distributionUrl", "").replace("\\:", ":")
    distribution = re.fullmatch(r"https://services\.gradle\.org/distributions/gradle-([0-9.]+)-(all|bin)\.zip", url)
    if (not distribution or any(config.get(key) != value for key, value in (
            ("distributionBase", "GRADLE_USER_HOME"), ("zipStoreBase", "GRADLE_USER_HOME"),
            ("distributionPath", "wrapper/dists"), ("zipStorePath", "wrapper/dists")))):
        raise PilotError("Unrecognized wrapper cache configuration; no bootstrap is authorized")
    # Gradle PathAssembler uses MD5/base36 only as a cache locator, not as an integrity hash.
    number = int.from_bytes(hashlib.md5(url.encode("utf-8")).digest(), "big")
    locator = ""
    while number:
        number, digit = divmod(number, 36)
        locator = "0123456789abcdefghijklmnopqrstuvwxyz"[digit] + locator
    version, kind = distribution.groups()
    cache = home / "wrapper/dists" / f"gradle-{version}-{kind}" / (locator or "0")
    directories = [path for path in cache.iterdir() if path.is_dir()] if cache.is_dir() else []
    root = cache / f"gradle-{version}"
    if (directories != [root] or not (cache / f"gradle-{version}-{kind}.zip.ok").is_file()
            or not (root / "bin/gradle").is_file()
            or not (root / f"lib/gradle-launcher-{version}.jar").is_file()):
        raise PilotError("Exact Gradle wrapper distribution not already cached; no download is authorized")
    return version


def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    path.chmod(0o600)


def apk_identity(path, aapt, apksigner, allow_unversioned=False):
    badging = run([aapt, "dump", "badging", str(path)]).stdout
    package = re.search(r"^package: name='([^']+)' versionCode='([0-9]*)' versionName='([^']*)'", badging, re.M)
    certs = re.findall(r"^Signer #[0-9]+ certificate SHA-256 digest: ([a-fA-F0-9]{64})$",
                      run([apksigner, "verify", "--print-certs", str(path)]).stdout, re.M)
    if not package or len(certs) != 1:
        raise PilotError("Unverifiable APK identity or multiple signing certificates")
    # The test manifest need not inherit the application's release version. Never
    # invent it or relax the target pins; only the expected helper may be unversioned.
    if (not package[2] or not package[3]) and not (allow_unversioned and package[1] == HELPER):
        raise PilotError("Missing target APK version; only androidTest may be unversioned")
    return dict(package=package[1], version_code=int(package[2]) if package[2] else None,
                version_name=package[3] or None,
                certificate_sha256=certs[0].lower(), apk_sha256=sha256(path))


def verify_helper(manifest, identity, target):
    if identity["package"] != HELPER or identity["certificate_sha256"] != target["certificate_sha256"]:
        raise PilotError("Helper package/certificate mismatch; never replace or re-sign Lumapse")
    # aapt XML tree groups attributes beneath E: nodes. Require exactly one runner.
    blocks = re.split(r"(?m)^\s*E: ", manifest)[1:]
    instrumentation = [block for block in blocks if block.startswith("instrumentation ")]
    if len(instrumentation) != 1:
        raise PilotError("Expected exactly one instrumentation declaration")
    attributes = dict(re.findall(r'android:(name|targetPackage)\([^\n]*?\)="([^"\n]+)"', instrumentation[0]))
    if attributes != {"name": RUNNER, "targetPackage": TARGET}:
        raise PilotError("Wrong instrumentation runner/target")
    processes = re.findall(r'android:targetProcesses\([^\n]*?\)="([^"\n]+)"', instrumentation[0])
    if processes and processes != [TARGET]:
        raise PilotError("Unexpected instrumentation target processes")
    if any(block.startswith("receiver ") for block in blocks):
        raise PilotError("Unexpected receiver in helper; review before installation")


def inspect_trace(path):
    """Structural inventory only. Event names/timestamps do not prove presentation."""
    if path.stat().st_size > LIMIT:
        raise PilotError("Trace size exceeds pilot limit")
    try:
        def reject_constant(value):
            raise ValueError(f"Non-finite JSON constant: {value}")
        trace = json.loads(path.read_text(encoding="utf-8"), parse_constant=reject_constant)
    except (ValueError, UnicodeError) as error:
        raise PilotError("Original trace is not valid JSON") from error
    events = trace.get("traceEvents") if isinstance(trace, dict) else None
    if not isinstance(events, list) or not events or any(not isinstance(event, dict) for event in events):
        raise PilotError("Missing/non-object/empty traceEvents")
    timestamps = [event["ts"] for event in events if "ts" in event]
    if any(isinstance(value, bool) or not isinstance(value, (int, float))
           or not math.isfinite(value) for value in timestamps):
        raise PilotError("Invalid trace timestamps")
    phases = {}
    for event in events:
        phase = str(event.get("ph", "missing"))
        phases[phase] = phases.get(phase, 0) + 1
    return dict(trace_sha256=sha256(path), trace_bytes=path.stat().st_size,
                trace_event_count=len(events), phases=phases,
                timestamp_min=min(timestamps) if timestamps else None,
                timestamp_max=max(timestamps) if timestamps else None,
                clock="SDK JSON ts; clock domain/offset to elapsedRealtime requires review",
                scope_validation="PENDING: inspect process/renderer attribution; no global tracer used",
                loss_validation="PENDING: absence of an overflow flag does not establish losslessness",
                input_to_correct_presented_frame_ms=None, persistence_ms=None, refresh_ms=None,
                complete_presented_frames=None, partial_frames=None, lost_frames=None, fps=None,
                rnf_002="PENDING", rnf_004="PENDING", semantic_validation="PENDING",
                reason="Review actual input and correctly presented frame boundaries/classification before any series")


def parser():
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--serial", required=True, help="USB serial explícito; nunca autoselección")
    result.add_argument("--expected-head", required=True)
    result.add_argument("--app-source-sha", required=True, help="Fuente de la APK instalada, no HEAD del helper")
    result.add_argument("--expected-app-sha256", required=True)
    result.add_argument("--expected-app-cert-sha256", required=True)
    result.add_argument("--expected-version", default="0.5.0")
    result.add_argument("--expected-version-code", type=int, default=500)
    result.add_argument("--expected-api", type=int, default=29)
    result.add_argument("--expected-model", default="SM-G965F")
    result.add_argument("--aapt", required=True, help="Binario existente del SDK; no instala herramientas")
    result.add_argument("--apksigner", required=True, help="Binario existente del SDK; no lee keystores")
    result.add_argument("--gradle-user-home", required=True, type=Path, help="Caché Gradle existente; no descarga distribución")
    result.add_argument("--output", required=True, type=Path, help="Directorio nuevo privado, fuera de Git o ignorado")
    mode = result.add_mutually_exclusive_group()
    mode.add_argument("--reuse-helper", action="store_true", help="Reusar solo auxiliar exacto verificado sin cambios nativos")
    mode.add_argument("--update-helper", action="store_true", help="Actualizar solo auxiliar previo exacto y de firma compatible")
    result.add_argument("--expected-installed-helper-sha256")
    result.add_argument("--installed-helper-source-sha", help="Proveniencia documentada del auxiliar previo, separada del script/target")
    result.add_argument("--capture-ms", type=int, default=8000)
    result.add_argument("--yes-pilot", action="store_true")
    result.add_argument("--acknowledge-restart", action="store_true")
    return result


def validate_args(args):
    if not args.yes_pilot or not args.acknowledge_restart:
        raise PilotError("Explicit --yes-pilot and --acknowledge-restart required")
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", args.serial):
        raise PilotError("Invalid USB serial (network transports are not allowed)")
    for value in (args.expected_head, args.app_source_sha):
        if not re.fullmatch(r"[a-f0-9]{40}", value):
            raise PilotError("Expected full lowercase source SHA")
    for value in (args.expected_app_sha256, args.expected_app_cert_sha256):
        if not re.fullmatch(r"[a-f0-9]{64}", value):
            raise PilotError("Expected full lowercase SHA-256")
    if not 1000 <= args.capture_ms <= 8000 or args.expected_api < 28:
        raise PilotError("Pilot requires API28+ and 1000–8000ms (10s observed maximum)")
    opted = args.reuse_helper or args.update_helper
    pins = (args.expected_installed_helper_sha256, args.installed_helper_source_sha)
    if opted:
        if (not pins[0] or not re.fullmatch(r"[a-f0-9]{64}", pins[0])
                or not pins[1] or not re.fullmatch(r"[a-f0-9]{40}", pins[1])):
            raise PilotError("Reuse/update requires full known helper hash and source provenance pins")
    elif any(pins):
        raise PilotError("Helper pins require explicit --reuse-helper or --update-helper")
    args.gradle_user_home = args.gradle_user_home.expanduser().resolve()


def prepare_output(path):
    path = path.expanduser().absolute()
    if path.exists() or path.is_symlink():
        raise PilotError("Output must be a new private directory")
    parent = path.parent.resolve()
    if parent == ROOT or ROOT in parent.parents:
        ignored = run(["git", "check-ignore", "--quiet", str(parent / path.name / "trace.json")], check=False)
        if ignored.returncode != 0:
            raise PilotError("Raw outputs inside repository must be Git-ignored")
    path.mkdir(mode=0o700, parents=True, exist_ok=False)
    path.chmod(0o700)
    return path


class UsbPilot:
    def __init__(self, args, output):
        self.args, self.output = args, output
        self.run_id = uuid.uuid4().hex
        self.remote = "cache/f3-webview-pilot/" + self.run_id
        self.helper_apk = output / "helper.apk"
        self.process = None
        self.status_read_attempt = 0
        self.report = dict(status="PENDING", branch=BRANCH, helper_source_sha=args.expected_head, script_source_sha=args.expected_head,
                           app_source_sha=args.app_source_sha, run_id=self.run_id,
                           capture_requested_ms=args.capture_ms, android_validation="pending",
                           rnf_002="PENDING", rnf_004="PENDING", functional_result="PENDING_OPERATOR_REVIEW",
                           target_apk_unchanged=None)

    def adb(self, *arguments, **kwargs):
        return run(["adb", "-s", self.args.serial, *arguments], **kwargs)

    def private_read(self, filename, check=True, timeout=15):
        if filename not in ("status.json", "trace.json"):
            raise PilotError("Not a pilot output")
        return self.adb("exec-out", "run-as", TARGET, "cat", self.remote + "/" + filename,
                        binary=True, check=check, timeout=timeout)

    def target_identity(self, destination):
        paths = self.adb("shell", "pm", "path", "--user", "0", TARGET).stdout.strip().splitlines()
        if len(paths) != 1 or not re.fullmatch(r"package:/[A-Za-z0-9_./=+~-]+\.apk", paths[0]):
            raise PilotError("Expected one installed target APK, no splits/unknown paths")
        self.adb("pull", paths[0][len("package:"):], str(destination), timeout=60)
        destination.chmod(0o600)
        identity = apk_identity(destination, self.args.aapt, self.args.apksigner)
        # A reinstallation of the same binary is still a changed installation.
        identity["installed_apk_path"] = paths[0][len("package:"):]
        return identity

    def preflight(self):
        if run(["git", "status", "--porcelain"]).stdout.strip():
            raise PilotError("Dirty checkout; preserve changes and synchronize before pilot")
        if (run(["git", "branch", "--show-current"]).stdout.strip() != BRANCH
                or run(["git", "rev-parse", "HEAD"]).stdout.strip() != self.args.expected_head
                or run(["git", "rev-parse", "@{u}"]).stdout.strip() != self.args.expected_head):
            raise PilotError("Wrong branch/head/upstream; review and pull ff-only first")
        run(["npm", "run", "check:runtime", "--silent"])
        java = run(["java", "-XshowSettings:properties", "-version"])
        java_version = re.search(r'version "(21(?:\.[^"\s]+)?)"', java.stderr + java.stdout)
        java_home = re.search(r"(?m)^\s*java.home = (.+)$", java.stderr + java.stdout)
        if not java_version or not java_home or not Path(java_home[1]).is_dir():
            raise PilotError("Existing JDK21 required; do not install/change a global runtime")
        wrapper = (ROOT / "android/gradle/wrapper/gradle-wrapper.properties").read_text()
        version = cached_gradle(self.args.gradle_user_home, wrapper)
        self.gradle_command = [str(ROOT / "android/gradlew"), "--offline", "--no-daemon",
                               "--gradle-user-home", str(self.args.gradle_user_home),
                               "-Dorg.gradle.java.home=" + java_home[1], "-Pandroid.builder.sdkDownload=false"]
        gradle = run(self.gradle_command + ["--version"], cwd=ROOT / "android", timeout=60).stdout
        if not re.search(r"(?m)^Gradle " + re.escape(version) + r"\s*$", gradle) or not re.search(r"(?m)^Launcher JVM:\s+21[.\s]", gradle):
            raise PilotError("Gradle version/launcher JDK mismatch; review session JAVA_HOME/PATH, no global changes")
        devices = run(["adb", "devices", "-l"]).stdout.splitlines()
        lines = [line for line in devices if line.split() and line.split()[0] == self.args.serial]
        if len(lines) != 1 or not re.search(r"\sdevice\s", lines[0]) or "usb:" not in lines[0]:
            raise PilotError("Explicit device must be authorized and connected by USB")
        api = int(self.adb("shell", "getprop", "ro.build.version.sdk").stdout.strip())
        model = self.adb("shell", "getprop", "ro.product.model").stdout.strip()
        if api != self.args.expected_api or model != self.args.expected_model:
            raise PilotError("Unexpected device/API; review scope before testing")
        if self.adb("shell", "am", "get-current-user").stdout.strip() != "0":
            raise PilotError("Expected Android user0")
        self.adb("shell", "run-as", TARGET, "id")  # no root; only installed debuggable target
        target = self.target_identity(self.output / "target-before.apk")
        expected = dict(package=TARGET, version_name=self.args.expected_version,
                        version_code=self.args.expected_version_code,
                        apk_sha256=self.args.expected_app_sha256,
                        certificate_sha256=self.args.expected_app_cert_sha256)
        if any(target.get(key) != value for key, value in expected.items()):
            raise PilotError("Installed target identity mismatch; no install will be attempted")
        self.report.update(target_before=target, device=dict(model=model, api=api),
                           runtime=dict(node="22.20.0", npm="10.9.3", java=java_version[1],
                                        gradle=version, python=sys.version.split()[0]))
        return target

    def installed_helper(self, target):
        paths = self.adb("shell", "pm", "path", "--user", "0", HELPER, check=False).stdout.strip().splitlines()
        opted = self.args.reuse_helper or self.args.update_helper
        if not paths:
            if opted:
                raise PilotError("Pinned helper not installed; no implicit fresh installation")
            return None
        if not opted:
            raise PilotError("Helper already installed; explicit pinned reuse/update required")
        if len(paths) != 1 or not re.fullmatch(r"package:/[A-Za-z0-9_./=+~-]+\.apk", paths[0]):
            raise PilotError("Unknown helper installation/splits")
        apk = self.output / "helper-before.apk"
        self.adb("pull", paths[0][len("package:"):], str(apk), timeout=60)
        apk.chmod(0o400)
        identity = apk_identity(apk, self.args.aapt, self.args.apksigner, allow_unversioned=True)
        manifest = run([self.args.aapt, "dump", "xmltree", str(apk), "AndroidManifest.xml"]).stdout
        verify_helper(manifest, identity, target)
        if identity["apk_sha256"] != self.args.expected_installed_helper_sha256:
            raise PilotError("Unknown helper hash; preserve it, no update/reuse")
        self.report.update(helper_before=identity,
                           installed_helper_source_sha=self.args.installed_helper_source_sha)
        if self.args.reuse_helper:
            unchanged = run(["git", "diff", "--quiet", self.args.installed_helper_source_sha,
                             self.args.expected_head, "--", "android/app/src/androidTest", "android/app/build.gradle",
                             "android/build.gradle", "android/variables.gradle"], check=False)
            if unchanged.returncode != 0:
                raise PilotError("Cannot reuse helper with changed/unknown native source provenance")
        return identity

    def prepare_helper(self, target):
        previous = self.installed_helper(target)
        if self.args.reuse_helper:
            self.helper_apk = self.output / "helper-before.apk"
            self.report.update(helper=previous, helper_source_sha=self.args.installed_helper_source_sha,
                               helper_action="REUSED_VERIFIED", helper_installed=False)
            return
        self.build_helper(target)
        if previous and self.report["helper"]["apk_sha256"] == previous["apk_sha256"]:
            self.report.update(helper_action="REUSED_IDENTICAL_BUILD", helper_installed=False)
            return
        # Recheck the known installation immediately before changing ONLY the helper.
        current = self.adb("shell", "pm", "path", "--user", "0", HELPER, check=False).stdout.strip()
        if previous:
            check_apk = self.output / "helper-preinstall.apk"
            if not re.fullmatch(r"package:/[A-Za-z0-9_./=+~-]+\.apk", current):
                raise PilotError("Helper changed during build; no update")
            self.adb("pull", current[len("package:"):], str(check_apk), timeout=60)
            check_apk.chmod(0o400)
            if sha256(check_apk) != previous["apk_sha256"]:
                raise PilotError("Helper changed during build; no update")
        elif current:
            raise PilotError("Unexpected helper appeared during build; no installation")
        flags = ("-r", "-t") if previous else ("-t",)
        installed = self.adb("install", *flags, str(self.helper_apk), timeout=60)
        if installed.stdout.strip() != "Success" and not installed.stdout.rstrip().endswith("\nSuccess"):
            raise PilotError("Test helper installation not confirmed")
        self.report.update(helper_installed=True, helper_action="UPDATED_VERIFIED" if previous else "INSTALLED_NEW")
        path = self.adb("shell", "pm", "path", "--user", "0", HELPER).stdout.strip()
        if not re.fullmatch(r"package:/[A-Za-z0-9_./=+~-]+\.apk", path):
            raise PilotError("Installed helper path unverified; no instrumentation")
        after = self.output / "helper-after.apk"
        self.adb("pull", path[len("package:"):], str(after), timeout=60)
        after.chmod(0o400)
        if sha256(after) != self.report["helper"]["apk_sha256"]:
            raise PilotError("Installed helper hash mismatch; no instrumentation")

    def build_helper(self, target):
        # Existing caches only, no tooling/dependency installation, Vite build, sync or main deploy.
        built = run(self.gradle_command + [":app:assembleDebugAndroidTest"],
                    timeout=300, cwd=ROOT / "android", check=False)
        (self.output / "build.txt").write_text(built.stdout + built.stderr, encoding="utf-8")
        if built.returncode:
            raise PilotError(f"Test-only Gradle build failed (exit {built.returncode}); review local build.txt")
        if not APK.is_file() or APK.is_symlink():
            raise PilotError("Expected test APK missing")
        shutil.copyfile(APK, self.helper_apk)
        self.helper_apk.chmod(0o400)
        identity = apk_identity(self.helper_apk, self.args.aapt, self.args.apksigner, allow_unversioned=True)
        manifest = run([self.args.aapt, "dump", "xmltree", str(self.helper_apk), "AndroidManifest.xml"]).stdout
        verify_helper(manifest, identity, target)
        self.report["helper"] = identity

    def read_status(self, data):
        if len(data) > STATUS_LIMIT:
            raise PilotError("Native status size limit exceeded")
        if not data.strip():
            raise PartialStatusError("Empty native status snapshot")
        try:
            text = data.decode("utf-8")
        except UnicodeDecodeError as error:
            if data.lstrip().startswith(b"{") and error.reason == "unexpected end of data":
                raise PartialStatusError("Incomplete native status encoding") from error
            raise PilotError("Invalid native status encoding") from error
        def unique_object(pairs):
            result = {}
            for key, value in pairs:
                if key in result:
                    raise PilotError("Duplicate native status key")
                result[key] = value
            return result
        def nonfinite(value):
            raise PilotError("Nonfinite native status constant")
        try:
            state = json.loads(text, object_pairs_hook=unique_object, parse_constant=nonfinite)
        except json.JSONDecodeError as error:
            if text.lstrip().startswith("{") and (error.pos >= len(text.rstrip())
                    or error.msg.startswith("Unterminated string")):
                raise PartialStatusError("Incomplete native status snapshot") from error
            raise PilotError("Invalid native status JSON") from error
        if not isinstance(state, dict) or state.get("run_id") != self.run_id:
            raise PilotError("Unexpected native status/run identity")
        if (state.get("target_package") != TARGET or state.get("helper_package") != HELPER
                or state.get("process_name") != TARGET or state.get("api") != self.args.expected_api
                or state.get("model") != self.args.expected_model
                or state.get("requested_capture_ms") != self.args.capture_ms
                or state.get("state") not in ("READY", "CAPTURING", "CAPTURED", "ERROR")):
            raise PilotError("Unexpected native capture scope/state")
        if state["state"] == "CAPTURED":
            self.validate_captured(state)
        return state

    def validate_captured(self, state):
        if state.get("state") != "CAPTURED" or state.get("output_stream_closed") is not True:
            raise PilotError("No SDK OutputStream close acknowledgment")
        timestamps = [state.get(key) for key in (
            "start_call_before_elapsed_ns", "start_call_after_elapsed_ns",
            "stop_call_before_elapsed_ns", "stop_call_after_elapsed_ns", "flush_closed_elapsed_ns")]
        # Callback close can run before stop returns. Do not impose a false order
        # between those two events, and never map elapsedRealtime to Chromium ts.
        if (any(type(value) is not int or value < 0 for value in timestamps)
                or timestamps[:4] != sorted(timestamps[:4]) or timestamps[4] < timestamps[2]
                or timestamps[3] - timestamps[0] > 10_000_000_000):
            raise PilotError("Unverifiable/overlong native capture interval")
        count = state.get("trace_bytes")
        digest = state.get("trace_sha256")
        if (type(count) is not int or not 0 < count <= LIMIT
                or not isinstance(digest, str) or not re.fullmatch(r"[a-f0-9]{64}", digest)):
            raise PilotError("Invalid native trace bytes/hash")

    def status_not_published(self, result):
        # exec-out may carry cat's diagnostic on stdout with exit 0. Match the
        # complete known message, never a substring or arbitrary malformed JSON.
        if (result.returncode not in (0, 1) or not re.fullmatch(r"[a-f0-9]{32}", self.run_id)
                or self.remote != "cache/f3-webview-pilot/" + self.run_id):
            return False
        message = f"cat: {self.remote}/status.json: No such file or directory".encode("ascii")
        messages = (message, message + b"\n", message + b"\r\n")
        return ((result.stdout in messages and not result.stderr)
                or (result.stderr in messages and not result.stdout))

    def record_status_failure(self, result, stage, reason, deadline):
        self.status_read_attempt += 1
        prefix = f"status-read-{self.status_read_attempt:04d}"
        data, stderr = result.stdout or b"", result.stderr or b""
        for suffix, payload in (("stdout", data), ("stderr", stderr)):
            path = self.output / f"{prefix}.{suffix}.bin"
            path.write_bytes(payload[:STATUS_LIMIT])
            path.chmod(0o600)
        record = dict(at_utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                      host_monotonic_s=time.monotonic(), deadline_monotonic_s=deadline, stage=stage, reason=reason,
                      adb_exit=result.returncode, stdout_bytes=len(data),
                      stdout_sha256=hashlib.sha256(data).hexdigest(), stderr_bytes=len(stderr),
                      stderr_sha256=hashlib.sha256(stderr).hexdigest(),
                      raw_prefix=prefix, raw_limit_bytes=STATUS_LIMIT)
        self.report.setdefault("status_read_failures", []).append(record)
        write_json(self.output / "status-read-diagnostics.json", self.report["status_read_failures"])

    def wait_state(self, desired, timeout):
        started = time.monotonic()
        deadline = started + timeout
        partial_reads = 0
        snapshot_seen = False
        stage = "/".join(sorted(desired))
        wait = dict(stage=stage, started_monotonic_s=started,
                    deadline_monotonic_s=deadline, timeout_s=timeout)
        self.report.setdefault("status_waits", []).append(wait)

        def expired():
            wait["deadline_exceeded"] = True
            raise PilotError("Native " + stage + " deadline exceeded; inspect private diagnostics")

        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                expired()
            try:
                result = self.private_read("status.json", check=False, timeout=min(2, remaining))
            except subprocess.TimeoutExpired as error:
                result = subprocess.CompletedProcess([], -1, error.output or b"", error.stderr or b"")
                self.record_status_failure(result, stage, "STATUS_READ_TIMEOUT", deadline)
                raise PilotError("Native status transport timeout; inspect private diagnostics") from error
            if time.monotonic() >= deadline:
                self.record_status_failure(result, stage, "STATUS_AFTER_DEADLINE", deadline)
                expired()  # Never accept a late READY or send start after this deadline.
            if self.status_not_published(result):
                if stage != "READY" or snapshot_seen:
                    self.record_status_failure(result, stage, "UNEXPECTED_STATUS_ABSENCE", deadline)
                    raise PilotError("Native status disappeared; inspect private diagnostics")
                self.record_status_failure(result, stage, "STATUS_NOT_YET_PUBLISHED", deadline)
            elif result.returncode != 0 or result.stderr:
                self.record_status_failure(result, stage, "STATUS_READ_REJECTED", deadline)
                raise PilotError("Native status read failed; inspect private diagnostics")
            else:
                snapshot_seen = True
                try:
                    state = self.read_status(result.stdout)
                except PartialStatusError:
                    self.record_status_failure(result, stage, "INCOMPLETE_SNAPSHOT", deadline)
                    partial_reads += 1
                    if partial_reads >= PARTIAL_READ_LIMIT:
                        raise PilotError("Persistent incomplete native status; inspect private diagnostics")
                except PilotError:
                    self.record_status_failure(result, stage, "PERMANENT_STATUS_REJECTION", deadline)
                    raise
                else:
                    partial_reads = 0
                    if state["state"] == "ERROR":
                        write_json(self.output / "native-status.json", state)
                        raise PilotError("Native pilot failed; inspect private native-status.json")
                    if state["state"] in desired:
                        return state
                    previous = {"CAPTURING": "READY", "CAPTURED": "CAPTURING"}.get(stage)
                    if state["state"] != previous:
                        self.record_status_failure(result, stage, "UNEXPECTED_STAGE_STATE", deadline)
                        raise PilotError("Unexpected native state for " + stage)
            if self.process.poll() is not None:
                raise PilotError("Instrumentation ended before " + stage + "; inspect private instrumentation.txt")
            time.sleep(min(0.25, max(0, deadline - time.monotonic())))

    def capture(self):
        with (self.output / "instrumentation.txt").open("wb") as log:
            command = ["adb", "-s", self.args.serial, "shell", "am", "instrument", "--user", "0", "-w", "-r",
                       "-e", "class", TEST, "-e", "f3Pilot", "yes", "-e", "runId", self.run_id,
                       "-e", "captureMs", str(self.args.capture_ms), HELPER + "/" + RUNNER]
            self.process = subprocess.Popen(command, stdout=log, stderr=subprocess.STDOUT)
            self.wait_state({"READY"}, 40)
            print("READY: Lumapse pudo reiniciarse. Preparar una nota sintética, teclado/filtros y scroll.\n"
                  "No otra grabación/instrumentación de Lumapse activa. Enter cuando esté lista (máximo 90s).", flush=True)
            if not select.select([sys.stdin], [], [], 90)[0] or sys.stdin.readline() not in ("\n", "\r\n"):
                raise PilotError("Preparation not acknowledged within deadline")
            # Known private signal, no arbitrary command delivered by another machine.
            signal = "printf %s " + shlex.quote(self.run_id) + " > " + shlex.quote(self.remote + "/start.signal")
            self.adb("shell", "run-as", TARGET, "sh", "-c", shlex.quote(signal))
            self.wait_state({"CAPTURING"}, 5)
            print("CAPTURING: realizar UNA operación CRUD sintética y un scroll breve; solo diagnóstico.", flush=True)
            state = self.wait_state({"CAPTURED"}, 45)
            self.process.wait(timeout=10)
        text = (self.output / "instrumentation.txt").read_text(encoding="utf-8", errors="replace")
        if (self.process.returncode != 0 or "OK (1 test)" not in text
                or re.search(r"FAILURES!!!|INSTRUMENTATION_FAILED|shortMsg=|Process crashed", text)):
            raise PilotError("Instrumentation result is not a verified successful test")
        self.validate_captured(state)
        trace = self.output / "trace.json"
        trace.write_bytes(self.private_read("trace.json").stdout)
        trace.chmod(0o600)
        if sha256(trace) != state.get("trace_sha256") or trace.stat().st_size != state.get("trace_bytes"):
            raise PilotError("Native/local trace byte count or SHA-256 mismatch")
        write_json(self.output / "native-status.json", state)
        write_json(self.output / "trace-inventory.json", inspect_trace(trace))
        self.report.update(status="CAPTURED_PENDING_REVIEW", native_capture=state,
                           original_trace_sha256=sha256(trace), semantic_validation="PENDING")

    def execute(self):
        target = self.preflight()
        try:
            self.prepare_helper(target)
            self.capture()
        finally:
            if self.process is not None and self.process.poll() is None:
                # Native deadlines stop/flush its own trace. Never force-stop/clear/uninstall target.
                try:
                    self.process.wait(timeout=165)
                except subprocess.TimeoutExpired:
                    self.report["instrumentation_cleanup"] = "UNCONFIRMED; no device force-stop attempted"
                    try:
                        self.process.terminate()  # Only the local ADB child; not a device process.
                        self.process.wait(timeout=5)
                    except (OSError, subprocess.SubprocessError):
                        # Preserve the limitation but still attempt the immutable target check.
                        self.report["local_adb_cleanup"] = "UNCONFIRMED; supervision required"
            after = self.target_identity(self.output / "target-after.apk")
            self.report.update(target_after=after, target_apk_unchanged=(after == target))
            if after != target:
                raise PilotError("CRITICAL: target APK identity changed; preserve artifacts and request supervision")


def main(argv=None):
    args = parser().parse_args(argv)
    pilot = None
    try:
        validate_args(args)  # Before any build/ADB/filesystem operation.
        if not sys.stdin.isatty():
            raise PilotError("Interactive terminal required for preparation acknowledgment")
        os.umask(0o077)
        output = prepare_output(args.output)
        pilot = UsbPilot(args, output)
        pilot.execute()
        return 0
    except (PilotError, OSError, ValueError, subprocess.SubprocessError) as error:
        if pilot:
            pilot.report.update(status="ERROR", error=str(error))
        print(f"PENDING / {error}", file=sys.stderr)
        return 1
    finally:
        if pilot:
            write_json(pilot.output / "pilot-result.json", pilot.report)


if __name__ == "__main__":
    sys.exit(main())
