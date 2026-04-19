#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { applySecretOperation, checkGhAuth, resolveRepo } from "./cli-gh.js";
import { printHelp, renderHelpText } from "./cli-help.js";
import { createStyler, formatTable, shouldUseColor } from "./cli-styling.js";
import type {
    ErrorCategory,
    ParsedOptions,
    SecretOperation,
    SecretOperationResult,
    SecretTarget,
    Styler,
} from "./cli-types.js";

type NormalizedConfig = {
    dryRun: boolean;
    jsonOutput: boolean;
    operations: SecretOperation[];
    quiet: boolean;
    styler: Styler;
};

type PlanRecord = {
    environment?: string;
    org?: string;
    repo?: string;
    secret?: string;
    secretName?: string;
    selectedRepos?: string[];
    target?: string;
    value?: string;
    visibility?: string;
};

type PlanFormat = "csv" | "json";

function parseArguments(args: string[]): ParsedOptions {
    const parsed: ParsedOptions = {};

    const booleanFlags = new Set([
        "confirm",
        "dry-run",
        "help",
        "json",
        "quiet",
        "secret-value-prompt",
        "secret-value-stdin",
        "yes",
    ]);

    const repeatableFlags = new Set([
        "repos",
        "set",
        "set-env",
    ]);

    for (let index = 0; index < args.length; index += 1) {
        const token = args[index];
        if (!token?.startsWith("--")) {
            continue;
        }

        const [rawKey, inlineValue] = token.slice(2).split("=", 2);
        const key = (rawKey ?? "").trim();

        if (booleanFlags.has(key)) {
            parsed[key] = true;
            continue;
        }

        const nextToken = args[index + 1];
        const value =
            inlineValue ??
            (nextToken && !nextToken.startsWith("--") ? nextToken : "");

        if (
            inlineValue === undefined &&
            nextToken &&
            !nextToken.startsWith("--")
        ) {
            index += 1;
        }

        if (repeatableFlags.has(key)) {
            const existing = parsed[key];
            const bucket = Array.isArray(existing) ? existing : [];
            bucket.push(value);
            parsed[key] = bucket;
            continue;
        }

        parsed[key] = value;
    }

    return parsed;
}

function emitError(
    message: string,
    category: ErrorCategory,
    asJson: boolean,
    styler?: Styler
): number {
    if (asJson) {
        console.error(
            JSON.stringify(
                {
                    error: {
                        category,
                        message,
                    },
                },
                null,
                2
            )
        );
        return 1;
    }

    const rendered = styler
        ? styler.error(`Error: ${message}`)
        : `Error: ${message}`;
    console.error(rendered);
    return 1;
}

function isValidRepoSlug(value: string): boolean {
    return /^[^\s/]+\/[^\s/]+$/u.test(value);
}

function isValidSecretName(value: string): boolean {
    return /^(?!\d)[A-Za-z_][A-Za-z0-9_]*$/u.test(value);
}

function collectStringListOption(
    options: ParsedOptions,
    key: string
): string[] {
    const rawValues = options[key];
    if (Array.isArray(rawValues)) {
        return rawValues
            .flatMap((value) => value.split(","))
            .map((value) => value.trim())
            .filter((value) => value.length > 0);
    }

    if (typeof rawValues === "string") {
        return rawValues
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value.length > 0);
    }

    return [];
}

function readUtf8File(path: string): string {
    return readFileSync(path, "utf8");
}

function readRepoFile(path: string): string[] {
    const raw = readUtf8File(path);
    return raw
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));
}

async function promptHiddenValue(promptText: string): Promise<string> {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        throw new Error(
            "--secret-value-prompt requires an interactive terminal."
        );
    }

    const stdin = process.stdin;
    const stdout = process.stdout;

    return await new Promise((resolve, reject) => {
        let value = "";

        const cleanup = (): void => {
            stdin.off("data", onData);
            if (stdin.isTTY) {
                stdin.setRawMode(false);
            }
            stdin.pause();
        };

        const onData = (chunk: Buffer | string): void => {
            const text =
                typeof chunk === "string" ? chunk : chunk.toString("utf8");

            for (const character of text) {
                if (character === "\u0003") {
                    cleanup();
                    reject(new Error("secret prompt cancelled by user."));
                    return;
                }

                if (character === "\r" || character === "\n") {
                    cleanup();
                    stdout.write("\n");
                    resolve(value);
                    return;
                }

                if (character === "\u0008" || character === "\u007f") {
                    if (value.length > 0) {
                        value = value.slice(0, -1);
                    }
                    continue;
                }

                value += character;
            }
        };

        stdout.write(promptText);
        stdin.resume();
        stdin.setEncoding("utf8");
        if (stdin.isTTY) {
            stdin.setRawMode(true);
        }
        stdin.on("data", onData);
    });
}

function validateRepoList(
    repos: string[],
    jsonOutput: boolean,
    styler: Styler
): number | string[] {
    const deduped = Array.from(new Set(repos));
    const invalid = deduped.filter((repo) => !isValidRepoSlug(repo));
    if (invalid.length > 0) {
        return emitError(
            `invalid repository values: ${invalid.join(", ")}. Use owner/name format.`,
            "validation_error",
            jsonOutput,
            styler
        );
    }
    return deduped;
}

function normalizeSecretPair(
    value: string,
    sourceLabel: string,
    jsonOutput: boolean,
    styler: Styler
): number | { name: string; value: string } {
    const separator = value.indexOf("=");
    if (separator < 1 || separator === value.length - 1) {
        return emitError(
            `${sourceLabel} entries must be NAME=VALUE format.`,
            "validation_error",
            jsonOutput,
            styler
        );
    }

    const name = value.slice(0, separator).trim();
    const right = value.slice(separator + 1);

    if (!isValidSecretName(name)) {
        return emitError(
            `invalid secret name: ${name}. Allowed pattern: letters/numbers/underscore and cannot start with a number.`,
            "validation_error",
            jsonOutput,
            styler
        );
    }

    if (right.length === 0) {
        return emitError(
            `${sourceLabel} secret value cannot be empty for ${name}.`,
            "validation_error",
            jsonOutput,
            styler
        );
    }

    return {
        name,
        value: right,
    };
}

async function resolveSingleSecretValue(
    options: ParsedOptions,
    jsonOutput: boolean,
    styler: Styler,
    dryRun: boolean
): Promise<number | string> {
    const inlineValue =
        typeof options["secret-value"] === "string"
            ? options["secret-value"]
            : undefined;
    const envName =
        typeof options["secret-value-env"] === "string"
            ? options["secret-value-env"]
            : undefined;
    const valueFile =
        typeof options["secret-value-file"] === "string"
            ? options["secret-value-file"]
            : undefined;
    const promptValue = options["secret-value-prompt"] === true;
    const readFromStdin = options["secret-value-stdin"] === true;

    const provided = [
        inlineValue,
        envName,
        valueFile,
        promptValue ? "prompt" : undefined,
        readFromStdin ? "stdin" : undefined,
    ].filter((entry) => typeof entry === "string").length;

    if (provided > 1) {
        return emitError(
            "provide only one of: --secret-value, --secret-value-env, --secret-value-file, --secret-value-prompt, --secret-value-stdin.",
            "validation_error",
            jsonOutput,
            styler
        );
    }

    if (typeof inlineValue === "string") {
        if (inlineValue.length === 0) {
            return emitError(
                "--secret-value cannot be empty.",
                "validation_error",
                jsonOutput,
                styler
            );
        }
        return inlineValue;
    }

    if (typeof envName === "string") {
        const value = process.env[envName];
        if (typeof value !== "string" || value.length === 0) {
            return emitError(
                `environment variable ${envName} is empty or missing.`,
                "validation_error",
                jsonOutput,
                styler
            );
        }
        return value;
    }

    if (typeof valueFile === "string") {
        try {
            const value = readUtf8File(valueFile);
            if (value.length === 0) {
                return emitError(
                    `--secret-value-file ${valueFile} is empty.`,
                    "validation_error",
                    jsonOutput,
                    styler
                );
            }
            return value;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            return emitError(
                `unable to read --secret-value-file ${valueFile}: ${message}`,
                "validation_error",
                jsonOutput,
                styler
            );
        }
    }

    if (promptValue) {
        if (dryRun) {
            return "<prompt-value omitted in dry-run>";
        }

        try {
            const value = await promptHiddenValue(
                "Enter secret value (hidden): "
            );
            if (value.length === 0) {
                return emitError(
                    "--secret-value-prompt received an empty value.",
                    "validation_error",
                    jsonOutput,
                    styler
                );
            }
            return value;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            return emitError(message, "validation_error", jsonOutput, styler);
        }
    }

    if (readFromStdin) {
        if (dryRun) {
            return "<stdin-value omitted in dry-run>";
        }

        try {
            const value = readFileSync(0, "utf8");
            if (value.length === 0) {
                return emitError(
                    "--secret-value-stdin did not receive any input.",
                    "validation_error",
                    jsonOutput,
                    styler
                );
            }
            return value;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            return emitError(
                `unable to read secret value from stdin: ${message}`,
                "validation_error",
                jsonOutput,
                styler
            );
        }
    }

    return emitError(
        "missing secret value. Provide --secret-value, --secret-value-env, --secret-value-file, --secret-value-prompt, --secret-value-stdin, --set, or --set-env.",
        "validation_error",
        jsonOutput,
        styler
    );
}

function parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];

        if (character === undefined) {
            continue;
        }

        if (inQuotes) {
            if (character === '"') {
                if (line[index + 1] === '"') {
                    current += '"';
                    index += 1;
                } else {
                    inQuotes = false;
                }
            } else {
                current += character;
            }
            continue;
        }

        if (character === '"') {
            inQuotes = true;
            continue;
        }

        if (character === ",") {
            fields.push(current.trim());
            current = "";
            continue;
        }

        current += character;
    }

    if (inQuotes) {
        throw new Error("unterminated quoted CSV field");
    }

    fields.push(current.trim());
    return fields;
}

function parseCsvPlan(raw: string): PlanRecord[] {
    const lines = raw
        .replace(/^\uFEFF/u, "")
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));

    if (lines.length === 0) {
        return [];
    }

    const headers = parseCsvLine(lines[0] ?? "").map((header) => header.trim());

    if (headers.length === 0) {
        throw new Error("CSV plan file must contain a header row");
    }

    const records: PlanRecord[] = [];

    for (const [rowIndex, line] of lines.slice(1).entries()) {
        const values = parseCsvLine(line);
        if (values.length !== headers.length) {
            throw new Error(
                `CSV row ${rowIndex + 2} has ${values.length} column(s); expected ${headers.length}`
            );
        }

        const mapped = new Map<string, string>();
        for (const [columnIndex, header] of headers.entries()) {
            const value = values[columnIndex] ?? "";
            if (value.length > 0) {
                mapped.set(header, value);
            }
        }

        const selectedReposValue =
            mapped.get("selectedRepos") ?? mapped.get("selected_repos");

        const record: PlanRecord = {};

        const environment = mapped.get("environment");
        if (typeof environment === "string") {
            record.environment = environment;
        }

        const org = mapped.get("org");
        if (typeof org === "string") {
            record.org = org;
        }

        const repo = mapped.get("repo");
        if (typeof repo === "string") {
            record.repo = repo;
        }

        const secret = mapped.get("secret");
        if (typeof secret === "string") {
            record.secret = secret;
        }

        const secretName =
            mapped.get("secretName") ?? mapped.get("secret_name");
        if (typeof secretName === "string") {
            record.secretName = secretName;
        }

        if (
            typeof selectedReposValue === "string" &&
            selectedReposValue.length > 0
        ) {
            record.selectedRepos = selectedReposValue
                .split("|")
                .map((selectedRepo) => selectedRepo.trim())
                .filter((selectedRepo) => selectedRepo.length > 0);
        }

        const target = mapped.get("target");
        if (typeof target === "string") {
            record.target = target;
        }

        const value = mapped.get("value");
        if (typeof value === "string") {
            record.value = value;
        }

        const visibility = mapped.get("visibility");
        if (typeof visibility === "string") {
            record.visibility = visibility;
        }

        records.push(record);
    }

    return records;
}

function resolvePlanFormat(
    planFile: string,
    options: ParsedOptions,
    jsonOutput: boolean,
    styler: Styler
): number | PlanFormat {
    const planFormatOption =
        typeof options["plan-format"] === "string"
            ? options["plan-format"].trim().toLowerCase()
            : "";

    if (planFormatOption.length > 0) {
        if (planFormatOption === "json" || planFormatOption === "csv") {
            return planFormatOption;
        }

        return emitError(
            "--plan-format must be one of: json, csv.",
            "validation_error",
            jsonOutput,
            styler
        );
    }

    if (planFile.toLowerCase().endsWith(".json")) {
        return "json";
    }

    if (planFile.toLowerCase().endsWith(".csv")) {
        return "csv";
    }

    return emitError(
        "unable to infer plan format. Use a .json/.csv extension or pass --plan-format.",
        "validation_error",
        jsonOutput,
        styler
    );
}

function parseVisibility(
    raw: string | undefined,
    jsonOutput: boolean,
    styler: Styler
): number | "all" | "private" | "selected" | undefined {
    if (typeof raw !== "string" || raw.length === 0) {
        return undefined;
    }

    const normalized = raw.trim().toLowerCase();
    if (
        normalized !== "all" &&
        normalized !== "private" &&
        normalized !== "selected"
    ) {
        return emitError(
            "--org-visibility must be one of: all, private, selected.",
            "validation_error",
            jsonOutput,
            styler
        );
    }

    return normalized;
}

function addOperationForTargets(
    operations: SecretOperation[],
    target: SecretTarget,
    secretName: string,
    secretValue: string
): void {
    operations.push({
        secretName,
        target,
        value: secretValue,
    });
}

function targetLabel(target: SecretTarget): string {
    if (target.kind === "org") {
        return `org:${target.org}`;
    }

    return typeof target.environment === "string"
        ? `repo:${target.repo} env:${target.environment}`
        : `repo:${target.repo}`;
}

function renderPlanRecordToOperation(
    record: PlanRecord,
    jsonOutput: boolean,
    styler: Styler
): number | SecretOperation {
    const secretName =
        typeof record.secretName === "string"
            ? record.secretName.trim()
            : typeof record.secret === "string"
              ? record.secret.trim()
              : "";

    if (!isValidSecretName(secretName)) {
        return emitError(
            `invalid plan secret name: ${secretName || "<empty>"}.`,
            "validation_error",
            jsonOutput,
            styler
        );
    }

    if (typeof record.value !== "string" || record.value.length === 0) {
        return emitError(
            `plan record value is required for secret ${secretName}.`,
            "validation_error",
            jsonOutput,
            styler
        );
    }

    const targetKind = (record.target ?? "").trim().toLowerCase();

    if (targetKind === "org" || (targetKind.length === 0 && record.org)) {
        const org = typeof record.org === "string" ? record.org.trim() : "";
        if (org.length === 0) {
            return emitError(
                "plan record target org requires org field.",
                "validation_error",
                jsonOutput,
                styler
            );
        }

        const rawVisibility =
            typeof record.visibility === "string"
                ? record.visibility.trim().toLowerCase()
                : undefined;
        if (
            rawVisibility !== undefined &&
            rawVisibility !== "all" &&
            rawVisibility !== "private" &&
            rawVisibility !== "selected"
        ) {
            return emitError(
                `invalid plan visibility for org ${org}: ${rawVisibility}.`,
                "validation_error",
                jsonOutput,
                styler
            );
        }

        const selected = Array.isArray(record.selectedRepos)
            ? record.selectedRepos
                  .map((repo) => repo.trim())
                  .filter((repo) => repo.length > 0)
            : [];

        const invalidSelected = selected.filter(
            (repo) => !isValidRepoSlug(repo)
        );
        if (invalidSelected.length > 0) {
            return emitError(
                `invalid selected repos in plan: ${invalidSelected.join(", ")}.`,
                "validation_error",
                jsonOutput,
                styler
            );
        }

        const target: SecretTarget = {
            kind: "org",
            org,
        };

        if (selected.length > 0) {
            target.selectedRepos = selected;
        }

        if (
            rawVisibility === "all" ||
            rawVisibility === "private" ||
            rawVisibility === "selected"
        ) {
            target.visibility = rawVisibility;
        }

        return {
            secretName,
            target,
            value: record.value,
        };
    }

    const repo = typeof record.repo === "string" ? record.repo.trim() : "";
    if (!isValidRepoSlug(repo)) {
        return emitError(
            `invalid plan repo value: ${repo || "<empty>"}.`,
            "validation_error",
            jsonOutput,
            styler
        );
    }

    const environment =
        targetKind === "env" || typeof record.environment === "string"
            ? (record.environment?.trim() ?? "")
            : undefined;

    if (targetKind === "env" && (!environment || environment.length === 0)) {
        return emitError(
            `plan env target requires environment for repo ${repo}.`,
            "validation_error",
            jsonOutput,
            styler
        );
    }

    const target: SecretTarget = {
        kind: "repo",
        repo,
    };

    if (environment && environment.length > 0) {
        target.environment = environment;
    }

    return {
        secretName,
        target,
        value: record.value,
    };
}

function loadPlanOperations(
    planFile: string,
    options: ParsedOptions,
    jsonOutput: boolean,
    styler: Styler
): number | SecretOperation[] {
    let raw: string;
    try {
        raw = readUtf8File(planFile);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return emitError(
            `unable to read --plan-file ${planFile}: ${message}`,
            "validation_error",
            jsonOutput,
            styler
        );
    }

    const planFormat = resolvePlanFormat(planFile, options, jsonOutput, styler);
    if (typeof planFormat === "number") {
        return planFormat;
    }

    let parsed: unknown;
    try {
        parsed = planFormat === "json" ? JSON.parse(raw) : parseCsvPlan(raw);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return emitError(
            `invalid ${planFormat.toUpperCase()} in --plan-file ${planFile}: ${message}`,
            "validation_error",
            jsonOutput,
            styler
        );
    }

    if (!Array.isArray(parsed)) {
        return emitError(
            `--plan-file ${planFormat.toUpperCase()} must describe an array/list of operation records.`,
            "validation_error",
            jsonOutput,
            styler
        );
    }

    const operations: SecretOperation[] = [];
    for (const entry of parsed) {
        if (!entry || typeof entry !== "object") {
            return emitError(
                "plan file records must be objects.",
                "validation_error",
                jsonOutput,
                styler
            );
        }

        const rendered = renderPlanRecordToOperation(
            entry as PlanRecord,
            jsonOutput,
            styler
        );
        if (typeof rendered === "number") {
            return rendered;
        }

        operations.push(rendered);
    }

    return operations;
}

async function buildExecutionConfig(
    options: ParsedOptions
): Promise<NormalizedConfig | number> {
    const jsonOutput = options["json"] === true;
    const quiet = options["quiet"] === true;

    const colorMode = options["no-color"] === true ? "never" : "auto";
    const styler = createStyler(shouldUseColor(colorMode, jsonOutput));

    if (options["help"] === true) {
        console.log(renderHelpText(styler));
        return 0;
    }

    const confirm = options["confirm"] === true || options["yes"] === true;
    const dryRun = !confirm || options["dry-run"] === true;

    const operations: SecretOperation[] = [];

    const planFile =
        typeof options["plan-file"] === "string"
            ? options["plan-file"].trim()
            : "";

    if (planFile.length > 0) {
        const planOperations = loadPlanOperations(
            planFile,
            options,
            jsonOutput,
            styler
        );
        if (typeof planOperations === "number") {
            return planOperations;
        }
        operations.push(...planOperations);
    }

    const repoOption =
        typeof options["repo"] === "string" ? options["repo"].trim() : "";
    const reposOption = collectStringListOption(options, "repos");
    const repoFile =
        typeof options["repo-file"] === "string"
            ? options["repo-file"].trim()
            : "";

    const repoTargets: string[] = [];
    if (repoOption.length > 0) {
        repoTargets.push(repoOption);
    }
    repoTargets.push(...reposOption);

    if (repoFile.length > 0) {
        try {
            repoTargets.push(...readRepoFile(repoFile));
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            return emitError(
                `unable to read --repo-file ${repoFile}: ${message}`,
                "validation_error",
                jsonOutput,
                styler
            );
        }
    }

    const org = typeof options["org"] === "string" ? options["org"].trim() : "";
    if (org.length > 0 && repoTargets.length > 0) {
        return emitError(
            "--org cannot be combined with --repo/--repos/--repo-file.",
            "validation_error",
            jsonOutput,
            styler
        );
    }

    const validatedRepos = validateRepoList(repoTargets, jsonOutput, styler);
    if (typeof validatedRepos === "number") {
        return validatedRepos;
    }

    const setPairs = collectStringListOption(options, "set");
    const setEnvPairs = collectStringListOption(options, "set-env");
    const singleSecretName =
        typeof options["secret-name"] === "string"
            ? options["secret-name"].trim()
            : "";

    const secretsForSimpleMode: Array<{ name: string; value: string }> = [];

    for (const pair of setPairs) {
        const normalized = normalizeSecretPair(
            pair,
            "--set",
            jsonOutput,
            styler
        );
        if (typeof normalized === "number") {
            return normalized;
        }
        secretsForSimpleMode.push(normalized);
    }

    for (const pair of setEnvPairs) {
        const normalized = normalizeSecretPair(
            pair,
            "--set-env",
            jsonOutput,
            styler
        );
        if (typeof normalized === "number") {
            return normalized;
        }

        const envValue = process.env[normalized.value];
        if (typeof envValue !== "string" || envValue.length === 0) {
            return emitError(
                `environment variable ${normalized.value} is empty or missing for --set-env ${normalized.name}.`,
                "validation_error",
                jsonOutput,
                styler
            );
        }

        secretsForSimpleMode.push({
            name: normalized.name,
            value: envValue,
        });
    }

    if (singleSecretName.length > 0) {
        if (!isValidSecretName(singleSecretName)) {
            return emitError(
                `invalid --secret-name: ${singleSecretName}.`,
                "validation_error",
                jsonOutput,
                styler
            );
        }

        const singleValue = await resolveSingleSecretValue(
            options,
            jsonOutput,
            styler,
            dryRun
        );
        if (typeof singleValue === "number") {
            return singleValue;
        }

        secretsForSimpleMode.push({
            name: singleSecretName,
            value: singleValue,
        });
    }

    if (secretsForSimpleMode.length > 0) {
        const environment =
            typeof options["env"] === "string" ? options["env"].trim() : "";

        if (org.length > 0) {
            const visibility = parseVisibility(
                typeof options["org-visibility"] === "string"
                    ? options["org-visibility"]
                    : undefined,
                jsonOutput,
                styler
            );
            if (typeof visibility === "number") {
                return visibility;
            }

            const selectedReposOption = collectStringListOption(
                options,
                "org-selected-repos"
            );
            const validatedSelected = validateRepoList(
                selectedReposOption,
                jsonOutput,
                styler
            );
            if (typeof validatedSelected === "number") {
                return validatedSelected;
            }

            for (const secret of secretsForSimpleMode) {
                const target: SecretTarget = {
                    kind: "org",
                    org,
                };
                if (validatedSelected.length > 0) {
                    target.selectedRepos = validatedSelected;
                }
                if (
                    visibility === "all" ||
                    visibility === "private" ||
                    visibility === "selected"
                ) {
                    target.visibility = visibility;
                }

                addOperationForTargets(
                    operations,
                    target,
                    secret.name,
                    secret.value
                );
            }
        } else {
            let finalRepos = validatedRepos;
            if (finalRepos.length === 0) {
                const resolved = resolveRepo(undefined);
                if (typeof resolved !== "string" || resolved.length === 0) {
                    if (!jsonOutput) {
                        console.log(printHelp(styler));
                    }
                    return emitError(
                        "unable to resolve repository. Provide --repo/--repos/--repo-file, --org, or --plan-file.",
                        "validation_error",
                        jsonOutput,
                        styler
                    );
                }

                finalRepos = [resolved];
            }

            for (const repo of finalRepos) {
                for (const secret of secretsForSimpleMode) {
                    const target: SecretTarget = {
                        kind: "repo",
                        repo,
                    };
                    if (environment.length > 0) {
                        target.environment = environment;
                    }

                    addOperationForTargets(
                        operations,
                        target,
                        secret.name,
                        secret.value
                    );
                }
            }
        }
    }

    if (operations.length === 0) {
        if (!jsonOutput) {
            console.log(printHelp(styler));
        }
        return emitError(
            "no operations were generated. Provide --plan-file or CLI secret inputs.",
            "validation_error",
            jsonOutput,
            styler
        );
    }

    if (!checkGhAuth()) {
        return emitError(
            "gh CLI is not authenticated. Run: gh auth login",
            "auth_error",
            jsonOutput,
            styler
        );
    }

    return {
        dryRun,
        jsonOutput,
        operations,
        quiet,
        styler,
    };
}

function printTextSummary(
    results: SecretOperationResult[],
    dryRun: boolean,
    quiet: boolean,
    styler: Styler
): void {
    const total = results.length;
    const failed = results.filter((result) => !result.ok).length;
    const applied = total - failed;

    if (!quiet) {
        const rows = results.slice(0, 50).map((result) => [
            result.ok ? styler.ok("ok") : styler.error("failed"),
            result.operation.secretName,
            targetLabel(result.operation.target),
            result.ok
                ? ""
                : (result.error ?? "unknown error")
                      .replace(/\s+/gu, " ")
                      .trim(),
        ]);

        console.log(
            styler.heading(
                dryRun ? "Secret sync dry-run" : "Secret sync results"
            )
        );
        console.log(
            formatTable(
                [
                    styler.strong("Status"),
                    styler.strong("Secret"),
                    styler.strong("Target"),
                    styler.strong("Message"),
                ],
                rows,
                true
            )
        );

        if (results.length > 50) {
            console.log(
                styler.muted(`... and ${results.length - 50} more operation(s)`)
            );
        }
    }

    console.log(
        dryRun
            ? styler.info(`Planned operations: ${total}`)
            : styler.info(
                  `Applied: ${applied} | Failed: ${failed} | Total: ${total}`
              )
    );
}

export async function main(argv: string[]): Promise<number> {
    const startedAt = Date.now();
    const options = parseArguments(argv);
    const built = await buildExecutionConfig(options);

    if (typeof built === "number") {
        return built;
    }

    const { dryRun, jsonOutput, operations, quiet, styler } = built;

    const results: SecretOperationResult[] = dryRun
        ? operations.map((operation) => ({
              ok: true,
              operation,
          }))
        : operations.map((operation) => applySecretOperation(operation));

    const failed = results.filter((result) => !result.ok).length;
    const applied = results.length - failed;

    if (jsonOutput) {
        console.log(
            JSON.stringify(
                {
                    applied,
                    dryRun,
                    durationMs: Date.now() - startedAt,
                    failed,
                    results: results.map((result) => ({
                        error: result.error,
                        ok: result.ok,
                        secretName: result.operation.secretName,
                        target: targetLabel(result.operation.target),
                    })),
                    total: results.length,
                },
                null,
                2
            )
        );
    } else {
        printTextSummary(results, dryRun, quiet, styler);
    }

    return failed > 0 ? 2 : 0;
}

const isDirectExecution =
    typeof process.argv[1] === "string" &&
    fileURLToPath(import.meta.url) === process.argv[1];

export function runCli(): void {
    void main(process.argv.slice(2))
        .then((code) => {
            process.exitCode = code;
        })
        .catch((error: unknown) => {
            const message =
                error instanceof Error ? error.message : String(error);
            console.error(`Error: ${message}`);
            process.exitCode = 1;
        });
}

if (isDirectExecution) {
    runCli();
}
