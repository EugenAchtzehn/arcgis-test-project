<template>
  <div class="controlPanel">
    <h2 class="controlPanel__title">Control Panel</h2>
    <div class="controlPanel__controls">
      <div class="controlPanel__controls-switcher">
        <span>3D 模式</span>
        <el-switch v-model="isSceneMode" @change="eChangeSceneMode" />
      </div>
      <div>
        {{
          mapStore.currentLng !== 0
            ? mapStore.currentLng.toFixed(6)
            : t("ControlPanel.NoValidLongitude")
        }}
        {{
          mapStore.currentLat !== 0
            ? mapStore.currentLat.toFixed(6)
            : t("ControlPanel.NoValidLatitude")
        }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { isDefined } from "@/lib/utils/isDefined";
  import { useMapStore } from "@/stores/mapStore";

  const mapStore = useMapStore();
  const isSceneMode = ref(false);
  const { t } = useI18n();

  const props = defineProps<{
    mapDiv: HTMLDivElement | null;
  }>();

  function eChangeSceneMode() {
    if (!isDefined(mapStore.mapView) || !isDefined(mapStore.sceneView)) return;
    // 2D to 3D
    if (isSceneMode.value) {
      // update current center and zoom from mapView
      const center = [mapStore.mapView.center.longitude, mapStore.mapView.center.latitude] as [
        number,
        number,
      ];
      const zoom = mapStore.mapView.zoom;
      mapStore.setCurrentCenter(center);
      mapStore.setCurrentZoom(zoom);

      if (!isDefined(mapStore.currentCenter) || !isDefined(mapStore.currentZoom)) return;

      mapStore.mapView.container = null;
      mapStore.sceneView.center = mapStore.currentCenter;
      mapStore.sceneView.zoom = mapStore.currentZoom;
      mapStore.sceneView.container = props.mapDiv;
    }
    // 3D to 2D
    else {
      const center = [mapStore.sceneView.center.longitude, mapStore.sceneView.center.latitude] as [
        number,
        number,
      ];
      const zoom = mapStore.sceneView.zoom;
      mapStore.setCurrentCenter(center);
      mapStore.setCurrentZoom(zoom);

      if (!isDefined(mapStore.currentCenter) || !isDefined(mapStore.currentZoom)) return;

      mapStore.sceneView.container = null;
      mapStore.mapView.center = mapStore.currentCenter;
      mapStore.mapView.zoom = mapStore.currentZoom;
      mapStore.mapView.container = props.mapDiv;
    }
  }
</script>
<style lang="css" scoped>
  .controlPanel {
    width: 25%;
    height: calc(100vh - var(--navigation-height));
    background-color: #f0f0f0;
    overflow-y: auto;

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
