<script setup lang="tsx">
import {ref} from 'vue'
import { useRoute } from 'vue-router'
import { CloseIcon, CheckIcon } from 'tdesign-icons-vue-next';
const toHome = () => {
    window.location.href = "/"
}
// 为了解决刷新后路由与当前选中的menu-item不同的情况
// 本来想用onMounted，但是setup的执行时机比mounted早
const route = useRoute() // 获取当前路由信息
const currentItem = route.path.split('/')[1] // 例如'/anno/work'只要anno，这样就要求路由的路径与muen-item的value相同

const darkMode = ref(false)
const titleImg = ref('/title5.png')
const modeChange = ()=> {
    if (darkMode.value) {
        document.documentElement.setAttribute('theme-mode', 'dark')
        titleImg.value = '/title6.png'
    } else {
        document.documentElement.setAttribute('theme-mode', 'light')
        titleImg.value = '/title5.png'
    }
    darkMode.value = !darkMode.value
}

</script>

<template>
    <t-layout class="root">
        <t-header>
            <t-head-menu value="item1" height="120px">
                <template #logo>
                    <img style="user-select: none;" @click="toHome" width="180" class="logo" :src="titleImg" alt="logo" />
                </template>
                <t-menu-item value="item1"> 工作区 </t-menu-item>
                <t-button style="margin-left: 10px;" theme="default" variant="text" @click="modeChange" value="item2"> {{ darkMode ? '深色模式' : '浅色模式' }} </t-button>
                <template #operations>
                    <a><t-icon class="t-menu__operations-icon" name="search" /></a>
                    <a><t-icon class="t-menu__operations-icon" name="notification-filled" /></a>
                    <a><t-icon class="t-menu__operations-icon" name="home" /></a>
                </template>
            </t-head-menu>
        </t-header>
        <t-layout style="margin-top: 2px;">
            <t-aside>
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
                        标注
                    </t-menu-item>
                    <t-menu-item value="task" to="/task">
                        <template #icon>
                            <t-icon name="server" />
                        </template>
                        任务管理
                    </t-menu-item>
                    <t-menu-item value="check" to="/check">
                        <template #icon>
                            <t-icon name="filter-clear" />
                        </template>
                        审核管理
                    </t-menu-item>
                    <t-menu-item value="space" to="/space">
                        <template #icon>
                            <t-icon name="user-circle" />
                        </template>
                        个人中心
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
</style>