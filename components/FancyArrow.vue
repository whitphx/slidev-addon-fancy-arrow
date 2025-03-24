<script setup lang="ts">
import { ref, computed } from "vue";
import { useElementPosition, type SnapPosition } from "./use-element-position";
import { useRoughArrow } from "./use-rough-arrow";

const props = defineProps<{
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

const query1 = computed(() => {
  if (props.q1) return props.q1;
  if (props.id1) return `#${props.id1}`;
  return undefined;
});
const query2 = computed(() => {
  if (props.q2) return props.q2;
  if (props.id2) return `#${props.id2}`;
  return undefined;
});

const point1 = query1.value
  ? useElementPosition(slideContainer, svgContainer, query1.value, props.pos1)
  : ref({ x: Number(props.x1 ?? 0), y: Number(props.y1 ?? 0) });
const point2 = query2.value
  ? useElementPosition(slideContainer, svgContainer, query2.value, props.pos2)
  : ref({ x: Number(props.x2 ?? 0), y: Number(props.y2 ?? 0) });

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
