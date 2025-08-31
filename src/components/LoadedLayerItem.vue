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
      <div class="layerItem__control control-view" @click="eChangeVisible">
        <el-icon :size="16" :color="'#fff'">
          <View v-if="props.layer.visible" />
          <Hide v-else />
        </el-icon>
      </div>
      <!-- Delete this layer -->
      <div class="layerItem__control control-delete" @click="eClickRemoveLayer">
        <el-icon :size="16" :color="'#fff'">
          <Delete />
        </el-icon>
      </div>
    </div>

    <!-- <el-switch v-model="props.layer.visible" @change="eChangeVisible"></el-switch> -->
  </div>
</template>
<script setup lang="ts">
  import { Layer } from "@/types/Layer";
  import { useMapStore } from "@/stores/mapStore";
  import { isDefined } from "@/lib/utils/isDefined";
  import { addLayerToMap, removeLayerFromMap } from "@/lib/maps/arcgisMapController";
  import { buildUrlForLocalData } from "@/lib/utils/buildUrl";
  import { Delete, Hide, View } from "@element-plus/icons-vue";

  const layerActive = ref<boolean>(false);
  const mapStore = useMapStore();
  const props = defineProps<{
    layer: Layer;
  }>();

  function eChangeVisible() {
    if (props.layer.isLocal) {
      // const builtUrl = buildUrlForLocalData(props.layer.url);
    }
  }

  function eClickRemoveLayer() {
    if (props.layer.isLocal) {
      // const builtUrl = buildUrlForLocalData(props.layer.url);
    }
  }

  // 2D 模式下不顯示 3D 圖層，3D 模式下，顯示所有圖層
  function validForCurrentMode(layer: Layer) {
    if (mapStore.currentMode === "MapView") {
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
