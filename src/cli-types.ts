/** Controls whether terminal styling is emitted. */
export type ColorMode =
    | "always"
    | "auto"
    | "never";

/** Stable machine-readable category for a CLI error. */
export type ErrorCategory = "auth_error" | "validation_error";

/** Captured result of invoking the GitHub CLI. */
export interface GhResponse {
    readonly status: number;
    readonly stderr: string;
    readonly stdout: string;
}

/** Parsed command-line options keyed by their long flag name. */
export type ParsedOptions = Readonly<
    Record<
        string,
        | boolean
        | readonly string[]
        | string
    >
>;

/** One secret write and its resolved destination. */
export interface SecretOperation {
    readonly secretName: string;
    readonly target: SecretTarget;
    readonly value: string;
}

/** Outcome of applying a resolved secret operation. */
export interface SecretOperationResult {
    readonly error?: string;
    readonly ok: boolean;
    readonly operation: SecretOperation;
}

/** Repository, environment, or organization destination for a secret. */
export type SecretTarget =
    | {
          readonly environment?: string;
          readonly kind: "repo";
          readonly repo: string;
      }
    | {
          readonly kind: "org";
          readonly org: string;
          readonly selectedRepos?: readonly string[];
          readonly visibility?:
              | "all"
              | "private"
              | "selected";
      };

/** Functions used to apply optional ANSI styling to CLI text. */
export interface Styler {
    readonly arg: (text: string) => string;
    readonly error: (text: string) => string;
    readonly flag: (text: string) => string;
    readonly heading: (text: string) => string;
    readonly info: (text: string) => string;
    readonly muted: (text: string) => string;
    readonly ok: (text: string) => string;
    readonly strong: (text: string) => string;
}
