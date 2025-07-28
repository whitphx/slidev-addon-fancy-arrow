<script setup lang="ts">
import { ref, computed, Ref } from "vue";
import { compileArrowEndpointProps } from "./parse-option";
import { useElementPosition, type SnapPosition } from "./use-element-position";
import { useRoughArrow, type AbsolutePosition } from "./use-rough-arrow";

const props = defineProps<{
  from?: string; // Shorthand for (q1 and pos1) or (x1 and y1)
  to?: string; // Shorthand for (q2 and pos2) or (x2 and y2)
  q1?: string;
  q2?: string;
  id1?: string; // Deprecated
  id2?: string; // Deprecated
  pos1?: SnapPosition;
  pos2?: SnapPosition;
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
}>();

const root = ref<HTMLElement>();
const slideContainer = computed(() => {
  return root.value?.closest(".slidev-page") ?? undefined;
});

const svgContainer = ref<SVGSVGElement>();

const from = computed(() =>
  compileArrowEndpointProps({
    shorthand: props.from,
    q: props.q1,
    id: props.id1,
    pos: props.pos1,
    x: props.x1,
    y: props.y1,
  }),
);
const to = computed(() =>
  compileArrowEndpointProps({
    shorthand: props.to,
    q: props.q2,
    id: props.id2,
    pos: props.pos2,
    x: props.x2,
    y: props.y2,
  }),
);

const point1: Ref<AbsolutePosition | undefined> =
  from.value && "query" in from.value
    ? useElementPosition(
        slideContainer,
        svgContainer,
        from.value.query,
        from.value.snapPosition,
      )
    : ref(from.value);
const point2: Ref<AbsolutePosition | undefined> =
  to.value && "query" in to.value
    ? useElementPosition(
        slideContainer,
        svgContainer,
        to.value.query,
        to.value.snapPosition,
      )
    : ref(to.value);

const { arcSvg, textPosition } = useRoughArrow({
  point1,
  point2,
  width: Number(props.width ?? 2),
  twoWay: props.twoWay ?? false,
  centerPositionParam: Number(props.arc ?? 0),
  headType: props.headType ?? "line",
  headSize: props.headSize ? Number(props.headSize) : null,
  roughness: props.roughness ? Number(props.roughness) : undefined,
  seed: props.seed ? Number(props.seed) : undefined,
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
      <g v-html="arcSvg" />
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
