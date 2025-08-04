import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import { isDefined } from "@/lib/utils/isDefined";
import { useMapStore } from "@/stores/mapStore";

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  // a composable can update its managed state over time.
  function update(event: MouseEvent) {
    x.value = event.pageX;
    y.value = event.pageY;
  }

  // a composable can also hook into its owner component's
  // lifecycle to setup and teardown side effects.
  onMounted(() => window.addEventListener("mousemove", update));
  onUnmounted(() => window.removeEventListener("mousemove", update));

  return { x, y };
}

export function useMapViewCoords() {
  const mapStore = useMapStore();
  const mapViewLng = ref(0);
  const mapViewLat = ref(0);

  // 這時根本還沒有 mapView 實體故不啟動
  mapStore.mapView?.when(
    () => {
      console.log("in 2d");
      debugger;
      if (isDefined(mapStore.mapView)) {
        mapStore.mapView.on("pointer-move", updateCoords);
        console.log("in");
      }
    },
    (error: any) => {
      console.log(error);
    }
  );

  console.log("in 2d");
  debugger;

  /**
   * @description 更新圖面坐標
   * @param event __esri.ViewPointerMoveEvent
   */
  function updateCoords(event: __esri.ViewPointerMoveEvent) {
    if (isDefined(mapStore.mapView) && isDefined(mapStore.mapView.container)) {
      const point = mapStore.mapView.toMap({ x: event.x, y: event.y });

      // 沒有取到有效地圖點位，不更新
      if (!isDefined(point) || !isDefined(point.longitude) || !isDefined(point.latitude)) return;

      mapViewLng.value = point.longitude;
      mapViewLat.value = point.latitude;
    }
  }

  return { mapViewLng, mapViewLat };
}

export function useSceneViewCoords() {
  const mapStore = useMapStore();
  const sceneViewLng = ref(0);
  const sceneViewLat = ref(0);

  console.log("in 3d");

  //   if (isDefined(mapStore.sceneView)) {
  //     mapStore.sceneView.on("pointer-move", updateCoords);
  //   }

  //   function updateCoords(event: __esri.ViewPointerMoveEvent) {
  //     if (isDefined(mapStore.sceneView) && isDefined(mapStore.sceneView.container)) {
  //       const point = mapStore.sceneView.toMap({ x: event.x, y: event.y });

  //       // 沒有取到有效地圖點位，不更新
  //       if (!isDefined(point) || !isDefined(point.longitude) || !isDefined(point.latitude)) return;

  //       sceneViewLng.value = point.longitude;
  //       sceneViewLat.value = point.latitude;
  //     }
  //   }

  return { sceneViewLng, sceneViewLat };
}
