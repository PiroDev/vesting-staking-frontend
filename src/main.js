import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import store from "/src/store/index.js";

createApp(App)
    .use(store)
    .mount('#app');
