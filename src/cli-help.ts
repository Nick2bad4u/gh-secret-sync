import type { Styler } from "./cli-types.ts";

interface HelpOption {
    readonly arg?: string;
    readonly description: string;
    readonly flag: string;
}

interface HelpSection {
    readonly options: readonly HelpOption[];
    readonly title: string;
}

const HELP_SECTIONS: readonly HelpSection[] = [
    {
        options: [
            {
                description:
                    "Dry-run mode (default). Prints planned writes without calling gh secret set.",
                flag: "--dry-run",
            },
            {
                description:
                    "Required to actually write secrets. Alias: --yes.",
                flag: "--confirm",
            },
            {
                description: "Alias for --confirm.",
                flag: "--yes",
            },
            {
                description: "Emit machine-readable JSON summary.",
                flag: "--json",
            },
            {
                description: "Reduce non-error text output.",
                flag: "--quiet",
            },
        ],
        title: "Safety and output",
    },
    {
        options: [
            {
                arg: "<owner/name>",
                description:
                    "Single repository target. If omitted, current repo is auto-resolved.",
                flag: "--repo",
            },
            {
                arg: "<owner/name[,owner/name...]>",
                description: "Multiple repository targets (repeatable).",
                flag: "--repos",
            },
            {
                arg: "<path>",
                description:
                    "Text file with one repo slug per line (# comments allowed).",
                flag: "--repo-file",
            },
            {
                arg: "<environment>",
                description:
                    "Set repository environment secret instead of repository-level secret.",
                flag: "--env",
            },
        ],
        title: "Repository targets",
    },
    {
        options: [
            {
                arg: "<name>",
                description: "Secret name for single-secret mode.",
                flag: "--secret-name",
            },
            {
                arg: "<value>",
                description: "Secret value for single-secret mode.",
                flag: "--secret-value",
            },
            {
                arg: "<ENV_VAR>",
                description:
                    "Read secret value from an environment variable in the current shell.",
                flag: "--secret-value-env",
            },
            {
                arg: "<path>",
                description:
                    "Read secret value from a file (full file content is used).",
                flag: "--secret-value-file",
            },
            {
                description:
                    "Prompt once for a hidden secret value in an interactive terminal.",
                flag: "--secret-value-prompt",
            },
            {
                description:
                    "Read the secret value from stdin once (best for avoiding shell history).",
                flag: "--secret-value-stdin",
            },
            {
                arg: "<NAME=VALUE>",
                description:
                    "Add a secret inline (repeatable) for bulk mode across the same targets.",
                flag: "--set",
            },
            {
                arg: "<NAME=ENV_VAR>",
                description:
                    "Add a secret where value is read from environment variable (repeatable).",
                flag: "--set-env",
            },
        ],
        title: "CLI input modes",
    },
    {
        options: [
            {
                arg: "<path>",
                description:
                    "JSON or CSV plan file for mixed target operations (repo/env/org in one run).",
                flag: "--plan-file",
            },
            {
                arg: "<json|csv>",
                description:
                    "Optional plan format override when the file extension is ambiguous.",
                flag: "--plan-format",
            },
            {
                arg: "<org>",
                description:
                    "Organization target for single-secret mode (uses gh secret set --org).",
                flag: "--org",
            },
            {
                arg: "<all|private|selected>",
                description:
                    "Organization secret visibility in single-secret mode.",
                flag: "--org-visibility",
            },
            {
                arg: "<owner/name[,owner/name...]>",
                description:
                    "Selected repositories for organization secret in single-secret mode.",
                flag: "--org-selected-repos",
            },
            {
                description: "Show help.",
                flag: "--help",
            },
        ],
        title: "Plan mode and org mode",
    },
];

const HELP_EXAMPLES = [
    "gh secret-sync --repo owner/repo --secret-name API_KEY --secret-value-env API_KEY --confirm",
    "gh secret-sync --repo owner/repo --secret-name API_KEY --secret-value-prompt --confirm",
    "Get-Content ./secrets/api_key.txt | gh secret-sync --repo owner/repo --secret-name API_KEY --secret-value-stdin --confirm",
    "gh secret-sync --repos owner/a,owner/b --env production --set TOKEN=$TOKEN --set-env URL=DEPLOY_URL --confirm",
    "gh secret-sync --repo-file repos.txt --secret-name NPM_TOKEN --secret-value-file ./.secrets/npm_token.txt --dry-run",
    "gh secret-sync --org my-org --secret-name SHARED --secret-value-env SHARED --org-visibility private --confirm",
    "gh secret-sync --plan-file ./secret-plan.json --confirm --json",
    "gh secret-sync --plan-file ./secret-plan.csv --plan-format csv --confirm",
];

/** Build the complete help text, optionally applying terminal styling. */
export function buildHelpText(styler?: Styler): string {
    const heading = (text: string): string =>
        styler === undefined ? text : styler.info(text);
    const flag = (text: string): string =>
        styler === undefined ? text : styler.flag(text);
    const arg = (text: string): string =>
        styler === undefined ? text : styler.arg(text);
    const title = (text: string): string =>
        styler === undefined ? text : styler.heading(text);

    const maxLabelWidth = Math.max(
        ...HELP_SECTIONS.flatMap((section) =>
            section.options.map(
                (option) => formatPlainOptionLabel(option).length
            )
        ),
        0
    );

    const lines: string[] = [
        title("gh-secret-sync"),
        "",
        heading("Usage"),
        "  gh secret-sync [options]",
        "",
    ];

    for (const section of HELP_SECTIONS) {
        lines.push(title(section.title));
        for (const option of section.options) {
            const renderedArgument =
                option.arg === undefined ? "" : ` ${arg(option.arg)}`;
            const plainArgument =
                option.arg === undefined ? "" : ` ${option.arg}`;
            const label = `${flag(option.flag)}${renderedArgument}`;
            const plainLabel = `${option.flag}${plainArgument}`;
            const padding = " ".repeat(
                Math.max(1, maxLabelWidth - plainLabel.length + 2)
            );
            lines.push(`  ${label}${padding}${option.description}`);
        }
        lines.push("");
    }

    lines.push(
        heading("Plan file format (JSON)"),
        '  [ { "target": "repo"|"env"|"org", "repo"?: "owner/name", "environment"?: "prod",',
        '      "org"?: "my-org", "secret": "NAME", "value": "secret", "selectedRepos"?: ["owner/repo"] } ]',
        "",
        heading("Plan file format (CSV)"),
        "  target,repo,environment,org,secret,value,visibility,selectedRepos",
        '  env,owner/repo,production,,API_KEY,"value",,"owner/repo-a|owner/repo-b"',
        "",
        heading("Examples")
    );

    for (const example of HELP_EXAMPLES) {
        lines.push(`  ${styleCommandExample(example, styler)}`);
    }

    return lines.join("\n");
}

/** Build help text for callers that use the historical print helper. */
export function printHelp(styler?: Styler): string {
    return buildHelpText(styler);
}

/** Build help text for callers that render it through their own output layer. */
export function renderHelpText(styler?: Styler): string {
    return buildHelpText(styler);
}

function formatPlainOptionLabel(option: HelpOption): string {
    const argument = option.arg === undefined ? "" : ` ${option.arg}`;
    return `${option.flag}${argument}`;
}

function styleCommandExample(command: string, styler?: Styler): string {
    if (styler === undefined) {
        return command;
    }

    return command.replaceAll(/\S+/gv, (token) =>
        token.startsWith("--") ? styler.flag(token) : token
    );
}
