import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { statusStore } from '@/store'
import pinia from "@/store/pinia"
// 这样写是为了能够在路由守卫中使用store
const status = statusStore(pinia)

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
                    name: 'anno_work',
                    meta: {
                        breadcrumbLevel: 2 // 在面包屑导航中的级别，用来动态匹配面包屑
                    }
                },
                {
                    path: '/anno/type',
                    component: ()=> import('@/views/content/anno/type.vue'),
                    name: 'anno_type',
                    meta: {
                        breadcrumbLevel: 1
                    }
                },
                {
                    path: '/anno/result',
                    component: ()=> import('@/views/content/anno/result.vue'),
                    name: 'anno_result',
                    meta: {
                        breadcrumbLevel: 3
                    }
                }
            ]
        }, 
        {
            path: '/check',
            component: () => import('@/views/content/check.vue'),
            name: 'check',
        },
        {
            path: '/student',
            component: () => import('@/views/content/student.vue'),
            name: 'student',
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
                    name: 'task_list',
                    meta: {
                        breadcrumbLevel: 1
                    }
                },
                {
                    path: '/task/new',
                    component: ()=> import('@/views/content/task/new.vue'),
                    name: 'task_new',
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

// 权限控制，目前针对 task check两个地址
router.beforeEach((to, from, next) => {
    if (to.name === 'task_list' || to.name === "task_new" || to.name === 'check' || to.name == 'student') {
        if ( status.currnetRole === 'admin') {
            next()
        } else {
            next({ name: 'home' })
        }
    } else {
        next()
    }
})

export default router