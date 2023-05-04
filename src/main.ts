import { createApp } from 'vue'
import './style/index.less'
import App from './App.vue'
import router from './router'
import pinia from '@/store/pinia'

createApp(App).use(pinia).use(router).mount("#app")
