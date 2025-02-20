<script setup lang="ts">
import { ref } from "vue";
import { slideWidth, slideHeight } from "@slidev/client";
import { useElementPosition, type SnapPosition } from "./use-element-position";
import { useRoughArrow } from "./use-rough-arrow";

const props = defineProps<{
  id1?: string;
  id2?: string;
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
  arrowHeadType?: "line" | "polygon";
  arrowHeadSize?: number | string;
  roughness?: number | string;
  seed?: number | string;
}>();

const point1 = props.id1
  ? useElementPosition(props.id1, props.pos1)
  : ref({ x: Number(props.x1 ?? 0), y: Number(props.y1 ?? 0) });
const point2 = props.id2
  ? useElementPosition(props.id2, props.pos2)
  : ref({ x: Number(props.x2 ?? 0), y: Number(props.y2 ?? 0) });

const roughSvg = useRoughArrow({
  point1,
  point2,
  width: Number(props.width ?? 2),
  twoWay: props.twoWay ?? false,
  centerPositionParam: Number(props.arc ?? 0),
  arrowHeadType: props.arrowHeadType ?? "line",
  arrowHeadSize: props.arrowHeadSize ? Number(props.arrowHeadSize) : null,
  roughness: props.roughness ? Number(props.roughness) : undefined,
  seed: props.seed ? Number(props.seed) : undefined,
});
</script>

<template>
  <svg
    v-if="point1 && point2"
    :class="['absolute left-0 top-0', props.color && `text-${props.color}`]"
    :width="slideWidth"
    :height="slideHeight"
  >
    <g v-html="roughSvg" />
  </svg>
</template>
