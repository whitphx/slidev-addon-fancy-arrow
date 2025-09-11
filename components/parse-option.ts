const SNAP_ANCHOR_POINTS_LIST = [
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "topleft",
  "topright",
  "bottomleft",
  "bottomright",
] as const;
export const SNAP_ANCHOR_POINTS = new Set(SNAP_ANCHOR_POINTS_LIST);
export type SnapAnchorPoint = (typeof SNAP_ANCHOR_POINTS_LIST)[number];

export interface LengthPercentage {
  value: number;
  unit: "px" | "%";
}
export interface Position {
  x: LengthPercentage;
  y: LengthPercentage;
}

export interface SnapTarget {
  query: string;
  snapPosition: SnapAnchorPoint | Position | undefined;
}

const ZERO_LENGTH_PERCENTAGE: LengthPercentage = { value: 0, unit: "px" };

const lengthPercentageRegex = /(?<value>[+-]?\d+)(?<unit>%|px)?/;
const positionRegex = /^\(\s*(?<x>\S+)\s*,\s*(?<y>\S+)\s*\)$/;
const snapTargetRegex = /^(?<query>[^@]+?)(@\s*(?<snapPosition>.+?))?$/;

function parseLengthPercentage(
  lengthString: string,
): LengthPercentage | undefined {
  const match = lengthString.match(lengthPercentageRegex);
  if (!match) {
    return undefined;
  }
  const value = parseInt(match.groups?.value ?? "0", 10);
  const unit = (match.groups?.unit ?? "px") as "px" | "%";
  return { value, unit };
}

function parsePosition(positionString: string): Position | undefined {
  const positionMatch = positionString.match(positionRegex);
  if (!positionMatch) {
    return undefined;
  }

  const x =
    parseLengthPercentage(positionMatch.groups?.x ?? "") ??
    ZERO_LENGTH_PERCENTAGE;
  const y =
    parseLengthPercentage(positionMatch.groups?.y ?? "") ??
    ZERO_LENGTH_PERCENTAGE;
  return {
    x,
    y,
  };
}

function parseSnapPosition(
  snapPositionString: string,
): SnapAnchorPoint | Position | undefined {
  if ((SNAP_ANCHOR_POINTS as Set<string>).has(snapPositionString)) {
    return snapPositionString as SnapAnchorPoint;
  }

  return parsePosition(snapPositionString);
}

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

  const position = parsePosition(arrowEndpointShorthand);
  if (position) {
    return position;
  }

  const snapTargetMatch = arrowEndpointShorthand.match(snapTargetRegex);
  if (snapTargetMatch) {
    const query = snapTargetMatch.groups?.query;
    if (!query) {
      throw new Error(
        `Invalid arrow endpoint format: missing query group in "${arrowEndpointShorthand}"`,
      );
    }
    const snapPosition = snapTargetMatch.groups?.snapPosition;
    return {
      query: query.trim(),
      snapPosition: snapPosition ? parseSnapPosition(snapPosition) : undefined,
    };
  }

  throw new Error(`Invalid arrow endpoint format: ${arrowEndpointShorthand}`);
}

interface ArrowEndpointProps {
  shorthand?: string;
  q?: string;
  id?: string; // Deprecated
  pos?: SnapAnchorPoint;
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
      snapPosition: props.pos ? parseSnapPosition(props.pos) : undefined,
    };
  }
  if (props.id) {
    // Deprecated
    return {
      query: `#${props.id}`,
      snapPosition: props.pos ? parseSnapPosition(props.pos) : undefined,
    };
  }

  if (props.x != undefined || props.y != undefined) {
    return {
      x:
        typeof props.x === "number"
          ? { value: props.x, unit: "px" }
          : typeof props.x === "string"
            ? (parseLengthPercentage(props.x) ?? ZERO_LENGTH_PERCENTAGE)
            : ZERO_LENGTH_PERCENTAGE,
      y:
        typeof props.y === "number"
          ? { value: props.y, unit: "px" }
          : typeof props.y === "string"
            ? (parseLengthPercentage(props.y) ?? ZERO_LENGTH_PERCENTAGE)
            : ZERO_LENGTH_PERCENTAGE,
    };
  }

  return undefined;
}
