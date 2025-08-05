import { Layer } from "@/types/Layer";

export const useLayerStore = defineStore("layerStore", () => {
  const layers = ref<Layer[]>([]);
  function setLayers(updatedLayers: Layer[]) {
    layers.value = updatedLayers.map((layer) => new Layer(layer));
  }
  return { layers, setLayers };
});
