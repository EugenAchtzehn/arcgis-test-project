<template>
  <main class="container">
    <div class="map" ref="mapDiv"></div>
    <ControlPanel :map-div="mapDiv"></ControlPanel>
  </main>
</template>

<script setup lang="ts">
  import { setupMap } from "@/composables/useMap";
  import ControlPanel from "@/components/ControlPanel.vue";
  import axios from "axios";

  onBeforeMount(async () => {
    const { data: mapConfig } = await axios.get("/data/MapConfig.json");
    console.log(mapConfig);
  });

  const { mapDiv } = setupMap();
</script>

<style scoped>
  @import url("https://js.arcgis.com/4.33/@arcgis/core/assets/esri/themes/light/main.css");

  .container {
    display: flex;

    .map {
      width: 75%;
      height: calc(100vh - var(--navigation-height));
    }
  }
</style>
