<script lang="ts" setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
    <t-layout>
        <t-breadcrumb class="bread">
            <t-breadcrumbItem to="/anno/list" v-if="route.meta.breadcrumbLevel as number > 0"> 标注列表 </t-breadcrumbItem>
            <t-breadcrumbItem to="/anno/work" v-if="route.meta.breadcrumbLevel as number > 1"> 标注 </t-breadcrumbItem>
            <t-breadcrumbItem to="/anno/result" v-if="route.meta.breadcrumbLevel as number > 2"> 标注结果 </t-breadcrumbItem>
        </t-breadcrumb>
        <RouterView />
    </t-layout>
</template>

<style lang="less" scoped>
.bread {
    margin: 20px 0 50px 20px;
    user-select: none;
}
</style>