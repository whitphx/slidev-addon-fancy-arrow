import { computed, ref, type Ref } from "vue";
import roughjs from "roughjs";

type RoughSVG = ReturnType<typeof roughjs.svg>;

const createArrowHeadSvg = (
  rc: RoughSVG,
  color: string,
  width: number,
): SVGGElement => {
  const arrowSize = 20;
  const arrowAngle = Math.PI / 6; // 30 degrees

  const x1 = -arrowSize * Math.cos(arrowAngle);
  const y1 = arrowSize * Math.sin(arrowAngle);
  const x2 = -arrowSize * Math.cos(arrowAngle);
  const y2 = arrowSize * Math.sin(-arrowAngle);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const line1 = rc.line(x1, y1, 0, 0, {
    stroke: color,
    strokeWidth: width,
  });
  g.appendChild(line1);

  const line2 = rc.line(x2, y2, 0, 0, {
    stroke: color,
    strokeWidth: width,
  });
  g.appendChild(line2);

  return g;
};

export function useRoughArrow(props: {
  point1: Ref<{ x: number; y: number } | undefined>;
  point2: Ref<{ x: number; y: number } | undefined>;
  color: string;
  width: number;
  twoWay: boolean;
  centerPositionParam: number;
}) {
  const {
    point1: point1Ref,
    point2: point2Ref,
    color,
    width,
    twoWay,
    centerPositionParam,
  } = props;

  const svg = ref<SVGSVGElement>(
    document.createElementNS("http://www.w3.org/2000/svg", "svg"),
  );
  const rc = ref(roughjs.svg(svg.value));

  const arrowHead1 = ref(
    createArrowHeadSvg(rc.value as RoughSVG, color, width),
  );
  const arrowHead2 = ref(
    createArrowHeadSvg(rc.value as RoughSVG, color, width),
  );

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
      // The radius can be interpreted as infinity.
      return roughSvg.line(point1.x, point1.y, point2.x, point2.y, {
        stroke: color,
        strokeWidth: width,
      });
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
    return roughSvg.arc(center.x, center.y, D, D, startAngle, endAngle, false, {
      stroke: color,
      strokeWidth: width,
    });
  });

  return computed(() => {
    svg.value.innerHTML = "";

    if (
      line.value == null ||
      point1Ref.value == null ||
      point2Ref.value == null
    ) {
      return null;
    }

    svg.value.appendChild(line.value);

    const dx = point2Ref.value.x - point1Ref.value.x;
    const dy = point2Ref.value.y - point1Ref.value.y;
    const angle = Math.atan2(dy, dx);

    arrowHead2.value.setAttribute(
      "transform",
      `translate(${point2Ref.value.x},${point2Ref.value.y}) rotate(${(angle * 180) / Math.PI})`,
    );
    svg.value.appendChild(arrowHead2.value);

    if (twoWay) {
      arrowHead1.value.setAttribute(
        "transform",
        `translate(${point1Ref.value.x},${point1Ref.value.y}) rotate(${(angle * 180) / Math.PI + 180})`,
      );
      svg.value.appendChild(arrowHead1.value);
    }

    return svg.value.innerHTML;
  });
}
