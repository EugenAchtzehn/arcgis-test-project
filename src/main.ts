import "@/assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import zhTw from "element-plus/es/locale/lang/zh-tw";
import "element-plus/dist/index.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus, {
  locale: zhTw,
});

app.mount("#app");
