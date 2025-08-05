import urijs from "urijs";

/**
 * 將 isLocal: true 的 Layer 的 url 加上正確的 baseUrl
 * @param url /data/geojson/TaiwanCounty.geojson
 * @returns
 */
export function buildUrlForLocalData(url: string) {
  const currentUrl = window.location.href;
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const uri = new urijs(currentUrl);
  return uri.path(baseUrl + url).toString();
}
