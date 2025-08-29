import type { TabValue } from "@/types/UserInterface";

export const useUiStore = defineStore("uiStore", () => {
  const activeTab = ref<TabValue>("layerList");
  function setActiveTab(tab: TabValue) {
    activeTab.value = tab;
  }

  return { activeTab, setActiveTab };
});
