<template>
  <div class="button__wrapper" @click="togglePanel" :class="{ 'is-hidden': isHidden }">
    <el-icon :size="20" :color="'#333'">
      <DArrowLeft v-if="isHidden"></DArrowLeft>
      <DArrowRight v-else></DArrowRight>
    </el-icon>
  </div>
</template>
<script setup lang="ts">
  import { DArrowLeft, DArrowRight } from "@element-plus/icons-vue";

  defineProps<{
    isHidden: boolean;
  }>();

  const emit = defineEmits<{
    (e: "toggle-panel"): void;
  }>();

  function togglePanel() {
    emit("toggle-panel");
  }
</script>
<style lang="css" scoped>
  .button__wrapper {
    position: absolute;
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
    top: 20px;
    right: 304px;
    cursor: pointer;
    transition: right 0.3s ease-in-out;
    width: 20px;
    height: 20px;
    background-color: rgb(255 196 8 / 80%);

    &.is-hidden {
      right: 0;
    }

    &:hover {
      background-color: rgb(255 196 8);
    }
  }
</style>
