// ===== esri =====
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";

// ===== other 3rd party =====
import axios from "axios";

// ===== stores =====
import { useLayerStore } from "@/stores/layerStore";
import { useMapStore } from "@/stores/mapStore";
import { isDefined } from "@/lib/utils/isDefined";
import { parseGeoJsonToArcGIS } from "@/lib/maps/processGeoJson";

// ===== imported types =====
import type { FeatureCollection } from "geojson";

// ===== self-defined types =====
import { Layer } from "@/types/Layer";

/**
 * @description Add layer to map by layer type
 * @param layer - Layer object
 */
export async function addLayerToMap(layer: Layer, map: __esri.Map) {
  if (layer.type === "SceneLayer") {
    const sceneLayer = new SceneLayer({
      url: layer.url,
      popupTemplate: {
        title: "Popup-Title",
        content: "Popup-Content",
      },
    });
    const arcgis_id = sceneLayer.id;
    updateLayerArcgisId(layer, arcgis_id);
    map.add(sceneLayer);
  } else if (layer.type === "FeatureLayer") {
    const { data } = await axios.get(layer.url);

    const parsedData = parseGeoJsonToArcGIS(data);
    if (!isDefined(parsedData)) return;
    const { source, popupTemplate, objectIdField } = parsedData;

    // 添加調試信息
    console.log("FeatureLayer source:", source);
    console.log("FeatureLayer popupTemplate:", popupTemplate);
    console.log("FeatureLayer objectIdField:", objectIdField);

    // const renderer = {
    //   type: "simple",
    //   symbol: {
    //     type: "simple-marker",
    //     style: "square",
    //     size: 5,
    //     color: "maroon",
    //   },
    // };

    const featureLayer = new FeatureLayer({
      source,
      objectIdField: objectIdField,
      popupTemplate: popupTemplate || {
        title: "Feature Information",
        content: "No properties available",
      },
      // renderer: renderer,
    });
    const arcgis_id = featureLayer.id;
    updateLayerArcgisId(layer, arcgis_id);
    map.add(featureLayer);
    const mapStore = useMapStore();

    const extent =
      featureLayer.fullExtent ?? (await featureLayer.queryExtent({ where: "1=1" })).extent;

    mapStore.mapView?.goTo({
      center: [extent.center.x, extent.center.y],
      zoom: 11,
    });
  } else if (layer.type === "GeoJSONLayer") {
    const geojsonLayer = new GeoJSONLayer({ url: layer.url });
    const arcgis_id = geojsonLayer.id;
    updateLayerArcgisId(layer, arcgis_id);
    map.add(geojsonLayer);
  }
}

export async function removeLayerFromMap(layer: Layer, map: __esri.Map) {
  // 先排除不具 arcgis_id 的 layer
  if (!isDefined(layer.arcgis_id)) return;

  if (layer.type === "SceneLayer") {
    const sceneLayer = map.findLayerById(layer.arcgis_id);
    if (!isDefined(sceneLayer)) return;
    map.remove(sceneLayer);
    resetLayerArcgisId(layer);
  } else if (layer.type === "FeatureLayer") {
    const featureLayer = map.findLayerById(layer.arcgis_id);
    if (!isDefined(featureLayer)) return;
    map.remove(featureLayer);
    resetLayerArcgisId(layer);
  } else if (layer.type === "GeoJSONLayer") {
    const geojsonLayer = map.findLayerById(layer.arcgis_id);
    if (!isDefined(geojsonLayer)) return;
    map.remove(geojsonLayer);
    resetLayerArcgisId(layer);
  }
}

/**
 * @description 使用傳入的自訂 Layer 介面的 id 找到並更新 layerStore 中對應 layer 的 arcgis_id
 */
function updateLayerArcgisId(layer: Layer, arcgisId: string): void {
  const layerStore = useLayerStore();
  const updatingLayer = layerStore.layers.find((l) => l.id === layer.id);
  if (!isDefined(updatingLayer)) return;
  updatingLayer.arcgis_id = arcgisId;
}

/**
 * @description 使用傳入的自訂 Layer 介面的 id 找到並重設 layerStore 中對應 layer 的 arcgis_id 為 null
 */
function resetLayerArcgisId(layer: Layer): void {
  const layerStore = useLayerStore();
  const updatingLayer = layerStore.layers.find((l) => l.id === layer.id);
  if (!isDefined(updatingLayer)) return;
  updatingLayer.arcgis_id = null;
}
