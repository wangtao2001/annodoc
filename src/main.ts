import { createApp } from 'vue'
import './style/index.less'
import App from './App.vue'
import router from './router'
import pinia from '@/store/pinia'
import 'tdesign-vue-next/es/style/index.css'
import axios from 'axios'

axios.interceptors.request.use(
    config => {
        // if (localStorage.getItem('Authorization')) {
        //     config.headers.Authorization = localStorage.getItem('Authorization')
        // }
        return config
    }, error => {
        return Promise.reject(error)
    }
)


createApp(App).use(pinia).use(router).mount("#app")
