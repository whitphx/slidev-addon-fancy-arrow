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
      "(+100,+200)",
    ] as const
  ).forEach((optionString) => {
    it(`parses a string with an absolute position correctly: "${optionString}"`, () => {
      // Assuming parsePosition is a function that processes the options
      const parsed = parseArrowEndpointShorthand(optionString);
      expect(parsed).toEqual({
        x: { value: 100, unit: "px" },
        y: { value: 200, unit: "px" },
      });
    });
  });

  (
    [
      "(10%,20%)",
      "(10%, 20%)",
      "(10% ,20%)",
      "(10% , 20%)",
      "( 10%,20%)",
      " (10%,20%)",
      "(10%,20%) ",
      " (10%,20%) ",
      " (10% ,20%) ",
      " (10%, 20%) ",
      " (10% , 20%) ",
      "(+10%,+20%)",
    ] as const
  ).forEach((optionString) => {
    it(`parses a string with a relative option correctly: "${optionString}"`, () => {
      // Assuming parsePosition is a function that processes the options
      const parsed = parseArrowEndpointShorthand(optionString);
      expect(parsed).toEqual({
        x: { value: 10, unit: "%" },
        y: { value: 20, unit: "%" },
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
      [
        "#target@(100,200)",
        [
          "#target",
          { x: { value: 100, unit: "px" }, y: { value: 200, unit: "px" } },
        ],
      ],
      [
        ".target@(100,200)",
        [
          ".target",
          { x: { value: 100, unit: "px" }, y: { value: 200, unit: "px" } },
        ],
      ],
      [
        "[data-id=target]@(10%,20%)",
        [
          "[data-id=target]",
          { x: { value: 10, unit: "%" }, y: { value: 20, unit: "%" } },
        ],
      ],
      [
        "#target@(10%,20%)",
        [
          "#target",
          { x: { value: 10, unit: "%" }, y: { value: 20, unit: "%" } },
        ],
      ],
      [
        ".target@(10%,20%)",
        [
          ".target",
          { x: { value: 10, unit: "%" }, y: { value: 20, unit: "%" } },
        ],
      ],
      [
        "[data-id=target]@(10%,20%)",
        [
          "[data-id=target]",
          { x: { value: 10, unit: "%" }, y: { value: 20, unit: "%" } },
        ],
      ],
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
