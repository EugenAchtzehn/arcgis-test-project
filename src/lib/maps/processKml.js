import { kml } from "@tmcw/togeojson";

export function createGeojsonUrlFromKml(data) {
  const geojson = kml(new DOMParser().parseFromString(data, "application/xml"));
  const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  return url;
}
