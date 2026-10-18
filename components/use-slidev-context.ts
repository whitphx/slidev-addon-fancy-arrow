import { computed, type ComputedRef } from "vue";
import { useSlideContext } from "@slidev/client/context.ts";

/**
 * Slidev helpers that must not go through the `@slidev/client` barrel.
 *
 * The barrel re-exports `useNav` and `useIsSlideActive` from modules that
 * import `#slidev/slides`. FancyArrow is rendered inside slides, so that would
 * close an HMR circular import (`/@slidev/slides` → FancyArrow → `@slidev/client`
 * → `#slidev/slides`) and force a full page reload on every `slides.md` edit.
 *
 * `useSlideContext()` is inject-based and lives in a module with no slides-registry
 * dependency, so these local wrappers keep the same behavior without the cycle.
 *
 * @see https://github.com/whitphx/slidev-addon-fancy-arrow/issues/449
 */

export function useIsSlideActive(): ComputedRef<boolean> {
  const { $page, $nav } = useSlideContext();
  // Same logic as @slidev/client's useIsSlideActive — see slidevjs/slidev#2310.
  return computed(() => $page.value === $nav.value.currentSlideNo);
}

export function useIsPrintMode(): ComputedRef<boolean> {
  const { $nav } = useSlideContext();
  // Runtime nav is SlidevContextNavFull (includes isPrintMode); injected type is SlidevContextNav.
  type NavWithPrintMode = typeof $nav.value & { isPrintMode: boolean };
  return computed(() => ($nav.value as NavWithPrintMode).isPrintMode);
}
