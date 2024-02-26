
import router from './router'

import { createApp } from "vue";
import App from "./App.vue";
import Vue3Lottie from "vue3-lottie";
import { createPinia } from 'pinia'

const pinia = createPinia()

const app = createApp(App);
app.use(Vue3Lottie);
app.use(router);
app.use(pinia);
app.mount("#app");
