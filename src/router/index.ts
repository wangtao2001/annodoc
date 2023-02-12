import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [{
    path: '/',
    component: () => import('@/views/index.vue'),
    name: 'index',
    redirect: '/home',
    children: [
        {
            path: '/home',
            component: () => import('@/views/content/home.vue'),
            name: 'home',
        },
        {
            path: '/anno',
            component: () => import('@/views/content/anno.vue'),
            name: 'anno',
        }, 
        {
            path: '/space',
            component: () => import('@/views/content/space.vue'),
            name: 'space',
        },
    ]
}]

const router = createRouter({
    history: createWebHistory(), // history模式
    routes
})

export default router