<template>
  <main class="container">
    <div class="map" ref="mapDiv"></div>
    <control-panel :map-div="mapDiv" :is-hidden="isControlPanelHidden"></control-panel>
    <toggle-panel-button
      :is-hidden="isControlPanelHidden"
      @toggle-panel="toggleControlPanel"
    ></toggle-panel-button>
    <map-footer></map-footer>
  </main>
</template>

<script setup lang="ts">
  import { setupMap } from "@/composables/useMap";
  import { useLayerStore } from "@/stores/layerStore";
  import axios from "axios";
  import MapFooter from "@/components/MapFooter.vue";

  const layerStore = useLayerStore();
  const isControlPanelHidden = ref(false);

  function toggleControlPanel() {
    isControlPanelHidden.value = !isControlPanelHidden.value;
  }

  onMounted(async () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const { data: mapConfig } = await axios.get(`${baseUrl}data/MapConfig.json`);
    layerStore.setLayers(mapConfig.layers);
  });

  const { mapDiv } = setupMap();
</script>

<style scoped>
  @import url("https://js.arcgis.com/4.33/@arcgis/core/assets/esri/themes/light/main.css");

  .container {
    position: relative;
    display: flex;
    overflow: hidden;
    width: 100vw;
    height: calc(100vh - var(--navigation-height));

    .map {
      width: 100%;
      height: 100%;
    }
  }
</style>
