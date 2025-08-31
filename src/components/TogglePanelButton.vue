<template>
  <div class="button__wrapper" @click="togglePanel" :class="{ 'is-hidden': isHidden }">
    <el-icon :size="16" color="#333">
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
    top: 20px;
    right: 304px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: right 0.3s ease-in-out;
    width: 24px;
    height: 24px;
    background-color: #ffc408;
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;

    &.is-hidden {
      right: 0;
    }

    &:hover {
      background-color: #ffd944;
    }
  }
</style>
