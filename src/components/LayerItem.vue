<template>
  <div class="layerItem">
    <div class="layerItem__name">
      {{ layer.name }}
    </div>
    <div class="layerItem__controls">
      <div class="layerItem__control control-add" @click="eClickAddLayer">
        <el-icon :size="16" :color="'#fff'">
          <Plus />
        </el-icon>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  // ===== stores =====
  import { useMapStore } from "@/stores/mapStore";

  // ===== 內部元件、函數 =====
  import { addLayerToMap } from "@/lib/maps/arcgisMapController";
  import { isDefined } from "@/lib/utils/isDefined";

  // ===== 外部元件、函數 =====
  import { Plus } from "@element-plus/icons-vue";

  // ===== 自定義型別 =====
  import { Layer } from "@/types/Layer";

  const mapStore = useMapStore();
  const props = defineProps<{
    layer: Layer;
  }>();

  function eClickAddLayer() {
    if (!isDefined(mapStore.map)) return;
    addLayerToMap(props.layer, mapStore.map);
  }
</script>
<style scoped>
  .layerItem {
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

      .control-add {
        background-color: #409eff;
      }
    }
  }
</style>
