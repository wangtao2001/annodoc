<script lang="ts" setup>
import { useRoute } from 'vue-router'
import  counter from '@/components/counter.vue'
import { statusStore } from '@/store'

const status = statusStore()
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
            <counter v-if="route.meta.breadcrumbLevel as number > 1" />
        </t-breadcrumb>
        <RouterView />
    </t-layout>
</template>

<style lang="less" scoped>
.bread {
    margin: 20px 20px 50px 20px;
    user-select: none;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .b {
        display: flex;
        flex-direction: row;
    }
}

@media screen and (max-width: 900px) {
    .b {
        flex-direction: column !important;
    }
}
</style>