<script lang="ts" setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
    <t-layout>
        <t-breadcrumb class="bread">
            <div class="b">
                <t-breadcrumbItem to="/anno/type" v-if="route.meta.breadcrumbLevel as number > 0"> 任务选择 </t-breadcrumbItem>
                <t-breadcrumbItem to="/anno/work" v-if="route.meta.breadcrumbLevel as number > 1"> 标注 </t-breadcrumbItem>
                <t-breadcrumbItem to="/anno/result" v-if="route.meta.breadcrumbLevel as number > 2"> 标注结果 </t-breadcrumbItem>
            </div>
            <div class="num" v-if="route.meta.breadcrumbLevel as number > 1">当前：67/200</div>
        </t-breadcrumb>
        <RouterView />
    </t-layout>
</template>

<style lang="less" scoped>
.bread {
    margin: 20px 0 50px 20px;
    user-select: none;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .b {
        display: flex;
        flex-direction: row;
    }

    .num {
        margin: 0 20px 0 0;
        color: #0052d9;
        background-color: #f3f3f3;
        padding: 10px 20px;
    }
}
</style>