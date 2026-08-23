import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import * as nodePath from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
    SecretOperation,
    SecretOperationResult,
} from "../src/cli-types.ts";

import { main, runCli } from "../src/cli.ts";

const ghMocks = vi.hoisted(() => ({
    applySecretOperation:
        vi.fn<(operation: SecretOperation) => SecretOperationResult>(),
    isGhAuthenticated: vi.fn<() => boolean>(),
    resolveRepo: vi.fn<(repo: string | undefined) => string | undefined>(),
}));

vi.mock(import("../src/cli-gh.ts"), () => ghMocks);

interface CapturedMainResult {
    readonly code: number;
    readonly errors: readonly string[];
    readonly logs: readonly string[];
}

const temporaryDirectories: string[] = [];

async function captureMain(
    argumentList: string[]
): Promise<CapturedMainResult> {
    const errors: string[] = [];
    const logs: string[] = [];
    vi.spyOn(console, "error").mockImplementation((...values: unknown[]) => {
        errors.push(values.map(String).join(" "));
    });
    vi.spyOn(console, "log").mockImplementation((...values: unknown[]) => {
        logs.push(values.map(String).join(" "));
    });

    return {
        code: await main(argumentList),
        errors,
        logs,
    };
}

function createFixture(name: string, content: string): string {
    const directory = mkdtempSync(
        nodePath.join(tmpdir(), "gh-secret-sync-test-")
    );
    temporaryDirectories.push(directory);
    const path = nodePath.join(directory, name);
    writeFileSync(path, content, "utf8");
    return path;
}

function successfulResult(operation: SecretOperation): SecretOperationResult {
    return { ok: true, operation };
}

beforeEach(() => {
    ghMocks.applySecretOperation.mockReset();
    ghMocks.applySecretOperation.mockImplementation(successfulResult);
    ghMocks.isGhAuthenticated.mockReset();
    ghMocks.isGhAuthenticated.mockReturnValue(true);
    ghMocks.resolveRepo.mockReset();
    ghMocks.resolveRepo.mockReturnValue("owner/current");
});

afterEach(() => {
    for (const directory of temporaryDirectories) {
        rmSync(directory, { force: true, recursive: true });
    }
    temporaryDirectories.length = 0;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe("validation", () => {
    it("prints help and returns success for --help", async () => {
        const result = await captureMain(["--help"]);

        expect(result.code).toBe(0);
        expect(result.logs.join("\n")).toContain("gh-secret-sync");
        expect(ghMocks.isGhAuthenticated).not.toHaveBeenCalled();
    });

    it("supports unstyled help through --no-color", async () => {
        const result = await captureMain(["--help", "--no-color"]);

        expect(result.code).toBe(0);
        expect(result.logs.join("\n")).not.toContain("\u{1B}[");
    });

    it("requires at least one operation", async () => {
        const result = await captureMain([]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain(
            "no operations were generated"
        );
        expect(result.logs.join("\n")).toContain("Usage");
    });

    it("emits machine-readable validation errors without help text", async () => {
        const result = await captureMain(["--json"]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain('"validation_error"');
        expect(result.logs).toStrictEqual([]);
    });

    it("accepts inline option values and ignores positional arguments", async () => {
        const result = await captureMain([
            "ignored-positional-value",
            "--repo=owner/repo",
            "--set=INLINE_SECRET=value",
        ]);

        expect(result.code).toBe(0);
        expect(result.logs.join("\n")).toContain("Planned operations: 1");
    });

    it.each([
        ["not-a-repo", "invalid repository values"],
        ["owner/repo/extra", "invalid repository values"],
    ])("rejects invalid repository %s", async (repo, message) => {
        const result = await captureMain([
            "--repo",
            repo,
            "--set",
            "API_KEY=value",
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain(message);
    });

    it.each([
        "1INVALID",
        ["GITHUB", "TOKEN"].join("_"),
        ["github", "custom"].join("_"),
        "BAD-NAME",
    ])("rejects invalid secret name %s", async (secretName) => {
        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--secret-name",
            secretName,
            "--secret-value",
            "value",
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain("invalid --secret-name");
    });

    it.each([
        ["NAME", "NAME=VALUE"],
        ["=VALUE", "NAME=VALUE"],
        ["NAME=", "NAME=VALUE"],
        ["BAD-NAME=value", "invalid secret name"],
    ])("rejects invalid --set entry %s", async (pair, message) => {
        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--set",
            pair,
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain(message);
    });

    it("rejects multiple secret value sources", async () => {
        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--secret-name",
            "API_KEY",
            "--secret-value",
            "value",
            "--secret-value-prompt",
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain("provide only one of");
    });

    it("rejects repository targets combined with --org", async () => {
        const result = await captureMain([
            "--org",
            "example",
            "--repo",
            "owner/repo",
            "--set",
            "API_KEY=value",
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain("cannot be combined");
    });

    it("reports unauthenticated GitHub CLI state", async () => {
        ghMocks.isGhAuthenticated.mockReturnValue(false);

        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--set",
            "API_KEY=value",
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain("gh auth login");
    });

    it("reports an unresolved implicit repository", async () => {
        ghMocks.resolveRepo.mockReturnValue(undefined);

        const result = await captureMain(["--set", "API_KEY=value"]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain(
            "unable to resolve repository"
        );
    });

    it("reports an unresolved repository as JSON without help text", async () => {
        ghMocks.resolveRepo.mockReturnValue(undefined);

        const result = await captureMain([
            "--set",
            "API_KEY=value",
            "--json",
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain(
            "unable to resolve repository"
        );
        expect(result.logs).toStrictEqual([]);
    });
});

describe("secret value sources", () => {
    it("reads one secret from an environment variable", async () => {
        vi.stubEnv("GH_SECRET_SYNC_VALUE", "environment-value");

        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--secret-name",
            "API_KEY",
            "--secret-value-env",
            "GH_SECRET_SYNC_VALUE",
            "--confirm",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.applySecretOperation).toHaveBeenCalledWith({
            secretName: "API_KEY",
            target: { kind: "repo", repo: "owner/repo" },
            value: "environment-value",
        });
    });

    it("reports a missing environment variable", async () => {
        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--secret-name",
            "API_KEY",
            "--secret-value-env",
            "GH_SECRET_SYNC_MISSING",
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain("empty or missing");
    });

    it("reads a secret from a file without logging its value", async () => {
        const secretPath = createFixture("secret.txt", "file-value");

        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--secret-name",
            "API_KEY",
            "--secret-value-file",
            secretPath,
            "--confirm",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.applySecretOperation).toHaveBeenCalledWith(
            expect.objectContaining({ value: "file-value" })
        );
        expect([...result.logs, ...result.errors].join("\n")).not.toContain(
            "file-value"
        );
    });

    it.each([
        ["missing.txt", "unable to read"],
        ["empty.txt", "is empty"],
    ])("reports unusable secret file %s", async (name, message) => {
        const path =
            name === "empty.txt"
                ? createFixture(name, "")
                : nodePath.join(
                      tmpdir(),
                      `gh-secret-sync-${Date.now()}-${name}`
                  );

        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--secret-name",
            "API_KEY",
            "--secret-value-file",
            path,
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain(message);
    });

    it("uses placeholders for prompt and stdin inputs during dry runs", async () => {
        const promptResult = await captureMain([
            "--repo",
            "owner/repo",
            "--secret-name",
            "PROMPTED",
            "--secret-value-prompt",
        ]);
        vi.restoreAllMocks();
        const stdinResult = await captureMain([
            "--repo",
            "owner/repo",
            "--secret-name",
            "PIPED",
            "--secret-value-stdin",
        ]);

        expect(promptResult.code).toBe(0);
        expect(stdinResult.code).toBe(0);
        expect(ghMocks.applySecretOperation).not.toHaveBeenCalled();
    });

    it("rejects an interactive prompt in a non-interactive process", async () => {
        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--secret-name",
            "PROMPTED",
            "--secret-value-prompt",
            "--confirm",
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain("interactive terminal");
    });

    it("reads --set-env values and rejects missing ones", async () => {
        vi.stubEnv("GH_SECRET_SYNC_SET", "set-environment-value");
        const success = await captureMain([
            "--repo",
            "owner/repo",
            "--set-env",
            "API_KEY=GH_SECRET_SYNC_SET",
            "--confirm",
        ]);
        vi.restoreAllMocks();
        const failure = await captureMain([
            "--repo",
            "owner/repo",
            "--set-env",
            "TEST_NAME=UNSET_ENVIRONMENT_VARIABLE",
        ]);

        expect(success.code).toBe(0);
        expect(failure.code).toBe(1);
        expect(failure.errors.join("\n")).toContain("empty or missing");
    });

    it("rejects malformed --set-env pairs before environment lookup", async () => {
        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--set-env",
            "MALFORMED",
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain("NAME=VALUE");
    });
});

describe("repository and organization operations", () => {
    it("deduplicates repository targets from flags and a repository file", async () => {
        const repoFile = createFixture(
            "repos.txt",
            "# managed repositories\nowner/two\nowner/three\nowner/two\n"
        );

        const result = await captureMain([
            "--repo",
            "owner/one",
            "--repos",
            "owner/two,owner/one",
            "--repo-file",
            repoFile,
            "--set",
            "API_KEY=value",
            "--confirm",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.applySecretOperation).toHaveBeenCalledTimes(3);
    });

    it("reports an unreadable repository file", async () => {
        const result = await captureMain([
            "--repo-file",
            nodePath.join(tmpdir(), `missing-repos-${Date.now()}.txt`),
            "--set",
            "API_KEY=value",
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain(
            "unable to read --repo-file"
        );
    });

    it("creates environment operations for each repository and secret", async () => {
        const result = await captureMain([
            "--repos",
            "owner/one,owner/two",
            "--env",
            "production",
            "--set",
            "FIRST=one",
            "--set",
            "SECOND=two",
            "--confirm",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.applySecretOperation).toHaveBeenCalledTimes(4);
        expect(ghMocks.applySecretOperation).toHaveBeenCalledWith(
            expect.objectContaining({
                target: {
                    environment: "production",
                    kind: "repo",
                    repo: "owner/two",
                },
            })
        );
    });

    it("creates organization operations with selected repositories", async () => {
        const result = await captureMain([
            "--org",
            "example",
            "--org-visibility",
            "selected",
            "--org-selected-repos",
            "owner/one,owner/two",
            "--set",
            "API_KEY=value",
            "--confirm",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.applySecretOperation).toHaveBeenCalledWith({
            secretName: "API_KEY",
            target: {
                kind: "org",
                org: "example",
                selectedRepos: ["owner/one", "owner/two"],
                visibility: "selected",
            },
            value: "value",
        });
    });

    it.each([
        [["--org-visibility", "public"], "must be one of"],
        [["--org-selected-repos", "not-a-repo"], "invalid repository values"],
    ])("rejects invalid organization options", async (options, message) => {
        const result = await captureMain([
            "--org",
            "example",
            ...options,
            "--set",
            "API_KEY=value",
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain(message);
    });
});

describe("plan files", () => {
    it("applies repository, environment, and organization JSON records", async () => {
        const planPath = createFixture(
            "plan.json",
            JSON.stringify([
                {
                    repo: "owner/repo",
                    secret: "REPO_SECRET",
                    target: "repo",
                    value: "repo-value",
                },
                {
                    environment: "production",
                    repo: "owner/repo",
                    secretName: "ENV_SECRET",
                    target: "env",
                    value: "env-value",
                },
                {
                    org: "example",
                    secret: "ORG_SECRET",
                    selectedRepos: ["owner/repo"],
                    target: "org",
                    value: "org-value",
                    visibility: "selected",
                },
            ])
        );

        const result = await captureMain([
            "--plan-file",
            planPath,
            "--confirm",
            "--json",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.applySecretOperation).toHaveBeenCalledTimes(3);
        expect(result.logs.join("\n")).toContain('"total": 3');
        expect(result.logs.join("\n")).not.toContain("repo-value");
    });

    it("parses quoted CSV fields, aliases, and selected repositories", async () => {
        const planPath = createFixture(
            "plan.csv",
            [
                "target,repo,environment,org,secret_name,value,visibility,selected_repos",
                'repo,owner/repo,,,REPO_SECRET,"value,with,commas",,',
                'org,,,example,ORG_SECRET,"quoted ""value""",selected,owner/one|owner/two',
            ].join("\n")
        );

        const result = await captureMain([
            "--plan-file",
            planPath,
            "--plan-format",
            "csv",
            "--confirm",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.applySecretOperation).toHaveBeenCalledTimes(2);
        expect(ghMocks.applySecretOperation).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ value: "value,with,commas" })
        );
        expect(ghMocks.applySecretOperation).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ value: 'quoted "value"' })
        );
    });

    it("accepts a UTF-8 BOM and minimal CSV columns", async () => {
        const planPath = createFixture(
            "bom.csv",
            "\u{FEFF}target,repo,secret,value\nrepo,owner/repo,BOM_SECRET,value"
        );

        const result = await captureMain([
            "--plan-file",
            planPath,
            "--confirm",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.applySecretOperation).toHaveBeenCalledWith(
            expect.objectContaining({ secretName: "BOM_SECRET" })
        );
    });

    it("infers an organization target without optional restrictions", async () => {
        const planPath = createFixture(
            "inferred-org.json",
            '[{"org":"example","secret":"ORG_DEFAULT","value":"value"}]'
        );

        const result = await captureMain([
            "--plan-file",
            planPath,
            "--confirm",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.applySecretOperation).toHaveBeenCalledWith({
            secretName: "ORG_DEFAULT",
            target: { kind: "org", org: "example" },
            value: "value",
        });
    });

    it.each([
        [
            "invalid.json",
            "{ invalid",
            [],
            "invalid JSON",
        ],
        [
            "invalid.csv",
            'name,value\n"unterminated,value',
            [],
            "invalid CSV",
        ],
        [
            "empty.csv",
            "",
            [],
            "no operations were generated",
        ],
        [
            "object.json",
            "{}",
            [],
            "must describe an array",
        ],
        [
            "primitive.json",
            "[null]",
            [],
            "records must be objects",
        ],
        [
            "missing-secret.json",
            '[{"repo":"owner/repo","value":"x"}]',
            [],
            "invalid plan secret",
        ],
        [
            "missing-value.json",
            '[{"repo":"owner/repo","secret":"NAME"}]',
            [],
            "value is required",
        ],
        [
            "bad-repo.json",
            '[{"repo":"bad","secret":"NAME","value":"x"}]',
            [],
            "invalid plan repo",
        ],
        [
            "missing-env.json",
            '[{"target":"env","repo":"owner/repo","secret":"NAME","value":"x"}]',
            [],
            "requires environment",
        ],
        [
            "missing-org.json",
            '[{"target":"org","secret":"NAME","value":"x"}]',
            [],
            "requires org",
        ],
        [
            "bad-visibility.json",
            '[{"target":"org","org":"example","secret":"NAME","value":"x","visibility":"public"}]',
            [],
            "invalid plan visibility",
        ],
        [
            "bad-selected.json",
            '[{"target":"org","org":"example","secret":"NAME","value":"x","selectedRepos":["bad"]}]',
            [],
            "invalid selected repos",
        ],
        [
            "typed-field.json",
            '[{"repo":42,"secret":"NAME","value":"x"}]',
            [],
            "unsupported field value",
        ],
        [
            "typed-selected.json",
            '[{"target":"org","org":"example","secret":"NAME","value":"x","selectedRepos":[42]}]',
            [],
            "unsupported field value",
        ],
        [
            "missing-repo.json",
            '[{"secret":"NAME","value":"x"}]',
            [],
            "invalid plan repo value: <empty>",
        ],
        [
            "mismatched.csv",
            "target,repo,secret,value\nrepo,owner/repo,NAME",
            [],
            "invalid CSV",
        ],
        [
            "unknown.txt",
            "[]",
            [],
            "unable to infer plan format",
        ],
        [
            "override.txt",
            "[]",
            ["--plan-format", "xml"],
            "must be one of",
        ],
    ])(
        "reports invalid plan %s",
        async (name, content, extraArguments, message) => {
            const planPath = createFixture(name, content);
            const result = await captureMain([
                "--plan-file",
                planPath,
                ...extraArguments,
            ]);

            expect(result.code).toBe(1);
            expect(result.errors.join("\n")).toContain(message);
        }
    );

    it("reports a missing plan file", async () => {
        const result = await captureMain([
            "--plan-file",
            nodePath.join(tmpdir(), `missing-plan-${Date.now()}.json`),
        ]);

        expect(result.code).toBe(1);
        expect(result.errors.join("\n")).toContain(
            "unable to read --plan-file"
        );
    });
});

describe("execution and summaries", () => {
    it("defaults to a dry run and does not invoke gh secret set", async () => {
        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--secret-name",
            "API_KEY",
            "--secret-value",
            "sensitive-value",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.applySecretOperation).not.toHaveBeenCalled();
        expect(result.logs.join("\n")).toContain("Planned operations: 1");
        expect(result.logs.join("\n")).not.toContain("sensitive-value");
    });

    it("keeps --dry-run authoritative when combined with --confirm", async () => {
        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--set",
            "API_KEY=value",
            "--confirm",
            "--dry-run",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.applySecretOperation).not.toHaveBeenCalled();
    });

    it("uses --yes as an alias for confirmed writes", async () => {
        const result = await captureMain([
            "--set",
            "API_KEY=value",
            "--yes",
        ]);

        expect(result.code).toBe(0);
        expect(ghMocks.resolveRepo).toHaveBeenCalledWith(undefined);
        expect(ghMocks.applySecretOperation).toHaveBeenCalledTimes(1);
    });

    it("returns 2 and renders a normalized failure", async () => {
        ghMocks.applySecretOperation.mockImplementation((operation) => ({
            error: "  failed\nwith details  ",
            ok: false,
            operation,
        }));

        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--set",
            "API_KEY=value",
            "--confirm",
        ]);

        expect(result.code).toBe(2);
        expect(result.logs.join("\n")).toContain("failed with details");
        expect(result.logs.join("\n")).toContain("Applied: 0 | Failed: 1");
    });

    it("uses an unknown-error fallback and JSON output", async () => {
        ghMocks.applySecretOperation.mockImplementation((operation) => ({
            ok: false,
            operation,
        }));

        const result = await captureMain([
            "--org",
            "example",
            "--set",
            "API_KEY=value",
            "--confirm",
            "--json",
        ]);

        expect(result.code).toBe(2);
        expect(result.logs.join("\n")).toContain('"failed": 1');
        expect(result.logs.join("\n")).toContain('"target": "org:example"');
    });

    it("honors quiet output", async () => {
        const result = await captureMain([
            "--repo",
            "owner/repo",
            "--set",
            "API_KEY=value",
            "--confirm",
            "--quiet",
        ]);

        expect(result.code).toBe(0);
        expect(result.logs).toStrictEqual([
            "Applied: 1 | Failed: 0 | Total: 1",
        ]);
    });

    it("summarizes operations beyond the first fifty rows", async () => {
        const pairs = Array.from(
            { length: 51 },
            (_, index) => `SECRET_${index}=value-${index}`
        );
        const argumentList = ["--repo", "owner/repo"];
        for (const pair of pairs) {
            argumentList.push("--set", pair);
        }

        const result = await captureMain(argumentList);

        expect(result.code).toBe(0);
        expect(result.logs.join("\n")).toContain("... and 1 more operation(s)");
    });

    it("runs through the exported process entry point", async () => {
        await runCli(["--help"]);

        expect(process.exitCode).toBe(0);
    });

    it("normalizes unexpected process-entry failures", async () => {
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
        ghMocks.isGhAuthenticated.mockImplementationOnce(() => {
            throw new Error("entrypoint failure");
        });

        try {
            await runCli([
                "--repo",
                "owner/repo",
                "--set",
                "API_KEY=value",
            ]);

            expect(process.exitCode).toBe(1);
            expect(errorSpy).toHaveBeenCalledWith("Error: entrypoint failure");
        } finally {
            process.exitCode = 0;
        }
    });
});
