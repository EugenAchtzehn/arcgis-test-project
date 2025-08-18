// ===== esri =====
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
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
    default:
      console.warn(`Unsupported layer type: ${layer.type}`);
      return;
  }

  if (arcgisLayer) {
    updateLayerArcgisId(layer, arcgisLayer.id);
    map.add(arcgisLayer);

    // Handle map view extent for FeatureLayer
    if (layer.type === "FeatureLayer" && arcgisLayer instanceof FeatureLayer) {
      await handleFeatureLayerExtent(arcgisLayer);
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
 * Create FeatureLayer with GeoJSON processing
 */
async function createFeatureLayer(layer: Layer): Promise<FeatureLayer> {
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

  return new FeatureLayer({
    source,
    objectIdField: objectIdField,
    popupTemplate: popupTemplate || {
      title: "Feature Information",
      content: "No properties available",
    },
  });
}

/**
 * Create GeoJSONLayer
 */
function createGeoJSONLayer(layer: Layer): GeoJSONLayer {
  return new GeoJSONLayer({ url: layer.url });
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
 * Handle FeatureLayer extent and map view navigation
 */
async function handleFeatureLayerExtent(featureLayer: FeatureLayer): Promise<void> {
  const mapStore = useMapStore();
  if (!mapStore.mapView) return;

  try {
    const extent =
      featureLayer.fullExtent ?? (await featureLayer.queryExtent({ where: "1=1" })).extent;

    mapStore.mapView.goTo({
      center: [extent.center.x, extent.center.y],
      zoom: 11,
    });
  } catch (error) {
    console.warn("Failed to handle FeatureLayer extent:", error);
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
  updatingLayer.arcgis_id = null;
}
