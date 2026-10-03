import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch


SPEC = importlib.util.spec_from_file_location(
    "release_helper", Path(__file__).resolve().parents[1] / "release-helper.py"
)
helper = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(helper)


class ReleaseBuildMetadataTests(unittest.TestCase):
    def test_candidate_channel_only_for_web_build_without_executing_pipeline(self):
        with patch.object(helper, "run_command") as run:
            helper.run_build_pipeline()
        self.assertEqual(run.call_count, 4)
        build = run.call_args_list[1]
        self.assertEqual(build.args[0], ["npm", "run", "build"])
        self.assertEqual(build.kwargs["env"]["LUMAPSE_BUILD_CHANNEL"], "android-candidate")
        for index in (0, 2, 3):
            self.assertNotIn("env", run.call_args_list[index].kwargs)

    def test_environment_reaches_subprocess_without_real_process(self):
        with patch.object(helper.subprocess, "run") as run:
            run.return_value.returncode = 0
            env = {"LUMAPSE_BUILD_CHANNEL": "android-candidate"}
            helper.run_command(["npm", "run", "build"], env=env)
        self.assertEqual(run.call_args.kwargs["env"], env)


if __name__ == "__main__":
    unittest.main()
