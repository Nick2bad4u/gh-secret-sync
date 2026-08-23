import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import * as nodePath from "node:path";

import type {
    GhResponse,
    SecretOperation,
    SecretOperationResult,
} from "./cli-types.ts";

type FileExistenceCheck = (path: string) => boolean;

const GH_EXECUTABLE_PATHS: Readonly<Record<string, readonly string[]>> = {
    darwin: [
        "/opt/homebrew/bin/gh",
        "/usr/local/bin/gh",
        "/usr/bin/gh",
    ],
    freebsd: ["/usr/local/bin/gh", "/usr/bin/gh"],
    linux: [
        "/usr/bin/gh",
        "/usr/local/bin/gh",
        "/snap/bin/gh",
    ],
    openbsd: ["/usr/local/bin/gh", "/usr/bin/gh"],
    win32: [
        String.raw`C:\Program Files\GitHub CLI\gh.exe`,
        String.raw`C:\Program Files (x86)\GitHub CLI\gh.exe`,
    ],
};

/** Apply one secret operation while keeping the value off the process argv. */
export function applySecretOperation(
    operation: SecretOperation
): SecretOperationResult {
    const args = [
        "secret",
        "set",
        operation.secretName,
    ];

    if (operation.target.kind === "repo") {
        args.push("--repo", operation.target.repo);
        if (
            typeof operation.target.environment === "string" &&
            operation.target.environment.length > 0
        ) {
            args.push("--env", operation.target.environment);
        }
    } else {
        args.push("--org", operation.target.org);
        if (
            typeof operation.target.visibility === "string" &&
            operation.target.visibility.length > 0
        ) {
            args.push("--visibility", operation.target.visibility);
        }
        if (
            Array.isArray(operation.target.selectedRepos) &&
            operation.target.selectedRepos.length > 0
        ) {
            args.push("--repos", operation.target.selectedRepos.join(","));
        }
    }

    const response = runGhWithInput(args, operation.value);
    if (response.status === 0) {
        return {
            ok: true,
            operation,
        };
    }

    return {
        error: normalizeErrorMessage(response),
        ok: false,
        operation,
    };
}

/** Return whether the GitHub CLI has an authenticated account. */
export function isGhAuthenticated(): boolean {
    const response = runGh(["auth", "status"]);
    return response.status === 0;
}

/** Resolve GitHub CLI to an existing absolute executable path. */
export function resolveGhExecutablePath(
    platform: string = process.platform,
    configuredPath: string | undefined = process.env["GH_PATH"],
    isExistingFile: FileExistenceCheck = existsSync,
    pathValue: string | undefined = process.env["PATH"]
): string | undefined {
    if (
        typeof configuredPath === "string" &&
        nodePath.isAbsolute(configuredPath) &&
        isExistingFile(configuredPath)
    ) {
        return configuredPath;
    }

    const pathExecutable = resolveGhExecutableFromPath(
        platform,
        pathValue,
        isExistingFile
    );
    if (pathExecutable !== undefined) {
        return pathExecutable;
    }

    return GH_EXECUTABLE_PATHS[platform]?.find((candidate) =>
        isExistingFile(candidate)
    );
}

/** Resolve an explicit repository or infer the current repository from gh. */
export function resolveRepo(
    optionRepo: string | undefined
): string | undefined {
    if (typeof optionRepo === "string" && optionRepo.length > 0) {
        return optionRepo;
    }

    const response = runGh([
        "repo",
        "view",
        "--json",
        "nameWithOwner",
        "--jq",
        ".nameWithOwner",
    ]);

    if (response.status !== 0) {
        return undefined;
    }

    const resolved = response.stdout.trim();
    return resolved.length > 0 ? resolved : undefined;
}

/** Invoke the authenticated GitHub CLI and capture its result. */
export function runGh(args: readonly string[]): GhResponse {
    const executablePath = resolveGhExecutablePath();
    if (executablePath === undefined) {
        return missingGhResponse();
    }

    const result = spawnSync(executablePath, [...args], {
        encoding: "utf8",
        stdio: "pipe",
    });

    return toGhResponse(result);
}

/** Invoke the GitHub CLI with private input supplied through standard input. */
export function runGhWithInput(
    args: readonly string[],
    input: string
): GhResponse {
    const executablePath = resolveGhExecutablePath();
    if (executablePath === undefined) {
        return missingGhResponse();
    }

    const result = spawnSync(executablePath, [...args], {
        encoding: "utf8",
        input,
        stdio: "pipe",
    });

    return toGhResponse(result);
}

function missingGhResponse(): GhResponse {
    return {
        status: 1,
        stderr: "Unable to locate the GitHub CLI through GH_PATH, PATH, or a trusted system location. Set GH_PATH to its absolute executable path.",
        stdout: "",
    };
}

function normalizeErrorMessage(response: GhResponse): string {
    const stderr = response.stderr.trim();
    if (stderr.length > 0) {
        return stderr;
    }

    const stdout = response.stdout.trim();
    if (stdout.length > 0) {
        return stdout;
    }

    return `gh command failed with exit code ${response.status}`;
}

function resolveGhExecutableFromPath(
    platform: string,
    pathValue: string | undefined,
    isExistingFile: FileExistenceCheck
): string | undefined {
    if (typeof pathValue !== "string" || pathValue.length === 0) {
        return undefined;
    }

    const executableName = platform === "win32" ? "gh.exe" : "gh";
    for (const rawPathEntry of pathValue.split(nodePath.delimiter)) {
        const trimmedPathEntry = rawPathEntry.trim();
        const pathEntry =
            trimmedPathEntry.startsWith('"') && trimmedPathEntry.endsWith('"')
                ? trimmedPathEntry.slice(1, -1)
                : trimmedPathEntry;
        if (!nodePath.isAbsolute(pathEntry)) {
            continue;
        }

        const candidate = nodePath.join(pathEntry, executableName);
        if (isExistingFile(candidate)) {
            return candidate;
        }
    }

    return undefined;
}

function toGhResponse(
    result: Readonly<{
        error?: Error;
        status: null | number;
        stderr: null | string;
        stdout: null | string;
    }>
): GhResponse {
    return {
        status: result.status ?? 1,
        stderr:
            typeof result.stderr === "string"
                ? result.stderr
                : (result.error?.message ?? ""),
        stdout: typeof result.stdout === "string" ? result.stdout : "",
    };
}
