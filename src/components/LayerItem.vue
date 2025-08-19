<template>
  <div class="layerItem" v-if="validForCurrentMode(props.layer)">
    <el-checkbox
      v-model="layerActive"
      @change="eChangeActive"
      :label="props.layer.name"
    ></el-checkbox>
    <!-- <el-switch v-model="props.layer.visible" @change="eChangeVisible"></el-switch> -->
  </div>
</template>
<script setup lang="ts">
  import { Layer } from "@/types/Layer";
  import { useMapStore } from "@/stores/mapStore";
  import { useLayerStore } from "@/stores/layerStore";
  import { isDefined } from "@/lib/utils/isDefined";
  import { addLayerToMap, removeLayerFromMap } from "@/lib/maps/arcgisMapController";
  import { buildUrlForLocalData } from "@/lib/utils/buildUrl";

  import SceneLayer from "@arcgis/core/layers/SceneLayer";
  import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
  import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
  import Graphic from "@arcgis/core/Graphic.js";
  import axios from "axios";

  const layerActive = ref<boolean>(false);
  const mapStore = useMapStore();
  const layerStore = useLayerStore();
  const props = defineProps<{
    layer: Layer;
  }>();

  function eChangeVisible() {
    if (props.layer.isLocal) {
      // const builtUrl = buildUrlForLocalData(props.layer.url);
    }
  }

  // 3D 模式下，顯示所有圖層
  function validForCurrentMode(layer: Layer) {
    if (mapStore.currentMode === "TwoD") {
      return !layer.onlyThreeD;
    } else {
      return true;
    }
  }

  async function eChangeActive() {
    if (!isDefined(mapStore.map)) return;

    if (layerActive.value) {
      await addLayerToMap(props.layer, mapStore.map);
    } else {
      await removeLayerFromMap(props.layer, mapStore.map);
    }
  }
</script>
<style scoped>
  .layerItem {
    /* box-shadow */
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    border: 0.6667px solid rgb(212 212 212);
    background-color: #e8f5e9;

    .layerItem__header {
      display: flex;
    }
  }
</style>
