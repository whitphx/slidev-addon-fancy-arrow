import { computed, type Ref } from "vue";
import roughjs from "roughjs";
import { splitPath } from "./split-path";

type RoughSVG = ReturnType<typeof roughjs.svg>;

export const DEFAULT_ANIMATION_DURATION = 800; // Same as https://github.com/rough-stuff/rough-notation/blob/668ba82ac89c903d6f59c9351b9b85855da9882c/src/model.ts#L3C14-L3C47

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

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

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
  width: number;
  headType: "line" | "polygon";
  headSize: number | null;
  roughness?: number;
  seed?: number;
  twoWay: boolean;
  centerPositionParam: number;
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
    width,
    headType,
    headSize,
    roughness,
    seed,
    twoWay,
    centerPositionParam,
    animation,
    strokeAnimationClass,
    fillAnimationClass,
  } = props;
  const baseOptions = {
    // We don't support the `bowing` param because it's not so effective for arc.
    ...(roughness !== undefined && { roughness }),
    ...(seed !== undefined && { seed }),
  } as const;
  const roughSvg = roughjs.svg(
    document.createElementNS("http://www.w3.org/2000/svg", "svg"),
  );

  const arcData = computed(() => {
    if (!point1Ref.value || !point2Ref.value) {
      return null;
    }

    const point1 = point1Ref.value;
    const point2 = point2Ref.value;

    if (point1.x === point2.x && point1.y === point2.y) {
      return;
    }

    const lineOptions = {
      ...baseOptions,
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

    const lineLength = getArrowHeadLineLength();
    const arrowHeadOptions = {
      ...baseOptions,
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

  const arrowSvg = computed(() => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

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
    splitPaths.forEach((path) => g.appendChild(path));
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
        strokedPaths: splitPaths,
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
