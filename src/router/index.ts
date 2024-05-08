import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { statusStore } from '@/store'
import { UserRole } from '@/interface'
import pinia from "@/store/pinia"
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { request, getConfig } from '@/methods/request'
import axios from 'axios'
import { MessagePlugin } from 'tdesign-vue-next'
NProgress.configure({ showSpinner: false })

// 这样写是为了能够在路由守卫中使用store
const current = statusStore(pinia)

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
                    component: () => import('@/views/content/anno/work.vue'),
                    name: 'anno_work',
                    meta: {
                        breadcrumbLevel: 2 // 在面包屑导航中的级别，用来动态匹配面包屑
                    }
                },
                {
                    path: '/anno/corpus',
                    component: () => import('@/views/content/anno/corpus.vue'),
                    name: 'corpus_work',
                    meta: {
                        breadcrumbLevel: 2
                    }
                },
                {
                    path: '/anno/corpus-v2',
                    component: () => import('@/views/content/anno/corpus-v2.vue'),
                    name: 'corpus_work_v2',
                    meta: {
                        breadcrumbLevel: 2
                    }
                }, {
                    path: '/anno/generate',
                    component: () => import('@/views/content/anno/generate.vue'),
                    name: 'generate_work',
                    meta: {
                        breadcrumbLevel: 2
                    }
                },
                {
                    path: '/anno/type',
                    component: () => import('@/views/content/anno/type.vue'),
                    name: 'anno_type',
                    meta: {
                        breadcrumbLevel: 1
                    }
                },
                {
                    path: '/anno/result',
                    component: () => import('@/views/content/anno/result.vue'),
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
            path: '/option',
            component: () => import('@/views/content/option.vue'),
            name: 'option',
        },
        {
            path: '/task',
            component: () => import('@/views/content/task.vue'),
            name: 'task',
            redirect: '/task/list',
            children: [
                {
                    path: '/task/list',
                    component: () => import('@/views/content/task/list.vue'),
                    name: 'task_list',
                    meta: {
                        breadcrumbLevel: 1
                    }
                },
                {
                    path: '/task/new',
                    component: () => import('@/views/content/task/new.vue'),
                    name: 'task_new',
                    meta: {
                        breadcrumbLevel: 2
                    }
                },
            ]
        },
    ],
},
{
    "path": "/404",
    "name": "notfound",
    component: () => import('@/views/404.vue')
}, {
    "path": "/403",
    "name": "permission",
    component: () => import('@/views/403.vue')
},
{
    path: "/:pathMath(.*)", // 此处需特别注意置于最底部
    redirect: "/404"
}]

const router = createRouter({
    history: createWebHistory(), // history模式
    routes
})

// 权限控制
router.beforeEach(async (to, from, next) => {
    NProgress.start()

    if (current.user.number.length == 0) { // 使用原生请求，因为状态码不一样，和main.ts中一样
        const res = await axios.get('/api/getResponses/getUser')
        if (res.data.code == '70030' || res.data.code == '70040') {
            MessagePlugin.error("身份验证失败, 请重新登录")
            window.location.href = 'http://id.cpu.edu.cn/sso/logout?service=https://anno.cpu.edu.cn'
            return
        }
        const data = res.data.data
        if (data.checker) {
            current.userRoles.push(UserRole.checker)
        }
        if (data.manager) {
            current.userRoles.push(UserRole.teacher)
        }
        if (data.grade) {
            if (data.grade.length != 0) {
                current.userRoles.push(UserRole.student)
            }
        }
        current.user.number = data.number
        current.user.grade = data.grade
        if (current.userRoles.length == 0) {
            current.user.login = false
        } else {
            current.user.login = true
            current.user.role = current.userRoles[0] // 我都快气死了
        }
    }
    if (!current.user.login && to.name != 'permission') {
        next({ name: 'permission' })
    } else
        // 只有管理员能访问
        if (to.name === 'task_list' || to.name === "task_new" || to.name === 'check' || to.name == 'student' || to.name == 'option') {
            if (current.user.role == UserRole.teacher) {
                next()
            } else {
                next({ name: 'anno' })
            }
        } else
            // 只有学生能访
            if (to.name === 'home') {
                if (current.user.role == UserRole.student) {
                    next()
                } else {
                    next({ name: 'anno' })
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