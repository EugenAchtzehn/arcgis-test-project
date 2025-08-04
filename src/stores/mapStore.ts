import type Map from "@arcgis/core/Map";
import type MapView from "@arcgis/core/views/MapView";
import type SceneView from "@arcgis/core/views/SceneView";
import type Point from "@arcgis/core/geometry/Point";

export const useMapStore = defineStore("mapStore", () => {
  const map = shallowRef<Map | null>(null);
  function setMap(mapInstance: Map) {
    map.value = markRaw(mapInstance);
  }

  const mapView = shallowRef<MapView | null>(null);
  function setMapView(view: MapView) {
    mapView.value = markRaw(view);
  }

  const sceneView = shallowRef<SceneView | null>(null);
  function setSceneView(view: SceneView) {
    sceneView.value = markRaw(view);
  }

  const currentCenter = ref<[number, number] | null>(null);
  function setCurrentCenter(center: [number, number]) {
    currentCenter.value = center;
  }

  const currentZoom = ref<number | null>(null);
  function setCurrentZoom(zoom: number) {
    currentZoom.value = zoom;
  }

  return {
    map,
    setMap,
    mapView,
    setMapView,
    sceneView,
    setSceneView,
    currentCenter,
    setCurrentCenter,
    currentZoom,
    setCurrentZoom,
  };
});
