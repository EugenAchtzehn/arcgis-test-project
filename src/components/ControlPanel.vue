<template>
  <div class="controlPanel">
    <h2 class="controlPanel__title">Control Panel</h2>
    <div class="controlPanel__controls">
      <div class="controlPanel__controls-switcher">
        <el-radio-group
          class="DimensionControl-RadioGroup"
          v-model="isSceneMode"
          @change="eChangeSceneMode"
        >
          <el-radio-button class="DimensionControl-RadioButton" label="2D" value="mapView" />
          <el-radio-button class="DimensionControl-RadioButton" label="3D" value="sceneView" />
        </el-radio-group>
      </div>
      <section v-for="layer in layerStore.layers" :key="layer.id">
        <!-- <LayerItem :model-value="layer" /> -->
        <layer-item :layer="layer" />
      </section>
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
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { isDefined } from "@/lib/utils/isDefined";
  import { useMapStore } from "@/stores/mapStore";
  import { useLayerStore } from "@/stores/layerStore";

  const mapStore = useMapStore();
  const layerStore = useLayerStore();
  const isSceneMode = ref("mapView");
  const { t } = useI18n();

  const props = defineProps<{
    mapDiv: HTMLDivElement | null;
  }>();

  function eChangeSceneMode() {
    console.log(isSceneMode.value);
    if (!isDefined(mapStore.mapView) || !isDefined(mapStore.sceneView)) return;
    // 2D to 3D
    if (isSceneMode.value === "sceneView") {
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
    if (isSceneMode.value === "mapView") {
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
    position: absolute;
    top: 4px;
    right: 4px;
    bottom: 4px;
    width: 300px;
    height: calc(100% - 8px);
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

      .DimensionControl-RadioGroup {
        display: flex;
        width: 100%;

        .DimensionControl-RadioButton {
          flex-grow: 1;
        }

        :deep(.el-radio-button__inner) {
          width: 100%;
        }
      }
    }
  }
</style>
