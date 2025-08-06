<template>
  <div class="layerItem">
    <el-checkbox
      v-model="layerActive"
      @change="eChangeActive"
      :label="props.layer.name"
    ></el-checkbox>
    <el-switch v-model="props.layer.visible" @change="eChangeVisible"></el-switch>
  </div>
</template>
<script setup lang="ts">
  import { Layer } from "@/types/Layer";
  import { useMapStore } from "@/stores/mapStore";
  import { useLayerStore } from "@/stores/layerStore";
  import { isDefined } from "@/lib/utils/isDefined";
  import { addLayerToMap } from "@/lib/maps/addLayerToMap";
  import { removeLayerFromMap } from "@/lib/maps/removeLayerFromMap";
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
      const builtUrl = buildUrlForLocalData(props.layer.url);
      console.log(builtUrl);
    }
    // console.log(props.layer.visible);
  }

  async function eChangeActive() {
    if (props.layer.type === "SceneLayer") {
      if (layerActive.value && isDefined(mapStore.map)) {
        // addLayerToMap(props.layer);
        const layer = new SceneLayer({
          url: props.layer.url,
          popupTemplate: {
            title: "Popup Title",
            content: "Popup Content",
          },
        });
        const updatingLayer = layerStore.layers.find((layer) => layer.id === props.layer.id);
        if (!isDefined(updatingLayer)) return;
        updatingLayer.arcgis_id = layer.id;
        mapStore.map.add(layer);
      } else if (isDefined(mapStore.map) && isDefined(props.layer.arcgis_id)) {
        // remove layer from map
        const targetLayer = mapStore.map.findLayerById(props.layer.arcgis_id);
        if (!isDefined(targetLayer)) return;
        mapStore.map.remove(targetLayer);
        // set arcgis_id to null from layerStore, because it has been removed from map
        const updatingLayer = layerStore.layers.find((layer) => layer.id === props.layer.id);
        if (!isDefined(updatingLayer)) return;
        updatingLayer.arcgis_id = null;
      }
    } else if (props.layer.type === "FeatureLayer") {
      // TODO: repair here
      const { data } = await axios.get(props.layer.url);
      const source = data.features.map((f: any, idx: number) => {
        return {
          geometry: {
            type: f.geometry.type.toLowerCase(),
            x: f.geometry.coordinates[0],
            y: f.geometry.coordinates[1],
          },
          attributes: {
            ...f.properties,
          },
        };
      });
      console.log(source);
      if (layerActive.value && isDefined(mapStore.map)) {
        const layer = new FeatureLayer({
          source: source,
          objectIdField: "NO",
          popupTemplate: {
            title: "Popup Title",
            content: "Popup Content",
          },
        });
        const updatingLayer = layerStore.layers.find((layer) => layer.id === props.layer.id);
        if (!isDefined(updatingLayer)) return;
        updatingLayer.arcgis_id = layer.id;
        mapStore.map.add(layer);
      } else if (isDefined(mapStore.map) && isDefined(props.layer.arcgis_id)) {
      }
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
    background-color: #fff;

    .layerItem__header {
      display: flex;
    }
  }
</style>
