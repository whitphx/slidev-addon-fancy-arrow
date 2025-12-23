<script setup lang="ts">
import { ref, computed, useSlots, type Ref } from "vue";
import {
  compileArrowEndpointProps,
  type SnapAnchorPoint,
} from "./parse-option";
import { useIsSlideActive, useNav } from "@slidev/client";
import { SnapTarget, useEndpointResolution } from "./use-element-position";
import {
  useRoughArrow,
  DEFAULT_ANIMATION_DURATION,
  type AbsolutePosition,
} from "./use-rough-arrow";
import SlotAdapter from "./SlotAdapter.vue";

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
  color?: string;
  twoWay?: boolean;
  arc?: number | string;
  headType?: "line" | "polygon";
  headSize?: number | string;
  roughness?: number | string;
  seed?: number | string;
  static?: boolean;
  animationDuration?: number | string;
  animationDelay?: number | string;
}>();

const root = ref<HTMLElement>();
const slideContainer = computed(() => {
  return root.value?.closest(".slidev-page") ?? undefined;
});

const svgContainer = ref<SVGSVGElement>();

const slots = useSlots();
const tailElementRef = ref<HTMLElement>();
const headElementRef = ref<HTMLElement>();
function onTailElementMounted(element: HTMLElement | null) {
  tailElementRef.value = element ?? undefined;
}
function onHeadElementMounted(element: HTMLElement | null) {
  headElementRef.value = element ?? undefined;
}

const { isPrintMode } = useNav();
const isSlideActive = useIsSlideActive();

const tail = computed(() => {
  const useTailSlot = slots.tail != null;
  if (useTailSlot) {
    return {
      element: tailElementRef.value,
      snapPosition: undefined,
    } as SnapTarget;
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
    return {
      element: root.value?.previousElementSibling ?? undefined,
      snapPosition: undefined,
    } as SnapTarget;
  }

  if (!("query" in tailConfig)) {
    // tailConfig is of type Position. Return it as is.
    return tailConfig;
  }

  // Resolve the element from the query.
  if (
    !isPrintMode.value && // In print mode, isSlideActive doesn't matter because all slides are rendered.
    !isSlideActive.value // In the normal mode, we only resolve the snap target on the active slide because other slides may not be rendered.
  ) {
    return undefined;
  }

  const element =
    slideContainer.value?.querySelector(tailConfig.query) ?? undefined;
  if (element == null) {
    console.warn(`Element not found for query: ${tailConfig.query}`);
  }

  return {
    element,
    snapPosition: tailConfig.snapPosition,
  } as SnapTarget;
});

const head = computed(() => {
  const useHeadSlot = slots.head != null;
  if (useHeadSlot) {
    return {
      element: headElementRef.value,
      snapPosition: undefined,
    } satisfies SnapTarget;
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
    return {
      element: root.value?.nextElementSibling ?? undefined,
      snapPosition: undefined,
    } satisfies SnapTarget;
  }

  if (!("query" in headConfig)) {
    // headConfig is of type Position. Return it as is.
    return headConfig;
  }

  // Resolve the element from the query.
  if (
    !isPrintMode.value && // In print mode, isSlideActive doesn't matter because all slides are rendered.
    !isSlideActive.value // In the normal mode, we only resolve the snap target on the active slide because other slides may not be rendered.
  ) {
    return undefined;
  }

  const element =
    slideContainer.value?.querySelector(headConfig.query) ?? undefined;
  if (element == null) {
    console.warn(`Element not found for query: ${headConfig.query}`);
  }

  return {
    element,
    snapPosition: headConfig.snapPosition,
  } satisfies SnapTarget;
});

const tailPoint: Ref<AbsolutePosition | undefined> = useEndpointResolution(
  svgContainer,
  tail,
);
const headPoint: Ref<AbsolutePosition | undefined> = useEndpointResolution(
  svgContainer,
  head,
);

const animationEnabled = computed(() => {
  return props.static !== true;
});

const { arrowSvg, textPosition } = useRoughArrow({
  point1: tailPoint,
  point2: headPoint,
  width: Number(props.width ?? 2),
  twoWay: props.twoWay ?? false,
  centerPositionParam: Number(props.arc ?? 0),
  headType: props.headType ?? "line",
  headSize: props.headSize ? Number(props.headSize) : null,
  roughness: props.roughness ? Number(props.roughness) : undefined,
  seed: props.seed ? Number(props.seed) : undefined,
  animation: animationEnabled.value
    ? {
        duration:
          props.animationDuration != null
            ? Number(props.animationDuration)
            : undefined,
        delay:
          props.animationDelay != null
            ? Number(props.animationDelay)
            : undefined,
      }
    : undefined,
  strokeAnimationClass: "animated-rough-arrow-stroke",
  fillAnimationClass: "animated-rough-arrow-fill",
});
</script>

<template>
  <div
    ref="root"
    style="display: contents"
  >
    <!--
    "display: contents" ensures the root element doesn't affect the layout
    so that the positions of the elements injected into the slots are not
    affected by the root element.
  -->
    <svg
      ref="svgContainer"
      :class="props.color ? `text-${props.color}` : ''"
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
      <g v-html="arrowSvg" />
    </svg>
    <div
      v-if="$slots.default && textPosition"
      :class="{ 'animated-rough-arrow-content': animationEnabled }"
      :style="{
        position: 'absolute',
        left: `${textPosition.x}px`,
        top: `${textPosition.y}px`,
        transform: 'translate(-50%, -50%)',
        ...(animationEnabled && {
          animationDuration: `${props.animationDuration ?? DEFAULT_ANIMATION_DURATION}ms`,
          animationDelay: `${props.animationDelay ?? 0}ms`,
          visibility: 'hidden',
        }),
      }"
    >
      <slot />
    </div>

    <SlotAdapter
      v-if="$slots.tail"
      @first-child-element-mounted="onTailElementMounted"
    >
      <slot name="tail" />
    </SlotAdapter>
    <SlotAdapter
      v-if="$slots.head"
      @first-child-element-mounted="onHeadElementMounted"
    >
      <slot name="head" />
    </SlotAdapter>
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
