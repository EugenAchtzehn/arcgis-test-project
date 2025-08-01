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

  function eChangeSceneMode(updatedStatus: boolean) {
    console.log(isSceneMode.value);
  }
</script>
<style lang="css" scoped>
  .controlPanel {
    width: 25%;
    height: 100%;
    background-color: #f0f0f0;

    .controlPanel__title {
      padding: 0.5rem;
      text-align: center;
      font-size: 2rem;
      font-weight: 500;
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
