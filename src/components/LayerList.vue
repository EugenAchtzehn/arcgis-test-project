<template>
  <div class="layerList">
    <layer-item
      class="layerItem"
      v-for="layer in layerStore.layers"
      :key="layer.id"
      :layer="layer"
    ></layer-item>
  </div>
</template>

<script setup lang="ts">
  import { useLayerStore } from "@/stores/layerStore";
  const layerStore = useLayerStore();
</script>

<style scoped>
  .layerList__wrapper {
    .layerItem {
      margin-bottom: 0.25rem;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
</style>
