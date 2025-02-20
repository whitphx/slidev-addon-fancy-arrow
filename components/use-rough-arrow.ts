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
  arrowHeadType: "line" | "polygon";
  arrowHeadSize: number | null;
  roughness?: number;
  seed?: number;
  twoWay: boolean;
  centerPositionParam: number;
}) {
  const {
    point1: point1Ref,
    point2: point2Ref,
    width,
    arrowHeadType,
    arrowHeadSize,
    roughness,
    seed,
    twoWay,
    centerPositionParam,
  } = props;
  const options = {
    stroke: "currentColor",
    strokeWidth: width,
    fill: "currentColor",
    fillStyle: "solid",
    // We don't support the `bowing` param because it's not so effective for arc.
    ...(roughness !== undefined && { roughness }),
    ...(seed !== undefined && { seed }),
  } as const;
  const svg = ref<SVGSVGElement>(
    document.createElementNS("http://www.w3.org/2000/svg", "svg"),
  );
  const rc = ref(roughjs.svg(svg.value));

  const line = computed(() => {
    if (!point1Ref.value || !point2Ref.value) {
      return null;
    }

    const roughSvg = rc.value as RoughSVG;
    const point1 = point1Ref.value;
    const point2 = point2Ref.value;

    if (point1.x === point2.x && point1.y === point2.y) {
      return;
    }

    if (centerPositionParam === 0) {
      // Straight line.
      // This can be interpreted as the arc's center is at infinity.
      const svg = roughSvg.line(
        point1.x,
        point1.y,
        point2.x,
        point2.y,
        options,
      );
      const angle =
        Math.atan2(point2.y - point1.y, point2.x - point1.x) - Math.PI / 2;
      return {
        svg,
        angle1: angle,
        angle2: angle,
        lineLength: Math.hypot(point2.x - point1.x, point2.y - point1.y),
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
    // (Here we use (-dy, dx) for the perpendicular direction.)
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

    const D = 2 * R;
    const svg = roughSvg.arc(
      center.x,
      center.y,
      D,
      D,
      startAngle,
      endAngle,
      false,
      options,
    );

    return {
      svg,
      angle1,
      angle2,
      lineLength: R * (endAngle - startAngle),
    };
  });

  const computedArrowHeadSize = computed(() => {
    if (line.value == null) {
      return 0;
    }

    if (arrowHeadSize != null) {
      return arrowHeadSize;
    }

    // The arrow size is proportional to the line length.
    // The constant factor is chosen so that the arrow size is 30 when the line length is 200.
    return (30 * Math.log(line.value.lineLength)) / Math.log(200);
  });

  const arrowHead1 = computed(() =>
    createArrowHeadSvg(
      rc.value as RoughSVG,
      computedArrowHeadSize.value,
      arrowHeadType,
      options,
    ),
  );
  const arrowHead2 = computed(() =>
    createArrowHeadSvg(
      rc.value as RoughSVG,
      computedArrowHeadSize.value,
      arrowHeadType,
      options,
    ),
  );

  return computed(() => {
    svg.value.innerHTML = "";

    if (
      line.value == null ||
      point1Ref.value == null ||
      point2Ref.value == null
    ) {
      return null;
    }

    svg.value.appendChild(line.value.svg);

    arrowHead2.value.setAttribute(
      "transform",
      `translate(${point2Ref.value.x},${point2Ref.value.y}) rotate(${(line.value.angle2 * 180) / Math.PI + (centerPositionParam >= 0 ? 90 : -90)})`,
    );
    svg.value.appendChild(arrowHead2.value);

    if (twoWay) {
      arrowHead1.value.setAttribute(
        "transform",
        `translate(${point1Ref.value.x},${point1Ref.value.y}) rotate(${(line.value.angle1 * 180) / Math.PI + (centerPositionParam >= 0 ? -90 : 90)})`,
      );
      svg.value.appendChild(arrowHead1.value);
    }

    return svg.value.innerHTML;
  });
}
