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

export function resolveSnapTargetPosition(
  rootElementRef: Ref<SVGSVGElement | undefined>,
  endpointRef: Ref<Position | SnapTarget | undefined>,
): Ref<Position | BoxPosition | undefined> {
  const { $scale } = useSlideContext();
  const isSlideActive = useIsSlideActive();

  // Sync SnapTarget -> BoxPosition in case where endpoint is SnapTarget
  const position = ref<Position | BoxPosition | undefined>(undefined);
  const updateSnappedPosition = () => {
    if (endpointRef.value == null) {
      return;
    }
    if ("x" in endpointRef.value) {
      // Endpoint is of type Position
      // so we don't need to update point in this method
      // as it's done in the watch below.
      return;
    }

    const snapTarget = endpointRef.value;

    const { elements, snapPosition } = snapTarget;
    const rect = getUnionRect(elements);
    if (!rootElementRef.value || !rect) {
      position.value = undefined;
      return;
    }

    const rootRect = rootElementRef.value.getBoundingClientRect();

    const x = (rect.left - rootRect.left) / $scale.value;
    const y = (rect.top - rootRect.top) / $scale.value;
    const width = (rect.right - rect.left) / $scale.value;
    const height = (rect.bottom - rect.top) / $scale.value;

    if (
      position.value &&
      "rect" in position.value &&
      position.value.rect.x === x &&
      position.value.rect.y === y &&
      position.value.rect.width === width &&
      position.value.rect.height === height
    ) {
      // Avoid unnecessary re-renders
      return;
    }
    position.value = {
      rect: { x, y, width, height },
      snapPosition,
    };
  };

  watch(isSlideActive, () => {
    setTimeout(() => {
      // This `setTimeout` is important to ensure `update()` is called after the DOM elements in the slide are updated after `isSlideActive` is changed.
      updateSnappedPosition();
    });
  });

  watch(
    endpointRef,
    (newVal) => {
      if (newVal == null) {
        return;
      }
      if ("x" in newVal) {
        // Sync Position -> Position
        position.value = newVal;
      } else if (newVal.elements.length > 0) {
        const observer = new MutationObserver(updateSnappedPosition);
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
    updateSnappedPosition();

    // Some type of position/size changes can't be observed by MutationObserver.
    // So we need to update the position/size periodically in the polling manner.
    const interval = setInterval(() => {
      updateSnappedPosition();
    }, 100);

    return () => clearInterval(interval);
  });

  return position;
}

export function computeEndpointPosition(
  position: Ref<Position | BoxPosition | undefined>,
  anotherPosition: Ref<Position | BoxPosition | undefined>,
): Ref<AbsolutePosition | undefined> {
  return computed<AbsolutePosition | undefined>((previous) => {
    if (position.value == null) {
      return undefined;
    }
    if ("x" in position.value) {
      return {
        x: getAbsoluteValue(position.value.x, slideWidth.value),
        y: getAbsoluteValue(position.value.y, slideHeight.value),
      };
    } else {
      const { snapPosition, rect } = position.value;
      let x = rect.x;
      let y = rect.y;
      if (snapPosition == null) {
        if (anotherPosition.value) {
          // Auto snap to the point that is on the edge of the rectangle and closest to the center of the other element
          const c2x =
            "x" in anotherPosition.value
              ? getAbsoluteValue(anotherPosition.value.x, slideWidth.value)
              : anotherPosition.value.rect.x +
                anotherPosition.value.rect.width / 2;
          const c2y =
            "y" in anotherPosition.value
              ? getAbsoluteValue(anotherPosition.value.y, slideHeight.value)
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
    }
  });
}
