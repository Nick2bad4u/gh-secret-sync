import { spawnSync } from "node:child_process";

import type {
    GhResponse,
    SecretOperation,
    SecretOperationResult,
} from "./cli-types.js";

export function runGh(args: string[], capture = true): GhResponse {
    const result = spawnSync("gh", args, {
        encoding: "utf8",
        stdio: capture ? "pipe" : "inherit",
    });

    return {
        stdout: result.stdout,
        stderr: result.stderr,
        status: result.status ?? 1,
    };
}

export function runGhWithInput(
    args: string[],
    input: string,
    capture = true
): GhResponse {
    const result = spawnSync("gh", args, {
        encoding: "utf8",
        input,
        stdio: capture ? "pipe" : "inherit",
    });

    return {
        stdout: result.stdout,
        stderr: result.stderr,
        status: result.status ?? 1,
    };
}

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

export function checkGhAuth(): boolean {
    const response = runGh(["auth", "status"]);
    return response.status === 0;
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

    args.push("--body", "-");

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
