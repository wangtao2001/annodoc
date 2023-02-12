<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const toHome = () => {
    router.push('/')
}
// 为了解决刷新后路由与当前选中的menu-item不同的情况
// 暂时只对一级路由有效，二级路由有没有BUG暂时不知道
// 本来想用onMounted，但是setup的执行时机比mounted早
const route = useRoute() // 获取当前路由信息
const currentItem = route.path.substring(1) // 将'/'切除，这样就要求路由的路径与muen-item的value相同

</script>

<template>
    <t-layout class="root">
        <t-aside>
            <t-menu theme="light" :default-value="currentItem" style="margin-right: 50px" router>
                <template #logo>
                    <img style="user-select: none;" @click="toHome" width="180" class="logo" src="/title5.png"
                        alt="logo" />
                </template>
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
                <t-menu-item :disabled="true" value="upload">
                    <template #icon>
                        <t-icon name="server" />
                    </template>
                    上传标注内容
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
            <t-content class="content">
                <RouterView />
            </t-content>
            <t-footer style="user-select: none; display: flex; justify-content: center;">Copyright @ 2023-{{
                new
            Date().getFullYear()
            }}
                China Pharmaceutical University. All Rights
                Reserved</t-footer>
        </t-layout>
    </t-layout>
</template>

<style scoped lang='less'>
.root {
    height: 100vh;
}

.title {
    font-size: 20px;
}

.content {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>