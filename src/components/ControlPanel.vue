<template>
  <div class="controlPanel" :class="{ 'is-hidden': isHidden }">
    <h2 class="controlPanel__title">Control Panel</h2>
    <div class="controlPanel__controls">
      <div class="controlPanel__controls-switcher">
        <el-radio-group
          class="DimensionControl-RadioGroup"
          v-model="mapStore.currentMode"
          @change="eChangeMode"
        >
          <el-radio-button class="DimensionControl-RadioButton" label="3D" value="SceneView" />
          <el-radio-button class="DimensionControl-RadioButton" label="2D" value="MapView" />
        </el-radio-group>
      </div>
      <div class="tabs__wrapper">
        <!-- 圖層列表 -->
        <layer-list v-if="uiStore.activeTab === 'layerList'"></layer-list>
        <!-- 已加入圖層 -->
        <loaded-layer-list v-if="uiStore.activeTab === 'loadedLayers'"></loaded-layer-list>
        <!-- 環域方法 -->
        <buffer-methods v-if="uiStore.activeTab === 'bufferMethods'"></buffer-methods>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { useMapStore } from "@/stores/mapStore";
  import { useUiStore } from "@/stores/uiStore";

  import { isDefined } from "@/lib/utils/isDefined";

  const mapStore = useMapStore();
  const uiStore = useUiStore();
  const { t } = useI18n();

  const props = defineProps<{
    mapDiv: HTMLDivElement | null;
    isHidden: boolean;
  }>();

  // v-model 已經改了 store 此函數才觸發
  function eChangeMode() {
    if (!isDefined(mapStore.map) || !isDefined(mapStore.mapView) || !isDefined(mapStore.sceneView))
      return;

    // called when 2D to 3D
    if (mapStore.currentMode === "SceneView") {
      // update current center and zoom from mapView
      const center = [mapStore.mapView.center.longitude, mapStore.mapView.center.latitude] as [
        number,
        number,
      ];
      const zoom = mapStore.mapView.zoom;
      mapStore.setCurrentCenter(center);
      mapStore.setCurrentZoom(zoom);

      if (!isDefined(mapStore.currentCenter) || !isDefined(mapStore.currentZoom)) return;

      // set 3D only layers visible
      // setVisible3DLayers(layerStore.layers, mapStore.map);

      mapStore.mapView.container = null;
      mapStore.sceneView.center = mapStore.currentCenter;
      mapStore.sceneView.zoom = mapStore.currentZoom;
      mapStore.sceneView.container = props.mapDiv;
    }

    // called when 3D to 2D
    if (mapStore.currentMode === "MapView") {
      const center = [mapStore.sceneView.center.longitude, mapStore.sceneView.center.latitude] as [
        number,
        number,
      ];
      const zoom = mapStore.sceneView.zoom;
      mapStore.setCurrentCenter(center);
      mapStore.setCurrentZoom(zoom);

      if (!isDefined(mapStore.currentCenter) || !isDefined(mapStore.currentZoom)) return;

      // set 3D only layers invisible
      // setInvisible3DLayers(layerStore.layers, mapStore.map);

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
    bottom: 26px;
    transition: all 0.3s ease-in-out;
    width: 300px;
    border-radius: 0.25rem;

    /* 常磐 */
    background-color: #1b813e;

    &.is-hidden {
      right: -300px;
    }

    .controlPanel__title {
      padding: 0.5rem;
      color: #fff;
      text-align: center;
      font-weight: 500;
    }

    .controlPanel__controls {
      height: calc(100% - 58px);

      .controlPanel__controls-switcher {
        padding: 0.5rem;

        .DimensionControl-RadioGroup {
          display: flex;
          width: 100%;

          .DimensionControl-RadioButton {
            flex-grow: 1;
          }

          :deep(.el-radio-button__inner) {
            width: 100%;
            border-color: rgb(212 212 212);
            border-radius: 0;
          }
        }
      }

      .tabs__wrapper {
        /* 扣除 2D/3D 切換元件和上下 margin */
        height: calc(100% - 48px - 1rem);
        margin: 0.5rem 0.25rem 0.5rem 0;
        padding: 0 0.25rem 0 0.5rem;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        &::-webkit-scrollbar-thumb {
          border-radius: 2px;
          background-color: #aaa;
        }

        &::-webkit-scrollbar-track {
          border-radius: 2px;
          background-color: transparent;
        }
      }
    }
  }
</style>
