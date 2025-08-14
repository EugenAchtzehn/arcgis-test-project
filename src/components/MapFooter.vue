<template>
  <div class="mapFooter">
    <div class="mapFooter__coords">
      <span>
        Longitude:
        {{
          mapStore.currentLng !== 0
            ? mapStore.currentLng.toFixed(6)
            : t("ControlPanel.NoValidLongitude")
        }}
      </span>
      <span>
        Latitude:
        {{
          mapStore.currentLat !== 0
            ? mapStore.currentLat.toFixed(6)
            : t("ControlPanel.NoValidLatitude")
        }}
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { useMapStore } from "@/stores/mapStore";

  const mapStore = useMapStore();
  const { t } = useI18n();
</script>
<style scoped>
  .mapFooter {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 2px 8px;
    background-color: rgb(0 0 0 / 70%);
    color: #fff;
    line-height: 18px;
    font-size: 12px;

    .mapFooter__coords {
      display: flex;
      gap: 8px;
    }
  }
</style>
