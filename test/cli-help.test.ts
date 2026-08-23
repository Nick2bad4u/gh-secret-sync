import { describe, expect, it } from "vitest";

import { buildHelpText, printHelp, renderHelpText } from "../src/cli-help.ts";
import { createStyler } from "../src/cli-styling.ts";

describe("cli help", () => {
    it("documents safety defaults, every input mode, and examples", () => {
        const help = buildHelpText();

        expect(help).toContain("gh-secret-sync");
        expect(help).toContain("Dry-run mode (default)");
        expect(help).toContain("--secret-value-stdin");
        expect(help).toContain("--plan-file");
        expect(help).toContain("Plan file format (JSON)");
        expect(help).toContain("Plan file format (CSV)");
        expect(help).toContain("Examples");
    });

    it("keeps render and print aliases synchronized", () => {
        expect(renderHelpText()).toBe(buildHelpText());
        expect(printHelp()).toBe(buildHelpText());
    });

    it("styles headings, flags, arguments, and command examples", () => {
        const help = buildHelpText(createStyler(true));

        expect(help).toContain("\u{1B}[1;36mgh-secret-sync");
        expect(help).toContain("\u{1B}[38;5;51m--repo");
        expect(help).toContain("\u{1B}[38;5;221m<owner/name>");
    });
});
