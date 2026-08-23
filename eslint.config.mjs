import { createConfig } from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...createConfig({
        allowDefaultProjectFilePatterns: [
            "*.{js,mjs,cjs}",
            ".*.{js,mjs,cjs}",
            "scripts/*.mjs",
            "stylelint.config.mjs",
        ],
        plugins: {
            "docusaurus-2": false,
            typefest: false,
        },
        tsconfigPaths: ["./tsconfig.json"],
    }),
    {
        name: "Repository policy exceptions",
        rules: {
            "repo-compliance/require-secret-scanning-config": "off",
        },
    },
    {
        files: ["package.json"],
        name: "Validate package metadata without remote SchemaStore resolution",
        rules: {
            "json-schema-validator-2/no-invalid": "off",
        },
    },
    {
        files: ["**/*.ts"],
        name: "Require native Node TypeScript import extensions",
        rules: {
            "import-x/extensions": "off",
        },
    },
    {
        files: ["**/*.html"],
        name: "Defer self-closing tag spacing to Prettier",
        rules: {
            "@html-eslint/no-extra-spacing-tags": "off",
        },
    },
    {
        files: ["src/**/*.ts"],
        name: "Allow the CLI runtime to write user-facing output",
        rules: {
            "no-console": "off",
            "unicorn/prefer-error-is-error": "off",
        },
    },
    {
        files: ["src/cli-styling.ts"],
        name: "Allow terminal behavior to honor standard environment variables",
        rules: {
            "n/no-process-env": "off",
        },
    },
    {
        files: ["src/cli-gh.ts"],
        name: "Allow the synchronous GitHub CLI process boundary",
        rules: {
            "n/no-process-env": "off",
            "n/no-sync": "off",
        },
    },
    {
        files: ["src/cli.ts"],
        name: "Allow the executable module to export its testable entry point",
        rules: {
            "n/no-process-env": "off",
            "n/no-sync": "off",
            // Keep execution helpers grouped by control flow; alphabetic sorting
            // creates circular auto-fixes and obscures the CLI's safety sequence.
            "perfectionist/sort-modules": "off",
            // Paths are explicit CLI inputs for secret and plan files.
            "security/detect-non-literal-fs-filename": "off",
            "unicorn/no-exports-in-scripts": "off",
        },
    },
    {
        files: ["scripts/**/*.{js,mjs,ts,mts}"],
        name: "Allow controlled repository maintenance script boundaries",
        rules: {
            "n/no-process-env": "off",
            "n/no-sync": "off",
            "no-console": "off",
            "security/detect-non-literal-fs-filename": "off",
            "unicorn/prefer-error-is-error": "off",
        },
    },
    {
        files: ["test/**/*.ts"],
        name: "Keep deterministic test fixtures and cleanup readable",
        rules: {
            "canonical/no-barrel-import": "off",
            "sonarjs/no-undefined-assignment": "off",
            "test-signal/no-duplicate-assertions": "off",
            "test-signal/no-mock-call-only-tests": "off",
            "test-signal/require-negative-path": "off",
            "unicorn/prefer-temporal": "off",
            "vitest/no-hooks": "off",
            // Test-signal already requires real assertions; mandatory counts add churn.
            "vitest/prefer-expect-assertions": "off",
            "vitest/prefer-import-in-mock": "off",
            "vitest/require-top-level-describe": "off",
        },
    },
];

export default config;
