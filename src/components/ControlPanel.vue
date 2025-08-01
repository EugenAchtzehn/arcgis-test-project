<template>
  <div class="controlPanel">
    <h2 class="controlPanel__title">Control Panel</h2>
    <div class="controlPanel__controls">
      <el-button type="primary" @click="eClickIncrement">按我加一</el-button>
      <div>{{ num }}</div>
      <div class="controlPanel__controls-switcher">
        <span>3D 模式</span>
        <el-switch v-model="isSceneMode" @change="eChangeSceneMode" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  const num = ref(0);
  const isSceneMode = ref(false);

  function eClickIncrement() {
    num.value++;
  }

  function eChangeSceneMode() {
    console.log(isSceneMode.value);
  }
</script>
<style lang="css" scoped>
  .controlPanel {
    width: 25%;
    height: calc(100vh - var(--navigation-height));
    overflow-y: auto;
    background-color: #f0f0f0;

    .controlPanel__title {
      font-size: 2rem;
      font-weight: 500;
      text-align: center;
      padding: 0.5rem;
    }

    .controlPanel__controls {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;

      .controlPanel__controls-switcher {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
    }
  }
</style>
