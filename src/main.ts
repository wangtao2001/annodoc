import { createApp } from 'vue'
import './style.less'
import App from './App.vue'
import router from './router'
import TDesign from 'tdesign-vue-next'
import { createPinia } from 'pinia'
// 考虑到产物大小可以按需引入或者通过插件引入

//document.documentElement.setAttribute('theme-mode', 'dark');
createApp(App).use(router).use(createPinia()).use(TDesign).mount("#app")
