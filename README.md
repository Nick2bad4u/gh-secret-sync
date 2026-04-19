# gh-secret-sync

[![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/gh-secret-sync?color=yellow)](https://github.com/Nick2bad4u/gh-secret-sync/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/gh-secret-sync?color=green)](https://github.com/Nick2bad4u/gh-secret-sync/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/gh-secret-sync?color=red)](https://github.com/Nick2bad4u/gh-secret-sync/issues)

`gh-secret-sync` is a GitHub CLI extension for safely syncing secrets across many repositories, environments, and organization targets.

It is built for bulk secret updates where safety and deterministic output matter.

## Install

```bash
gh extension install Nick2bad4u/gh-secret-sync
```

## Requirements

- `gh` CLI installed and authenticated (`gh auth login`)
- Node.js `>=22.18.0`

## Safety model

- Default behavior is **dry-run** (no writes)
- Pass `--confirm` (or `--yes`) to actually apply changes
- `--json` output is machine-readable and stable
- Secret values are forwarded to `gh secret set` via **stdin**, not as child-process command arguments
- Hidden prompt mode is available with `--secret-value-prompt`
- Existing secrets are **updated** by `gh secret set`; this extension currently follows that behavior

## Usage

Use `gh secret-sync` to apply one or many secret updates across repository, environment, or organization targets from CLI input or plan files.

```bash
# Single secret, single repo
gh secret-sync --repo owner/repo --secret-name API_KEY --secret-value-env API_KEY
# Single secret, multiple repos
gh secret-sync --repos owner/a,owner/b --secret-name API_KEY --secret-value-prompt --confirm
# Multiple secrets, multiple repos
# (same value from file)
gh secret-sync --repos owner/a,owner/b --secret-name API_KEY --secret-value-file ./secrets/api_key.txt --confirm
# (value from stdin)
Get-Content ./secrets/api_key.txt | gh secret-sync --repo owner/repo --secret-name API_KEY --secret-value-stdin --confirm
# (multiple names/values)
gh secret-sync --repo-file repos.txt --set TOKEN=abc123 --set-env URL=DEPLOY_URL --confirm
# Environment secret target
gh secret-sync --repo owner/repo --env production --secret-name API_KEY --secret-value-env API_KEY --confirm
# Organization secret target
gh secret-sync --org my-org --secret-name SHARED --secret-value-env SHARED --org-visibility private --confirm
# Plan file (JSON)
gh secret-sync --plan-file ./secret-plan.json --confirm --json
# Plan file (CSV)
gh secret-sync --plan-file ./secret-plan.csv --plan-format csv --confirm
# SECURITY NOTICE: inline value can be recorded by shell history/logging
gh secret-sync --repo owner/repo --secret-name API_KEY --secret-value "your-secret-value" --confirm
```

## Input modes

### 1) CLI mode (single secret)

- `--secret-name <name>`
- exactly one of:
  - `--secret-value <value>`
  - `--secret-value-env <ENV_VAR>`
  - `--secret-value-file <path>`
  - `--secret-value-prompt`
  - `--secret-value-stdin`

Targets:

- Repos: `--repo`, `--repos`, `--repo-file`
- Current repo fallback when no explicit target is provided
- Environment secret: add `--env <environment>`
- Org secret: `--org <org>` (optional `--org-visibility`, `--org-selected-repos`)

### 2) CLI mode (multi-secret)

- Repeat `--set NAME=VALUE`
- Repeat `--set-env NAME=ENV_VAR`
- Combine with repo/org target options

### 3) Plan file mode

Use `--plan-file <path>` with either JSON or CSV records.

- If the extension is `.json`, JSON is inferred
- If the extension is `.csv`, CSV is inferred
- You can force the parser with `--plan-format json` or `--plan-format csv`

Example commands:

```bash
gh secret-sync --plan-file ./docs/examples/secret-plan.example.json --confirm --json
gh secret-sync --plan-file ./docs/examples/secret-plan.example.csv --plan-format csv --confirm
```

Example files included in this repo:

- `docs/examples/secret-plan.example.json`
- `docs/examples/secret-plan.example.csv`

JSON example:

```json
[
  {
    "target": "repo",
    "repo": "owner/repo-a",
    "secret": "API_KEY",
    "value": "value-a"
  },
  {
    "target": "env",
    "repo": "owner/repo-b",
    "environment": "production",
    "secret": "API_KEY",
    "value": "value-b"
  },
  {
    "target": "org",
    "org": "my-org",
    "secret": "SHARED_TOKEN",
    "value": "value-c",
    "visibility": "private",
    "selectedRepos": [
      "owner/repo-a",
      "owner/repo-b"
    ]
  }
]
```

CSV example:

```csv
target,repo,environment,org,secret,value,visibility,selectedRepos
repo,owner/repo-a,,,API_KEY,replace-me,,
env,owner/repo-b,production,,API_KEY,replace-me-too,,
org,,,my-org,SHARED_TOKEN,replace-me-three,selected,owner/repo-a|owner/repo-b
```

CSV columns:

- `target`: `repo`, `env`, or `org`
- `repo`: required for `repo` and `env`
- `environment`: required for `env`
- `org`: required for `org`
- `secret`: secret name
- `value`: secret value
- `visibility`: org visibility (`all`, `private`, or `selected`)
- `selectedRepos`: pipe-delimited repo list for org secrets, e.g. `owner/a|owner/b`

## Execution flags

- `--dry-run` (default)
- `--confirm` / `--yes`
- `--json`
- `--quiet`
- `--help`

## Keeping secrets out of shell history

You can avoid putting the secret itself in shell history by preferring one of these:

- `--secret-value-env`
- `--secret-value-file`
- `--secret-value-prompt`
- `--secret-value-stdin`
- plan files stored outside shell history

Using `--secret-value <value>` is convenient, but the value is part of the command you typed, so it may be stored by your shell history manager.

### PowerShell note

PowerShell does **not** have a Bash-style `HISTCONTROL` environment variable for this.

What it does have is PSReadLine configuration, for example:

```powershell
Set-PSReadLineOption -AddToHistoryHandler {
  param($line)
  if ($line -like 'gh secret-sync*') {
    return $false
  }
  return $true
}
```

or more aggressively:

```powershell
Set-PSReadLineOption -HistorySaveStyle SaveNothing
```

That second option is broader and affects all saved history, so `--secret-value-prompt`, `--secret-value-stdin`, or `--secret-value-env` are usually better choices.

Important nuance: avoiding shell history is possible, but no tool can guarantee the secret never appears anywhere at all if your environment has extra logging enabled (for example PowerShell transcription, terminal recording, CI logs, or screen capture tools).

## Overwrite behavior

`gh secret set` updates an existing secret if one already exists with the same name and target.

This extension currently follows that behavior.

I have **not** added a separate overwrite flag yet because overwrite is already the underlying GitHub CLI behavior. If you want stricter safety next, the best follow-up would be a flag like:

- `--skip-existing`
- or `--fail-if-exists`

Those would be more meaningful than `--overwrite`, since overwrite is already what GitHub CLI does.

## Exit codes

- `0`: success
- `1`: validation/auth/runtime error before execution
- `2`: partial failure (some secret writes failed)

## Development

```bash
npm install
npm run build
npm run typecheck
npm run lint
npm test
```
