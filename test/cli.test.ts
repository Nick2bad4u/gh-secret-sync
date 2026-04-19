import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { main } from "../src/cli.js";

async function withSilentConsole<T>(callback: () => Promise<T>): Promise<T> {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = () => {};
    console.error = () => {};

    try {
        return await callback();
    } finally {
        console.log = originalLog;
        console.error = originalError;
    }
}

test("main returns 0 for --help", async () => {
    const code = await withSilentConsole(async () => await main(["--help"]));
    assert.equal(code, 0);
});

test("main returns 1 when no operations are provided", async () => {
    const code = await withSilentConsole(async () => await main([]));
    assert.equal(code, 1);
});

test("main returns 1 for invalid --repo format", async () => {
    const code = await withSilentConsole(
        async () =>
            await main([
                "--repo",
                "not-a-repo",
                "--secret-name",
                "API_KEY",
                "--secret-value",
                "abc",
            ])
    );

    assert.equal(code, 1);
});

test("main returns 1 for invalid --secret-name", async () => {
    const code = await withSilentConsole(
        async () =>
            await main([
                "--repo",
                "owner/repo",
                "--secret-name",
                "1INVALID",
                "--secret-value",
                "abc",
            ])
    );

    assert.equal(code, 1);
});

test("main returns 1 for invalid --set entry", async () => {
    const code = await withSilentConsole(
        async () =>
            await main([
                "--repo",
                "owner/repo",
                "--set",
                "NOT_VALID",
            ])
    );

    assert.equal(code, 1);
});

test("main returns 1 when multiple secret value sources are provided", async () => {
    const code = await withSilentConsole(
        async () =>
            await main([
                "--repo",
                "owner/repo",
                "--secret-name",
                "API_KEY",
                "--secret-value",
                "abc",
                "--secret-value-prompt",
            ])
    );

    assert.equal(code, 1);
});

test("main returns 1 when --org is combined with --repo", async () => {
    const code = await withSilentConsole(
        async () =>
            await main([
                "--org",
                "my-org",
                "--repo",
                "owner/repo",
                "--secret-name",
                "API_KEY",
                "--secret-value",
                "abc",
            ])
    );

    assert.equal(code, 1);
});

test("main returns 1 when plan file JSON is invalid", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "gh-secret-sync-test-"));
    const planPath = join(tempDir, "invalid-plan.json");

    writeFileSync(planPath, "{ this is not json", "utf8");

    try {
        const code = await withSilentConsole(
            async () => await main(["--plan-file", planPath])
        );
        assert.equal(code, 1);
    } finally {
        rmSync(tempDir, {
            force: true,
            recursive: true,
        });
    }
});

test("main returns 1 when plan format is invalid", async () => {
    const code = await withSilentConsole(
        async () =>
            await main([
                "--plan-file",
                "example.txt",
                "--plan-format",
                "xml",
            ])
    );

    assert.equal(code, 1);
});

test("main returns 1 when plan file CSV is invalid", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "gh-secret-sync-test-"));
    const planPath = join(tempDir, "invalid-plan.csv");

    writeFileSync(
        planPath,
        'target,repo,secret,value\nrepo,"unterminated,API_KEY,value',
        "utf8"
    );

    try {
        const code = await withSilentConsole(
            async () => await main(["--plan-file", planPath])
        );
        assert.equal(code, 1);
    } finally {
        rmSync(tempDir, {
            force: true,
            recursive: true,
        });
    }
});
