import type { Styler } from "./cli-types.js";

type HelpOption = {
    arg?: string;
    description: string;
    flag: string;
};

type HelpSection = {
    options: HelpOption[];
    title: string;
};

const HELP_SECTIONS: HelpSection[] = [
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

function styleCommandExample(command: string, styler?: Styler): string {
    if (!styler) {
        return command;
    }

    return command
        .split(/(\s+)/u)
        .map((token) =>
            token.startsWith("--")
                ? styler.flag(token)
                : token.startsWith("<") && token.endsWith(">")
                  ? styler.arg(token)
                  : token
        )
        .join("");
}

export function buildHelpText(styler?: Styler): string {
    const heading = (text: string): string =>
        styler ? styler.info(text) : text;
    const flag = (text: string): string => (styler ? styler.flag(text) : text);
    const arg = (text: string): string => (styler ? styler.arg(text) : text);
    const title = (text: string): string =>
        styler ? styler.heading(text) : text;

    const maxLabelWidth = Math.max(
        ...HELP_SECTIONS.flatMap((section) =>
            section.options.map(
                (option) =>
                    `${option.flag}${option.arg ? ` ${option.arg}` : ""}`.length
            )
        ),
        0
    );

    const lines: string[] = [];
    lines.push(title("gh-secret-sync"));
    lines.push("");
    lines.push(heading("Usage"));
    lines.push(`  gh secret-sync [options]`);
    lines.push("");

    for (const section of HELP_SECTIONS) {
        lines.push(title(section.title));
        for (const option of section.options) {
            const label = `${flag(option.flag)}${option.arg ? ` ${arg(option.arg)}` : ""}`;
            const plainLabel = `${option.flag}${option.arg ? ` ${option.arg}` : ""}`;
            const padding = " ".repeat(
                Math.max(1, maxLabelWidth - plainLabel.length + 2)
            );
            lines.push(`  ${label}${padding}${option.description}`);
        }
        lines.push("");
    }

    lines.push(heading("Plan file format (JSON)"));
    lines.push(
        '  [ { "target": "repo"|"env"|"org", "repo"?: "owner/name", "environment"?: "prod",'
    );
    lines.push(
        '      "org"?: "my-org", "secret": "NAME", "value": "secret", "selectedRepos"?: ["owner/repo"] } ]'
    );
    lines.push("");
    lines.push(heading("Plan file format (CSV)"));
    lines.push(
        "  target,repo,environment,org,secret,value,visibility,selectedRepos"
    );
    lines.push(
        '  env,owner/repo,production,,API_KEY,"value",,"owner/repo-a|owner/repo-b"'
    );
    lines.push("");

    lines.push(heading("Examples"));
    for (const example of HELP_EXAMPLES) {
        lines.push(`  ${styleCommandExample(example, styler)}`);
    }

    return lines.join("\n");
}

export function renderHelpText(styler?: Styler): string {
    return buildHelpText(styler);
}

export function printHelp(styler?: Styler): string {
    return buildHelpText(styler);
}
