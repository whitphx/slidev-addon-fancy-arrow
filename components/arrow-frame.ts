/**
 * The mapping between the three coordinate systems an arrow deals with:
 *
 * - **screen**: what `getBoundingClientRect()` returns, which is where the elements an
 *   arrow snaps to are measured.
 * - **SVG user units**: what the arrow is actually drawn in. The arrow's `<svg>` is a
 *   1px x 1px box placed at the top-left corner of its containing block, which is the
 *   nearest positioned or transformed ancestor rather than the slide. So its origin is
 *   wherever that ancestor happens to be.
 * - **slide**: what `x1`/`y1`, `(x, y)` and percentages are written in, whose origin is
 *   the top-left corner of the slide and whose unit is one of the `slideWidth` x
 *   `slideHeight` pixels the slide is authored at.
 *
 * The three only coincide when the arrow sits directly in the slide and the slide is
 * displayed at its authored size, so every coordinate is converted through the frame
 * measured here instead of assumed.
 */

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ArrowFrame {
  /** Screen pixels per SVG user unit. */
  scale: Point;
  /** The SVG's origin, in screen coordinates. */
  screenOrigin: Point;
  /** The slide's top-left corner, in SVG user units. */
  slideOrigin: Point;
  /** SVG user units per slide coordinate unit. */
  slideUnit: Point;
}

/**
 * @param svgRect the arrow's `<svg>` element, which is laid out as a 1px x 1px box.
 * @param slideRect the slide element the arrow is on, or `undefined` when the arrow is
 * used outside a slide.
 * @param slideSize the size the slide is authored at.
 * @param fallbackScale the scale to assume when the SVG has no size to measure.
 */
export function measureArrowFrame(
  svgRect: Rect,
  slideRect: Rect | undefined,
  slideSize: { width: number; height: number },
  fallbackScale: number,
): ArrowFrame {
  // The SVG is one pixel wide and one pixel tall, so its measured size is how much
  // screen space one of its user units takes up. Measuring it beats deriving it from
  // the slide's scale, because it also accounts for whatever the elements between the
  // slide and the arrow do, such as a `zoom` or a `transform: scale()`.
  // A zero size means it isn't being rendered at all and there is nothing to measure.
  const scale = {
    x: svgRect.width > 0 ? svgRect.width : fallbackScale,
    y: svgRect.height > 0 ? svgRect.height : fallbackScale,
  };
  const screenOrigin = { x: svgRect.left, y: svgRect.top };

  if (slideRect == null || slideRect.width <= 0 || slideRect.height <= 0) {
    // Without a slide to anchor to there is nothing better to treat as its origin than
    // the SVG's own, which is what the arrow is drawn relative to anyway.
    return {
      scale,
      screenOrigin,
      slideOrigin: { x: 0, y: 0 },
      slideUnit: { x: 1, y: 1 },
    };
  }

  return {
    scale,
    screenOrigin,
    slideOrigin: {
      x: (slideRect.left - svgRect.left) / scale.x,
      y: (slideRect.top - svgRect.top) / scale.y,
    },
    slideUnit: {
      x: slideRect.width / slideSize.width / scale.x,
      y: slideRect.height / slideSize.height / scale.y,
    },
  };
}

/** Converts a point measured with `getBoundingClientRect()` into SVG user units. */
export function screenToSvgPoint(frame: ArrowFrame, point: Point): Point {
  return {
    x: (point.x - frame.screenOrigin.x) / frame.scale.x,
    y: (point.y - frame.screenOrigin.y) / frame.scale.y,
  };
}

/** Converts a size measured with `getBoundingClientRect()` into SVG user units. */
export function screenToSvgSize(frame: ArrowFrame, size: Point): Point {
  return {
    x: size.x / frame.scale.x,
    y: size.y / frame.scale.y,
  };
}

/** Converts a point written in slide coordinates into SVG user units. */
export function slideToSvgPoint(frame: ArrowFrame, point: Point): Point {
  return {
    x: frame.slideOrigin.x + point.x * frame.slideUnit.x,
    y: frame.slideOrigin.y + point.y * frame.slideUnit.y,
  };
}
