import { isDefined } from "@/lib/utils/isDefined";
import { arrayEqual } from "@/lib/utils/arrayMethods";

// ===== imported types =====
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Polygon,
  MultiPolygon,
  LineString,
  MultiLineString,
} from "geojson";

export function checkFeatureConsistency(features: Feature[]): boolean {
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
    // 若第一筆無 properties 屬性
    isConsistent = features.every((feature) => {
      const geometryConsistent = feature.geometry.type === geometryType;
      // 其他 feature 也要無有效的 properties 才行
      const propertyConsistent = !isDefined(feature.properties);
      return geometryConsistent && propertyConsistent;
    });
  }

  return isConsistent;
}

/**
 * 根據 GeoJSON properties 動態生成 popupTemplate
 * @param features - GeoJSON features
 * @returns ArcGIS popupTemplate 設定
 */
function generatePopupTemplate(features: Feature[]): any {
  if (!features.length || !isDefined(features[0].properties)) {
    return null;
  }

  const properties = features[0].properties;
  const propertyKeys = Object.keys(properties);

  if (propertyKeys.length === 0) {
    return null;
  }

  // 試著尋找適合的標題欄位
  const titleField = findTitleField(propertyKeys);

  // 生成 fieldInfos 來確保所有欄位都被正確處理
  const fieldInfos = propertyKeys.map((key) => ({
    fieldName: key,
    label: formatFieldName(key),
    visible: true,
  }));

  // 使用 ArcGIS 的標準 popupTemplate 格式
  const popupTemplate = {
    title: titleField ? `{${titleField}}` : "Feature Information",
    content: [
      {
        type: "fields",
        fieldInfos: fieldInfos,
      },
    ],
    outFields: propertyKeys, // 明確指定所有欄位
  };

  // 加入測試訊息
  console.log("Generated popupTemplate:", {
    title: popupTemplate.title,
    content: popupTemplate.content,
    fieldInfos: fieldInfos,
    propertyKeys: propertyKeys,
    properties: properties,
  });

  return popupTemplate;
}

/**
 * 尋找適合作為標題的欄位
 * @param propertyKeys - 屬性鍵名陣列
 * @returns 適合的標題欄位名稱
 */
function findTitleField(propertyKeys: string[]): string | null {
  const titleKeywords = ["name", "title", "label", "id", "code", "name_zh", "name_en"];

  for (const keyword of titleKeywords) {
    const field = propertyKeys.find((key) => key.toLowerCase().includes(keyword.toLowerCase()));
    if (field) return field;
  }

  return propertyKeys[0] || null;
}

/**
 * 格式化欄位名稱，使其更易讀
 * @param fieldName - 原始欄位名稱
 * @returns 格式化後的欄位名稱
 */
function formatFieldName(fieldName: string): string {
  // 處理全大寫的單字（如 OBJECTID, ID 等）
  if (fieldName === fieldName.toUpperCase()) {
    return fieldName;
  }

  // 處理 camelCase（如 userName, firstName 等）
  // 但不處理連續的大寫字母（如 URL, ID 等）
  return fieldName
    .replace(/_/g, " ") // 先處理 snake_case
    .replace(/([a-z])([A-Z])/g, "$1 $2") // 只在小寫後大寫之間加空格
    .replace(/^./, (str) => str.toUpperCase()) // 首字母大寫
    .trim();
}

/**
 * 尋找適合作為 objectIdField 的欄位
 * @param propertyKeys - 屬性鍵名陣列
 * @returns 適合的 objectIdField 名稱
 */
function findObjectIdField(propertyKeys: string[]): string {
  const idKeywords = ["id", "objectid", "fid", "gid", "oid", "no", "code"];

  for (const keyword of idKeywords) {
    const field = propertyKeys.find((key) => key.toLowerCase() === keyword.toLowerCase());
    if (field) return field;
  }

  // 如果沒有找到合適的 ID 欄位，使用第一個欄位
  return propertyKeys[0] || "OBJECTID";
}

/**
 * 解析 GeoJSON 資料並轉換為 ArcGIS FeatureLayer 可用的格式
 * @param data - GeoJSON FeatureCollection
 * @returns 轉換後的資料、幾何類型和 popupTemplate，如果轉換失敗則返回 null
 */
export function parseGeoJsonToArcGIS(data: FeatureCollection) {
  // 檢查資料一致性
  if (!checkFeatureConsistency(data.features)) {
    console.warn("GeoJSON features are not consistent");
    return null;
  }

  const firstFeature = data.features[0];
  const geometryType = firstFeature.geometry.type;

  // 根據幾何類型進行轉換
  let source: any[];
  let arcgisGeometryType: string;

  switch (geometryType) {
    case "Point":
      source = data.features.map((f: any) => {
        console.log("Point feature properties:", f.properties);
        return {
          geometry: {
            type: "point",
            x: f.geometry.coordinates[0],
            y: f.geometry.coordinates[1],
          },
          attributes: { ...f.properties },
        };
      });
      arcgisGeometryType = "point";
      break;

    case "MultiPoint":
      source = data.features.map((f: any) => ({
        geometry: {
          type: "multipoint",
          points: f.geometry.coordinates,
        },
        attributes: { ...f.properties },
      }));
      arcgisGeometryType = "multipoint";
      break;

    case "LineString":
      source = data.features.map((f: any) => linestringToPolyline(f));
      arcgisGeometryType = "polyline";
      break;

    case "MultiLineString":
      source = data.features.flatMap((f: any) => multilinestringToPolylines(f));
      arcgisGeometryType = "polyline";
      break;

    case "Polygon":
      source = data.features.map((f: any) => polygonToPolygon(f));
      arcgisGeometryType = "polygon";
      break;

    case "MultiPolygon":
      source = data.features.flatMap((f: any) => multipolygonToPolygons(f));
      arcgisGeometryType = "polygon";
      break;

    default:
      console.warn(`Unsupported geometry type: ${geometryType}`);
      return null;
  }

  // 生成動態的 popupTemplate
  const popupTemplate = generatePopupTemplate(data.features);

  // 尋找適合作為 objectIdField 的欄位
  const propertyKeys = Object.keys(firstFeature.properties || {});
  const objectIdField = findObjectIdField(propertyKeys);

  return {
    source,
    geometryType: arcgisGeometryType,
    originalGeometryType: geometryType,
    popupTemplate,
    objectIdField,
  };
}

/**
 * 將 GeoJSON Polygon 轉換為 ArcGIS polygon 格式
 * @param polygonFeature - GeoJSON Polygon feature
 * @returns ArcGIS polygon feature
 */
export function polygonToPolygon(polygonFeature: any): any {
  return {
    geometry: {
      type: "polygon",
      rings: polygonFeature.geometry.coordinates,
    },
    attributes: {
      ...polygonFeature.properties,
    },
  };
}

/**
 * 將 GeoJSON LineString 轉換為 ArcGIS polyline 格式
 * @param linestringFeature - GeoJSON LineString feature
 * @returns ArcGIS polyline feature
 */
export function linestringToPolyline(linestringFeature: any): any {
  return {
    geometry: {
      type: "polyline",
      // ArcGIS polyline paths 格式：
      // - 每個 path 是一個座標陣列 [[x1,y1], [x2,y2], ...]
      // - 可以包含多個 paths（多條線段）
      paths: [linestringFeature.geometry.coordinates],
    },
    attributes: {
      ...linestringFeature.properties,
    },
  };
}

/**
 * 將 GeoJSON MultiLineString 轉換為多個 polyline features
 * @param multilinestringFeature - GeoJSON MultiLineString feature
 * @returns 多個 polyline features 的陣列
 */
export function multilinestringToPolylines(multilinestringFeature: any): any[] {
  const polylines: any[] = [];

  // MultiLineString 的 coordinates 結構: [[[line1], [line2], ...]]
  // 每個 line 是一個座標陣列 [[x1,y1], [x2,y2], ...]
  multilinestringFeature.geometry.coordinates.forEach((line: number[][]) => {
    // 為每條線創建一個獨立的 feature
    polylines.push({
      geometry: {
        type: "polyline",
        // 每個 polyline feature 只包含一條線段
        paths: [line],
      },
      attributes: {
        // 所有線段共享相同的屬性
        ...multilinestringFeature.properties,
      },
    });
  });

  return polylines;
}

/**
 * 將 GeoJSON MultiPolygon 轉換為多個 Polygon features
 * @param multipolygonFeature - GeoJSON MultiPolygon feature
 * @returns 多個 Polygon features 的陣列
 */
export function multipolygonToPolygons(multipolygonFeature: any): any[] {
  const polygons: any[] = [];

  // MultiPolygon 的 coordinates 結構: [[[polygon1], [polygon2], ...]]
  // 每個 polygon 包含多個 rings（外環 + 內環）
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
        // 每個 polygon feature 包含完整的 rings 資訊
        rings,
      },
      attributes: {
        // 所有 polygon 共享相同的屬性
        ...multipolygonFeature.properties,
      },
    });
  });

  return polygons;
}
