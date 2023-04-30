import { createApp } from 'vue'
import './style/index.less'
import App from './App.vue'
import router from './router'
import TDesign from 'tdesign-vue-next'
import pinia from '@/store/pinia'
// 考虑到产物大小可以按需引入或者通过插件引入

createApp(App).use(pinia).use(router).use(TDesign).mount("#app")

// 适配横屏，最小宽度960
