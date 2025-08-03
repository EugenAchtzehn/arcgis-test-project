<template>
  <main class="container">
    <div class="map" ref="mapDiv"></div>
    <ControlPanel :map-div="mapDiv"></ControlPanel>
  </main>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import Map from "@arcgis/core/Map";
  import MapView from "@arcgis/core/views/MapView";
  import WebMap from "@arcgis/core/WebMap";
  import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
  import Graphic from "@arcgis/core/Graphic";
  import Point from "@arcgis/core/geometry/Point";
  import { isDefined } from "@/lib/util/isDefined";

  import { useMapStore } from "@/stores/mapStore";
  import ControlPanel from "@/components/ControlPanel.vue";

  const mapStore = useMapStore();

  const mapDiv = ref(null);

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
    const webMap = new Map({
      basemap: "streets",
    });

    const view = new MapView({
      container: mapDiv.value,
      map: webMap,
      zoom: 14,
      center: [121.55, 25.05],
    });

    webMap.add(featureLayer);
    mapStore.setMap(webMap);
    mapStore.setMapView(view);
  });
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
