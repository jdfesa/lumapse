import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import types
import unittest
from unittest.mock import patch, Mock


SPEC = importlib.util.spec_from_file_location(
    "artemis_launcher", Path(__file__).resolve().parents[1] / "artemis-direct-mcp.py"
)
launcher = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(launcher)


class ArtemisDirectTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.checkout = self.root / "checkout"
        (self.checkout / "artemis/mcp").mkdir(parents=True)
        (self.checkout / "artemis/mcp/adb_server.py").write_text("# fixture\n")
        (self.checkout / "uv.lock").write_text("# fixture\n")
        self.python = self.checkout / ".venv/bin/python"
        self.python.parent.mkdir(parents=True)
        self.python.write_text("# fixture\n")
        self.python.chmod(0o700)
        self.adb = self.root / "bin/adb"
        self.adb.parent.mkdir()
        self.adb.write_text("# fixture\n")
        self.adb.chmod(0o700)
        self.state = self.root / "state"
        self.state.mkdir(mode=0o700)
        self.config = {"checkout": str(self.checkout), "state_dir": str(self.state),
                       "adb": str(self.adb), "target": "SYNTHETIC_USB_PIN"}
        self.config_path = self.root / "config.json"
        self.save()
        self.git = patch.object(launcher, "git_output", side_effect=[launcher.REVISION, ""])

    def save(self):
        self.config_path.write_text(json.dumps(self.config))
        self.config_path.chmod(0o600)

    def test_explicit_pin_reaches_real_upstream_variables(self):
        with self.git, patch.dict(os.environ, {"ARTEMIS_DEVICE_ID": "OTHER", "ANDROID_SERIAL": "OTHER",
                    "ARTEMIS_CLOUD_MODE": "1", "ARTEMIS_HIERARCHY_BACKEND": "auto", "GROQ_API_KEY": "fixture"}):
            checkout, python, env = launcher.prepare(launcher.load_config(self.config_path))
        self.assertEqual(checkout, self.checkout)
        self.assertEqual(python, self.python)
        for name in ("ARTEMIS_DEVICE_ID", "ADB_DEVICE_SERIAL"):
            self.assertEqual(env[name], "SYNTHETIC_USB_PIN")
        self.assertNotIn("ANDROID_SERIAL", env)
        self.assertNotIn("GROQ_API_KEY", env)
        self.assertEqual(env["ARTEMIS_CLOUD_MODE"], "0")
        self.assertEqual(env["ARTEMIS_HIERARCHY_BACKEND"], "helper")
        for name in ("ARTEMIS_HELPER_AUTO_INSTALL", "ARTEMIS_KEEP_DEVICE_AWAKE"):
            self.assertEqual(env[name], "false")
        self.assertEqual(env["ADB_SERVER_SOCKET"], "tcp:127.0.0.1:5037")
        self.assertEqual(env["ADB_HOST"], "127.0.0.1")
        self.assertEqual(env["ADB_PORT"], "5037")
        for name in ("home", "tmp", "app"):
            self.assertEqual((self.state / name).stat().st_mode & 0o777, 0o700)

    def test_missing_empty_multiple_or_network_target_rejected(self):
        for value in (None, "", " ", "PIN OTHER", ["PIN", "OTHER"], "127.0.0.1:5555", "emulator-5554", "PIN\n"):
            with self.subTest(value=value):
                self.config["target"] = value
                self.save()
                with self.assertRaises(launcher.GuardError):
                    launcher.load_config(self.config_path)
        del self.config["target"]
        self.save()
        with self.assertRaises(launcher.GuardError):
            launcher.load_config(self.config_path)

    def test_unknown_config_keys_and_relative_paths_rejected(self):
        self.config["ADB_HOST"] = "remote"
        self.save()
        with self.assertRaises(launcher.GuardError):
            launcher.load_config(self.config_path)
        del self.config["ADB_HOST"]
        self.config["checkout"] = "relative"
        self.save()
        with self.assertRaises(launcher.GuardError):
            launcher.load_config(self.config_path)

    def test_duplicate_keys_and_bad_json_rejected(self):
        for value in ('{"target":"A","target":"B"}', '{"target":'):
            self.config_path.write_text(value)
            with self.assertRaises((launcher.GuardError, ValueError)):
                launcher.load_config(self.config_path)

    def test_shared_config_or_symlink_rejected(self):
        self.config_path.chmod(0o644)
        with self.assertRaises(launcher.GuardError):
            launcher.load_config(self.config_path)
        self.config_path.chmod(0o600)
        link = self.root / "link.json"
        link.symlink_to(self.config_path)
        with self.assertRaises(launcher.GuardError):
            launcher.load_config(link)

    def test_wrong_owner_or_large_config_rejected(self):
        with patch.object(launcher.os, "getuid", return_value=os.getuid() + 1):
            with self.assertRaises(launcher.GuardError):
                launcher.load_config(self.config_path)
        self.config_path.write_text(" " * 8193)
        with self.assertRaises(launcher.GuardError):
            launcher.load_config(self.config_path)

    def test_wrong_revision_and_dirty_checkout_rejected(self):
        for outputs in (["wrong"], [launcher.REVISION, " M uv.lock"]):
            with patch.object(launcher, "git_output", side_effect=outputs):
                with self.assertRaises(launcher.GuardError):
                    launcher.prepare(self.config)

    def test_missing_executables_fail_without_install(self):
        self.python.unlink()
        with self.git:
            with self.assertRaises(launcher.GuardError):
                launcher.prepare(self.config)

    def test_shared_state_and_children_rejected(self):
        self.state.chmod(0o755)
        with self.git:
            with self.assertRaises(launcher.GuardError):
                launcher.prepare(self.config)
        self.state.chmod(0o700)
        (self.state / "home").mkdir(mode=0o755)
        (self.state / "home").chmod(0o755)
        with patch.object(launcher, "git_output", side_effect=[launcher.REVISION, ""]):
            with self.assertRaises(launcher.GuardError):
                launcher.prepare(self.config)

    def test_symlink_child_rejected(self):
        (self.state / "home").symlink_to(self.root, target_is_directory=True)
        with self.git:
            with self.assertRaises(launcher.GuardError):
                launcher.prepare(self.config)

    def test_dotenv_rejected_without_reading_it(self):
        (self.checkout / ".env").write_text("# fixture")
        with self.git:
            with self.assertRaises(launcher.GuardError):
                launcher.prepare(self.config)

    def test_validation_errors_do_not_echo_private_values(self):
        self.config["target"] = "SYNTHETIC_SECRET:5555"
        self.save()
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err), patch.object(launcher.os, "execve") as execute:
            self.assertEqual(launcher.main(["--config", str(self.config_path)]), 2)
        self.assertEqual(out.getvalue(), "")
        self.assertNotIn("SYNTHETIC_SECRET", err.getvalue())
        self.assertNotIn(str(self.root), err.getvalue())
        execute.assert_not_called()

    def test_git_checks_are_bounded_and_ignore_inherited_git_redirects(self):
        with patch.dict(os.environ, {"GIT_DIR": "other", "GIT_WORK_TREE": "other"}), patch.object(launcher.subprocess, "run") as run:
            run.return_value = subprocess.CompletedProcess([], 0, launcher.REVISION, "")
            self.assertEqual(launcher.git_output(self.checkout, ["rev-parse", "HEAD"]), launcher.REVISION)
        self.assertEqual(run.call_args.kwargs["timeout"], 10)
        self.assertNotIn("GIT_DIR", run.call_args.kwargs["env"])
        self.assertNotIn("GIT_WORK_TREE", run.call_args.kwargs["env"])
        self.assertEqual(run.call_args.kwargs["stdin"], subprocess.DEVNULL)

    def test_timeout_and_exec_failure_are_sanitized(self):
        for error in (subprocess.TimeoutExpired("SYNTHETIC_SECRET", 10), OSError("SYNTHETIC_SECRET")):
            with patch.object(launcher, "prepare", side_effect=error), contextlib.redirect_stderr(io.StringIO()) as err:
                self.assertEqual(launcher.main(["--config", str(self.config_path)]), 2)
            self.assertNotIn("SYNTHETIC_SECRET", err.getvalue())

    def test_exec_uses_existing_venv_isolated_stdio_and_no_discovery(self):
        with self.git, patch.object(launcher.os, "chdir") as chdir, patch.object(launcher.os, "execve") as execute:
            self.assertEqual(launcher.main(["--config", str(self.config_path)]), 0)
        chdir.assert_called_once_with(self.checkout)
        argv = execute.call_args.args[1]
        self.assertEqual(argv[:4], [str(self.python), "-I", "-B", "-c"])
        self.assertNotIn("_get_controller", argv[4])
        self.assertNotIn("awake_service", argv[4])

    def test_bootstrap_only_configures_and_serves_no_ui_tools(self):
        server = types.ModuleType("artemis.mcp.adb_server")
        server.configure_stdio_mode = Mock()
        server.mcp = Mock()
        with patch.dict("sys.modules", {"artemis.mcp.adb_server": server}), patch.object(launcher.sys, "argv", ["-c", "SYNTHETIC_CHECKOUT"]), patch.object(launcher.sys, "path", []):
            exec(launcher.BOOTSTRAP, {})
        server.configure_stdio_mode.assert_called_once_with()
        server.mcp.run.assert_called_once_with(transport="stdio")


if __name__ == "__main__":
    unittest.main()
