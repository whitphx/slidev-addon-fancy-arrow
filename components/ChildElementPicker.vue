<script setup lang="ts">
import {
  ref,
  useTemplateRef,
  getCurrentInstance,
  onMounted,
  onUpdated,
  isVNode,
  computed,
  watchEffect,
  type RendererElement,
} from "vue";

const emit = defineEmits<{
  firstChildElementMounted: [element: HTMLElement | null];
}>();

// Trick to get the reference to the element injected to the slot.
// Refs:
// - https://github.com/orgs/vuejs/discussions/8936
// - https://play.vuejs.org/#eNqNUk1vwjAM/StRLhQJFW3cGDBtiAOT9qHBMZeuNRCWJlXiMCTU/z4nXYFpbFqlqqnfe/aznQO/q6p054EP+QihrFSGMBGa0TOamrJqz4XcTa5G/fA5j1x/C/W/FKP+WSr6dbmVFTIH6AMsy8pYZIHMVtaUrJNGZfDRCeqGP+E9ji43eiXX6dYZTR4PoZLgObGlAvtcoTTaCT5kEQlYppT5eIgxtB56bTzfQP5+Ib51+xAT/MWCA7sDwY8YZnYN2MCzxRPs6XwES1N4Rew/wFdwRvngsaHde12Q7TNedDuPA5F6vXSzPYJ2bVPBaGDWkS84DSgM6rfWT3YH6SDqhK5piu1wLy3ZKYOs/++lHZiFVY9Rmam3FjTOtcNM59BjRj8arxEKVjdrjX4FvwnpaI0OWQGrzCtchJrjkCnRXqkuMRpcOh2TEfizQtIV+lgjSbrjCTUedEZBqsw6adWp829LC3Cb5hupCspBypre082qPwHA+gCI
const instance = getCurrentInstance();
const firstChildElementRef = ref<RendererElement>();
const handleDomUpdate = () => {
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
};
onMounted(handleDomUpdate);
onUpdated(handleDomUpdate);

const shouldWrap = computed(() => {
  if (firstChildElementRef.value == null) {
    return false;
  }

  return !(firstChildElementRef.value instanceof HTMLElement);
});

const wrapperRef = useTemplateRef("wrapper");
watchEffect(() => {
  if (shouldWrap.value) {
    emit("firstChildElementMounted", wrapperRef.value);
  } else if (firstChildElementRef.value instanceof HTMLElement) {
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
