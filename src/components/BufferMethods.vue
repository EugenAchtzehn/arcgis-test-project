<template>
  <el-button type="primary" @click="eClickDrawPolyline">Draw Polyline</el-button>
</template>
<script setup lang="ts">
  import { useMapStore } from "@/stores/mapStore";
  import Draw from "@arcgis/core/views/draw/Draw";
  import Graphic from "@arcgis/core/Graphic";
  const mapStore = useMapStore();

  function eClickDrawPolyline() {
    if (!mapStore.sceneView) return;
    const draw = new Draw({
      view: mapStore.sceneView,
    });

    const action = draw.create("polyline", { mode: "click" });
    action.on("vertex-add", (event: any) => {
      console.log(event);
      measureLine(event.vertices);
    });
    action.on("vertex-remove", (event: any) => {
      console.log(event);
    });
    action.on("vertex-update", (event: any) => {
      console.log(event);
    });
  }

  function measureLine(vertices: any) {
    if (!mapStore.sceneView) return;
    mapStore.sceneView.graphics.removeAll();

    let line = createLine(vertices);
    let graphic = createGraphic(line);
    if (!graphic) return;
    mapStore.sceneView.graphics.add(graphic);
  }

  function createLine(vertices: any) {
    if (!mapStore.sceneView) return;

    let polyline = {
      type: "polyline", // autocasts as new Polyline()
      paths: vertices,
      spatialReference: mapStore.sceneView.spatialReference,
    };
    return polyline;
  }

  function createGraphic(line: any) {
    if (!mapStore.sceneView) return;
    let graphic = new Graphic({
      geometry: line,
    });
    return graphic;
  }
</script>
<style scoped></style>
