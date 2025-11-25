import { createApp } from "vue";
import { createPinia } from "pinia";
import VueECharts from "vue-echarts";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";
import "./plugins/echarts";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.component("VChart", VueECharts);

app.mount("#app");
