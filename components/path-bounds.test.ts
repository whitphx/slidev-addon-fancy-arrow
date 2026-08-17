import { describe, it, expect } from "vitest";
import { getPathControlPointBounds } from "./path-bounds";

describe("getPathControlPointBounds", () => {
  it("covers the control points of every given path", () => {
    expect(
      getPathControlPointBounds([
        "M10 20 C30 40, 50 60, 70 80",
        "M-5 100 L15 -25",
      ]),
    ).toEqual({ x: -5, y: -25, width: 75, height: 125 });
  });

  it("parses decimal and exponential coordinates", () => {
    expect(getPathControlPointBounds(["M-.5 1.5e2 L2.25 -1E1"])).toEqual({
      x: -0.5,
      y: -10,
      width: 2.75,
      height: 160,
    });
  });

  it("returns null when there is nothing to measure", () => {
    expect(getPathControlPointBounds([])).toBeNull();
    expect(getPathControlPointBounds([""])).toBeNull();
  });
});
