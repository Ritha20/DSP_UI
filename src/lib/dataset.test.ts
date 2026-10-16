import { describe, expect, it } from "vitest";
import { aggregate, classifyColumns, parseCsv } from "./dataset";

describe("dataset helpers", () => {
  it("parses quoted csv", () => {
    const { headers, rows } = parseCsv('a,b\n"x, y",2\nz,3\n');
    expect(headers).toEqual(["a", "b"]);
    expect(rows[0]?.["a"]).toBe("x, y");
  });
  it("detects numeric and category columns", () => {
    const { headers, rows } = parseCsv("p,n\nA,1\nB,2\nA,3\n");
    const k = classifyColumns(headers, rows);
    expect(k.map((c) => c.kind)).toEqual(["category", "numeric"]);
  });
  it("sums by group", () => {
    const { rows } = parseCsv("p,n\nA,1\nB,2\nA,3\n");
    expect(aggregate(rows, "p", "n", "sum").data[0]).toEqual({ name: "A", value: 4 });
  });
});
