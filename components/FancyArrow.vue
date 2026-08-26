<script setup lang="ts">
import { ref, computed, useSlots, watch, onBeforeUpdate, onUpdated } from "vue";
import { isBackwardMove } from "./nav-direction";
import {
  compileArrowEndpointProps,
  SnapTargetQuery,
  type SnapAnchorPoint,
} from "./parse-option";
import { useIsSlideActive, useNav } from "@slidev/client";
import {
  resolveSnapTargetPosition,
  SnapTarget,
  computeEndpointPosition,
} from "./position";
import {
  useRoughArrow,
  DEFAULT_ANIMATION_DURATION,
  type LineStyle,
} from "./use-rough-arrow";
import ChildElementPicker from "./ChildElementPicker.vue";

const props = defineProps<{
  from?: string; // Shorthand for (q1 and pos1) or (x1 and y1)
  to?: string; // Shorthand for (q2 and pos2) or (x2 and y2)
  q1?: string;
  q2?: string;
  id1?: string; // Deprecated
  id2?: string; // Deprecated
  pos1?: SnapAnchorPoint;
  pos2?: SnapAnchorPoint;
  x1?: number | string;
  y1?: number | string;
  x2?: number | string;
  y2?: number | string;
  width?: number | string;
  lineStyle?: LineStyle;
  color?: string;
  twoWay?: boolean;
  arc?: number | string;
  headType?: "line" | "polygon";
  headSize?: number | string;
  roughness?: number | string;
  seed?: number | string;
  static?: boolean;
  duration?: number | string;
  delay?: number | string;
  /** @deprecated Use `duration` instead */
  animationDuration?: number | string;
  /** @deprecated Use `delay` instead */
  animationDelay?: number | string;
}>();

const duration = computed(() => props.duration ?? props.animationDuration);
const delay = computed(() => props.delay ?? props.animationDelay);

const root = ref<HTMLElement>();
const slideContainer = computed(() => {
  return root.value?.closest(".slidev-page") ?? undefined;
});

const svgContainer = ref<SVGSVGElement>();

const slots = useSlots();
const tailElementRef = ref<Element>();
const headElementRef = ref<Element>();
function onTailElementMounted(element: Element | null) {
  tailElementRef.value = element ?? undefined;
}
function onHeadElementMounted(element: Element | null) {
  headElementRef.value = element ?? undefined;
}

const tail = computed(() => {
  const useTailSlot = slots.tail != null;
  if (useTailSlot) {
    const snapTarget: SnapTarget = {
      element: tailElementRef.value,
      snapPosition: undefined,
    };
    return snapTarget;
  }

  const tailConfig = compileArrowEndpointProps({
    shorthand: props.from,
    q: props.q1,
    id: props.id1,
    pos: props.pos1,
    x: props.x1,
    y: props.y1,
  });

  if (tailConfig == null) {
    // Try to use the next or previous element as fallback snap target.
    const snapTarget: SnapTarget = {
      element: root.value?.previousElementSibling ?? undefined,
      snapPosition: undefined,
    };
    return snapTarget;
  }

  if (!("query" in tailConfig)) {
    // tailConfig is of type Position. Return it as is.
    return tailConfig;
  }

  return getSnapTarget(tailConfig);
});

const head = computed(() => {
  const useHeadSlot = slots.head != null;
  if (useHeadSlot) {
    const snapTarget: SnapTarget = {
      element: headElementRef.value,
      snapPosition: undefined,
    };
    return snapTarget;
  }

  const headConfig = compileArrowEndpointProps({
    shorthand: props.to,
    q: props.q2,
    id: props.id2,
    pos: props.pos2,
    x: props.x2,
    y: props.y2,
  });

  if (headConfig == null) {
    // Try to use the next or previous element as fallback snap target.
    const snapTarget: SnapTarget = {
      element: root.value?.nextElementSibling ?? undefined,
      snapPosition: undefined,
    };
    return snapTarget;
  }

  if (!("query" in headConfig)) {
    // headConfig is of type Position. Return it as is.
    return headConfig;
  }

  return getSnapTarget(headConfig);
});

const { isPrintMode, currentPage, clicks } = useNav();
const isSlideActive = useIsSlideActive();
function getSnapTarget(
  snapTargetQuery: SnapTargetQuery,
): SnapTarget | undefined {
  if (
    !isPrintMode.value && // In print mode, isSlideActive doesn't matter because all slides are rendered.
    !isSlideActive.value // In the normal mode, we only resolve the snap target on the active slide because other slides may not be rendered.
  ) {
    return undefined;
  }

  const element =
    slideContainer.value?.querySelector(snapTargetQuery.query) ?? undefined;
  if (element == null) {
    console.warn(`Element not found for query: ${snapTargetQuery.query}`);
  }

  const snapTarget: SnapTarget = {
    element,
    snapPosition: snapTargetQuery.snapPosition,
  };
  return snapTarget;
}

const tailPosition = resolveSnapTargetPosition(svgContainer, tail);
const headPosition = resolveSnapTargetPosition(svgContainer, head);

const tailAbsPos = computeEndpointPosition(tailPosition, headPosition);
const headAbsPos = computeEndpointPosition(headPosition, tailPosition);

const animationEnabled = computed(() => {
  if (isPrintMode.value) {
    return false;
  }
  return props.static !== true;
});

// An arrow draws itself as the deck moves forward. Moving backward would replay a
// drawing the audience has already seen, so while the deck moves backward the arrow is
// shown as already drawn, by the rules at the end of this file.
const movingBackward = ref(false);
watch([currentPage, clicks], ([page, click], [previousPage, previousClick]) => {
  movingBackward.value = isBackwardMove(
    { page: previousPage, clicks: previousClick },
    { page, clicks: click },
  );
});

// Those rules only paint over the animation, which is still running underneath and
// would carry on in view once the deck moves forward again, so it is sent to its end
// as soon as it starts.
function onAnimationStart(event: AnimationEvent) {
  if (!movingBackward.value || !(event.target instanceof Element)) {
    return;
  }
  const isArrowAnimation = event.target.matches(
    ".animated-rough-arrow-stroke, .animated-rough-arrow-fill, .animated-rough-arrow-content",
  );
  if (!isArrowAnimation) {
    return;
  }
  event.target.getAnimations().forEach((animation) => animation.finish());
}

const { arrowSvg, textPosition } = useRoughArrow({
  point1: tailAbsPos,
  point2: headAbsPos,
  width: () => Number(props.width ?? 2),
  lineStyle: () => props.lineStyle ?? "solid",
  twoWay: () => props.twoWay ?? false,
  centerPositionParam: () => Number(props.arc ?? 0),
  headType: () => props.headType ?? "line",
  headSize: () => (props.headSize != null ? Number(props.headSize) : null),
  roughness: () =>
    props.roughness != null ? Number(props.roughness) : undefined,
  seed: () => (props.seed != null ? Number(props.seed) : undefined),
  animation: computed(() =>
    animationEnabled.value
      ? {
          duration: duration.value != null ? Number(duration.value) : undefined,
          delay: delay.value != null ? Number(delay.value) : undefined,
        }
      : undefined,
  ),
  strokeAnimationClass: "animated-rough-arrow-stroke",
  fillAnimationClass: "animated-rough-arrow-fill",
});

function getArrowAnimations(): Animation[] {
  return svgContainer.value?.getAnimations({ subtree: true }) ?? [];
}

// Every re-render replaces the arrow's elements,
// and the new ones start the drawing animation from the beginning.
// So once the arrow has finished drawing, we skip the new animation to its end,
// and the arrow simply appears at its new position.
// The animation itself is left as it is,
// so a `v-click` reveal or a slide transition still replays the drawing.
let arrowWasDrawn = false;
onBeforeUpdate(() => {
  const animations = getArrowAnimations();
  arrowWasDrawn =
    animations.length > 0 &&
    animations.every((animation) => animation.playState === "finished");
});
onUpdated(() => {
  if (!arrowWasDrawn) {
    return;
  }
  getArrowAnimations().forEach((animation) => animation.finish());
});
</script>

<template>
  <div ref="root" style="display: contents" @animationstart="onAnimationStart">
    <!--
    "display: contents" ensures the root element doesn't affect the layout
    so that the positions of the elements injected into the slots are not
    affected by the root element.
  -->

    <!--
    Place these slots before the main SVG arrow
    so that the SVG arrow is placed in front of the elements in the slots.
    -->
    <ChildElementPicker
      v-if="slots.tail"
      @first-child-element-mounted="onTailElementMounted"
    >
      <slot name="tail" />
    </ChildElementPicker>
    <ChildElementPicker
      v-if="slots.head"
      @first-child-element-mounted="onHeadElementMounted"
    >
      <slot name="head" />
    </ChildElementPicker>

    <!--
    The paths stroke and fill with `currentColor`, and `color` may be either a UnoCSS color
    token or a plain CSS color value, which can't be told apart reliably. So both forms are
    emitted and the cascade resolves it: an invalid CSS value is dropped by the browser, and
    the inner `text-*` class wins over the inherited value when UnoCSS generated the utility.
    -->
    <svg
      ref="svgContainer"
      :class="{ 'fancy-arrow-skip-drawing': movingBackward }"
      :style="{ color: props.color }"
      style="
        position: absolute;
        top: 0;
        left: 0;
        width: 1px;
        height: 1px;
        overflow: visible;
      "
    >
      <!-- eslint-disable-next-line vue/no-v-html -->
      <g :class="props.color ? `text-${props.color}` : ''" v-html="arrowSvg" />
    </svg>
    <div
      v-if="$slots.default && textPosition"
      :class="{
        'animated-rough-arrow-content': animationEnabled,
        'fancy-arrow-skip-drawing': movingBackward,
      }"
      :style="{
        position: 'absolute',
        left: `${textPosition.x}px`,
        top: `${textPosition.y}px`,
        transform: 'translate(-50%, -50%)',
        ...(animationEnabled && {
          animationDuration: `${duration ?? DEFAULT_ANIMATION_DURATION}ms`,
          animationDelay: `${delay ?? 0}ms`,
          visibility: 'hidden',
        }),
      }"
    >
      <slot />
    </div>
  </div>
</template>

<style>
@keyframes rough-arrow-dash {
  0.01% {
    /*
    We set visibility: hidden when constructing the SVG,
    which is necessary to hide unexpected fragments before starting animation,
    and we also want to make them visible right after starting animation.
    */
    visibility: visible;
  }
  to {
    stroke-dashoffset: 0;
    visibility: visible;
  }
}

@keyframes rough-arrow-fill {
  to {
    visibility: visible;
  }
}

@keyframes rough-arrow-content {
  from {
    visibility: hidden;
  }
  99.99% {
    visibility: hidden;
  }
  100% {
    visibility: visible;
  }
}

.animated-rough-arrow-stroke {
  animation: rough-arrow-dash ease-out forwards;
}
.animated-rough-arrow-fill {
  animation: rough-arrow-fill ease-out forwards;
}
.animated-rough-arrow-content {
  animation: rough-arrow-content ease-out forwards;
}

/* Stop animation when this element is hidden due to v-click */
.slidev-vclick-target.slidev-vclick-hidden .animated-rough-arrow-stroke {
  animation: none;
}
.slidev-vclick-target.slidev-vclick-hidden .animated-rough-arrow-fill {
  animation: none;
}
.slidev-vclick-target.slidev-vclick-hidden .animated-rough-arrow-content {
  animation: none;
}

/*
Show the arrow as already drawn while the deck is moving backward, rather than let it
draw a picture the audience has already seen.
`!important` puts these above the animation, which the cascade otherwise ranks above
the styles each path is built with.
*/
.fancy-arrow-skip-drawing .animated-rough-arrow-stroke,
.fancy-arrow-skip-drawing .animated-rough-arrow-fill,
.animated-rough-arrow-content.fancy-arrow-skip-drawing {
  visibility: visible !important;
}
.fancy-arrow-skip-drawing .animated-rough-arrow-stroke {
  stroke-dashoffset: 0 !important;
}

/*
An arrow a `v-click` is hiding stays hidden: the rules above are for an arrow that is on
screen. Slidev hides it by turning the opacity down, which has no effect on the
`display: contents` element the arrow hangs from, so this `visibility` is what hides it.
*/
.slidev-vclick-target.slidev-vclick-hidden
  .fancy-arrow-skip-drawing
  .animated-rough-arrow-stroke,
.slidev-vclick-target.slidev-vclick-hidden
  .fancy-arrow-skip-drawing
  .animated-rough-arrow-fill,
.slidev-vclick-target.slidev-vclick-hidden
  .animated-rough-arrow-content.fancy-arrow-skip-drawing {
  visibility: hidden !important;
}

/*
Stop animation during slide transitions.
Slidev uses Vue Transition for the slide transitions (https://sli.dev/guide/animations#custom-transitions),
and Vue Transition adds class names `<prefix>-(enter|leave)-(from|active|to)` to the slide elements `.slidev-page`.
The animation should stop when the parent slide element (`.slidev-page`) has the `<prefix>-enter-active` class.
*/
.slidev-page[class*="-enter-active"] .animated-rough-arrow-stroke {
  animation: none;
}
.slidev-page[class*="-enter-active"] .animated-rough-arrow-fill {
  animation: none;
}
.slidev-page[class*="-enter-active"] .animated-rough-arrow-content {
  animation: none;
}
</style>
