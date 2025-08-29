// ===== esri =====
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import IntegratedMesh3DTilesLayer from "@arcgis/core/layers/IntegratedMesh3DTilesLayer";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import Extent from "@arcgis/core/geometry/Extent";

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
 * @description Toggle layer visibility on map (add if not present, remove if present)
 * @param layer - Layer object
 * @param map - ArcGIS Map instance
 * @returns Promise<boolean> - true if layer was added, false if removed
 */
export async function toggleLayer(layer: Layer, map: __esri.Map): Promise<boolean> {
  // Check if layer is already on map
  if (isDefined(layer.arcgis_id) && map.findLayerById(layer.arcgis_id)) {
    // Layer exists, remove it
    await removeLayerFromMap(layer, map);
    return false;
  } else {
    // Layer doesn't exist, add it
    await addLayerToMap(layer, map);
    return true;
  }
}

// 只調整 visible 無法處理 console 中的錯誤，整體機制待改善
// 可能要重新 create 跟 remove 一次
export function setVisible3DLayers(layers: Layer[], map: __esri.Map): void {
  const threeDOnlyLayers = layers.filter((l) => l.onlyThreeD);
  threeDOnlyLayers.forEach((l) => {
    const layer = map.findLayerById(l.arcgis_id);
    if (isDefined(layer)) layer.visible = true;
  });
}

export function setInvisible3DLayers(layers: Layer[], map: __esri.Map): void {
  const threeDOnlyLayers = layers.filter((l) => l.onlyThreeD);
  threeDOnlyLayers.forEach((l) => {
    const layer = map.findLayerById(l.arcgis_id);
    if (isDefined(layer)) layer.visible = false;
  });
}

/**
 * @description Add layer to map by layer type
 * @param layer - Layer object
 * @param map - ArcGIS Map instance
 */
export async function addLayerToMap(layer: Layer, map: __esri.Map): Promise<void> {
  let arcgisLayer: __esri.Layer;

  switch (layer.type) {
    case "SceneLayer":
      arcgisLayer = createSceneLayer(layer);
      break;
    case "FeatureLayer":
      arcgisLayer = await createFeatureLayer(layer);
      break;
    case "GeoJSONLayer":
      arcgisLayer = createGeoJSONLayer(layer);
      break;
    case "WMTSLayer":
      arcgisLayer = createWMTSLayer(layer);
      break;
    case "WMSLayer":
      arcgisLayer = createWMSLayer(layer);
      break;
    case "IntegratedMesh3DTilesLayer":
      arcgisLayer = createIntegratedMesh3DTilesLayer(layer);
      break;
    default:
      console.warn(`Unsupported layer type: ${layer.type}`);
      return;
  }

  if (arcgisLayer) {
    updateLayerArcgisId(layer, arcgisLayer.id);
    map.add(arcgisLayer);

    // Handle map view extent for layers that support queryExtent
    if (layer.type === "FeatureLayer" || layer.type === "GeoJSONLayer") {
      await handleLayerExtent(arcgisLayer);
    }
  }
}

/**
 * @description Remove layer from map
 * @param layer - Layer object
 * @param map - ArcGIS Map instance
 */
export async function removeLayerFromMap(layer: Layer, map: __esri.Map): Promise<void> {
  if (!isDefined(layer.arcgis_id)) return;

  const arcgisLayer = map.findLayerById(layer.arcgis_id);
  if (!isDefined(arcgisLayer)) return;

  map.remove(arcgisLayer);
  resetLayerArcgisId(layer);
}

// ===== Layer Creation Helper Functions =====

/**
 * Create SceneLayer
 */
function createSceneLayer(layer: Layer): SceneLayer {
  return new SceneLayer({
    url: layer.url,
    popupTemplate: {
      title: "Popup-Title",
      content: "Popup-Content",
    },
  });
}

/**
 * Create IntegratedMesh3DTilesLayer
 */
function createIntegratedMesh3DTilesLayer(layer: Layer): IntegratedMesh3DTilesLayer {
  return new IntegratedMesh3DTilesLayer({ url: layer.url });
}

/**
 * Create FeatureLayer with GeoJSON processing
 */
async function createFeatureLayer(layer: Layer): Promise<FeatureLayer> {
  // Custom / client-side data processing
  if (layer.isLocal) {
    const { data } = await axios.get(layer.url);
    const parsedData = parseGeoJsonToArcGIS(data);

    if (!isDefined(parsedData)) {
      throw new Error("Failed to parse GeoJSON data");
    }

    const { source, popupTemplate, objectIdField } = parsedData;

    // Debug logs
    console.log("FeatureLayer source:", source);
    console.log("FeatureLayer popupTemplate:", popupTemplate);
    console.log("FeatureLayer objectIdField:", objectIdField);

    // 從 source 中提取所有欄位名稱
    const fields =
      source.length > 0 && source[0].attributes
        ? Object.keys(source[0].attributes).map((key) => {
            const value = source[0].attributes[key];
            let fieldType: "string" | "integer" | "double" = "string";

            if (typeof value === "number") {
              fieldType = Number.isInteger(value) ? "integer" : "double";
            }

            return {
              name: key,
              type: fieldType,
              alias: key,
            };
          })
        : [];

    return new FeatureLayer({
      source,
      objectIdField: objectIdField,
      fields: fields,
      popupTemplate: popupTemplate || {
        title: "Feature Information",
        content: "No properties available",
      },
    });
  } else {
    // Feature service created by actual ArcGIS Server
    return new FeatureLayer({
      url: layer.url,
      popupTemplate: {
        title: "Feature Information",
        content: "No properties available",
      },
    });
  }
}

/**
 * Create GeoJSONLayer
 */
function createGeoJSONLayer(layer: Layer): GeoJSONLayer {
  return new GeoJSONLayer({
    url: layer.url,
    popupTemplate: {
      title: "Popup-Title",
      content: "Popup-Content",
    },
  });
}

/**
 * Create WMTSLayer
 */
function createWMTSLayer(layer: Layer): WMTSLayer {
  return new WMTSLayer({
    url: layer.url,
    activeLayer: layer.params.activeLayer,
  });
}

/**
 * Create WMSLayer
 */
function createWMSLayer(layer: Layer): WMSLayer {
  return new WMSLayer({
    url: layer.url,
    sublayers: layer.params.sublayers,
  });
}

/**
 * Handle layer extent and map view navigation for any layer type that supports queryExtent
 */
async function handleLayerExtent(layer: __esri.Layer): Promise<void> {
  const mapStore = useMapStore();
  if (!mapStore.mapView) return;

  try {
    // Check if the layer supports queryExtent method
    if (typeof (layer as any).queryExtent !== "function") {
      console.warn(`Layer type ${layer.type} does not support queryExtent`);
      return;
    }

    // Get extent from layer (prefer fullExtent, fallback to queryExtent)
    let extent: __esri.Extent;

    if ((layer as any).fullExtent) {
      extent = (layer as any).fullExtent;
    } else {
      // 通用查詢條件
      const queryResult = await (layer as any).queryExtent({ where: "1=1" });
      extent = queryResult.extent;
    }

    // Navigate to the layer extent
    if (mapStore.currentMode === "MapView") {
      mapStore.mapView.goTo(extent);
    } else {
      mapStore.sceneView?.goTo(extent);
    }

    console.log(`Successfully navigated to ${layer.type} extent:`, extent);
  } catch (error) {
    console.warn(`Failed to handle ${layer.type} extent:`, error);
  }
}

// ===== Layer Store Helper Functions =====

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
 * @description Reset layer's arcgis_id to null in layerStore
 */
function resetLayerArcgisId(layer: Layer): void {
  const layerStore = useLayerStore();
  const updatingLayer = layerStore.layers.find((l) => l.id === layer.id);
  if (!isDefined(updatingLayer)) return;
  updatingLayer.arcgis_id = "";
}
