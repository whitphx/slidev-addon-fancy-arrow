import {
  ref,
  onMounted,
  computed,
  watch,
  onWatcherCleanup,
  type Ref,
} from "vue";
import {
  useSlideContext,
  useIsSlideActive,
  slideWidth,
  slideHeight,
} from "@slidev/client";
import type { AbsolutePosition } from "./use-rough-arrow";
import type {
  Position,
  LengthPercentage,
  SnapAnchorPoint,
} from "./parse-option";
import { getClosestEdgePoint } from "./closest-edge-point";
import {
  measureArrowFrame,
  screenToSvgPoint,
  screenToSvgSize,
  slideToSvgPoint,
  type ArrowFrame,
} from "./arrow-frame";

function getAbsoluteValue(
  lengthPercentage: LengthPercentage,
  total: number,
): number {
  if (lengthPercentage.unit === "px") {
    return lengthPercentage.value;
  } else if (lengthPercentage.unit === "%") {
    return (lengthPercentage.value / 100) * total;
  } else {
    console.warn(
      `Unknown length percentage unit: ${String(lengthPercentage.unit)}`,
    );
    return 0;
  }
}

export interface SnapTarget {
  /**
   * The elements the arrow snaps to. More than one when the target spans several
   * elements, such as a range of code block lines, in which case the arrow snaps to
   * the box that covers them all.
   */
  elements: Element[];
  snapPosition: SnapAnchorPoint | Position | undefined;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function getUnionRect(elements: Element[]): Rect | undefined {
  // An element that renders nothing at all reports an empty rect at the origin, which
  // would stretch the union far beyond the elements that are actually on screen.
  const rects = elements
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 || rect.height > 0);
  if (rects.length === 0) {
    return elements[0]?.getBoundingClientRect();
  }

  return {
    left: Math.min(...rects.map((rect) => rect.left)),
    top: Math.min(...rects.map((rect) => rect.top)),
    right: Math.max(...rects.map((rect) => rect.right)),
    bottom: Math.max(...rects.map((rect) => rect.bottom)),
  };
}

export interface BoxPosition {
  rect: { x: number; y: number; width: number; height: number };
  snapPosition: SnapAnchorPoint | Position | undefined;
}

/**
 * The position of one endpoint, in the SVG user units the arrow is drawn in:
 * either the point itself, or the box it snaps to.
 */
export type ResolvedPosition = AbsolutePosition | BoxPosition;

function resolveAbsolutePosition(
  position: Position,
  frame: ArrowFrame,
): AbsolutePosition {
  return slideToSvgPoint(frame, {
    x: getAbsoluteValue(position.x, slideWidth.value),
    y: getAbsoluteValue(position.y, slideHeight.value),
  });
}

function resolveSnappedPosition(
  snapTarget: SnapTarget,
  frame: ArrowFrame,
): BoxPosition | undefined {
  const rect = getUnionRect(snapTarget.elements);
  if (rect == null) {
    return undefined;
  }

  const { x, y } = screenToSvgPoint(frame, { x: rect.left, y: rect.top });
  const { x: width, y: height } = screenToSvgSize(frame, {
    x: rect.right - rect.left,
    y: rect.bottom - rect.top,
  });
  return {
    rect: { x, y, width, height },
    snapPosition: snapTarget.snapPosition,
  };
}

function isSamePosition(
  a: ResolvedPosition | undefined,
  b: ResolvedPosition | undefined,
): boolean {
  if (a == null || b == null) {
    return a === b;
  }
  if ("x" in a) {
    return "x" in b && a.x === b.x && a.y === b.y;
  }
  return (
    !("x" in b) &&
    a.snapPosition === b.snapPosition &&
    a.rect.x === b.rect.x &&
    a.rect.y === b.rect.y &&
    a.rect.width === b.rect.width &&
    a.rect.height === b.rect.height
  );
}

/**
 * @param rootElementRef the arrow's own `<svg>` element.
 * @param slideElementRef the slide the arrow is on, which the coordinates the arrow is
 * given in are relative to.
 * @param endpointRef the endpoint to resolve.
 */
export function resolveSnapTargetPosition(
  rootElementRef: Ref<SVGSVGElement | undefined>,
  slideElementRef: Ref<Element | undefined>,
  endpointRef: Ref<Position | SnapTarget | undefined>,
): Ref<ResolvedPosition | undefined> {
  const { $scale } = useSlideContext();
  const isSlideActive = useIsSlideActive();

  const position = ref<ResolvedPosition | undefined>(undefined);
  const updatePosition = () => {
    const endpoint = endpointRef.value;
    if (endpoint == null) {
      return;
    }

    const rootElement = rootElementRef.value;
    if (rootElement == null) {
      position.value = undefined;
      return;
    }

    const frame = measureArrowFrame(
      rootElement.getBoundingClientRect(),
      slideElementRef.value?.getBoundingClientRect(),
      { width: slideWidth.value, height: slideHeight.value },
      $scale.value,
    );

    const newPosition =
      "x" in endpoint
        ? resolveAbsolutePosition(endpoint, frame)
        : resolveSnappedPosition(endpoint, frame);

    if (isSamePosition(position.value, newPosition)) {
      // This check is important.
      // If the position/size of the element doesn't change,
      // we must not update the ref to avoid unnecessary re-renders.
      return;
    }
    position.value = newPosition;
  };

  watch(isSlideActive, () => {
    setTimeout(() => {
      // This `setTimeout` is important to ensure `updatePosition()` is called after the DOM elements in the slide are updated after `isSlideActive` is changed.
      updatePosition();
    });
  });

  watch(
    endpointRef,
    (newVal) => {
      updatePosition();

      if (newVal != null && !("x" in newVal) && newVal.elements.length > 0) {
        const observer = new MutationObserver(updatePosition);
        newVal.elements.forEach((element) => {
          observer.observe(element, { attributes: true });
        });

        onWatcherCleanup(() => {
          observer.disconnect();
        });
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    updatePosition();

    // Some type of position/size changes can't be observed by MutationObserver.
    // So we need to update the position/size periodically in the polling manner.
    const interval = setInterval(() => {
      updatePosition();
    }, 100);

    return () => clearInterval(interval);
  });

  return position;
}

export function computeEndpointPosition(
  position: Ref<ResolvedPosition | undefined>,
  anotherPosition: Ref<ResolvedPosition | undefined>,
): Ref<AbsolutePosition | undefined> {
  return computed<AbsolutePosition | undefined>((previous) => {
    if (position.value == null) {
      return undefined;
    }
    if ("x" in position.value) {
      return position.value;
    }

    const { snapPosition, rect } = position.value;
    let x = rect.x;
    let y = rect.y;
    if (snapPosition == null) {
      if (anotherPosition.value) {
        // Auto snap to the point that is on the edge of the rectangle and closest to the center of the other element
        const c2x =
          "x" in anotherPosition.value
            ? anotherPosition.value.x
            : anotherPosition.value.rect.x +
              anotherPosition.value.rect.width / 2;
        const c2y =
          "x" in anotherPosition.value
            ? anotherPosition.value.y
            : anotherPosition.value.rect.y +
              anotherPosition.value.rect.height / 2;
        const closestPoint = getClosestEdgePoint(rect, { x: c2x, y: c2y });
        x = closestPoint.x;
        y = closestPoint.y;
      }
    }
    if (typeof snapPosition === "string") {
      if (snapPosition.includes("right")) {
        x += rect.width;
      } else if (!snapPosition.includes("left")) {
        x += rect.width / 2;
      }
      if (snapPosition.includes("bottom")) {
        y += rect.height;
      } else if (!snapPosition.includes("top")) {
        y += rect.height / 2;
      }
    } else if (typeof snapPosition === "object") {
      x += getAbsoluteValue(snapPosition.x, rect.width);
      y += getAbsoluteValue(snapPosition.y, rect.height);
    }

    if (previous?.x === x && previous?.y === y) {
      // This if-condition is important.
      // If the position/size of the element doesn't change,
      // we must not update the computed ref to avoid unnecessary re-renders.
      return previous;
    }

    return { x, y };
  });
}
