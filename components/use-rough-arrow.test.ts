// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { effectScope, ref, type Ref } from "vue";
import { useRoughArrow, type AbsolutePosition } from "./use-rough-arrow";

function setup(overrides: Partial<Parameters<typeof useRoughArrow>[0]> = {}): {
  arrowSvg: Ref<string | null>;
  dispose: () => void;
} {
  const point1 = ref<AbsolutePosition | undefined>({ x: 0, y: 0 });
  const point2 = ref<AbsolutePosition | undefined>({ x: 200, y: 100 });
  const scope = effectScope();
  const arrow = scope.run(() =>
    useRoughArrow({
      point1,
      point2,
      width: 2,
      headType: "line",
      headSize: null,
      twoWay: false,
      centerPositionParam: 0,
      animation: ref(undefined),
      strokeAnimationClass: "stroke",
      fillAnimationClass: "fill",
      ...overrides,
    }),
  );
  if (arrow == null) {
    throw new Error("Expected the effect scope to run");
  }
  return { arrowSvg: arrow.arrowSvg, dispose: () => scope.stop() };
}

// The line's paths are emitted before the arrow heads, which are wrapped in <g>.
function linePaths(svg: string | null): string {
  return (svg ?? "").split("<g")[0];
}

describe("useRoughArrow", () => {
  it("redraws when a styling prop changes", () => {
    const width = ref(2);
    const { arrowSvg, dispose } = setup({ width });

    expect(arrowSvg.value).toContain('stroke-width="2"');
    expect(arrowSvg.value).not.toContain('stroke-width="10"');

    width.value = 10;

    expect(arrowSvg.value).toContain('stroke-width="10"');
    dispose();
  });

  it("leaves the line alone when only the arrow head changes", () => {
    // No seed, so rough.js re-randomizes anything it regenerates. If a head-size
    // change re-ran the arc, the line would come back with a different squiggle.
    const headSize = ref<number | null>(20);
    const { arrowSvg, dispose } = setup({ headSize });

    const lineBefore = linePaths(arrowSvg.value);
    const svgBefore = arrowSvg.value;
    headSize.value = 60;

    expect(linePaths(arrowSvg.value)).toBe(lineBefore);
    expect(lineBefore).not.toBe("");
    expect(arrowSvg.value).not.toBe(svgBefore);
    dispose();
  });
});
