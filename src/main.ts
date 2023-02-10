import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
// 考虑到产物大小可以按需引入或者通过插件引入

createApp(App).use(router).use(TDesign).mount("#app")
