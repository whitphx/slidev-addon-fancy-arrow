import { describe, it, expect } from "vitest";
import { isBackwardMove } from "./nav-direction";

describe("isBackwardMove", () => {
  it("reads a move between slides from the slide numbers", () => {
    expect(isBackwardMove({ page: 3, clicks: 0 }, { page: 4, clicks: 0 })).toBe(
      false,
    );
    expect(isBackwardMove({ page: 4, clicks: 0 }, { page: 3, clicks: 2 })).toBe(
      true,
    );
  });

  it("reads a move within a slide from the click counts", () => {
    expect(isBackwardMove({ page: 3, clicks: 1 }, { page: 3, clicks: 2 })).toBe(
      false,
    );
    expect(isBackwardMove({ page: 3, clicks: 2 }, { page: 3, clicks: 1 })).toBe(
      true,
    );
  });

  it("ignores the click counts of the slide being left", () => {
    // Slidev lands on the last click of the slide it steps back to, so the clicks go
    // up while the deck moves backward.
    expect(isBackwardMove({ page: 4, clicks: 0 }, { page: 3, clicks: 5 })).toBe(
      true,
    );
    expect(isBackwardMove({ page: 3, clicks: 5 }, { page: 4, clicks: 0 })).toBe(
      false,
    );
  });

  it("treats a jump like any other move", () => {
    expect(isBackwardMove({ page: 9, clicks: 0 }, { page: 2, clicks: 0 })).toBe(
      true,
    );
    expect(isBackwardMove({ page: 2, clicks: 0 }, { page: 9, clicks: 0 })).toBe(
      false,
    );
  });

  it("reports staying put as not backward", () => {
    expect(isBackwardMove({ page: 3, clicks: 1 }, { page: 3, clicks: 1 })).toBe(
      false,
    );
  });
});
