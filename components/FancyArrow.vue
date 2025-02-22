<script setup lang="ts">
import { ref } from "vue";
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

const container = ref<SVGSVGElement>();

const point1 = props.id1
  ? useElementPosition(container, props.id1, props.pos1)
  : ref({ x: Number(props.x1 ?? 0), y: Number(props.y1 ?? 0) });
const point2 = props.id2
  ? useElementPosition(container, props.id2, props.pos2)
  : ref({ x: Number(props.x2 ?? 0), y: Number(props.y2 ?? 0) });

const { arcSvg, textPosition } = useRoughArrow({
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
  <!-- Use use <div v-if> as a root element here because <template v-if> doesn't work with v-click on Slidev -->
  <div v-if="point1 && point2" style="position: absolute; top: 0; left: 0">
    <svg
      ref="container"
      :class="props.color ? `text-${props.color}` : ''"
      style="
        position: absolute;
        top: 0;
        left: 0;
        width: 10px;
        height: 10px;
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
