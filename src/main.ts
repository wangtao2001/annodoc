import { createApp } from 'vue'
import './style/index.less'
import App from './App.vue'
import router from './router'
import pinia from '@/store/pinia'
import 'tdesign-vue-next/es/style/index.css'
import axios from 'axios'

const init = async () => {
    axios.defaults.withCredentials = true // 请求携带cookie
    // 502判断
    axios.interceptors.response.use((response) => {
        return response
    }, (error) => {
        window.location.href = '/502.html'
        return Promise.reject(error)
    })

    const res = await axios.get("/api/auth/login")
    if (res.data.code == '70020') window.location.href = res.data.data
    else
    createApp(App).use(pinia).use(router).mount("#app")
}

init()
