// ===== esri =====
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import IntegratedMesh3DTilesLayer from "@arcgis/core/layers/IntegratedMesh3DTilesLayer";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import KMLLayer from "@arcgis/core/layers/KMLLayer";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";

// ===== other 3rd party =====
import axios from "axios";

// ===== stores =====
import { useLayerStore } from "@/stores/layerStore";
import { useMapStore } from "@/stores/mapStore";
import { isDefined } from "@/lib/utils/isDefined";
import { parseGeoJsonToArcGIS } from "@/lib/maps/processGeoJson";
import { createGeojsonUrlFromKml } from "@/lib/maps/processKml";

// ===== imported types =====
import type { FeatureCollection } from "geojson";

// ===== self-defined types =====
import { Layer } from "@/types/Layer";
import type { LoadedLayer } from "@/types/Layer";

/**
 * @description Toggle layer visibility on map
 * @param layer - Layer object
 * @param map - ArcGIS Map instance
 */
export function toggleLayer(layer: LoadedLayer, map: __esri.Map): void {
  if (layer.arcgis_id !== "" && map.findLayerById(layer.arcgis_id)) {
    hideLayer(layer, map);
  } else {
    showLayer(layer, map);
  }
}

/**
 * @description 把 ArcGIS layer 實例和自訂 Layer 的 visible 設為 true
 * @param layer - LoadedLayer object
 * @param map - ArcGIS Map instance
 */
export function showLayer(l: LoadedLayer, map: __esri.Map): void {
  const layer = map.findLayerById(l.arcgis_id);
  if (isDefined(layer)) {
    layer.visible = true;
    l.visible = true;
  }
}

/**
 * @description 把 ArcGIS layer 實例和自訂 Layer 的 visible 設為 false
 * @param layer - LoadedLayer object
 * @param map - ArcGIS Map instance
 */
export function hideLayer(l: LoadedLayer, map: __esri.Map): void {
  const layer = map.findLayerById(l.arcgis_id);
  if (isDefined(layer)) {
    layer.visible = false;
    l.visible = false;
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
      arcgisLayer = await createGeoJSONLayer(layer);
      break;
    case "KMLLayer":
      arcgisLayer = await createKMLLayer(layer);
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

  // 無法成功建立 arcgisLayer，終止函數
  if (!isDefined(arcgisLayer)) return;
  // 掛載到 map 上
  map.add(arcgisLayer);

  // 將自訂 layer 和實體化後取得的 arcgis_id 儲存在 loadedLayers 中
  const layerStore = useLayerStore();
  layerStore.addLoadedLayer(layer, arcgisLayer.id);

  // Handle map view extent for layers that support queryExtent
  if (layer.type === "FeatureLayer" || layer.type === "GeoJSONLayer" || layer.type === "KMLLayer") {
    await handleLayerExtent(arcgisLayer);
  }
}

/**
 * @description Remove layer from map
 * @param layer - Layer object
 * @param map - ArcGIS Map instance
 */
export function removeLayerFromMap(layer: LoadedLayer, map: __esri.Map): void {
  // 從 map 中移除 arcgisLayer
  const arcgisLayer = map.findLayerById(layer.arcgis_id);
  if (!isDefined(arcgisLayer)) return;
  map.remove(arcgisLayer);

  // 從 loadedLayers 移除該 loadedLayer
  const layerStore = useLayerStore();
  layerStore.removeLoadedLayer(layer);
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
    // console.log("FeatureLayer source:", source);
    // console.log("FeatureLayer popupTemplate:", popupTemplate);
    // console.log("FeatureLayer objectIdField:", objectIdField);

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
 * Create GeoJSONLayer with dynamic popupTemplate
 */
async function createGeoJSONLayer(layer: Layer): Promise<GeoJSONLayer> {
  // Custom / client-side data processing for GeoJSON
  if (layer.isLocal) {
    const { data } = await axios.get(layer.url);
    const parsedData = parseGeoJsonToArcGIS(data);

    if (!isDefined(parsedData)) {
      throw new Error("Failed to parse GeoJSON data");
    }

    const { popupTemplate } = parsedData;

    // Debug logs
    // console.log("GeoJSONLayer popupTemplate:", popupTemplate);

    return new GeoJSONLayer({
      url: layer.url,
      popupTemplate: popupTemplate || {
        title: "Feature Information",
        content: "No properties available",
      },
    });
  } else {
    // Remote GeoJSON service
    return new GeoJSONLayer({
      url: layer.url,
      popupTemplate: {
        title: "Feature Information",
        content: "No properties available",
      },
    });
  }
}

/**
 * Create KMLLayer
 */
async function createKMLLayer(layer: Layer): Promise<KMLLayer | GeoJSONLayer> {
  if (layer.isLocal) {
    // Local 使用 kml to geojson 的方式來讀取
    const { data } = await axios.get(layer.url);
    const url = createGeojsonUrlFromKml(data);
    return new GeoJSONLayer({
      url: url,
      elevationInfo: {
        mode: "on-the-ground",
      },
      popupTemplate: {
        title: "Feature Information",
        content: "No properties available",
      },
    });
  } else {
    /**
     * KMLLayer 需要通過 ArcGIS 的 utility service，所以 .kmz/.kml 必須是在網路上可公開取用的
     * 如果有受到防火牆限制，則必須設定 esriConfig.kmlServiceUrl 來設定自己的 utility service (需要 ArcGIS Enterprise)
     * 其他已知限制：
     * 不支援 SceneView/3D 模式
     * 不支援 LayerList widget
     * MapImage 只在 MapView 的空間參考是 4326 或 3857 時可用
     * KMLLayer 的 popup 不支援 inline styles
     */
    return new KMLLayer({
      url: layer.url,
    });
  }
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
