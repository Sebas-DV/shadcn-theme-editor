import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const cliPath = path.resolve(__dirname, "../dist/cli.js");

describe("shadcn-theme-editor CLI", () => {
  it("prints help message with --help", async () => {
    const { stdout } = await execFileAsync(process.execPath, [cliPath, "--help"]);
    expect(stdout).toContain("shadcn-theme-editor — companion server");
    expect(stdout).toContain("--port");
  });

  it("strictly fails with error exit code when NODE_ENV is production", async () => {
    try {
      await execFileAsync(process.execPath, [cliPath], {
        env: { ...process.env, NODE_ENV: "production" },
      });
      expect.unreachable("Should have failed in production");
    } catch (error: any) {
      expect(error.code).toBe(1);
      expect(error.stderr).toContain(
        "Security error: companion server cannot and must not run in production",
      );
    }
  });
});
