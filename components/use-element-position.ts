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
import type { SnapTarget, Position, LengthPercentage } from "./parse-option";

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

export function useEndpointResolution(
  slideContainerRef: Ref<Element | undefined>,
  rootElementRef: Ref<SVGSVGElement | undefined>,
  endpointRef: Ref<Position | SnapTarget | undefined>,
  fallbackOption: {
    self: Ref<HTMLElement | undefined>;
    direction: "next" | "prev";
  },
): Ref<AbsolutePosition | undefined> {
  const { $scale } = useSlideContext();
  const isSlideActive = useIsSlideActive();

  const snappedElementInfo = computed(() => {
    const endpoint = endpointRef.value;
    if (endpoint == null) {
      // If endpoint is undefined, we try to use the next or previous element
      // as fallback snap target.
      const selfElem = fallbackOption.self.value;
      if (!selfElem) {
        return undefined;
      }
      const element =
        fallbackOption.direction === "next"
          ? selfElem.nextElementSibling
          : selfElem.previousElementSibling;
      return {
        element,
        snapPosition: undefined,
      };
    }
    if (!("query" in endpoint)) {
      // endpoint is of type Position
      // so we don't need to resolve the element.
      return undefined;
    }
    const element =
      slideContainerRef.value?.querySelector(endpoint.query) ?? null;
    if (element == null) {
      console.warn(`Element not found for query: ${endpoint.query}`);
    }
    return {
      element,
      snapPosition: endpoint.snapPosition,
    };
  });

  const point = ref<AbsolutePosition | undefined>(undefined);

  // Sync endpointRef -> point in case where endpoint is Position
  watch(
    endpointRef,
    (endpoint) => {
      if (endpoint == null) {
        point.value = undefined;
        return;
      } else if ("x" in endpoint) {
        point.value = {
          x: getAbsoluteValue(endpoint.x, slideWidth.value),
          y: getAbsoluteValue(endpoint.y, slideHeight.value),
        };
        return;
      }
    },
    { immediate: true },
  );

  // Sync snappedElementInfo -> point in case where endpoint is SnapTarget
  const updateSnappedPosition = () => {
    if (!snappedElementInfo.value) {
      // This case means endpoint is of type Position
      // so we don't need to update point in this method
      // as it's done in the watch above.
      return;
    }

    const { element, snapPosition } = snappedElementInfo.value;
    if (!isSlideActive.value || !rootElementRef.value || !element) {
      point.value = undefined;
      return;
    }

    const rect = element.getBoundingClientRect();
    const rootRect = rootElementRef.value.getBoundingClientRect();

    let x = (rect.left - rootRect.left) / $scale.value;
    let y = (rect.top - rootRect.top) / $scale.value;
    const width = rect.width / $scale.value;
    const height = rect.height / $scale.value;

    if (typeof snapPosition === "string" || snapPosition == null) {
      if (snapPosition?.includes("right")) {
        x += width;
      } else if (!snapPosition?.includes("left")) {
        x += width / 2;
      }
      if (snapPosition?.includes("bottom")) {
        y += height;
      } else if (!snapPosition?.includes("top")) {
        y += height / 2;
      }
    } else if (typeof snapPosition === "object") {
      x += getAbsoluteValue(snapPosition.x, width);
      y += getAbsoluteValue(snapPosition.y, height);
    }

    if (point.value?.x !== x || point.value?.y !== y) {
      // This if-condition is important.
      // If the position/size of the element doesn't change,
      // we must not update the point ref to avoid unnecessary re-renders.
      point.value = { x, y };
    }
  };

  watch(isSlideActive, () => {
    setTimeout(() => {
      // This `setTimeout` is important to ensure `update()` is called after the DOM elements in the slide are updated after `isSlideActive` is changed.
      updateSnappedPosition();
    });
  });

  watch(
    snappedElementInfo,
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

  return point;
}
