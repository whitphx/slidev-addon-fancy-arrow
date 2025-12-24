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

function getAbsoluteValue(
  lengthPercentage: LengthPercentage,
  total: number,
): number {
  if (lengthPercentage.unit === "px") {
    return lengthPercentage.value;
  } else if (lengthPercentage.unit === "%") {
    return (lengthPercentage.value / 100) * total;
  } else {
    console.warn(`Unknown length percentage unit: ${lengthPercentage.unit}`);
    return 0;
  }
}

export interface SnapTarget {
  element: Element | undefined;
  snapPosition: SnapAnchorPoint | Position | undefined;
}

export interface BoxPosition {
  rect: DOMRect;
  snapPosition: SnapAnchorPoint | Position | undefined;
}

export function resolveSnapTarget(
  rootElementRef: Ref<SVGSVGElement | undefined>,
  endpointRef: Ref<Position | SnapTarget | undefined>,
) {
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

    const { element, snapPosition } = snapTarget;
    if (!rootElementRef.value || !element) {
      position.value = undefined;
      return;
    }

    const rect = element.getBoundingClientRect();
    const rootRect = rootElementRef.value.getBoundingClientRect();

    const x = (rect.left - rootRect.left) / $scale.value;
    const y = (rect.top - rootRect.top) / $scale.value;
    const width = rect.width / $scale.value;
    const height = rect.height / $scale.value;

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
      rect: new DOMRect(x, y, width, height),
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
      } else if (newVal.element) {
        const observer = new MutationObserver(updateSnappedPosition);
        observer.observe(newVal.element, { attributes: true });

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

export function getClosestEdgePoint(
  rect: DOMRect,
  anotherPoint: { x: number; y: number },
): { x: number; y: number } {
  const c1x = rect.x + rect.width / 2;
  const c1y = rect.y + rect.height / 2;
  if (rect.width === 0 || rect.height === 0) {
    return { x: c1x, y: c1y };
  }

  const dx = anotherPoint.x - c1x;
  const dy = anotherPoint.y - c1y;
  if (dx === 0 && dy === 0) {
    return { x: c1x, y: c1y };
  }

  if (Math.abs(dx / dy) > rect.width / rect.height) {
    const x = dx > 0 ? rect.x + rect.width : rect.x;
    // Relationship between the ratios of side lengths of similar figures in geometry.
    // y - c1y : dy = x - c1x : dx
    const y = c1y + ((x - c1x) * dy) / dx;
    return { x, y };
  } else {
    const y = dy > 0 ? rect.y + rect.height : rect.y;
    // Relationship between the ratios of side lengths of similar figures in geometry.
    // x - c1x : dx = y - c1y : dy
    const x = c1x + ((y - c1y) * dx) / dy;
    return { x, y };
  }
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
