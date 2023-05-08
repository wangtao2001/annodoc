<script setup lang="tsx">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { statusStore } from '@/store'
import { MessagePlugin } from 'tdesign-vue-next'
 
const status = statusStore()

const toHome = () => {
    window.location.href = "/"
}
// 为了解决刷新后路由与当前选中的menu-item不同的情况
// 本来想用onMounted，但是setup的执行时机比mounted早
const route = useRoute() // 获取当前路由信息
const router = useRouter()
const currentItem = route.path.split('/')[1] // 例如'/anno/work'只要anno，这样就要求路由的路径与muen-item的value相同

const lightMode = ref(true)

const titleImg = ref('/title5.png')
const modeChange = ()=> {
    if (lightMode.value) {
        document.documentElement.setAttribute('theme-mode', 'dark')
        titleImg.value = '/title6.png'
        localStorage.setItem('lightMode', 'false')
    } else {
        document.documentElement.setAttribute('theme-mode', 'light')
        titleImg.value = '/title5.png'
        localStorage.setItem('lightMode', 'true')
    }
    lightMode.value = !lightMode.value
}
const local = localStorage.getItem('lightMode')
// 判断local为null
if(local === 'false') {
    modeChange()
}

const menuVisible = ref(false)
const menuButtonIcon = ref("format-vertical-align-right")
const openMenu = ()=> {
    if (menuVisible.value) {
        closeMenu()
    } else {
        menuVisible.value = true
        menuButtonIcon.value = "close"
    }
}

const closeMenu = () => {
    menuVisible.value = false
    menuButtonIcon.value = "format-vertical-align-right"
}

const dropdownOption = [
    {'content': '退出登录', value: 0}
]

const dropdownClick = (row: any) => {
    if (row.value === 0) {
        logout()
    }
}

const logout = () => {
    MessagePlugin.success("已退出登录")
}
</script>

<template>
    <t-layout class="root">
        <t-header >
            <t-head-menu height="120px">
                <template #logo>
                    <img style="user-select: none;" @click="toHome" width="180" class="logo" :src="titleImg" alt="logo" />
                </template>
                <t-menu-item class="s" style="margin-right: 5px;"> 工作区 </t-menu-item>
                <t-button class="s"  theme="default" variant="text" @click="modeChange" value="item2">{{ lightMode ? '深色模式' : '浅色模式' }}</t-button>
                <template #operations>
                    <t-icon class="t-menu__operations-icon s" name="search" />
                    <t-icon class="t-menu__operations-icon s" name="notification-filled" />
                    <t-dropdown class="s"  @click="dropdownClick" :options="dropdownOption">
                        <t-space>
                            <t-button variant="text">
                            <template #icon><t-icon name="user-circle" size="16" /></template>
                            {{ status.currentNumebr }}
                            <template #suffix> <t-icon name="chevron-down" size="16" /></template>
                            </t-button>
                        </t-space>
                    </t-dropdown>
                    <t-icon @click="toHome" class="t-menu__operations-icon s" name="home" />
                    <t-icon @click="openMenu" class="menu-button" :name="menuButtonIcon" />
                </template>
            </t-head-menu>
        </t-header>
        <t-layout style="position: relative;">
            <t-drawer
            v-model:visible="menuVisible"
            show-in-attached-element
            placement="top"
            :footer="false"
            
        >
            <div class="drawer">
                <div class="center">
                    <t-button variant="text" theme="default" @click="router.push('/'); closeMenu()" v-if="status.currnetRole === 'student'">
                        <template #icon>
                            <t-icon name="dashboard" />
                        </template>
                        首页
                    </t-button>
                    <t-button variant="text" theme="default" @click="router.push('/anno'); closeMenu()">
                        <template #icon>
                            <t-icon name="edit-1" />
                        </template>
                        {{ status.currnetRole == "student" ? "标注" : "标注审核" }}
                    </t-button>
                    <t-button variant="text" theme="default" @click="router.push('/task'); closeMenu()" v-if="status.currnetRole === 'admin'" value="task">
                        <template #icon>
                            <t-icon name="server" />
                        </template>
                        任务管理
                    </t-button>
                    <t-button variant="text" theme="default" @click="router.push('/check'); closeMenu()" v-if="status.currnetRole === 'admin'">
                        <template #icon>
                            <t-icon name="filter-clear" />
                        </template>
                        审核管理
                    </t-button>
                    <t-button variant="text" theme="default" @click="router.push('/student'); closeMenu()" v-if="status.currnetRole === 'admin'">
                        <template #icon>
                            <t-icon name="user-circle" />
                        </template>
                        学生管理
                    </t-button>
                    <t-button class="color" @click="modeChange()" theme="default">
                        {{ lightMode ? '深色模式' : '浅色模式' }}
                    </t-button>
                    <t-button @click="logout" variant="text" theme="default">
                        <template #icon><t-icon name="user-circle" size="16" /></template>
                        退出登录
                    </t-button>
                </div>
            </div>
        </t-drawer>
        <t-layout class="nonTop">
            <t-aside class="aside">
                <t-menu theme="light" :default-value="currentItem" style="margin-right: 50px" router>

                    <t-menu-item value="home" v-if="status.currnetRole === 'student'" to="/">
                        <template #icon>
                            <t-icon name="dashboard" />
                        </template>
                        首页
                    </t-menu-item>
                    <t-menu-item value="anno" to="/anno">
                        <template #icon>
                            <t-icon name="edit-1" />
                        </template>
                        {{ status.currnetRole == "student" ? "标注" : "标注审核" }}
                    </t-menu-item>
                    <t-menu-item v-if="status.currnetRole === 'admin'" value="task" to="/task">
                        <template #icon>
                            <t-icon name="server" />
                        </template>
                        任务管理
                    </t-menu-item>
                    <t-menu-item v-if="status.currnetRole === 'admin'" value="check" to="/check">
                        <template #icon>
                            <t-icon name="filter-clear" />
                        </template>
                        审核管理
                    </t-menu-item>
                    <t-menu-item v-if="status.currnetRole === 'admin'" value="student" to="/student">
                        <template #icon>
                            <t-icon name="user-circle" />
                        </template>
                        学生管理
                    </t-menu-item>
                </t-menu>
            </t-aside>
            <t-layout>
                <RouterView class="content" />

                <t-footer class="copy" style="user-select: none; display: flex; justify-content: center;">Copyright @ 2023-{{
                    new
                        Date().getFullYear()
                }}
                    China Pharmaceutical University. All Rights
                    Reserved</t-footer>
            </t-layout>
        </t-layout>
        </t-layout>
    </t-layout>
</template>

<style scoped lang='less'>
.root {
    height: 100vh;
}

.nonTop {
    margin-top: 2px;
}

.content {
    margin: 20px 20px 0 20px;
    height: auto;
    background-color: var(--base-bgc);
}

.menu-button {
    display: none;
}

.drawer {
    border-top: 1px solid #eee;
    display: flex;
    justify-content: center;
    
    .center {
        width: 80%;
        padding: 20px 0;

        button {
            width: 100%;
        }

        .color {
            margin: 20px 0;
        }
    }
}

@media screen and (max-width: 900px) {
    .aside, .s {
        display: none;
    }

    .copy {
        display: none !important;
    }

    .menu-button {
        display: block;
        margin-right: 15px;
    }

    .content {
        margin: 0;
    }

    .nonTop {
        margin: 0;
        border-top: 1px solid #eee;
    }
}
</style>