<script setup lang="ts">
import { ref, computed, type Ref } from "vue";
import {
  compileArrowEndpointProps,
  type SnapAnchorPoint,
} from "./parse-option";
import { useEndpointResolution } from "./use-element-position";
import { useRoughArrow, type AbsolutePosition } from "./use-rough-arrow";

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
  animated?: boolean;
  animationDuration?: number | string;
  animationDelay?: number | string;
}>();

const root = ref<HTMLElement>();
const slideContainer = computed(() => {
  return root.value?.closest(".slidev-page") ?? undefined;
});

const svgContainer = ref<SVGSVGElement>();

const endpoint1 = computed(() =>
  compileArrowEndpointProps({
    shorthand: props.from,
    q: props.q1,
    id: props.id1,
    pos: props.pos1,
    x: props.x1,
    y: props.y1,
  }),
);
const endpoint2 = computed(() =>
  compileArrowEndpointProps({
    shorthand: props.to,
    q: props.q2,
    id: props.id2,
    pos: props.pos2,
    x: props.x2,
    y: props.y2,
  }),
);

const point1: Ref<AbsolutePosition | undefined> = useEndpointResolution(
  slideContainer,
  svgContainer,
  endpoint1,
  {
    self: root,
    direction: "prev",
  },
);
const point2: Ref<AbsolutePosition | undefined> = useEndpointResolution(
  slideContainer,
  svgContainer,
  endpoint2,
  {
    self: root,
    direction: "next",
  },
);

const { arrowSvg, textPosition } = useRoughArrow({
  point1,
  point2,
  width: Number(props.width ?? 2),
  twoWay: props.twoWay ?? false,
  centerPositionParam: Number(props.arc ?? 0),
  headType: props.headType ?? "line",
  headSize: props.headSize ? Number(props.headSize) : null,
  roughness: props.roughness ? Number(props.roughness) : undefined,
  seed: props.seed ? Number(props.seed) : undefined,
  animation:
    props.animated || props.animationDuration || props.animationDelay
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
  strokeAnimationKeyframeName: "rough-arrow-dash",
  fillAnimationKeyframeName: "rough-arrow-fill",
});
</script>

<template>
  <div ref="root" style="position: absolute; top: 0; left: 0">
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
      <g v-html="arrowSvg" />
    </svg>
    <div
      v-if="$slots.default && textPosition"
      :style="{
        position: 'absolute',
        left: `${textPosition.x}px`,
        top: `${textPosition.y}px`,
        transform: 'translate(-50%, -50%)',
      }"
    >
      <slot />
    </div>
  </div>
</template>

<style>
@keyframes rough-arrow-dash {
  from {
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
</style>
