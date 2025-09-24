import { kml } from "@tmcw/togeojson";

/**
 * 將 KML 資料轉換為 GeoJSON 並創建 blob URL
 * @param {string} data - KML 字串資料
 * @returns {string} blob URL
 */
export function createGeojsonUrlFromKml(data) {
  const geojson = kml(new DOMParser().parseFromString(data, "application/xml"));
  const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  return url;
}

/**
 * 釋放 blob URL 以釋放記憶體
 * @param {string} url - 要釋放的 blob URL
 */
export function revokeGeojsonUrl(url) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
