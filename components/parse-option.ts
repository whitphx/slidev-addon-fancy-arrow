import { SnapPosition } from "./use-element-position";

interface SnappedArrowEndpoint {
  type: "snapped";
  query: string;
  snapPosition: SnapPosition | undefined;
}
interface AbsoluteArrowEndpoint {
  type: "absolute";
  x: number;
  y: number;
}
type ArrowEndpoint = SnappedArrowEndpoint | AbsoluteArrowEndpoint;

const absolutePositionRegex = /^\(\s*(\d+)\s*,\s*(\d+)\s*\)$/;
const snapTargetRegex = /^(\S+?)(@(\S+?))?$/;

/**
 * The `arrowEndpointShorthand` can be in the format of a CSS selector with a snap position,
 * or an absolute position in the format "(x,y)".
 * - For example, "[data-id=snap-target]" or "[data-id=snap-target]@left".
 * - Or an absolute position like "(100,200)".
 */
export function parseArrowEndpointShorthand(
  arrowEndpointShorthand: string,
): ArrowEndpoint {
  arrowEndpointShorthand = arrowEndpointShorthand.trim();

  const absolutePositionMatch = arrowEndpointShorthand.match(
    absolutePositionRegex,
  );
  if (absolutePositionMatch) {
    const x = parseInt(absolutePositionMatch[1], 10);
    const y = parseInt(absolutePositionMatch[2], 10);
    return { type: "absolute", x, y };
  }

  const snapTargetMatch = arrowEndpointShorthand.match(snapTargetRegex);
  if (snapTargetMatch) {
    const query = snapTargetMatch[1];
    const snapPosition = snapTargetMatch[3] as SnapPosition | undefined;
    return { type: "snapped", query, snapPosition };
  }

  throw new Error(`Invalid snap option string: ${arrowEndpointShorthand}`);
}

interface ArrowEndpointProps {
  shorthand?: string;
  q?: string;
  id?: string;
  pos?: SnapPosition;
  x?: number | string;
  y?: number | string;
}
export function compileArrowEndpoint(props: ArrowEndpointProps): ArrowEndpoint {
  if (props.shorthand) {
    return parseArrowEndpointShorthand(props.shorthand);
  }

  if (props.q) {
    return {
      type: "snapped",
      query: props.q,
      snapPosition: props.pos,
    };
  }
  if (props.id) {
    // Deprecated
    return {
      type: "snapped",
      query: `#${props.id}`,
      snapPosition: props.pos,
    };
  }

  return {
    type: "absolute",
    x: Number(props.x ?? 0),
    y: Number(props.y ?? 0),
  };
}
