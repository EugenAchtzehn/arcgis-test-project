<template>
  <div class="layerItem">
    <div class="layerItem__name">{{ layer.name }}</div>
    <el-switch v-model="layer.visible" @change="eChangeVisible"></el-switch>
  </div>
</template>
<script setup lang="ts">
  import { Layer } from "@/types/Layer";

  const props = defineProps<{
    layer: Layer;
  }>();

  function eChangeVisible() {
    console.log(props.layer.visible);
  }
</script>
<style scoped>
  .layerItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
