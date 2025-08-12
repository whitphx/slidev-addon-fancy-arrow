import type { SnapPosition } from "./use-element-position";

export interface SnapTarget {
  query: string;
  snapPosition: SnapPosition | undefined;
}

export interface LengthPercentage {
  value: number;
  unit: "px" | "%";
}
export interface Position {
  x: LengthPercentage;
  y: LengthPercentage;
}

const positionRegex =
  /^\(\s*(?<xValue>[+-]?\d+)(?<xUnit>%|px)?\s*,\s*(?<yValue>[+-]?\d+)(?<yUnit>%|px)?\s*\)$/;
const snapTargetRegex = /^(\S+?)(@(\S+?))?$/;

/**
 * The `arrowEndpointShorthand` can be in the format of a CSS selector with a snap position,
 * or a position in the format "(x,y)".
 * - For example, "[data-id=snap-target]" or "[data-id=snap-target]@left".
 * - Or a position like "(100,200)", "(100px,200px)", or (10%,20%).
 */
export function parseArrowEndpointShorthand(
  arrowEndpointShorthand: string,
): SnapTarget | Position {
  arrowEndpointShorthand = arrowEndpointShorthand.trim();

  const positionMatch = arrowEndpointShorthand.match(positionRegex);
  if (positionMatch) {
    const xValue = parseInt(positionMatch.groups?.xValue ?? "0", 10);
    const xUnit = (positionMatch.groups?.xUnit ?? "px") as "px" | "%";
    const yValue = parseInt(positionMatch.groups?.yValue ?? "0", 10);
    const yUnit = (positionMatch.groups?.yUnit ?? "px") as "px" | "%";
    return {
      x: { value: xValue, unit: xUnit },
      y: { value: yValue, unit: yUnit },
    };
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
): SnapTarget | Position | undefined {
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
      x: {
        value: Number(props.x ?? 0),
        unit: "px",
      },
      y: {
        value: Number(props.y ?? 0),
        unit: "px",
      },
    };
  }

  return undefined;
}
