// https://github.com/placemark/togeojson?tab=readme-ov-file#typescript
declare module "@/lib/maps/processKml" {
  export function createGeojsonUrlFromKml(data: string): string;
  export function revokeGeojsonUrl(url: string): void;
}

declare module "../maps/processKml" {
  export function createGeojsonUrlFromKml(data: string): string;
  export function revokeGeojsonUrl(url: string): void;
}
