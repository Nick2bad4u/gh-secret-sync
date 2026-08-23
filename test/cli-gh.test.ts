import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { GhResponse, SecretOperation } from "../src/cli-types.ts";

import {
    applySecretOperation,
    isGhAuthenticated,
    resolveGhExecutablePath,
    resolveRepo,
    runGh,
    runGhWithInput,
} from "../src/cli-gh.ts";

const FIRST_TRUSTED_GH_PATH: Readonly<Record<string, string>> = {
    darwin: "/opt/homebrew/bin/gh",
    freebsd: "/usr/local/bin/gh",
    linux: "/usr/bin/gh",
    openbsd: "/usr/local/bin/gh",
    win32: String.raw`C:\Program Files\GitHub CLI\gh.exe`,
};

const existsSyncMock = vi.hoisted(() => vi.fn<(path: string) => boolean>());
const spawnSyncMock = vi.hoisted(() =>
    vi.fn<
        (
            command: string,
            argumentList: readonly string[],
            options: Readonly<Record<string, unknown>>
        ) => {
            readonly error?: Error;
            readonly status: null | number;
            readonly stderr: null | string;
            readonly stdout: null | string;
        }
    >()
);

vi.mock("node:child_process", () => ({ spawnSync: spawnSyncMock }));
vi.mock("node:fs", () => ({ existsSync: existsSyncMock }));

function respond(response: Partial<GhResponse> = {}): void {
    spawnSyncMock.mockReturnValueOnce({
        status: response.status ?? 0,
        stderr: response.stderr ?? "",
        stdout: response.stdout ?? "",
    });
}

beforeEach(() => {
    existsSyncMock.mockReset();
    existsSyncMock.mockReturnValue(true);
    spawnSyncMock.mockReset();
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe(resolveGhExecutablePath, () => {
    it.each(Object.entries(FIRST_TRUSTED_GH_PATH))(
        "uses the first trusted path on %s",
        (platform, expectedPath) => {
            expect(
                resolveGhExecutablePath(platform, undefined, () => true)
            ).toBe(expectedPath);
        }
    );

    it("uses an existing absolute GH_PATH override", () => {
        const configuredPath = String.raw`D:\Tools\gh.exe`;

        expect(
            resolveGhExecutablePath(
                "win32",
                configuredPath,
                (path) => path === configuredPath
            )
        ).toBe(configuredPath);
    });

    it.each([
        ["relative/gh", "relative"],
        [String.raw`D:\missing\gh.exe`, "missing"],
    ])("rejects a %s GH_PATH override", (configuredPath) => {
        expect(
            resolveGhExecutablePath("unsupported", configuredPath, () => false)
        ).toBeUndefined();
    });
});

describe(runGh, () => {
    it("invokes the trusted executable with captured UTF-8 output", () => {
        respond({ stderr: "warning", stdout: "result" });

        expect(runGh(["auth", "status"])).toStrictEqual({
            status: 0,
            stderr: "warning",
            stdout: "result",
        });
        expect(spawnSyncMock).toHaveBeenCalledWith(
            FIRST_TRUSTED_GH_PATH["win32"],
            ["auth", "status"],
            { encoding: "utf8", stdio: "pipe" }
        );
    });

    it("returns a safe error when GitHub CLI cannot be found", () => {
        existsSyncMock.mockReturnValue(false);

        expect(runGh(["auth", "status"])).toStrictEqual({
            status: 1,
            stderr: expect.stringContaining("Unable to locate"),
            stdout: "",
        });
        expect(spawnSyncMock).not.toHaveBeenCalled();
    });

    it("normalizes null output and a spawn error", () => {
        spawnSyncMock.mockReturnValueOnce({
            error: new Error("spawn failed"),
            status: null,
            stderr: null,
            stdout: null,
        });

        expect(runGh(["api", "user"])).toStrictEqual({
            status: 1,
            stderr: "spawn failed",
            stdout: "",
        });
    });

    it("normalizes null output without a spawn error", () => {
        spawnSyncMock.mockReturnValueOnce({
            status: null,
            stderr: null,
            stdout: null,
        });

        expect(runGh(["api", "user"])).toStrictEqual({
            status: 1,
            stderr: "",
            stdout: "",
        });
    });
});

describe(runGhWithInput, () => {
    it("passes sensitive input over stdin instead of command arguments", () => {
        respond();

        expect(
            runGhWithInput(
                [
                    "secret",
                    "set",
                    "API_KEY",
                ],
                "sensitive"
            )
        ).toStrictEqual({
            status: 0,
            stderr: "",
            stdout: "",
        });
        expect(spawnSyncMock).toHaveBeenCalledWith(
            FIRST_TRUSTED_GH_PATH["win32"],
            [
                "secret",
                "set",
                "API_KEY",
            ],
            {
                encoding: "utf8",
                input: "sensitive",
                stdio: "pipe",
            }
        );
    });

    it("returns a safe error when GitHub CLI cannot be found", () => {
        existsSyncMock.mockReturnValue(false);

        expect(
            runGhWithInput(
                [
                    "secret",
                    "set",
                    "API_KEY",
                ],
                "value"
            )
        ).toStrictEqual({
            status: 1,
            stderr: expect.stringContaining("Unable to locate"),
            stdout: "",
        });
    });
});

describe(resolveRepo, () => {
    it("returns an explicit repository without invoking GitHub CLI", () => {
        expect(resolveRepo("owner/repo")).toBe("owner/repo");
        expect(spawnSyncMock).not.toHaveBeenCalled();
    });

    it("resolves and trims the current repository", () => {
        respond({ stdout: "owner/repo\n" });

        expect(resolveRepo(undefined)).toBe("owner/repo");
    });

    it.each([
        {
            name: "non-zero response",
            response: { status: 1, stderr: "failed" },
        },
        { name: "empty response", response: { stdout: "  " } },
    ])("returns undefined for a $name", ({ response }) => {
        respond(response);

        expect(resolveRepo(undefined)).toBeUndefined();
    });
});

describe(isGhAuthenticated, () => {
    it.each([
        [0, true],
        [1, false],
    ])("maps status %i to %s", (status, expected) => {
        respond({ status });

        expect(isGhAuthenticated()).toBe(expected);
    });
});

describe(applySecretOperation, () => {
    it.each<{
        expectedArguments: readonly string[];
        operation: SecretOperation;
    }>([
        {
            expectedArguments: [
                "secret",
                "set",
                "ORG_DEFAULT_SECRET",
                "--org",
                "example",
            ],
            operation: {
                secretName: "ORG_DEFAULT_SECRET",
                target: {
                    kind: "org",
                    org: "example",
                },
                value: "organization-default-value",
            },
        },
        {
            expectedArguments: [
                "secret",
                "set",
                "REPO_SECRET",
                "--repo",
                "owner/repo",
            ],
            operation: {
                secretName: "REPO_SECRET",
                target: { kind: "repo", repo: "owner/repo" },
                value: "repo-value",
            },
        },
        {
            expectedArguments: [
                "secret",
                "set",
                "ENV_SECRET",
                "--repo",
                "owner/repo",
                "--env",
                "production",
            ],
            operation: {
                secretName: "ENV_SECRET",
                target: {
                    environment: "production",
                    kind: "repo",
                    repo: "owner/repo",
                },
                value: "environment-value",
            },
        },
        {
            expectedArguments: [
                "secret",
                "set",
                "ORG_SECRET",
                "--org",
                "example",
                "--visibility",
                "selected",
                "--repos",
                "owner/one,owner/two",
            ],
            operation: {
                secretName: "ORG_SECRET",
                target: {
                    kind: "org",
                    org: "example",
                    selectedRepos: ["owner/one", "owner/two"],
                    visibility: "selected",
                },
                value: "organization-value",
            },
        },
    ])(
        "builds arguments and keeps $operation.secretName off argv",
        ({ expectedArguments, operation }) => {
            respond();

            expect(applySecretOperation(operation)).toStrictEqual({
                ok: true,
                operation,
            });
            expect(spawnSyncMock).toHaveBeenCalledWith(
                FIRST_TRUSTED_GH_PATH["win32"],
                expectedArguments,
                expect.objectContaining({ input: operation.value })
            );
            expect(expectedArguments).not.toContain(operation.value);
            expect(expectedArguments).not.toContain("--body");
        }
    );

    it.each([
        [{ status: 1, stderr: "stderr failure" }, "stderr failure"],
        [{ status: 1, stdout: "stdout failure" }, "stdout failure"],
        [{ status: 7 }, "gh command failed with exit code 7"],
    ])("returns a normalized failure", (response, expectedError) => {
        const operation: SecretOperation = {
            secretName: "API_KEY",
            target: { kind: "repo", repo: "owner/repo" },
            value: "value",
        };
        respond(response);

        expect(applySecretOperation(operation)).toStrictEqual({
            error: expectedError,
            ok: false,
            operation,
        });
    });
});
