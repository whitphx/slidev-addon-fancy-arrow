import { computed, type ComputedRef } from "vue";
import { useRoute } from "vue-router";
import { useSlideContext } from "@slidev/client/context.ts";

/**
 * Slidev helpers that must not go through the `@slidev/client` barrel.
 *
 * The barrel re-exports `useNav` and `useIsSlideActive` from modules that
 * import `#slidev/slides`. FancyArrow is rendered inside slides, so that would
 * close an HMR circular import (`/@slidev/slides` → FancyArrow → `@slidev/client`
 * → `#slidev/slides`) and force a full page reload on every `slides.md` edit.
 *
 * These helpers use slide context and Vue Router without the slides registry.
 *
 * @see https://github.com/whitphx/slidev-addon-fancy-arrow/issues/449
 */

export function useIsSlideActive(): ComputedRef<boolean> {
  const { $page, $nav } = useSlideContext();
  // Same logic as @slidev/client's useIsSlideActive — see slidevjs/slidev#2310.
  return computed(() => $page.value === $nav.value.currentSlideNo);
}

export function useIsPrintMode(): ComputedRef<boolean> {
  // May be undefined when FancyArrow mounts outside the Vue Router injection
  // context (Slidev preload of inactive slides, or some HMR remount paths).
  // Accessing route.query in that case blanks the whole slide.
  const route = useRoute();
  return computed(() => {
    if (route == null) {
      return new URLSearchParams(location.search).has("print");
    }
    // Track navigation because location.search is not reactive.
    void route.query;
    // Fixed navigation omits isPrintMode. Follow Slidev's URL-based detection (MIT; see LICENSE).
    // https://github.com/slidevjs/slidev/blob/v52.6.0/packages/client/composables/useNav.ts#L273-L284
    return (
      new URLSearchParams(location.search).has("print") ||
      route.name === "export"
    );
  });
}
