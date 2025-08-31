<template>
  <div class="tabs__control" :class="{ 'is-hidden': isHidden }">
    <div
      class="tabs__control-btn"
      :class="{ active: uiStore.activeTab === 'layerList' }"
      :title="t('TabsControl.LayerList')"
      @click="switchTab('layerList')"
    >
      <el-icon :size="16" :color="uiStore.activeTab === 'layerList' ? '#fff' : '#333'"
        ><Folder
      /></el-icon>
    </div>
    <div
      class="tabs__control-btn"
      :class="{ active: uiStore.activeTab === 'loadedLayers' }"
      :title="t('TabsControl.LoadedLayers')"
      @click="switchTab('loadedLayers')"
    >
      <el-icon :size="16" :color="uiStore.activeTab === 'loadedLayers' ? '#fff' : '#333'"
        ><Check
      /></el-icon>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { Folder, Check } from "@element-plus/icons-vue";
  import { useUiStore } from "@/stores/uiStore";
  import type { TabValue } from "@/types/UserInterface";

  const uiStore = useUiStore();
  const { t } = useI18n();

  defineProps<{
    isHidden: boolean;
  }>();

  function switchTab(tab: TabValue) {
    uiStore.setActiveTab(tab);
  }
</script>
<style scoped>
  .tabs__control {
    position: absolute;
    top: 50%;
    right: 304px;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    transition: right 0.3s ease-in-out;
    transform: translateY(-50%);

    &.is-hidden {
      right: 0;
    }

    .tabs__control-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 24px;
      height: 32px;
      background-color: #e8f5e9;
      border-top-left-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;

      &.active {
        background-color: #1b813e;
      }
    }
  }
</style>
