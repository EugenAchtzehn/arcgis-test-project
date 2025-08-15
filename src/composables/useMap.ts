import * as intl from "@arcgis/core/intl";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import { isDefined } from "@/lib/utils/isDefined";
import { useMapStore } from "@/stores/mapStore";

export function setupMap() {
  const mapStore = useMapStore();
  const mapDiv = ref<HTMLDivElement | null>(null);

  intl.setLocale("zh-TW");

  function initializeMap() {
    const webMap = new Map({
      basemap: "osm",
      ground: "world-elevation",
    });

    const initialCenter = [121.55, 25.05] as [number, number];
    const initialZoom = 11;

    mapStore.setCurrentCenter(initialCenter);
    mapStore.setCurrentZoom(initialZoom);

    // guard
    if (!isDefined(mapStore.currentCenter) || !isDefined(mapStore.currentZoom)) return;

    const mapView = new MapView({
      container: mapDiv.value,
      map: webMap,
      center: initialCenter,
      zoom: initialZoom,
      constraints: {
        rotationEnabled: false,
      },
      ui: {
        // 不放 attribution 但要注意使用條款
        components: ["zoom"],
      },
    });

    const sceneView = new SceneView({
      container: null,
      map: webMap,
      center: initialCenter,
      zoom: initialZoom,
      ui: {
        components: ["zoom", "compass", "navigation-toggle"],
      },
    });

    // const featureLayer = createFeatureLayer();
    // webMap.add(featureLayer);

    mapStore.setMap(webMap);
    mapStore.setMapView(mapView);
    mapStore.setSceneView(sceneView);
  }

  onMounted(() => {
    initializeMap();
  });

  return {
    mapDiv,
  };
}
