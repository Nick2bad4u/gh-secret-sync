import { stripVTControlCharacters } from "node:util";

import type { ColorMode, Styler } from "./cli-types.ts";

/** Create terminal styling functions for the selected color behavior. */
export function createStyler(useColor: boolean): Styler {
    const apply = (code: string, text: string): string =>
        useColor ? `\u{1B}[${code}m${text}\u{1B}[0m` : text;

    return {
        arg: (text) => apply("38;5;221", text),
        error: (text) => apply("31", text),
        flag: (text) => apply("38;5;51", text),
        heading: (text) => apply("1;36", text),
        info: (text) => apply("36", text),
        muted: (text) => apply("90", text),
        ok: (text) => apply("32", text),
        strong: (text) => apply("1", text),
    };
}

/** Render a compact table without allowing ANSI styling to affect alignment. */
export function formatTable(
    headers: readonly string[],
    rows: readonly (readonly string[])[],
    useUnicode: boolean
): string {
    const widths = headers.map((header, column) =>
        Math.max(
            visibleLength(header),
            ...rows.map((row) => visibleLength(row[column] ?? ""))
        )
    );

    const style = useUnicode
        ? {
              bl: "└",
              br: "┘",
              bt: "┴",
              h: "─",
              j: "┼",
              lt: "├",
              rt: "┤",
              tl: "┌",
              tr: "┐",
              tt: "┬",
              v: "│",
          }
        : {
              bl: "+",
              br: "+",
              bt: "+",
              h: "-",
              j: "+",
              lt: "+",
              rt: "+",
              tl: "+",
              tr: "+",
              tt: "+",
              v: "|",
          };

    const horizontal = widths.map((width) => style.h.repeat(width + 2));
    const top = `${style.tl}${horizontal.join(style.tt)}${style.tr}`;
    const middle = `${style.lt}${horizontal.join(style.j)}${style.rt}`;
    const bottom = `${style.bl}${horizontal.join(style.bt)}${style.br}`;

    const cellSeparator = ` ${style.v} `;
    const renderRow = (cells: readonly string[]): string => {
        const renderedCells = widths.map((width, index) =>
            padVisible(cells[index] ?? "", width)
        );
        return `${style.v} ${renderedCells.join(cellSeparator)} ${style.v}`;
    };

    const lines = [
        top,
        renderRow(headers),
        middle,
        ...rows.map((row) => renderRow(row)),
        bottom,
    ];

    return lines.join("\n");
}

/** Resolve whether ANSI color should be emitted for the current process. */
export function shouldUseColor(
    mode: ColorMode,
    isJsonOutput: boolean
): boolean {
    if (isJsonOutput) {
        return false;
    }

    if (mode === "always") {
        return true;
    }

    if (mode === "never") {
        return false;
    }

    if (process.env["NO_COLOR"] !== undefined) {
        return false;
    }

    const forced = process.env["FORCE_COLOR"];
    if (typeof forced === "string") {
        return forced !== "0";
    }

    return process.stdout.isTTY;
}

function padVisible(value: string, width: number): string {
    const difference = width - visibleLength(value);
    return difference > 0 ? `${value}${" ".repeat(difference)}` : value;
}

function visibleLength(value: string): number {
    return stripVTControlCharacters(value).length;
}
