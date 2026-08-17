import { computed, toValue, useId, type MaybeRefOrGetter, type Ref } from "vue";
import roughjs from "roughjs";
import { clonePath, splitPath } from "./split-path";
import { getPathControlPointBounds } from "./path-bounds";

type RoughSVG = ReturnType<typeof roughjs.svg>;

const SVGNS = "http://www.w3.org/2000/svg";

export const DEFAULT_ANIMATION_DURATION = 800; // Same as https://github.com/rough-stuff/rough-notation/blob/668ba82ac89c903d6f59c9351b9b85855da9882c/src/model.ts#L3C14-L3C47

export type LineStyle = "solid" | "dashed" | "dotted";

// The pattern scales with the stroke width so that it reads the same at any width.
function getStrokeLineDash(
  lineStyle: LineStyle,
  width: number,
): number[] | undefined {
  if (lineStyle === "dashed") {
    return [width * 4, width * 3];
  }
  if (lineStyle === "dotted") {
    // A zero-length dash renders as a dot only with a round line cap, which
    // applyLineStyle pairs with it.
    return [0, width * 2.5];
  }
  return undefined;
}

const createArrowHeadSvg = (
  roughSvg: RoughSVG,
  lineLength: number,
  type: "line" | "polygon",
  options: Parameters<RoughSVG["line"]>[4],
): SVGGElement => {
  const arrowAngle = Math.PI / 6; // 30 degrees

  const x1 = -lineLength * Math.cos(arrowAngle);
  const y1 = lineLength * Math.sin(arrowAngle);
  const x2 = -lineLength * Math.cos(arrowAngle);
  const y2 = lineLength * Math.sin(-arrowAngle);

  const g = document.createElementNS(SVGNS, "g");

  function addAllChildren(anotherGroup: SVGGElement) {
    // `for (... of anotherGroup.children)` doesn't work well: the second child and the latter will be discarded somehow.
    for (const child of Array.from(anotherGroup.children)) {
      g.appendChild(child);
    }
  }

  if (type === "line") {
    addAllChildren(roughSvg.line(x1, y1, 0, 0, options));
    addAllChildren(roughSvg.line(x2, y2, 0, 0, options));
  } else if (type === "polygon") {
    addAllChildren(
      roughSvg.polygon(
        [
          [x1, y1],
          [0, 0],
          [x2, y2],
        ],
        options,
      ),
    );
  } else {
    throw new Error("Invalid arrow head type");
  }

  return g;
};

export interface AbsolutePosition {
  x: number;
  y: number;
}
export function useRoughArrow(props: {
  point1: Ref<AbsolutePosition | undefined>;
  point2: Ref<AbsolutePosition | undefined>;
  width: MaybeRefOrGetter<number>;
  lineStyle: MaybeRefOrGetter<LineStyle>;
  headType: MaybeRefOrGetter<"line" | "polygon">;
  headSize: MaybeRefOrGetter<number | null>;
  roughness?: MaybeRefOrGetter<number | undefined>;
  seed?: MaybeRefOrGetter<number | undefined>;
  twoWay: MaybeRefOrGetter<boolean>;
  centerPositionParam: MaybeRefOrGetter<number>;
  animation: Ref<
    | {
        duration?: number;
        delay?: number;
      }
    | undefined
  >;
  strokeAnimationClass: string;
  fillAnimationClass: string;
}) {
  const {
    point1: point1Ref,
    point2: point2Ref,
    animation,
    strokeAnimationClass,
    fillAnimationClass,
  } = props;

  // Each computed reads only the props it uses. A single shared read would make a
  // head-size change re-run arcData, re-roughening the line with a fresh random seed.
  function getBaseOptions() {
    const roughness = toValue(props.roughness);
    const seed = toValue(props.seed);
    return {
      // We don't support the `bowing` param because it's not so effective for arc.
      ...(roughness !== undefined && { roughness }),
      ...(seed !== undefined && { seed }),
    };
  }
  const roughSvg = roughjs.svg(document.createElementNS(SVGNS, "svg"));

  const strokeLineDash = computed(() =>
    getStrokeLineDash(toValue(props.lineStyle), toValue(props.width)),
  );
  const lineMaskId = `fancy-arrow-line-mask-${useId()}`;

  const arcData = computed(() => {
    if (!point1Ref.value || !point2Ref.value) {
      return null;
    }

    const point1 = point1Ref.value;
    const point2 = point2Ref.value;

    if (point1.x === point2.x && point1.y === point2.y) {
      return null;
    }

    const width = toValue(props.width);
    const centerPositionParam = toValue(props.centerPositionParam);

    const lineOptions = {
      ...getBaseOptions(),
      stroke: "currentColor",
      strokeWidth: width,
    };

    if (centerPositionParam === 0) {
      // Straight line.
      // This can be interpreted as the arc's center is at infinity.
      const svg = roughSvg.line(
        point1.x,
        point1.y,
        point2.x,
        point2.y,
        lineOptions,
      );
      const angle =
        Math.atan2(point2.y - point1.y, point2.x - point1.x) - Math.PI / 2;
      return {
        svgPath: svg.getElementsByTagName("path")[0],
        angle1: angle,
        angle2: angle,
        lineLength: Math.hypot(point2.x - point1.x, point2.y - point1.y),
        arcMid: {
          x: (point1.x + point2.x) / 2,
          y: (point1.y + point2.y) / 2,
        },
      };
    }

    // Midpoint of the chord (the line segment connecting the endpoints).
    const mid = {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2,
    };

    // The chord vector and its length.
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const chordLength = Math.hypot(dx, dy);

    // Unit vector perpendicular to the chord.
    const n = {
      x: -dy / chordLength,
      y: dx / chordLength,
    };

    // Offset for the arc's center from the midpoint.
    // When |centerPositionParam| equals 1, the offset is 0 (center is at the midpoint).
    // For other values, a smaller parameter moves the center further away (resulting in lower curvature).
    // The formula is derived from the following simultaneous equations:
    // R = offset + centerPositionParam * chordLength / 2 (from the condition above)
    // R^2 = offset^2 + (chordLength / 2)^2 (Pythagorean theorem)
    const offset =
      ((1 - Math.pow(centerPositionParam, 2)) * chordLength) /
      (4 * centerPositionParam);

    // The arc's center is obtained by offsetting the midpoint in the direction of n.
    const center = {
      x: mid.x + offset * n.x,
      y: mid.y + offset * n.y,
    };

    // Pythagorean theorem.
    const R = Math.sqrt((chordLength / 2) ** 2 + offset ** 2);

    // Angles from the center to point1 and point2.
    const angle1 = Math.atan2(point1.y - center.y, point1.x - center.x);
    const angle2 = Math.atan2(point2.y - center.y, point2.x - center.x);
    let startAngle: number, endAngle: number;
    if (centerPositionParam > 0) {
      // Clockwise.
      startAngle = angle1;
      endAngle = angle2;
    } else {
      // Counterclockwise.
      startAngle = angle2;
      endAngle = angle1;
    }
    if (endAngle < startAngle) {
      // roughSvg.arc expects endAngle > startAngle.
      endAngle += 2 * Math.PI;
    }

    // RoughJS has .arc() method as follows with which we can more easily understand what arc we are drawing (that's why we left it commented out),
    // however, it doesn't work well in our case as https://github.com/whitphx/slidev-addon-fancy-arrow/issues/17
    // because large arcs are drawn too rough with it.
    // const D = 2 * R;
    // const svg = roughSvg.arc(center.x, center.y, D, D, startAngle, endAngle, false, lineOptions);
    // So we use .path() instead as below.
    const largeArcFlag =
      centerPositionParam < -1 || 1 < centerPositionParam ? 1 : 0;
    const sweepFlag = centerPositionParam > 0 ? 1 : 0;
    const svg = roughSvg.path(
      `M${point1.x} ${point1.y} A${R} ${R} 0 ${largeArcFlag} ${sweepFlag} ${point2.x} ${point2.y}`,
      lineOptions,
    );

    const signedR = R * Math.sign(offset);
    const arcMid = {
      x: center.x - signedR * n.x,
      y: center.y - signedR * n.y,
    };

    return {
      svgPath: svg.getElementsByTagName("path")[0],
      angle1,
      angle2,
      lineLength: R * (endAngle - startAngle),
      arcMid,
    };
  });

  function getArrowHeadLineLength(): number {
    if (arcData.value == null) {
      return 0;
    }

    const headSize = toValue(props.headSize);
    if (headSize != null) {
      return headSize;
    }

    // The arrow size is proportional to the line length.
    // The constant factor is chosen so that the arrow size is 30 when the line length is 200.
    return (30 * Math.log(arcData.value.lineLength)) / Math.log(200);
  }

  const arrowHeadData = computed(() => {
    if (
      arcData.value == null ||
      point1Ref.value == null ||
      point2Ref.value == null
    ) {
      return null;
    }

    const width = toValue(props.width);
    const headType = toValue(props.headType);
    const twoWay = toValue(props.twoWay);
    const centerPositionParam = toValue(props.centerPositionParam);

    const lineLength = getArrowHeadLineLength();
    const arrowHeadOptions = {
      ...getBaseOptions(),
      stroke: "currentColor",
      strokeWidth: width,
      fill: "currentColor",
      fillStyle: "solid",
    };
    const arrowHeadForwardSvg = createArrowHeadSvg(
      roughSvg,
      lineLength,
      headType,
      arrowHeadOptions,
    );
    arrowHeadForwardSvg.setAttribute(
      "transform",
      `translate(${point2Ref.value.x},${point2Ref.value.y}) rotate(${(arcData.value.angle2 * 180) / Math.PI + (centerPositionParam >= 0 ? 90 : -90)})`,
    );
    if (!twoWay) {
      return { arrowHeadForwardSvg, arrowHeadBackwardSvg: null, lineLength };
    }

    const arrowHeadBackwardSvg = createArrowHeadSvg(
      roughSvg,
      lineLength,
      headType,
      arrowHeadOptions,
    );
    arrowHeadBackwardSvg.setAttribute(
      "transform",
      `translate(${point1Ref.value.x},${point1Ref.value.y}) rotate(${(arcData.value.angle1 * 180) / Math.PI + (centerPositionParam >= 0 ? -90 : 90)})`,
    );
    return { arrowHeadBackwardSvg, arrowHeadForwardSvg, lineLength };
  });

  // The dash pattern is set here rather than handed to rough.js as `strokeLineDash`,
  // which would make arcData depend on the line style and re-roughen the line on every
  // change. Rough.js only forwards that option to this same attribute.
  function applyLineStyle(linePaths: SVGPathElement[]): void {
    const lineDash = strokeLineDash.value;
    if (lineDash === undefined) {
      return;
    }
    const dashArray = lineDash.join(" ");
    const lineCap = toValue(props.lineStyle) === "dotted" ? "round" : null;
    for (const path of linePaths) {
      path.setAttribute("stroke-dasharray", dashArray);
      if (lineCap != null) {
        path.setAttribute("stroke-linecap", lineCap);
      }
    }
  }

  // The stroke-drawing animation and a dash pattern both live in `stroke-dasharray`,
  // so they can't share one element. The animation is moved onto white copies of the
  // line inside a <mask>, and the dashed line is revealed through it as they are drawn.
  function buildLineMask(linePaths: SVGPathElement[]): {
    maskElement: SVGMaskElement;
    animatedPaths: SVGPathElement[];
  } | null {
    const bounds = getPathControlPointBounds(
      linePaths.map((path) => path.getAttribute("d") ?? ""),
    );
    if (bounds == null) {
      return null;
    }

    // Twice the line width so the revealed stroke sits clear of the mask edge,
    // where antialiasing would dim it.
    const maskStrokeWidth = toValue(props.width) * 2;
    const animatedPaths = linePaths.map((path) => {
      // The clone carries the dash pattern along with the rest, and the animation's
      // inline `stroke-dasharray` overrides it, so the mask stroke that does the
      // revealing is solid.
      const cloned = clonePath(path);
      cloned.setAttribute("stroke", "#fff");
      cloned.setAttribute("stroke-width", `${maskStrokeWidth}`);
      cloned.setAttribute("stroke-linecap", "round");
      cloned.setAttribute("stroke-linejoin", "round");
      return cloned;
    });

    const maskElement = document.createElementNS(SVGNS, "mask");
    maskElement.setAttribute("id", lineMaskId);
    // The default mask region is relative to the bounding box, which collapses for a
    // horizontal or vertical line, so the region is spelled out in user space instead.
    maskElement.setAttribute("maskUnits", "userSpaceOnUse");
    // The mask stroke spreads half its width to either side of the geometry,
    // and the region is padded by the whole width to leave slack.
    const padding = maskStrokeWidth;
    maskElement.setAttribute("x", `${bounds.x - padding}`);
    maskElement.setAttribute("y", `${bounds.y - padding}`);
    maskElement.setAttribute("width", `${bounds.width + padding * 2}`);
    maskElement.setAttribute("height", `${bounds.height + padding * 2}`);
    animatedPaths.forEach((path) => maskElement.appendChild(path));

    return { maskElement, animatedPaths };
  }

  const arrowSvg = computed(() => {
    const g = document.createElementNS(SVGNS, "g");

    if (arcData.value == null || arrowHeadData.value == null) {
      return null;
    }

    const arcPath = arcData.value.svgPath;
    const arrowHeadBackwardSvg = arrowHeadData.value.arrowHeadBackwardSvg;
    const arrowHeadForwardSvg = arrowHeadData.value.arrowHeadForwardSvg;

    // RoughSVG.arc() may generate <path> element whose `d` attribute contains multiple segments like `M... M...`.
    // Such paths don't be animated as expected, so we split them into multiple <path> elements that only contain `d` with only one `M`
    // and animate them individually.
    const splitPaths = splitPath(arcPath);
    applyLineStyle(splitPaths);

    const lineMask =
      strokeLineDash.value !== undefined && animation.value
        ? buildLineMask(splitPaths)
        : null;
    if (lineMask) {
      const maskedGroup = document.createElementNS(SVGNS, "g");
      maskedGroup.setAttribute("mask", `url(#${lineMaskId})`);
      splitPaths.forEach((path) => maskedGroup.appendChild(path));
      g.appendChild(lineMask.maskElement);
      g.appendChild(maskedGroup);
    } else {
      splitPaths.forEach((path) => g.appendChild(path));
    }
    const animatedLinePaths = lineMask?.animatedPaths ?? splitPaths;

    g.appendChild(arrowHeadForwardSvg);
    if (arrowHeadBackwardSvg) {
      g.appendChild(arrowHeadBackwardSvg);
    }

    if (animation.value) {
      const animationValue = animation.value;

      interface AnimationSegment {
        length: number;
        strokedPaths: SVGPathElement[];
        filledPaths: SVGPathElement[];
      }
      const segments: AnimationSegment[] = [];

      segments.push({
        length: arcData.value.lineLength,
        strokedPaths: animatedLinePaths,
        filledPaths: [],
      });

      function getArrowHeadAnimationSegment(
        arrowHeadG: SVGGElement,
        length: number,
      ): AnimationSegment {
        const strokedPaths: SVGPathElement[] = [];
        const filledPaths: SVGPathElement[] = [];
        arrowHeadG.childNodes.forEach((child) => {
          if (child instanceof SVGPathElement) {
            const stroke = child.getAttribute("stroke");
            const fill = child.getAttribute("fill");
            if (stroke && stroke !== "none") {
              strokedPaths.push(child);
            } else if (fill && fill !== "none") {
              filledPaths.push(child);
            }
          }
        });
        return {
          strokedPaths: strokedPaths,
          filledPaths: filledPaths,
          length,
        };
      }

      segments.push(
        getArrowHeadAnimationSegment(
          arrowHeadForwardSvg,
          arrowHeadData.value.lineLength * 2,
        ),
      );
      if (arrowHeadBackwardSvg) {
        segments.push(
          getArrowHeadAnimationSegment(
            arrowHeadBackwardSvg,
            arrowHeadData.value.lineLength * 2,
          ),
        );
      }

      const totalLength = segments
        .map((s) => s.length)
        .reduce((a, b) => a + b, 0);

      const { duration = DEFAULT_ANIMATION_DURATION, delay = 0 } =
        animationValue;
      let currentDelay = delay;
      // Animation impl inspired by https://github.com/rough-stuff/rough-notation/blob/668ba82ac89c903d6f59c9351b9b85855da9882c/src/render.ts#L222-L235
      for (const segment of segments) {
        const segmentDuration = (segment.length / totalLength) * duration;
        const pathDuration = segmentDuration / segment.strokedPaths.length;
        segment.strokedPaths.forEach((path, index) => {
          const pathDelay =
            currentDelay +
            (index / segment.strokedPaths.length) * segmentDuration;
          path.classList.add(strokeAnimationClass);
          path.style.animationDuration = `${pathDuration}ms`;
          path.style.animationDelay = `${pathDelay}ms`;
          path.style.strokeDashoffset = `${segment.length}`;
          path.style.strokeDasharray = `${segment.length}`;
          path.style.visibility = "hidden";
        });
        currentDelay += segmentDuration;
        segment.filledPaths.forEach((path) => {
          path.classList.add(fillAnimationClass);
          path.style.animationDuration = `${segmentDuration}ms`;
          path.style.animationDelay = `${currentDelay}ms`;
          path.style.visibility = "hidden";
        });
      }
    }

    return g.innerHTML;
  });

  const textPosition = computed(() => {
    if (arcData.value == null) {
      return null;
    }

    return arcData.value.arcMid;
  });

  return {
    arrowSvg,
    textPosition,
  };
}
