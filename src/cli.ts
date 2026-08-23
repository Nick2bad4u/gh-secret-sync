import { readFileSync } from "node:fs";

import type {
    ErrorCategory,
    ParsedOptions,
    SecretOperation,
    SecretOperationResult,
    SecretTarget,
    Styler,
} from "./cli-types.ts";

import {
    applySecretOperation,
    isGhAuthenticated,
    resolveRepo,
} from "./cli-gh.ts";
import { printHelp, renderHelpText } from "./cli-help.ts";
import { createStyler, formatTable, shouldUseColor } from "./cli-styling.ts";

interface CliFailure {
    readonly exitCode: number;
    readonly ok: false;
}

type CliResult<T> = CliFailure | CliSuccess<T>;

interface CliSuccess<T> {
    readonly ok: true;
    readonly value: T;
}

interface NamedSecret {
    readonly name: string;
    readonly value: string;
}

interface NormalizedConfig {
    readonly isDryRun: boolean;
    readonly isJsonOutput: boolean;
    readonly isQuiet: boolean;
    readonly operations: readonly SecretOperation[];
    readonly styler: Styler;
}

type PlanFormat = "csv" | "json";

interface PlanRecord {
    readonly environment?: string;
    readonly org?: string;
    readonly repo?: string;
    readonly secret?: string;
    readonly secretName?: string;
    readonly selectedRepos?: readonly string[];
    readonly target?: string;
    readonly value?: string;
    readonly visibility?: string;
}

interface ParsedArgument {
    readonly consumedValues: number;
    readonly isRepeatable: boolean;
    readonly key: string;
    readonly value: boolean | string;
}

const PLAN_STRING_FIELDS = [
    "environment",
    "org",
    "repo",
    "secret",
    "secretName",
    "target",
    "value",
    "visibility",
] as const satisfies readonly (keyof PlanRecord)[];

const VISIBILITY_VALUES: ReadonlySet<string> = new Set([
    "all",
    "private",
    "selected",
]);

/** Execute the secret synchronization command and return its process exit code. */
export async function main(argv: readonly string[]): Promise<number> {
    const startedAt = Date.now();
    const options = parseArguments(argv);
    const built = await buildExecutionConfig(options);

    if (!built.ok) {
        return built.exitCode;
    }

    if (built.value === undefined) {
        return 0;
    }

    const { isDryRun, isJsonOutput, isQuiet, operations, styler } = built.value;

    const results: SecretOperationResult[] = isDryRun
        ? operations.map((operation) => ({
              ok: true,
              operation,
          }))
        : operations.map((operation) => applySecretOperation(operation));

    const failed = results.filter((result) => !result.ok).length;
    const applied = results.length - failed;

    if (isJsonOutput) {
        console.log(
            JSON.stringify(
                {
                    applied,
                    dryRun: isDryRun,
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
        printTextSummary(results, isDryRun, isQuiet, styler);
    }

    return failed > 0 ? 2 : 0;
}

/** Run the process entry point, updating `process.exitCode` on completion. */
export async function runCli(
    argumentList: readonly string[] = process.argv.slice(2)
): Promise<void> {
    try {
        const exitCode = await main(argumentList);
        setProcessExitCode(exitCode);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${message}`);
        setProcessExitCode(1);
    }
}

async function buildExecutionConfig(
    options: ParsedOptions
): Promise<CliResult<NormalizedConfig | undefined>> {
    const isJsonOutput = options["json"] === true;
    const isQuiet = options["quiet"] === true;

    const colorMode = options["no-color"] === true ? "never" : "auto";
    const styler = createStyler(shouldUseColor(colorMode, isJsonOutput));

    if (options["help"] === true) {
        console.log(renderHelpText(styler));
        return succeed(undefined);
    }

    const isConfirm = options["confirm"] === true || options["yes"] === true;
    const isDryRun = !isConfirm || options["dry-run"] === true;

    const operations: SecretOperation[] = [];

    const planOperations = collectPlanOperations(options, isJsonOutput, styler);
    if (!planOperations.ok) {
        return planOperations;
    }
    operations.push(...planOperations.value);

    // Collect and validate repository targets
    const validatedRepos = collectRepositoryTargets(
        options,
        isJsonOutput,
        styler
    );
    if (!validatedRepos.ok) {
        return validatedRepos;
    }

    const org = typeof options["org"] === "string" ? options["org"].trim() : "";
    if (org.length > 0 && validatedRepos.value.length > 0) {
        return emitError(
            "--org cannot be combined with --repo/--repos/--repo-file.",
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    // Collect secrets from CLI options
    const secretsForSimpleMode = await collectSecrets(
        options,
        isJsonOutput,
        styler,
        isDryRun
    );
    if (!secretsForSimpleMode.ok) {
        return secretsForSimpleMode;
    }

    // Build operations for simple mode (if secrets were provided)
    if (secretsForSimpleMode.value.length > 0) {
        const environment =
            typeof options["env"] === "string" ? options["env"].trim() : "";

        const result =
            org.length > 0
                ? buildOrgModeOperations(
                      org,
                      secretsForSimpleMode.value,
                      options,
                      isJsonOutput,
                      styler
                  )
                : buildRepoModeOperations(
                      validatedRepos.value,
                      secretsForSimpleMode.value,
                      environment,
                      isJsonOutput,
                      styler
                  );
        if (!result.ok) {
            return result;
        }
        operations.push(...result.value);
    }

    // Validate that we have at least some operations
    if (operations.length === 0) {
        if (!isJsonOutput) {
            console.log(printHelp(styler));
        }
        return emitError(
            "no operations were generated. Provide --plan-file or CLI secret inputs.",
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    // Verify gh authentication
    if (!isGhAuthenticated()) {
        return emitError(
            "gh CLI is not authenticated. Run: gh auth login",
            "auth_error",
            isJsonOutput,
            styler
        );
    }

    return succeed({
        isDryRun,
        isJsonOutput,
        isQuiet,
        operations,
        styler,
    });
}

function collectPlanOperations(
    options: ParsedOptions,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<readonly SecretOperation[]> {
    const planFile =
        typeof options["plan-file"] === "string"
            ? options["plan-file"].trim()
            : "";

    return planFile.length === 0
        ? succeed([])
        : loadPlanOperations(planFile, options, isJsonOutput, styler);
}

function setProcessExitCode(exitCode: number): void {
    process.exitCode = exitCode;
}

function buildOrgModeOperations(
    org: string,
    secretsForSimpleMode: readonly NamedSecret[],
    options: ParsedOptions,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<readonly SecretOperation[]> {
    const visibilityResult = parseVisibility(
        typeof options["org-visibility"] === "string"
            ? options["org-visibility"]
            : undefined,
        isJsonOutput,
        styler
    );
    if (!visibilityResult.ok) {
        return visibilityResult;
    }

    const selectedReposOption = collectStringListOption(
        options,
        "org-selected-repos"
    );
    const validatedSelected = validateRepoList(
        selectedReposOption,
        isJsonOutput,
        styler
    );
    if (!validatedSelected.ok) {
        return validatedSelected;
    }

    const operations = secretsForSimpleMode.map((secret): SecretOperation => {
        const target: Extract<SecretTarget, { readonly kind: "org" }> = {
            kind: "org",
            org,
            ...(validatedSelected.value.length > 0 && {
                selectedRepos: validatedSelected.value,
            }),
            ...(visibilityResult.value !== undefined && {
                visibility: visibilityResult.value,
            }),
        };

        return {
            secretName: secret.name,
            target,
            value: secret.value,
        };
    });

    return succeed(operations);
}

function buildRepoModeOperations(
    validatedRepos: readonly string[],
    secretsForSimpleMode: readonly NamedSecret[],
    environment: string,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<readonly SecretOperation[]> {
    let finalRepos = validatedRepos;
    if (finalRepos.length === 0) {
        const resolved = resolveRepo(undefined);
        if (typeof resolved !== "string" || resolved.length === 0) {
            if (!isJsonOutput) {
                console.log(printHelp(styler));
            }
            return emitError(
                "unable to resolve repository. Provide --repo/--repos/--repo-file, --org, or --plan-file.",
                "validation_error",
                isJsonOutput,
                styler
            );
        }

        finalRepos = [resolved];
    }

    const operations = finalRepos.flatMap((repo) =>
        secretsForSimpleMode.map((secret): SecretOperation => {
            const target: SecretTarget = {
                kind: "repo",
                repo,
                ...(environment.length > 0 && { environment }),
            };

            return {
                secretName: secret.name,
                target,
                value: secret.value,
            };
        })
    );

    return succeed(operations);
}

function collectRepositoryTargets(
    options: ParsedOptions,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<readonly string[]> {
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
                isJsonOutput,
                styler
            );
        }
    }

    return validateRepoList(repoTargets, isJsonOutput, styler);
}

async function collectSecrets(
    options: ParsedOptions,
    isJsonOutput: boolean,
    styler: Styler,
    isDryRun: boolean
): Promise<CliResult<readonly NamedSecret[]>> {
    const inlineSecretPairs = collectStringListOption(options, "set");
    const environmentSecretPairs = collectStringListOption(options, "set-env");
    const singleSecretName =
        typeof options["secret-name"] === "string"
            ? options["secret-name"].trim()
            : "";

    const secretsForSimpleMode: NamedSecret[] = [];

    for (const pair of inlineSecretPairs) {
        const normalized = normalizeSecretPair(
            pair,
            "--set",
            isJsonOutput,
            styler
        );
        if (!normalized.ok) {
            return normalized;
        }
        secretsForSimpleMode.push(normalized.value);
    }

    for (const pair of environmentSecretPairs) {
        const normalized = normalizeSecretPair(
            pair,
            "--set-env",
            isJsonOutput,
            styler
        );
        if (!normalized.ok) {
            return normalized;
        }

        const envValue = process.env[normalized.value.value];
        if (typeof envValue !== "string" || envValue.length === 0) {
            return emitError(
                `environment variable ${normalized.value.value} is empty or missing for --set-env ${normalized.value.name}.`,
                "validation_error",
                isJsonOutput,
                styler
            );
        }

        secretsForSimpleMode.push({
            name: normalized.value.name,
            value: envValue,
        });
    }

    if (singleSecretName.length > 0) {
        if (!isValidSecretName(singleSecretName)) {
            return emitError(
                `invalid --secret-name: ${singleSecretName}.`,
                "validation_error",
                isJsonOutput,
                styler
            );
        }

        const singleValue = await resolveSingleSecretValue(
            options,
            isJsonOutput,
            styler,
            isDryRun
        );
        if (!singleValue.ok) {
            return singleValue;
        }

        secretsForSimpleMode.push({
            name: singleSecretName,
            value: singleValue.value,
        });
    }

    return succeed(secretsForSimpleMode);
}

function collectStringListOption(
    options: ParsedOptions,
    key: string
): readonly string[] {
    const rawValues = options[key];
    if (isStringArray(rawValues)) {
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

function emitError(
    message: string,
    category: ErrorCategory,
    isJsonOutput: boolean,
    styler: Styler
): CliFailure {
    if (isJsonOutput) {
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
        return { exitCode: 1, ok: false };
    }

    console.error(styler.error(`Error: ${message}`));
    return { exitCode: 1, ok: false };
}

function isPlanRecord(value: object): value is PlanRecord {
    for (const field of PLAN_STRING_FIELDS) {
        const fieldValue: unknown = Reflect.get(value, field);
        if (fieldValue !== undefined && typeof fieldValue !== "string") {
            return false;
        }
    }

    const selectedRepos: unknown = Reflect.get(value, "selectedRepos");
    return (
        selectedRepos === undefined ||
        (Array.isArray(selectedRepos) &&
            selectedRepos.every((repo) => typeof repo === "string"))
    );
}

function isStringArray(
    value:
        | boolean
        | readonly string[]
        | string
        | undefined
): value is readonly string[] {
    return Array.isArray(value);
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
    return Array.isArray(value);
}

function isValidRepoSlug(value: string): boolean {
    return /^[^\s\/]+\/[^\s\/]+$/v.test(value);
}

function isValidSecretName(value: string): boolean {
    return (
        /^[A-Z_a-z]\w*$/v.test(value) &&
        !value.toUpperCase().startsWith("GITHUB_")
    );
}

function isVisibility(value: string): value is
    | "all"
    | "private"
    | "selected" {
    return VISIBILITY_VALUES.has(value);
}

function readPlanSource(
    planFile: string,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<string> {
    try {
        return succeed(readUtf8File(planFile));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return emitError(
            `unable to read --plan-file ${planFile}: ${message}`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }
}

function parsePlanSource(
    raw: string,
    planFile: string,
    planFormat: PlanFormat,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<unknown> {
    try {
        return succeed(
            planFormat === "json" ? JSON.parse(raw) : parseCsvPlan(raw)
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return emitError(
            `invalid ${planFormat.toUpperCase()} in --plan-file ${planFile}: ${message}`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }
}

function loadPlanOperations(
    planFile: string,
    options: ParsedOptions,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<readonly SecretOperation[]> {
    const raw = readPlanSource(planFile, isJsonOutput, styler);
    if (!raw.ok) {
        return raw;
    }

    const planFormat = resolvePlanFormat(
        planFile,
        options,
        isJsonOutput,
        styler
    );
    if (!planFormat.ok) {
        return planFormat;
    }

    const parsed = parsePlanSource(
        raw.value,
        planFile,
        planFormat.value,
        isJsonOutput,
        styler
    );
    if (!parsed.ok) {
        return parsed;
    }

    if (!isUnknownArray(parsed.value)) {
        return emitError(
            `--plan-file ${planFormat.value.toUpperCase()} must describe an array/list of operation records.`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    const operations: SecretOperation[] = [];
    for (const entry of parsed.value) {
        if (entry === null || typeof entry !== "object") {
            return emitError(
                "plan file records must be objects.",
                "validation_error",
                isJsonOutput,
                styler
            );
        }

        if (!isPlanRecord(entry)) {
            return emitError(
                "plan file records contain an unsupported field value.",
                "validation_error",
                isJsonOutput,
                styler
            );
        }

        const rendered = renderPlanRecordToOperation(
            entry,
            isJsonOutput,
            styler
        );
        if (!rendered.ok) {
            return rendered;
        }

        operations.push(rendered.value);
    }

    return succeed(operations);
}

function normalizeSecretPair(
    value: string,
    sourceLabel: string,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<NamedSecret> {
    const separator = value.indexOf("=");
    if (separator < 1 || separator === value.length - 1) {
        return emitError(
            `${sourceLabel} entries must use NAME=VALUE format.`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    const name = value.slice(0, separator).trim();

    if (!isValidSecretName(name)) {
        return emitError(
            `invalid secret name: ${name}. Use letters, numbers, or underscores; do not start with a number or GITHUB_.`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    const right = value.slice(separator + 1);
    return succeed({
        name,
        value: right,
    });
}

function parseArgumentAtIndex(
    args: readonly string[],
    index: number,
    booleanFlags: ReadonlySet<string>,
    repeatableFlags: ReadonlySet<string>
): ParsedArgument | undefined {
    const token = args[index];
    if (token?.startsWith("--") !== true) {
        return undefined;
    }

    const inlineSeparator = token.indexOf("=");
    const key =
        inlineSeparator === -1
            ? token.slice(2).trim()
            : token.slice(2, inlineSeparator).trim();

    if (booleanFlags.has(key)) {
        return {
            consumedValues: 0,
            isRepeatable: false,
            key,
            value: true,
        };
    }

    const inlineValue =
        inlineSeparator === -1 ? undefined : token.slice(inlineSeparator + 1);
    const nextToken = args[index + 1];
    const hasSeparateValue =
        inlineValue === undefined &&
        nextToken !== undefined &&
        !nextToken.startsWith("--");
    const value = inlineValue ?? (hasSeparateValue ? nextToken : "");

    return {
        consumedValues: hasSeparateValue ? 1 : 0,
        isRepeatable: repeatableFlags.has(key),
        key,
        value,
    };
}

function parseArguments(args: readonly string[]): ParsedOptions {
    const parsed: Record<
        string,
        | boolean
        | string
        | string[]
    > = {};

    const booleanFlags = new Set([
        "confirm",
        "dry-run",
        "help",
        "json",
        "no-color",
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
        const argument = parseArgumentAtIndex(
            args,
            index,
            booleanFlags,
            repeatableFlags
        );
        if (argument !== undefined) {
            index += argument.consumedValues;
            if (argument.isRepeatable && typeof argument.value === "string") {
                const existing = parsed[argument.key];
                const bucket = Array.isArray(existing) ? existing : [];
                bucket.push(argument.value);
                parsed[argument.key] = bucket;
            } else {
                parsed[argument.key] = argument.value;
            }
        }
    }

    return parsed;
}

function parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let current = "";
    let isInQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line.charAt(index);

        if (character === '"' && isInQuotes && line.charAt(index + 1) === '"') {
            current += '"';
            index += 1;
        } else if (character === '"') {
            isInQuotes = !isInQuotes;
        } else if (character === "," && !isInQuotes) {
            fields.push(current.trim());
            current = "";
        } else {
            current += character;
        }
    }

    if (isInQuotes) {
        throw new Error("unterminated quoted CSV field");
    }

    fields.push(current.trim());
    return fields;
}

function parseCsvPlan(raw: string): PlanRecord[] {
    const normalizedRaw = raw.codePointAt(0) === 0xfe_ff ? raw.slice(1) : raw;
    const lines = normalizedRaw
        .split(/\r?\n/v)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));

    if (lines.length === 0) {
        return [];
    }

    const headers = parseCsvLine(lines[0] ?? "").map((header) => header.trim());

    return lines
        .slice(1)
        .map((line, rowIndex) =>
            parseCsvPlanRecord(headers, line, rowIndex + 2)
        );
}

function parseCsvPlanRecord(
    headers: readonly string[],
    line: string,
    rowNumber: number
): PlanRecord {
    const values = parseCsvLine(line);
    if (values.length !== headers.length) {
        throw new Error(
            `CSV row ${rowNumber} has ${values.length} column(s); expected ${headers.length}`
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
    const selectedRepos =
        selectedReposValue === undefined
            ? undefined
            : selectedReposValue
                  .split("|")
                  .map((repo) => repo.trim())
                  .filter((repo) => repo.length > 0);
    const environment = mapped.get("environment");
    const org = mapped.get("org");
    const repo = mapped.get("repo");
    const secret = mapped.get("secret");
    const secretName = mapped.get("secretName") ?? mapped.get("secret_name");
    const target = mapped.get("target");
    const value = mapped.get("value");
    const visibility = mapped.get("visibility");

    return {
        ...(environment !== undefined && { environment }),
        ...(org !== undefined && { org }),
        ...(repo !== undefined && { repo }),
        ...(secret !== undefined && { secret }),
        ...(secretName !== undefined && { secretName }),
        ...(selectedRepos !== undefined && { selectedRepos }),
        ...(target !== undefined && { target }),
        ...(value !== undefined && { value }),
        ...(visibility !== undefined && { visibility }),
    };
}

function parseVisibility(
    raw: string | undefined,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<
    | "all"
    | "private"
    | "selected"
    | undefined
> {
    if (typeof raw !== "string" || raw.length === 0) {
        return succeed(undefined);
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
            isJsonOutput,
            styler
        );
    }

    return succeed(normalized);
}

function printTextSummary(
    results: readonly SecretOperationResult[],
    isDryRun: boolean,
    isQuiet: boolean,
    styler: Styler
): void {
    const total = results.length;
    const failed = results.filter((result) => !result.ok).length;
    const applied = total - failed;

    if (!isQuiet) {
        const rows = results.slice(0, 50).map((result) => [
            result.ok ? styler.ok("ok") : styler.error("failed"),
            result.operation.secretName,
            targetLabel(result.operation.target),
            result.ok
                ? ""
                : (result.error ?? "unknown error")
                      .replaceAll(/\s+/gv, " ")
                      .trim(),
        ]);

        console.log(
            styler.heading(
                isDryRun ? "Secret sync dry-run" : "Secret sync results"
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
        isDryRun
            ? styler.info(`Planned operations: ${total}`)
            : styler.info(
                  `Applied: ${applied} | Failed: ${failed} | Total: ${total}`
              )
    );
}

async function promptHiddenValue(promptText: string): Promise<string> {
    const { stdin, stdout } = process;
    if (!stdin.isTTY || !stdout.isTTY) {
        throw new Error(
            "--secret-value-prompt requires an interactive terminal."
        );
    }

    return await new Promise((resolve, reject) => {
        let value = "";

        function cleanup(): void {
            stdin.off("data", onData);
            if (stdin.isTTY) {
                stdin.setRawMode(false);
            }
            stdin.pause();
        }

        function onData(chunk: Readonly<Buffer> | string): void {
            const text =
                typeof chunk === "string" ? chunk : chunk.toString("utf8");

            for (const character of text) {
                if (character === "\u{3}") {
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

                if (character === "\u{8}" || character === "\u{7F}") {
                    if (value.length > 0) {
                        value = value.slice(0, -1);
                    }
                    continue;
                }

                value += character;
            }
        }

        stdout.write(promptText);
        stdin.resume();
        stdin.setEncoding("utf8");
        if (stdin.isTTY) {
            stdin.setRawMode(true);
        }
        stdin.on("data", onData);
    });
}

function readRepoFile(path: string): string[] {
    const raw = readUtf8File(path);
    return raw
        .split(/\r?\n/v)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));
}

function readUtf8File(path: string): string {
    return readFileSync(path, "utf8");
}

function renderOrganizationPlanOperation(
    record: PlanRecord,
    secretName: string,
    secretValue: string,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<SecretOperation> {
    const org = typeof record.org === "string" ? record.org.trim() : "";
    if (org.length === 0) {
        return emitError(
            "plan record target org requires org field.",
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    const rawVisibility =
        typeof record.visibility === "string"
            ? record.visibility.trim().toLowerCase()
            : undefined;
    if (rawVisibility !== undefined && !isVisibility(rawVisibility)) {
        return emitError(
            `invalid plan visibility for org ${org}: ${rawVisibility}.`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    const selectedRepos = (record.selectedRepos ?? [])
        .map((repo) => repo.trim())
        .filter((repo) => repo.length > 0);
    const validatedSelected = validateRepoList(
        selectedRepos,
        isJsonOutput,
        styler,
        "invalid selected repos in plan"
    );
    if (!validatedSelected.ok) {
        return validatedSelected;
    }

    const target: SecretTarget = {
        kind: "org",
        org,
        ...(validatedSelected.value.length > 0 && {
            selectedRepos: validatedSelected.value,
        }),
        ...(rawVisibility !== undefined && { visibility: rawVisibility }),
    };

    return succeed({ secretName, target, value: secretValue });
}

function renderPlanRecordToOperation(
    record: PlanRecord,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<SecretOperation> {
    const secretName =
        typeof record.secretName === "string"
            ? record.secretName.trim()
            : typeof record.secret === "string"
              ? record.secret.trim()
              : "";

    if (!isValidSecretName(secretName)) {
        return emitError(
            `invalid plan secret name: ${secretName.length > 0 ? secretName : "<empty>"}.`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    if (typeof record.value !== "string" || record.value.length === 0) {
        return emitError(
            `plan record value is required for secret ${secretName}.`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    const targetKind = (record.target ?? "").trim().toLowerCase();

    if (
        targetKind === "org" ||
        (targetKind.length === 0 &&
            typeof record.org === "string" &&
            record.org.trim().length > 0)
    ) {
        return renderOrganizationPlanOperation(
            record,
            secretName,
            record.value,
            isJsonOutput,
            styler
        );
    }

    return renderRepositoryPlanOperation(
        record,
        secretName,
        record.value,
        targetKind,
        isJsonOutput,
        styler
    );
}

function renderRepositoryPlanOperation(
    record: PlanRecord,
    secretName: string,
    secretValue: string,
    targetKind: string,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<SecretOperation> {
    const repo = typeof record.repo === "string" ? record.repo.trim() : "";
    if (!isValidRepoSlug(repo)) {
        return emitError(
            `invalid plan repo value: ${repo.length > 0 ? repo : "<empty>"}.`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    const environment =
        targetKind === "env" || typeof record.environment === "string"
            ? (record.environment?.trim() ?? "")
            : undefined;

    if (
        targetKind === "env" &&
        (environment === undefined || environment.length === 0)
    ) {
        return emitError(
            `plan env target requires environment for repo ${repo}.`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    const target: SecretTarget = {
        kind: "repo",
        repo,
        ...(environment !== undefined &&
            environment.length > 0 && { environment }),
    };

    return succeed({
        secretName,
        target,
        value: secretValue,
    });
}

function resolvePlanFormat(
    planFile: string,
    options: ParsedOptions,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<PlanFormat> {
    const planFormatOption =
        typeof options["plan-format"] === "string"
            ? options["plan-format"].trim().toLowerCase()
            : "";

    if (planFormatOption.length > 0) {
        if (planFormatOption === "json" || planFormatOption === "csv") {
            return succeed(planFormatOption);
        }

        return emitError(
            "--plan-format must be one of: json, csv.",
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    if (planFile.toLowerCase().endsWith(".json")) {
        return succeed("json");
    }

    if (planFile.toLowerCase().endsWith(".csv")) {
        return succeed("csv");
    }

    return emitError(
        "unable to infer plan format. Use a .json/.csv extension or pass --plan-format.",
        "validation_error",
        isJsonOutput,
        styler
    );
}

async function resolveSingleSecretValue(
    options: ParsedOptions,
    isJsonOutput: boolean,
    styler: Styler,
    isDryRun: boolean
): Promise<CliResult<string>> {
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
    const isPromptValue = options["secret-value-prompt"] === true;
    const isReadFromStdin = options["secret-value-stdin"] === true;

    const provided = [
        inlineValue,
        envName,
        valueFile,
        isPromptValue ? "prompt" : undefined,
        isReadFromStdin ? "stdin" : undefined,
    ].filter((entry) => typeof entry === "string").length;

    if (provided > 1) {
        return emitError(
            "provide only one of: --secret-value, --secret-value-env, --secret-value-file, --secret-value-prompt, --secret-value-stdin.",
            "validation_error",
            isJsonOutput,
            styler
        );
    }

    if (typeof inlineValue === "string") {
        return validateNonEmptySecretValue(
            inlineValue,
            "--secret-value cannot be empty.",
            isJsonOutput,
            styler
        );
    }

    if (typeof envName === "string") {
        return resolveEnvironmentSecretValue(envName, isJsonOutput, styler);
    }

    if (typeof valueFile === "string") {
        return resolveFileSecretValue(valueFile, isJsonOutput, styler);
    }

    if (isPromptValue) {
        return resolvePromptSecretValue(isDryRun, isJsonOutput, styler);
    }

    if (isReadFromStdin) {
        return resolveStdinSecretValue(isDryRun, isJsonOutput, styler);
    }

    return emitError(
        "missing secret value. Provide --secret-value, --secret-value-env, --secret-value-file, --secret-value-prompt, --secret-value-stdin, --set, or --set-env.",
        "validation_error",
        isJsonOutput,
        styler
    );
}

function validateNonEmptySecretValue(
    value: string,
    emptyMessage: string,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<string> {
    return value.length === 0
        ? emitError(emptyMessage, "validation_error", isJsonOutput, styler)
        : succeed(value);
}

function resolveEnvironmentSecretValue(
    environmentVariable: string,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<string> {
    const value = process.env[environmentVariable];
    return typeof value !== "string" || value.length === 0
        ? emitError(
              `environment variable ${environmentVariable} is empty or missing.`,
              "validation_error",
              isJsonOutput,
              styler
          )
        : succeed(value);
}

function resolveFileSecretValue(
    path: string,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<string> {
    try {
        return validateNonEmptySecretValue(
            readUtf8File(path),
            `--secret-value-file ${path} is empty.`,
            isJsonOutput,
            styler
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return emitError(
            `unable to read --secret-value-file ${path}: ${message}`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }
}

async function resolvePromptSecretValue(
    isDryRun: boolean,
    isJsonOutput: boolean,
    styler: Styler
): Promise<CliResult<string>> {
    if (isDryRun) {
        return succeed("<prompt-value omitted in dry-run>");
    }

    try {
        return validateNonEmptySecretValue(
            await promptHiddenValue("Enter secret value (hidden): "),
            "--secret-value-prompt received an empty value.",
            isJsonOutput,
            styler
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return emitError(message, "validation_error", isJsonOutput, styler);
    }
}

function resolveStdinSecretValue(
    isDryRun: boolean,
    isJsonOutput: boolean,
    styler: Styler
): CliResult<string> {
    if (isDryRun) {
        return succeed("<stdin-value omitted in dry-run>");
    }

    try {
        return validateNonEmptySecretValue(
            readFileSync(0, "utf8"),
            "--secret-value-stdin did not receive any input.",
            isJsonOutput,
            styler
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return emitError(
            `unable to read secret value from stdin: ${message}`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }
}

function succeed<T>(value: T): CliSuccess<T> {
    return { ok: true, value };
}

function targetLabel(target: SecretTarget): string {
    if (target.kind === "org") {
        return `org:${target.org}`;
    }

    return typeof target.environment === "string"
        ? `repo:${target.repo} env:${target.environment}`
        : `repo:${target.repo}`;
}

function validateRepoList(
    repos: readonly string[],
    isJsonOutput: boolean,
    styler: Styler,
    errorPrefix = "invalid repository values"
): CliResult<readonly string[]> {
    const deduped = [...new Set(repos)];
    const invalid = deduped.filter((repo) => !isValidRepoSlug(repo));
    if (invalid.length > 0) {
        return emitError(
            `${errorPrefix}: ${invalid.join(", ")}. Use owner/name format.`,
            "validation_error",
            isJsonOutput,
            styler
        );
    }
    return succeed(deduped);
}
