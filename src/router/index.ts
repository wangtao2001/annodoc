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
            redirect: '/anno/list',
            children: [
                {
                    path: '/anno/work',
                    component: ()=> import('@/views/content/anno/work.vue'),
                    name: 'work',
                    meta: {
                        breadcrumbLevel: 2 // 在面包屑导航中的级别，用来动态匹配面包屑
                    }
                },
                {
                    path: '/anno/list',
                    component: ()=> import('@/views/content/anno/list.vue'),
                    name: 'list',
                    meta: {
                        breadcrumbLevel: 1
                    }
                },
                {
                    path: '/anno/result',
                    component: ()=> import('@/views/content/anno/result.vue'),
                    name: 'result',
                    meta: {
                        breadcrumbLevel: 3
                    }
                }
            ]
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