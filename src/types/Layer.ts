import { v4 as uuid } from "uuid";

// Layer definition
export interface Layer {
  id: string;
  arcgis_id: string;
  draggable_uuid: string;
  name: string;
  type: string;
  isLocal: boolean;
  url: string;
  opacity: number;
  visible: boolean;
  // onlyThreeD: boolean;
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
    this.opacity = 1;
    this.visible = true;
    this.onlyThreeD = isThreeDLayer(layer.type);
    // When "", means it is not mounted to the map.
    this.arcgis_id = "";
    // When not set in config, default value is an empty object.
    this.params = layer.params || {};
  }
}

function isThreeDLayer(type: string) {
  return ["SceneLayer", "IntegratedMesh3DTilesLayer", "ElevationLayer"].includes(type);
}
