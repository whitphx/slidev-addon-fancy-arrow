import type { SnapPosition } from "./use-element-position";
import type { AbsolutePosition } from "./use-rough-arrow";

export interface SnapTarget {
  query: string;
  snapPosition: SnapPosition | undefined;
}

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
): SnapTarget | AbsolutePosition {
  arrowEndpointShorthand = arrowEndpointShorthand.trim();

  const absolutePositionMatch = arrowEndpointShorthand.match(
    absolutePositionRegex,
  );
  if (absolutePositionMatch) {
    const x = parseInt(absolutePositionMatch[1], 10);
    const y = parseInt(absolutePositionMatch[2], 10);
    return { x, y };
  }

  const snapTargetMatch = arrowEndpointShorthand.match(snapTargetRegex);
  if (snapTargetMatch) {
    const query = snapTargetMatch[1];
    const snapPosition = snapTargetMatch[3] as SnapPosition | undefined;
    return { query, snapPosition };
  }

  throw new Error(`Invalid arrow endpoint format: ${arrowEndpointShorthand}`);
}

interface ArrowEndpointProps {
  shorthand?: string;
  q?: string;
  id?: string; // Deprecated
  pos?: SnapPosition;
  x?: number | string;
  y?: number | string;
}
export function compileArrowEndpointProps(
  props: ArrowEndpointProps,
): SnapTarget | AbsolutePosition | undefined {
  if (props.shorthand) {
    try {
      return parseArrowEndpointShorthand(props.shorthand);
    } catch (error) {
      console.error(`Failed to parse shorthand "${props.shorthand}":`, error);
      return undefined;
    }
  }

  if (props.q) {
    return {
      query: props.q,
      snapPosition: props.pos,
    };
  }
  if (props.id) {
    // Deprecated
    return {
      query: `#${props.id}`,
      snapPosition: props.pos,
    };
  }

  if (props.x != undefined || props.y != undefined) {
    return {
      x: Number(props.x ?? 0),
      y: Number(props.y ?? 0),
    };
  }

  return undefined;
}
