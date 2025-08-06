import { v4 as uuid } from "uuid";

// Layer definition
export interface Layer {
  id: string;
  arcgis_id: string | null;
  draggable_uuid: string;
  name: string;
  type: string;
  isLocal: boolean;
  url: string;
  opacity: number;
  visible: boolean;
}

export class Layer implements Layer {
  constructor(layer: Layer) {
    // set by mapConfig | user inserted value
    this.id = layer.id;
    this.name = layer.name;
    this.type = layer.type;
    this.isLocal = layer.isLocal;
    this.url = layer.url;
    // set by package generated uuid
    this.draggable_uuid = uuid();
    // set by default value
    this.opacity = 1;
    this.visible = true;
    // if null, then it is not instanced.
    this.arcgis_id = null;
  }
}

// // Define the type of the input data, excluding the automatically generated properties
// export type LayerData = Omit<Layer, "draggable_uuid" | "opacity" | "visible">;

// // Using factory function to create Layer
// export function createLayerFromConfig(layerConfig: LayerData): Layer {
//   return {
//     ...layerConfig,
//     draggable_uuid: uuid(),
//     opacity: 1,
//     visible: true,
//   };
// }
