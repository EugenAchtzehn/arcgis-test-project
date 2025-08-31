import { Layer } from "@/types/Layer";
import type { LoadedLayer } from "@/types/Layer";

export const useLayerStore = defineStore("layerStore", () => {
  const layers = ref<Layer[]>([]);
  function setLayers(updatedLayers: Layer[]) {
    layers.value = updatedLayers.map((layer) => new Layer(layer));
  }

  // loadedLayers are layers that have been added to the map
  const loadedLayers = ref<LoadedLayer[]>([]);
  function addLoadedLayer(addLayer: Layer, arcgisId: string) {
    loadedLayers.value.push({ ...addLayer, arcgis_id: arcgisId });
  }
  function removeLoadedLayer(removeLayer: LoadedLayer) {
    loadedLayers.value = loadedLayers.value.filter(
      (layer) => layer.arcgis_id !== removeLayer.arcgis_id
    );
  }

  return { layers, setLayers, loadedLayers, addLoadedLayer, removeLoadedLayer };
});
