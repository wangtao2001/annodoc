<script lang="ts" setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
    <t-layout>
        <t-breadcrumb class="bread">
            <t-breadcrumbItem v-if="route.meta.breadcrumbLevel as number > 0" to="/task/list"> 任务管理 </t-breadcrumbItem>
            <t-breadcrumbItem v-if="route.meta.breadcrumbLevel as number > 1" to="/task/new"> 创建任务 </t-breadcrumbItem>
        </t-breadcrumb>
        <RouterView  v-slot="{ Component }">
            <!--注意不是路由的name 而是组件的name!!!-->
            <keep-alive include="list">
                <component :is="Component"/>
            </keep-alive>
        </RouterView>
    </t-layout>
</template>

<style lang="less" scoped>
.bread {
    margin: 20px 0 20px 20px;
    user-select: none;
}
</style>