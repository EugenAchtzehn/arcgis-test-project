import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import { isDefined } from "@/lib/utils/isDefined";
import { useMapStore } from "@/stores/mapStore";

export function setupMap() {
  const mapStore = useMapStore();
  const mapDiv = ref<HTMLDivElement | null>(null);

  // const testPoints = [
  //   { id: 1, name: "台北101", lon: 121.5654, lat: 25.033 },
  //   { id: 2, name: "台北車站", lon: 121.5168, lat: 25.0478 },
  // ];

  // const createFeatureLayer = () => {
  //   const pointGraphics = testPoints.map((point) => {
  //     const pointGeometry = new Point({
  //       longitude: point.lon,
  //       latitude: point.lat,
  //     });
  //     return new Graphic({
  //       geometry: pointGeometry,
  //       attributes: { id: point.id, name: point.name },
  //     });
  //   });

  //   return new FeatureLayer({
  //     source: pointGraphics,
  //     objectIdField: "id",
  //     geometryType: "point",
  //   });
  // };

  function initializeMap() {
    const webMap = new Map({
      basemap: "streets-vector",
      ground: "world-elevation",
    });

    const initialCenter = [121.55, 25.05] as [number, number];
    const initialZoom = 14;

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
    });

    const sceneView = new SceneView({
      container: null,
      map: webMap,
      center: initialCenter,
      zoom: initialZoom,
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
