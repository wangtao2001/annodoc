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
            redirect: '/anno/type',
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
                    path: '/anno/type',
                    component: ()=> import('@/views/content/anno/type.vue'),
                    name: 'type',
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
        {
            path: '/check',
            component: () => import('@/views/content/check.vue'),
            name: 'check',
        },
        {
            path: '/task',
            component: () => import('@/views/content/task.vue'),
            name: 'task',
            redirect: '/task/list',
            children: [
                {
                    path: '/task/list',
                    component: ()=> import('@/views/content/task/list.vue'),
                    name: 'list',
                    meta: {
                        breadcrumbLevel: 1
                    }
                },
                {
                    path: '/task/new',
                    component: ()=> import('@/views/content/task/new.vue'),
                    name: 'new',
                    meta: {
                        breadcrumbLevel: 2
                    }
                },
            ]
        },
    ]
}]

const router = createRouter({
    history: createWebHistory(), // history模式
    routes
})

export default router