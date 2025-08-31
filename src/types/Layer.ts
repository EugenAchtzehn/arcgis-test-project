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
  params: Record<string, any>;
  onlyThreeD: boolean;
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
    this.arcgis_id = null;
    this.opacity = 1;
    this.visible = true;
    this.onlyThreeD = isThreeDLayer(layer.type);

    // When not set in config, default value is an empty object.
    this.params = layer.params || {};
  }
}

function isThreeDLayer(type: string) {
  return ["SceneLayer", "IntegratedMesh3DTilesLayer", "ElevationLayer"].includes(type);
}

// Layer will get arcgis_id after mounted to the map
export interface LoadedLayer extends Layer {
  arcgis_id: string;
}
