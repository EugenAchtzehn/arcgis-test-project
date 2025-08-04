import { createI18n } from "vue-i18n";

import en from "./i18n_en.json";
import zh from "./i18n_zhTW.json";

export const i18n = createI18n({
  // using Composition API
  legacy: false,
  // setting default language
  locale: "zh",
  // setting fallback language
  fallbackLocale: "en",
  messages: {
    en,
    zh,
  },
});
