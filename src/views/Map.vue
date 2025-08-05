<template>
  <main class="container">
    <div class="map" ref="mapDiv"></div>
    <control-panel :map-div="mapDiv"></control-panel>
  </main>
</template>

<script setup lang="ts">
  import { setupMap } from "@/composables/useMap";
  import { useLayerStore } from "@/stores/layerStore";
  import axios from "axios";

  const layerStore = useLayerStore();

  onMounted(async () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    // [!] if baseUrl is only '/', then skip it.
    const skipSlashBaseUrl = baseUrl === "/" ? "" : baseUrl;
    const { data: mapConfig } = await axios.get(`${skipSlashBaseUrl}/data/MapConfig.json`);
    layerStore.setLayers(mapConfig.layers);
  });

  const { mapDiv } = setupMap();
</script>

<style scoped>
  @import url("https://js.arcgis.com/4.33/@arcgis/core/assets/esri/themes/light/main.css");

  .container {
    position: relative;
    display: flex;
    height: calc(100vh - var(--navigation-height));

    .map {
      width: 100%;
      height: 100%;
    }
  }
</style>
