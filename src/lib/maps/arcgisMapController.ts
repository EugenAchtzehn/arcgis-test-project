import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import { useLayerStore } from "@/stores/layerStore";
import { useMapStore } from "@/stores/mapStore";
import axios from "axios";
import { isDefined } from "@/lib/utils/isDefined";

import { Layer } from "@/types/Layer";
import type { Feature, FeatureCollection, GeoJsonProperties, Polygon, MultiPolygon } from "geojson";

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

    const parsedData = geojsonParser(data);
    if (!isDefined(parsedData)) return;
    const { features, geometryType } = parsedData;

    let source: any;

    if (geometryType === "point") {
      source = features.map((f: any, idx: number) => {
        return {
          geometry: {
            type: geometryType,
            x: f.geometry.coordinates[0],
            y: f.geometry.coordinates[1],
          },
          attributes: {
            ...f.properties,
          },
        };
      });
    } else if (geometryType === "polygon") {
      source = features.map((f: any, idx: number) => {
        return {
          geometry: {
            type: geometryType,
            rings: polygonToRings(f.geometry as Polygon),
          },
          attributes: {
            ...f.properties,
          },
        };
      });
    } else if (geometryType === "multipolygon") {
      // MultiPolygon 需要轉換為多個獨立的 Polygon features
      source = features.flatMap((f: any) => multipolygonToPolygons(f));
    }

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
      objectIdField: "NO",
      popupTemplate: {
        title: "Popup-Title",
        content: "NO: {NO}",
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

/**
 * @description 解析 geojson 資料
 * @param data - GeoJSON 資料
 * @returns 提供 geometryType 以及給 FeatureLayer 的 source 屬性好用的資料格式
 */
function geojsonParser(data: FeatureCollection) {
  // 不一致的 feature 資料不執行
  if (!checkFeatureConsistency(data.features)) return;

  let geometryType: string;
  let processedFeatures: any;

  if (data.features[0].geometry.type === "Point") {
    geometryType = "point";
  } else if (data.features[0].geometry.type === "MultiPoint") {
    geometryType = "multipoint";
  } else if (data.features[0].geometry.type === "LineString") {
    geometryType = "polyline";
  } else if (data.features[0].geometry.type === "MultiLineString") {
    return;
    // geometryType = "polyline";
  } else if (data.features[0].geometry.type === "Polygon") {
    geometryType = "polygon";
  } else if (data.features[0].geometry.type === "MultiPolygon") {
    geometryType = "multipolygon";
  } else {
    // GeometryCollection, etc. 先視為 polygon
    return;
  }

  return {
    features: data.features,
    geometryType,
  };
}

function checkFeatureConsistency(features: Feature[]): boolean {
  const geometryType = features[0].geometry.type;

  let isConsistent: boolean;

  // 第一筆有 properties 時，檢查所有 feature 的 properties 是否一致
  if (isDefined(features[0].properties)) {
    const sortedPropertyKeys = Object.keys(features[0].properties).sort();
    isConsistent = features.every((feature) => {
      const geometryConsistent = feature.geometry.type === geometryType;

      // 第一筆有 properties 屬性，但其他任一筆沒有的情況
      if (!isDefined(feature.properties)) return false;

      const propertyConsistent = arrayEqual(
        sortedPropertyKeys,
        Object.keys(feature.properties).sort()
      );
      return geometryConsistent && propertyConsistent;
    });
  } else {
    // 第一筆無 properties 屬性
    isConsistent = features.every((feature) => {
      const geometryConsistent = feature.geometry.type === geometryType;
      // 其他 feature 也要無有效的 properties 才行
      const propertyConsistent = !isDefined(feature.properties);
      return geometryConsistent && propertyConsistent;
    });
  }

  return isConsistent;
}

function arrayEqual(arr1: string[], arr2: string[]) {
  return arr1.length === arr2.length && arr1.every((item, index) => item === arr2[index]);
}

function polygonToRings(polygon: Polygon): number[][][] {
  const { coordinates } = polygon;
  // not yet check if it is a enclosed ring
  return coordinates;
}

/**
 * 將 MultiPolygon 轉換為多個 Polygon features
 * @param multipolygonFeature - MultiPolygon feature
 * @returns 多個 Polygon features 的陣列
 */
function multipolygonToPolygons(multipolygonFeature: any): any[] {
  const polygons: any[] = [];

  // MultiPolygon 的 coordinates 結構: [[[polygon1], [polygon2], ...]]
  multipolygonFeature.geometry.coordinates.forEach((polygon: number[][][]) => {
    // 每個 polygon 的 rings（外環 + 內環）
    const rings: number[][][] = [];
    polygon.forEach((ring: number[][]) => {
      rings.push(ring);
    });

    // 為每個 polygon 創建一個獨立的 feature
    polygons.push({
      geometry: {
        type: "polygon",
        rings,
      },
      attributes: {
        ...multipolygonFeature.properties,
      },
    });
  });

  return polygons;
}
