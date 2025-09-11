import { fileURLToPath, URL } from "node:url";
import path from "node:path";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// analyze file size of each module
import { visualizer } from "rollup-plugin-visualizer";

// 嘗試外部化 @arcgis/core，不參與打包過程，尚未成功
import { viteStaticCopy } from "vite-plugin-static-copy";
// alternative plugin: "vite-plugin-html";
// currently not support vite 7
import { insertHtml, h } from "vite-plugin-insert-html";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    base: env.VITE_BASE_URL,
    // optimizeDeps: {
    //   exclude: ["@arcgis/core"],
    // },
    // build: {
    //   rollupOptions: {
    //     plugins: [],
    //   },
    // },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith("arcgis-") || tag.startsWith("calcite-"),
          },
        },
      }),
      vueDevTools(),
      AutoImport({
        imports: ["vue", "vue-router", "vue-i18n", "pinia"],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      visualizer({
        // automatically open the report after build
        open: true,
        // report's path will be <root>/stats.html
        filename: "stats.html",
      }),
      // viteStaticCopy({
      //   targets: [
      //     {
      //       src: "node_modules/@arcgis/core/",
      //       dest: "vendor/esri",
      //     },
      //   ],
      // }),
      // insertHtml({
      //   head: [
      //     h("link", {
      //       rel: "stylesheet",
      //       href: `${env.VITE_BASE_URL}vendor/esri/core/assets/esri/themes/light/main.css`,
      //     }),
      //     h("script", { src: `${env.VITE_BASE_URL}vendor/esri/core/Map.js`, type: "module" }),
      //   ],
      // }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
    server: {
      host: true,
      port: 8787,
    },
    preview: {
      port: 6489,
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
