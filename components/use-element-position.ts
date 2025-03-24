import {
  ref,
  onMounted,
  computed,
  watch,
  onWatcherCleanup,
  type Ref,
} from "vue";
import { useSlideContext, onSlideEnter } from "@slidev/client";

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
): Ref<{ x: number; y: number } | undefined> {
  const { $scale } = useSlideContext();
  const elem = computed(() => {
    return slideContainer.value?.querySelector(selector) ?? null;
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
  const point = ref<{ x: number; y: number } | undefined>(undefined);

  const update = () => {
    if (!rootElement.value || !elem.value) {
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

  onSlideEnter(() => {
    setTimeout(() => {
      update();
    });
  });

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
