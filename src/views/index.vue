<script setup lang="tsx">
import {ref} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { statusStore } from '@/store'
 
const status = statusStore()

const toHome = () => {
    window.location.href = "/"
}
// 为了解决刷新后路由与当前选中的menu-item不同的情况
// 本来想用onMounted，但是setup的执行时机比mounted早
const route = useRoute() // 获取当前路由信息
const router = useRouter()
const currentItem = route.path.split('/')[1] // 例如'/anno/work'只要anno，这样就要求路由的路径与muen-item的value相同

const darkMode = ref(true)

const titleImg = ref('/title5.png')
const modeChange = ()=> {
    if (darkMode.value) {
        document.documentElement.setAttribute('theme-mode', 'dark')
        titleImg.value = '/title6.png'
        localStorage.setItem('darkMode', 'false')
    } else {
        document.documentElement.setAttribute('theme-mode', 'light')
        titleImg.value = '/title5.png'
        localStorage.setItem('darkMode', 'true')
    }
    darkMode.value = !darkMode.value
}
const local = localStorage.getItem('darkMode')
// 判断local为null
 if(local === 'true') {
    darkMode.value = true
} else {
    darkMode.value = true
    document.documentElement.setAttribute('theme-mode', 'light')
    titleImg.value = '/title5.png'
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
</script>

<template>
    <t-layout class="root">
        <t-header >
            <t-head-menu height="120px">
                <template #logo>
                    <img style="user-select: none;" @click="toHome" width="180" class="logo" :src="titleImg" alt="logo" />
                </template>
                <t-menu-item class="s"> 工作区 </t-menu-item>
                <t-button class="s" style="margin-left: 10px;" theme="default" variant="text" @click="modeChange" value="item2">{{ darkMode ? '深色模式' : '浅色模式' }}</t-button>
                <template #operations>
                    <t-icon class="t-menu__operations-icon s" name="search" />
                    <t-icon class="t-menu__operations-icon s" name="notification-filled" />
                    <t-icon @click="router.push('/')" class="t-menu__operations-icon s" name="home" />
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
                    <t-button variant="text" theme="default" @click="router.push('/'); closeMenu()">
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
                    <t-button class="color" @click="modeChange(); closeMenu()" theme="default">
                        {{ darkMode ? '深色模式' : '浅色模式' }}
                    </t-button>
                </div>
            </div>
        </t-drawer>
        <t-layout style="margin-top: 2px;">
            <t-aside class="aside">
                <t-menu theme="light" :default-value="currentItem" style="margin-right: 50px" router>

                    <t-menu-item value="home" to="/">
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
                    <t-menu-item v-if="status.currnetRole === 'admin'" value="space" to="/student">
                        <template #icon>
                            <t-icon name="user-circle" />
                        </template>
                        学生管理
                    </t-menu-item>
                </t-menu>
            </t-aside>
            <t-layout>
                <RouterView class="content" />

                <t-footer style="user-select: none; display: flex; justify-content: center;">Copyright @ 2023-{{
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
            margin-top: 20px;
        }
    }
}

@media screen and (max-width: 900px) {
    .aside, .s {
        display: none;
    }

    .menu-button {
        display: block;
        margin-right: 15px;
    }
}
</style>