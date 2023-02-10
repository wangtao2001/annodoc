import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [{
    path: '/anno',
    component: () => import('@/views/anno.vue'),
    name: 'anno',
}, {
    path: '/',
    component: () => import('@/views/index.vue'),
    name: 'index'
}]

const router = createRouter({
    history: createWebHistory(), // history模式
    routes
})

export default router