import type Map from "@arcgis/core/Map";
import type MapView from "@arcgis/core/views/MapView";
import type SceneView from "@arcgis/core/views/SceneView";

export const useMapStore = defineStore("mapStore", () => {
  const map = shallowRef<Map | null>(null);
  function setMap(mapInstance: Map) {
    map.value = markRaw(mapInstance);
  }

  const mapView = shallowRef<MapView | SceneView | null>(null);
  function setMapView(view: MapView | SceneView) {
    mapView.value = markRaw(view);
  }

  return { map, setMap, mapView, setMapView };
});
