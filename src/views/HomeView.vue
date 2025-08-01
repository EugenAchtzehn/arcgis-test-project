<template>
  <main class="container">
    <arcgis-map class="map" ref="mapRef" basemap="streets" zoom="14" center="121.55,25.05">
      <arcgis-zoom position="top-left"></arcgis-zoom>
    </arcgis-map>
    <ControlPanel></ControlPanel>
  </main>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import "@arcgis/map-components/components/arcgis-map";
  import "@arcgis/map-components/components/arcgis-zoom";
  import "@arcgis/map-components/components/arcgis-legend";
  import "@arcgis/map-components/components/arcgis-search";
  import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
  import Graphic from "@arcgis/core/Graphic";
  import Point from "@arcgis/core/geometry/Point";
  import { isDefined } from "@/lib/util/isDefined";
  import type { ArcgisMap } from "@arcgis/map-components/components/arcgis-map";

  import ControlPanel from "@/components/ControlPanel.vue";

  const mapRef = ref<HTMLElement | ArcgisMap | null>(null);
  const testPoints = [
    { id: 1, name: "台北101", lon: 121.5654, lat: 25.033 },
    { id: 2, name: "台北車站", lon: 121.5168, lat: 25.0478 },
  ];

  const pointGraphics = testPoints.map((point) => {
    const pointGeometry = new Point({
      longitude: point.lon,
      latitude: point.lat,
    });
    return new Graphic({
      geometry: pointGeometry,
      attributes: { id: point.id, name: point.name },
    });
  });

  const featureLayer = new FeatureLayer({
    source: pointGraphics,
    objectIdField: "id",
    geometryType: "point",
  });

  onMounted(() => {
    if (isDefined(mapRef.value)) {
      // start map manipulation until the map is ready
      mapRef.value.addEventListener("arcgisViewReadyChange", () => {
        const arcgisMapElement = mapRef.value as ArcgisMap;
        const map = arcgisMapElement.map;
        if (isDefined(map)) {
          map.add(featureLayer);
        }
      });
    }
  });
</script>

<style scoped>
  @import "https://js.arcgis.com/calcite-components/3.2.1/calcite.css";
  @import "https://js.arcgis.com/4.33/@arcgis/core/assets/esri/themes/light/main.css";
  @import "https://js.arcgis.com/4.33/map-components/main.css";

  .container {
    display: flex;

    .map {
      height: calc(100vh - var(--navigation-height));
      width: 75%;
    }
  }
</style>
