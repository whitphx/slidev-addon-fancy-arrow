import { computed, ref, type Ref } from "vue";
import roughjs from "roughjs";

type RoughSVG = ReturnType<typeof roughjs.svg>;

const createArrowHeadSvg = (
  rc: RoughSVG,
  arrowSize: number,
  type: "line" | "polygon",
  options: Parameters<RoughSVG["line"]>[4],
): SVGGElement => {
  const arrowAngle = Math.PI / 6; // 30 degrees

  const x1 = -arrowSize * Math.cos(arrowAngle);
  const y1 = arrowSize * Math.sin(arrowAngle);
  const x2 = -arrowSize * Math.cos(arrowAngle);
  const y2 = arrowSize * Math.sin(-arrowAngle);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  if (type === "line") {
    g.appendChild(rc.line(x1, y1, 0, 0, options));
    g.appendChild(rc.line(x2, y2, 0, 0, options));
  } else if (type === "polygon") {
    g.appendChild(
      rc.polygon(
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

export function useRoughArrow(props: {
  point1: Ref<{ x: number; y: number } | undefined>;
  point2: Ref<{ x: number; y: number } | undefined>;
  width: number;
  headType: "line" | "polygon";
  headSize: number | null;
  roughness?: number;
  seed?: number;
  twoWay: boolean;
  centerPositionParam: number;
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
  } = props;
  const baseOptions = {
    // We don't support the `bowing` param because it's not so effective for arc.
    ...(roughness !== undefined && { roughness }),
    ...(seed !== undefined && { seed }),
  } as const;
  const svg = ref<SVGSVGElement>(
    document.createElementNS("http://www.w3.org/2000/svg", "svg"),
  );
  const rc = ref(roughjs.svg(svg.value));

  const arcData = computed(() => {
    if (!point1Ref.value || !point2Ref.value) {
      return null;
    }

    const roughSvg = rc.value as RoughSVG;
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
        svg,
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
      svg,
      angle1,
      angle2,
      lineLength: R * (endAngle - startAngle),
      arcMid,
    };
  });

  const computedArrowHeadSize = computed(() => {
    if (arcData.value == null) {
      return 0;
    }

    if (headSize != null) {
      return headSize;
    }

    // The arrow size is proportional to the line length.
    // The constant factor is chosen so that the arrow size is 30 when the line length is 200.
    return (30 * Math.log(arcData.value.lineLength)) / Math.log(200);
  });

  const arrowHeads = computed(() => {
    const arrowHeadOptions = {
      ...baseOptions,
      stroke: "currentColor",
      strokeWidth: width,
      fill: "currentColor",
      fillStyle: "solid",
    };
    const arrowHead1 = createArrowHeadSvg(
      rc.value as RoughSVG,
      computedArrowHeadSize.value,
      headType,
      arrowHeadOptions,
    );
    const arrowHead2 = createArrowHeadSvg(
      rc.value as RoughSVG,
      computedArrowHeadSize.value,
      headType,
      arrowHeadOptions,
    );
    return [arrowHead1, arrowHead2];
  });

  const arcSvg = computed(() => {
    svg.value.innerHTML = "";

    if (
      arcData.value == null ||
      point1Ref.value == null ||
      point2Ref.value == null
    ) {
      return null;
    }

    svg.value.appendChild(arcData.value.svg);

    const arrowHead1 = arrowHeads.value[0];
    const arrowHead2 = arrowHeads.value[1];

    arrowHead2.setAttribute(
      "transform",
      `translate(${point2Ref.value.x},${point2Ref.value.y}) rotate(${(arcData.value.angle2 * 180) / Math.PI + (centerPositionParam >= 0 ? 90 : -90)})`,
    );
    svg.value.appendChild(arrowHead2);

    if (twoWay) {
      arrowHead1.setAttribute(
        "transform",
        `translate(${point1Ref.value.x},${point1Ref.value.y}) rotate(${(arcData.value.angle1 * 180) / Math.PI + (centerPositionParam >= 0 ? -90 : 90)})`,
      );
      svg.value.appendChild(arrowHead1);
    }

    return svg.value.innerHTML;
  });

  const textPosition = computed(() => {
    if (arcData.value == null) {
      return null;
    }

    return arcData.value.arcMid;
  });

  return {
    arcSvg,
    textPosition,
  };
}
