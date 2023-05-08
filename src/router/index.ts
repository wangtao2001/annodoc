import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { statusStore } from '@/store'
import pinia from "@/store/pinia"
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({ showSpinner: false })

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
    ],
}, {
    "path": "/404",
    "name": "notfound",
    component: ()=>  import('@/views/404.vue')
}, {
    path: "/:pathMath(.*)", // 此处需特别注意置于最底部
    redirect: "/404"
}]

const router = createRouter({
    history: createWebHistory(), // history模式
    routes
})

// 权限控制
router.beforeEach((to, from, next) => {
    NProgress.start()
    // 只有管理员能访问
    if (to.name === 'task_list' || to.name === "task_new" || to.name === 'check' || to.name == 'student') {
        if ( status.currentUser.role === 'admin') {
            next()
        } else {
            next({ name: 'home' })
        }
    } else
     // 只有学生能访
    if(to.name === 'home') {
        if (status.currentUser.role === 'student') {
            next()
        } else {
            next({name: 'task_list'})
        }
    }
    else {
        next()
    }
})

router.afterEach(() => {
    NProgress.done()
  })

export default router