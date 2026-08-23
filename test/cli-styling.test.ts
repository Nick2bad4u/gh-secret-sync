import { afterEach, describe, expect, it, vi } from "vitest";

import {
    createStyler,
    formatTable,
    shouldUseColor,
} from "../src/cli-styling.ts";

const stdoutRestorers: (() => void)[] = [];

function stubStdoutIsTTY(isTTY: boolean): void {
    const descriptor = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
    Object.defineProperty(process.stdout, "isTTY", {
        configurable: true,
        value: isTTY,
    });
    stdoutRestorers.push(() => {
        if (descriptor === undefined) {
            Reflect.deleteProperty(process.stdout, "isTTY");
        } else {
            Object.defineProperty(process.stdout, "isTTY", descriptor);
        }
    });
}

afterEach(() => {
    for (const restore of stdoutRestorers.toReversed()) {
        restore();
    }
    stdoutRestorers.length = 0;
    vi.unstubAllEnvs();
});

describe(createStyler, () => {
    it("returns plain text when color is disabled", () => {
        const styler = createStyler(false);

        expect(styler.heading("heading")).toBe("heading");
        expect(styler.strong("strong")).toBe("strong");
        expect(styler.info("info")).toBe("info");
        expect(styler.muted("muted")).toBe("muted");
        expect(styler.ok("ok")).toBe("ok");
        expect(styler.error("error")).toBe("error");
        expect(styler.flag("--flag")).toBe("--flag");
        expect(styler.arg("<value>")).toBe("<value>");
    });

    it("wraps styled text in ANSI control sequences", () => {
        const styler = createStyler(true);

        expect(styler.heading("heading")).toContain("\u{1B}[1;36m");
        expect(styler.error("error")).toContain("\u{1B}[31m");
        expect(styler.flag("--flag")).toContain("\u{1B}[38;5;51m");
    });
});

describe(shouldUseColor, () => {
    it("disables color for JSON and never mode", () => {
        expect(shouldUseColor("always", true)).toBe(false);
        expect(shouldUseColor("never", false)).toBe(false);
    });

    it("enables color for always mode", () => {
        expect(shouldUseColor("always", false)).toBe(true);
    });

    it("honors NO_COLOR before FORCE_COLOR", () => {
        vi.stubEnv("NO_COLOR", "1");
        vi.stubEnv("FORCE_COLOR", "1");

        expect(shouldUseColor("auto", false)).toBe(false);
    });

    it.each([
        ["0", false],
        ["1", true],
    ])("maps FORCE_COLOR=%s to %s", (value, expected) => {
        vi.stubEnv("NO_COLOR", undefined);
        vi.stubEnv("FORCE_COLOR", value);

        expect(shouldUseColor("auto", false)).toBe(expected);
    });

    it.each([
        [false, false],
        [true, true],
    ])("falls back to stdout TTY state %s", (isTTY, expected) => {
        vi.stubEnv("NO_COLOR", undefined);
        vi.stubEnv("FORCE_COLOR", undefined);
        stubStdoutIsTTY(isTTY);

        expect(shouldUseColor("auto", false)).toBe(expected);
    });
});

describe(formatTable, () => {
    it("formats Unicode tables and aligns ANSI-styled cells visibly", () => {
        const styler = createStyler(true);
        const table = formatTable(
            ["Name", "Status"],
            [
                ["short", styler.ok("ok")],
                ["longer", styler.error("failed")],
            ],
            true
        );

        expect(table).toContain("┌");
        expect(table).toContain("┼");
        expect(table).toContain("longer");
        expect(table.split("\n")).toHaveLength(6);
    });

    it("formats ASCII tables and missing cells", () => {
        const table = formatTable(["Name", "Value"], [["only-name"]], false);

        expect(table).toContain("+");
        expect(table).toContain("| only-name |       |");
    });
});
