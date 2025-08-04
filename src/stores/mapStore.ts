import type Map from "@arcgis/core/Map";
import type MapView from "@arcgis/core/views/MapView";
import type SceneView from "@arcgis/core/views/SceneView";
import { isDefined } from "@/lib/utils/isDefined";

export const useMapStore = defineStore("mapStore", () => {
  const map = shallowRef<Map | null>(null);
  function setMap(mapInstance: Map) {
    map.value = markRaw(mapInstance);
  }

  const mapView = shallowRef<MapView | null>(null);
  function setMapView(view: MapView) {
    mapView.value = markRaw(view);

    view.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {
      const point = view.toMap({ x: event.x, y: event.y });
      if (!isDefined(point.longitude) || !isDefined(point.latitude)) return;
      setCurrentLngLat(point.longitude, point.latitude);
    });
  }

  const sceneView = shallowRef<SceneView | null>(null);
  function setSceneView(view: SceneView) {
    sceneView.value = markRaw(view);

    view.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {
      const point = view.toMap({ x: event.x, y: event.y });
      if (!isDefined(point) || !isDefined(point.longitude) || !isDefined(point.latitude)) return;
      setCurrentLngLat(point.longitude, point.latitude);
    });
  }

  const currentCenter = ref<[number, number] | null>(null);
  function setCurrentCenter(center: [number, number]) {
    currentCenter.value = center;
  }

  const currentZoom = ref<number | null>(null);
  function setCurrentZoom(zoom: number) {
    currentZoom.value = zoom;
  }

  const currentLng = ref<number>(0);
  const currentLat = ref<number>(0);
  function setCurrentLngLat(lng: number, lat: number) {
    currentLng.value = lng;
    currentLat.value = lat;
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
    currentLng,
    currentLat,
    setCurrentLngLat,
  };
});
