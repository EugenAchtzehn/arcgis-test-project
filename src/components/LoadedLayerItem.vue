<template>
  <div class="layerItem" v-if="validForCurrentMode(props.layer)">
    <!-- <el-checkbox
      v-model="layerActive"
      @change="eChangeActive"
      :label="props.layer.name"
    ></el-checkbox> -->
    <div class="layerItem__name">{{ props.layer.name }}</div>
    <div class="layerItem__controls">
      <!-- View or Hide -->
      <div class="layerItem__control control-view" @click="eClickViewOrHide">
        <el-icon :size="16" :color="'#fff'">
          <Hide v-if="props.layer.visible" />
          <View v-else />
        </el-icon>
      </div>
      <!-- Delete this layer -->
      <div class="layerItem__control control-delete" @click="eClickRemoveLayer">
        <el-icon :size="16" :color="'#fff'">
          <Delete />
        </el-icon>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import type { LoadedLayer } from "@/types/Layer";
  import { useMapStore } from "@/stores/mapStore";
  import { isDefined } from "@/lib/utils/isDefined";
  import { removeLayerFromMap, showLayer, hideLayer } from "@/lib/maps/arcgisMapController";
  import { Delete, Hide, View } from "@element-plus/icons-vue";

  const mapStore = useMapStore();
  const props = defineProps<{
    layer: LoadedLayer;
  }>();

  function eClickViewOrHide() {
    if (!isDefined(mapStore.map)) return;

    if (props.layer.visible) {
      hideLayer(props.layer, mapStore.map);
    } else {
      showLayer(props.layer, mapStore.map);
    }
  }

  function eClickRemoveLayer() {
    if (!isDefined(mapStore.map)) return;
    removeLayerFromMap(props.layer, mapStore.map);
  }

  // 2D 模式下不顯示 3D 圖層，3D 模式下，顯示所有圖層
  function validForCurrentMode(layer: LoadedLayer) {
    if (mapStore.currentMode === "MapView") {
      return !layer.onlyThreeD;
    } else {
      return true;
    }
  }
</script>
<style scoped>
  .layerItem {
    /* box-shadow */
    display: flex;
    align-items: center;
    cursor: default;
    padding: 8px 6px;
    border: 1px solid #ccc;
    background-color: #e8f5e9;

    .layerItem__name {
      display: flex;
      flex: 1;
      align-items: center;
      color: #333;
      font-size: 14px;
    }

    .layerItem__controls {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      width: 60px;

      .layerItem__control {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        width: 24px;
        height: 24px;
        border-radius: 4px;
      }

      .control-view {
        background-color: #409eff;
      }

      .control-delete {
        background-color: #f56c6c;
      }
    }
  }
</style>
