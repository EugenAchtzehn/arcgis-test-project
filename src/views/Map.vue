<template>
  <main class="container">
    <div class="map" ref="mapDiv"></div>
    <ControlPanel :map-div="mapDiv"></ControlPanel>
  </main>
</template>

<script setup lang="ts">
  import Map from "@arcgis/core/Map";
  import MapView from "@arcgis/core/views/MapView";
  import SceneView from "@arcgis/core/views/SceneView";
  import Point from "@arcgis/core/geometry/Point";
  import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
  import Graphic from "@arcgis/core/Graphic";
  import { isDefined } from "@/lib/utils/isDefined";
  import { useMapStore } from "@/stores/mapStore";

  const mapStore = useMapStore();

  const mapDiv = ref<HTMLDivElement | null>(null);

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
      basemap: "topo-vector",
    });

    const initialCenter = [121.55, 25.05] as [number, number];
    const initialZoom = 14;

    // console.log(initialCenter, initialZoom);

    mapStore.setCurrentCenter(initialCenter);
    mapStore.setCurrentZoom(initialZoom);

    // guard
    if (!isDefined(mapStore.currentCenter) || !isDefined(mapStore.currentZoom)) return;

    const mapView = new MapView({
      container: mapDiv.value,
      map: webMap,
      center: initialCenter,
      zoom: initialZoom,
      constraints: {
        rotationEnabled: false,
      },
    });

    const sceneView = new SceneView({
      container: null,
      map: webMap,
      center: initialCenter,
      zoom: initialZoom,
    });

    webMap.add(featureLayer);
    mapStore.setMap(webMap);
    debugger;
    mapStore.setMapView(mapView);
    mapStore.setSceneView(sceneView);
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
