import "@/assets/styles/main.css";
import "element-plus/dist/index.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import zhTw from "element-plus/es/locale/lang/zh-tw";
import { i18n } from "@/locale/i18n";

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(createPinia());
app.use(ElementPlus, {
  locale: zhTw,
});
app.use(i18n);
app.use(router);

app.mount("#app");
