import {
  ref,
  onMounted,
  computed,
  watch,
  onWatcherCleanup,
  type Ref,
} from "vue";
import { useSlideContext, useIsSlideActive } from "@slidev/client";
import { AbsolutePosition } from "./use-rough-arrow";

export type SnapPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "topleft"
  | "topright"
  | "bottomleft"
  | "bottomright";

export function useElementPosition(
  slideContainer: Ref<Element | undefined>,
  rootElement: Ref<SVGSVGElement | undefined>,
  selector: string,
  pos?: SnapPosition,
): Ref<AbsolutePosition | undefined> {
  const { $scale } = useSlideContext();
  const isSlideActive = useIsSlideActive();

  const elem = computed(() => {
    return slideContainer.value?.querySelector(selector) ?? null;
  });

  const point = ref<AbsolutePosition | undefined>(undefined);

  const update = () => {
    if (!isSlideActive.value || !rootElement.value || !elem.value) {
      point.value = undefined;
      return;
    }

    const rect = elem.value.getBoundingClientRect();
    const rootRect = rootElement.value.getBoundingClientRect();

    let x = (rect.left - rootRect.left) / $scale.value;
    let y = (rect.top - rootRect.top) / $scale.value;
    const width = rect.width / $scale.value;
    const height = rect.height / $scale.value;

    if (pos?.includes("right")) {
      x += width;
    } else if (!pos?.includes("left")) {
      x += width / 2;
    }
    if (pos?.includes("bottom")) {
      y += height;
    } else if (!pos?.includes("top")) {
      y += height / 2;
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
      update();
    });
  });

  watch(
    elem,
    (newVal) => {
      if (newVal) {
        const observer = new MutationObserver(update);
        observer.observe(newVal, { attributes: true });

        onWatcherCleanup(() => {
          observer.disconnect();
        });
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    update();

    // Some type of position/size changes can't be observed by MutationObserver.
    // So we need to update the position/size periodically in the polling manner.
    const interval = setInterval(() => {
      update();
    }, 100);

    return () => clearInterval(interval);
  });

  return point;
}
