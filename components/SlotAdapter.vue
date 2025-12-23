<script setup lang="ts">
import {
  ref,
  useTemplateRef,
  getCurrentInstance,
  onMounted,
  isVNode,
  watchEffect,
  type RendererElement,
} from "vue";

const emit = defineEmits<{
  firstChildElementMounted: [element: HTMLElement | null];
}>();

const instance = getCurrentInstance();
const firstChildElementRef = ref<RendererElement>();
onMounted(() => {
  const children = instance?.subTree.children;
  if (children == null) {
    return;
  }
  if (Array.isArray(children)) {
    const slot = children[0];
    if (!isVNode(slot)) {
      return;
    }

    const slotContents = slot.children;

    const firstChildNode = Array.isArray(slotContents)
      ? slotContents[0]
      : slotContents;
    if (!isVNode(firstChildNode)) {
      return;
    }

    const firstChildElement = firstChildNode.el;
    if (firstChildElement == null) {
      return;
    }

    firstChildElementRef.value = firstChildElement;
  }
});

const shouldWrap = ref(false);
watchEffect(() => {
  if (firstChildElementRef.value == null) {
    return;
  }

  if (!(firstChildElementRef.value instanceof HTMLElement)) {
    shouldWrap.value = true;
  }
});

const wrapperRef = useTemplateRef("wrapper");
watchEffect(() => {
  if (shouldWrap.value) {
    emit("firstChildElementMounted", wrapperRef.value);
  }
  if (firstChildElementRef.value instanceof HTMLElement) {
    emit("firstChildElementMounted", firstChildElementRef.value);
  }
});
</script>

<template>
  <slot v-if="!shouldWrap" />
  <span
    v-else
    ref="wrapper"
  >
    <slot />
  </span>
</template>
