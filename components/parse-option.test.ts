import { describe, it, expect } from "vitest";
import {
  compileArrowEndpointProps,
  parseArrowEndpointShorthand,
} from "./parse-option";

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
      [
        " #target @ ( 100 , 200 ) ",
        [
          "#target",
          { x: { value: 100, unit: "px" }, y: { value: 200, unit: "px" } },
        ],
      ],
      [
        " #target @ ( 10% , 20% ) ",
        [
          "#target",
          { x: { value: 10, unit: "%" }, y: { value: 20, unit: "%" } },
        ],
      ],
      [
        "[data-id=target] > .target-child:nth-child(2)",
        ["[data-id=target] > .target-child:nth-child(2)", undefined],
      ],
      [
        "[data-id=target] > .target-child:nth-child(2) @ left",
        ["[data-id=target] > .target-child:nth-child(2)", "left"],
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

describe("line specifiers", () => {
  (
    [
      [
        "[data-id=code]{3}",
        "[data-id=code]",
        [{ start: 3, end: 3 }],
        undefined,
      ],
      [
        "[data-id=code]{3-5}",
        "[data-id=code]",
        [{ start: 3, end: 5 }],
        undefined,
      ],
      [
        "[data-id=code]{1,3-5}",
        "[data-id=code]",
        [
          { start: 1, end: 1 },
          { start: 3, end: 5 },
        ],
        undefined,
      ],
      [
        "[data-id=code]{3}@left",
        "[data-id=code]",
        [{ start: 3, end: 3 }],
        "left",
      ],
      [
        " [data-id=code] { 3 - 5 } @ left ",
        "[data-id=code]",
        [{ start: 3, end: 5 }],
        "left",
      ],
      // A reversed range means the same lines as the forward one.
      [
        "[data-id=code]{5-3}",
        "[data-id=code]",
        [{ start: 3, end: 5 }],
        undefined,
      ],
      // Without a selector, the line specifier takes the slide's first code block.
      ["{3}", ".slidev-code", [{ start: 3, end: 3 }], undefined],
      ["{3-5}@right", ".slidev-code", [{ start: 3, end: 5 }], "right"],
    ] as const
  ).forEach(
    ([optionString, expectedQuery, expectedLines, expectedSnapPosition]) => {
      it(`parses a line specifier correctly: "${optionString}"`, () => {
        expect(parseArrowEndpointShorthand(optionString)).toEqual({
          query: expectedQuery,
          lines: expectedLines,
          snapPosition: expectedSnapPosition,
        });
      });
    },
  );

  it("keeps a selector without a line specifier free of lines", () => {
    expect(parseArrowEndpointShorthand("[data-id=code]")).not.toHaveProperty(
      "lines",
    );
  });

  (["{}", "{0}", "{abc}", "{1-}", "{-1}", "{1.5}"] as const).forEach(
    (optionString) => {
      it(`rejects an invalid line specifier: "${optionString}"`, () => {
        expect(() => parseArrowEndpointShorthand(optionString)).toThrow();
      });
    },
  );

  it("compiles the `line` prop into lines", () => {
    expect(
      compileArrowEndpointProps({
        q: "[data-id=code]",
        line: "3-5",
        pos: "left",
      }),
    ).toEqual({
      query: "[data-id=code]",
      lines: [{ start: 3, end: 5 }],
      snapPosition: "left",
    });
  });

  it("takes the first code block when `line` comes without `q`", () => {
    expect(compileArrowEndpointProps({ line: 3 })).toEqual({
      query: ".slidev-code",
      lines: [{ start: 3, end: 3 }],
      snapPosition: undefined,
    });
  });
});
