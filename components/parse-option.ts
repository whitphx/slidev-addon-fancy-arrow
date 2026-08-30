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

/** A 1-based, inclusive range of lines inside a code block. */
export interface LineRange {
  start: number;
  end: number;
}

export interface SnapTargetQuery {
  query: string;
  /**
   * When set, the arrow snaps to the lines of the code block matched by `query`
   * instead of the code block as a whole.
   */
  lines?: LineRange[];
  snapPosition: SnapAnchorPoint | Position | undefined;
}

/**
 * The code block a line specifier resolves against when it comes without a selector,
 * as in "{3}". It is the class Slidev puts on every code block it renders.
 */
export const DEFAULT_CODE_BLOCK_SELECTOR = ".slidev-code";

const ZERO_LENGTH_PERCENTAGE: LengthPercentage = { value: 0, unit: "px" };

const lengthPercentageRegex = /(?<value>[+-]?\d+)(?<unit>%|px)?/;
const positionRegex = /^\(\s*(?<x>\S+)\s*,\s*(?<y>\S+)\s*\)$/;
const snapTargetRegex =
  /^(?<query>[^@{}]*?)\s*(\{(?<lines>[^{}]*)\})?\s*(@\s*(?<snapPosition>.+?))?$/;
const lineRangeRegex = /^(?<start>\d+)(\s*-\s*(?<end>\d+))?$/;

function parseLengthPercentage(
  lengthString: string,
): LengthPercentage | undefined {
  const match = lengthString.match(lengthPercentageRegex);
  if (!match) {
    return undefined;
  }
  const value = parseInt(match.groups?.value ?? "0", 10);
  const unit: "px" | "%" = match.groups?.unit === "%" ? "%" : "px";
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

function isSnapAnchorPoint(s: string): s is SnapAnchorPoint {
  return (SNAP_ANCHOR_POINTS_LIST as readonly string[]).includes(s);
}

function parseSnapPosition(
  snapPositionString: string,
): SnapAnchorPoint | Position | undefined {
  if (isSnapAnchorPoint(snapPositionString)) {
    return snapPositionString;
  }

  return parsePosition(snapPositionString);
}

/**
 * Parses a line specifier such as "3", "3-5", or "1,3-5" into 1-based inclusive ranges.
 * The syntax mirrors Slidev's line-highlighting syntax, so ```ts {3-5} and "{3-5}" here
 * mean the same lines.
 */
export function parseLineSpec(lineSpecString: string): LineRange[] {
  const specs = lineSpecString
    .split(",")
    .map((spec) => spec.trim())
    .filter((spec) => spec !== "");
  if (specs.length === 0) {
    throw new Error(`Invalid line specifier: "${lineSpecString}" is empty`);
  }

  return specs.map((spec) => {
    const match = spec.match(lineRangeRegex);
    if (!match) {
      throw new Error(`Invalid line specifier: "${spec}"`);
    }
    const start = parseInt(match.groups?.start ?? "", 10);
    const end =
      match.groups?.end != null ? parseInt(match.groups.end, 10) : start;
    if (start < 1 || end < 1) {
      throw new Error(
        `Invalid line specifier: "${spec}", line numbers start at 1`,
      );
    }
    // A reversed range like "5-3" means the same lines as "3-5".
    return { start: Math.min(start, end), end: Math.max(start, end) };
  });
}

/**
 * The `arrowEndpointShorthand` can be in the format of a CSS selector with an optional
 * line specifier and an optional snap position, or a position in the format "(x,y)".
 * - For example, "[data-id=snap-target]" or "[data-id=snap-target]@left".
 * - A line of a code block like "[data-id=code]{3}", a range like "[data-id=code]{3-5}",
 *   or "{3}" on its own, which takes the first code block on the slide.
 * - Or a position like "(100,200)", "(100px,200px)", or (10%,20%).
 */
export function parseArrowEndpointShorthand(
  arrowEndpointShorthand: string,
): SnapTargetQuery | Position {
  arrowEndpointShorthand = arrowEndpointShorthand.trim();

  const position = parsePosition(arrowEndpointShorthand);
  if (position) {
    return position;
  }

  const snapTargetMatch = arrowEndpointShorthand.match(snapTargetRegex);
  if (snapTargetMatch) {
    const query = snapTargetMatch.groups?.query?.trim();
    const lineSpec = snapTargetMatch.groups?.lines;
    if (!query && lineSpec == null) {
      throw new Error(
        `Invalid arrow endpoint format: missing query group in "${arrowEndpointShorthand}"`,
      );
    }
    const snapPosition = snapTargetMatch.groups?.snapPosition;
    return {
      // A line specifier on its own points at the slide's first code block.
      query: query || DEFAULT_CODE_BLOCK_SELECTOR,
      ...(lineSpec != null && { lines: parseLineSpec(lineSpec) }),
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
  line?: number | string;
  x?: number | string;
  y?: number | string;
}
export function compileArrowEndpointProps(
  props: ArrowEndpointProps,
): SnapTargetQuery | Position | undefined {
  if (props.shorthand) {
    try {
      return parseArrowEndpointShorthand(props.shorthand);
    } catch (error) {
      console.error(`Failed to parse shorthand "${props.shorthand}":`, error);
      return undefined;
    }
  }

  if (props.q || props.id || props.line != null) {
    // `id` is deprecated in favour of `q`.
    const query =
      props.q ||
      (props.id ? `#${props.id}` : undefined) ||
      // A line without a selector points at the slide's first code block.
      DEFAULT_CODE_BLOCK_SELECTOR;

    let lines: LineRange[] | undefined;
    if (props.line != null) {
      try {
        lines = parseLineSpec(String(props.line));
      } catch (error) {
        console.error(`Failed to parse line "${String(props.line)}":`, error);
        return undefined;
      }
    }

    return {
      query,
      ...(lines && { lines }),
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
