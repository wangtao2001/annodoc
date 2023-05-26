import { createApp } from 'vue'
import './style/index.less'
import App from './App.vue'
import router from './router'
import pinia from '@/store/pinia'
import 'tdesign-vue-next/es/style/index.css'
import axios  from 'axios'


axios.defaults.withCredentials = true // 请求携带cookie

createApp(App).use(pinia).use(router).mount("#app")
