import { describe, it, expect } from "vitest";
import { parseArrowEndpointShorthand } from "./parse-option";

describe("parsePosition", () => {
  (
    [
      "(100,200)",
      "(100, 200)",
      "(100 ,200)",
      "(100 , 200)",
      "( 100,200 )",
      " (100,200)",
      "(100,200) ",
      " (100,200) ",
      " (100 ,200) ",
      " (100, 200) ",
      " (100 , 200) ",
    ] as const
  ).forEach((optionString) => {
    it(`parses string with absolute option correctly: "${optionString}"`, () => {
      // Assuming parsePosition is a function that processes the options
      const parsed = parseArrowEndpointShorthand(optionString);
      expect(parsed).toEqual({
        x: 100,
        y: 200,
      });
    });
  });

  (
    [
      ["#target", ["#target", undefined]],
      [".target", [".target", undefined]],
      ["[data-id=target]", ["[data-id=target]", undefined]],
      ["#target@left", ["#target", "left"]],
      [".target@left", [".target", "left"]],
      ["[data-id=target]@left", ["[data-id=target]", "left"]],
    ] as const
  ).forEach(([optionString, [expectedQuery, expectedSnapPosition]]) => {
    it(`parses string with snap target CSS selector correctly: "${optionString}"`, () => {
      const parsed = parseArrowEndpointShorthand(optionString);
      expect(parsed).toEqual({
        query: expectedQuery,
        snapPosition: expectedSnapPosition,
      });
    });
  });
});
