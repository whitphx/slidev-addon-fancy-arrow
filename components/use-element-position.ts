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

export function useEndpointResolution(
  rootElementRef: Ref<SVGSVGElement | undefined>,
  endpointRef: Ref<Position | SnapTarget | undefined>,
): Ref<AbsolutePosition | undefined> {
  const { $scale } = useSlideContext();
  const isSlideActive = useIsSlideActive();

  const snapTarget = computed(() => {
    if (endpointRef.value && "element" in endpointRef.value) {
      return endpointRef.value;
    }
    return undefined;
  });

  // Sync snapTarget -> boxPosition in case where endpoint is SnapTarget
  const boxPosition = ref<BoxPosition | undefined>(undefined);
  const updateSnappedPosition = () => {
    if (!snapTarget.value) {
      // This case means endpoint is of type Position
      // so we don't need to update point in this method
      // as it's done in the watch above.
      return;
    }

    const { element, snapPosition } = snapTarget.value;
    if (!rootElementRef.value || !element) {
      boxPosition.value = undefined;
      return;
    }

    const rect = element.getBoundingClientRect();
    const rootRect = rootElementRef.value.getBoundingClientRect();

    const x = (rect.left - rootRect.left) / $scale.value;
    const y = (rect.top - rootRect.top) / $scale.value;
    const width = rect.width / $scale.value;
    const height = rect.height / $scale.value;

    if (
      boxPosition.value?.rect.x === x &&
      boxPosition.value?.rect.y === y &&
      boxPosition.value?.rect.width === width &&
      boxPosition.value?.rect.height === height
    ) {
      // Avoid unnecessary re-renders
      return;
    }
    boxPosition.value = {
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
    snapTarget,
    (newVal) => {
      if (newVal?.element) {
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

  const point = computed<AbsolutePosition | undefined>((previous) => {
    if (endpointRef.value == null) {
      return undefined;
    } else if ("x" in endpointRef.value) {
      return {
        x: getAbsoluteValue(endpointRef.value.x, slideWidth.value),
        y: getAbsoluteValue(endpointRef.value.y, slideHeight.value),
      };
    } else if (boxPosition.value) {
      const { snapPosition, rect } = boxPosition.value;
      let x = rect.x;
      let y = rect.y;
      if (typeof snapPosition === "string" || snapPosition == null) {
        if (snapPosition?.includes("right")) {
          x += rect.width;
        } else if (!snapPosition?.includes("left")) {
          x += rect.width / 2;
        }
        if (snapPosition?.includes("bottom")) {
          y += rect.height;
        } else if (!snapPosition?.includes("top")) {
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

    return undefined;
  });

  return point;
}
