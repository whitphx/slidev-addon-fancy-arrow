import { describe, it, expect } from "vitest";
import { splitPathDefinition } from "./split-path";

describe("splitPathDefinition", () => {
  it("should split a path definition into segments", () => {
    const d = "M10 10 L20 20 M30 30";
    const segments = splitPathDefinition(d);
    expect(segments).toEqual(["M10 10 L20 20", "M30 30"]);
  });
});
