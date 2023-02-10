import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = []

const router = createRouter({
    history: createWebHistory(), // history模式
    routes
})

export default router