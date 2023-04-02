<script setup lang='ts'>
import { useRouter } from 'vue-router'
const router = useRouter()

const columns = [
    { colKey: 'type', title: '类型', width: '50' },
    { colKey: 'id', title: 'ID', width: '50' },
    { colKey: 'name', title: '名称', width: '50' },
    { colKey: 'desc', title: '描述', width: '100' },
    { colKey: 'cTime', title: '创建时间', width: '100' },
    { colKey: 'mTime', title: '修改时间', width: '100' },
    { colKey: 'op', title: '操作', width: '100' },
]

const tabs = [
    { value: 1, title: '全部' },
    { value: 2, title: '医学文本' },
    { value: 3, title: '电子病历' }
]

const createTask = () => {
    router.push('/task/new')
}
</script>

<template>
    <div class="root">
        <div class="container">
            <t-tabs :default-value="1">
                <t-tab-panel v-for="tab in tabs" :value="tab.value" :label="tab.title">
                    <t-base-table class="table" stripe bordered row-key="index" :columns="columns"></t-base-table>
                </t-tab-panel>
            </t-tabs>
            <t-button class="new" @click="createTask">创建任务</t-button>
        </div>
    </div>
</template>

<style scoped lang='less'>
.root {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    user-select: none;

    .container {
        width: 80%;
        margin-left: 40px;

        .table {
            margin-top: 20px;
            margin-bottom: 20px;
        }

        .new {
            margin-bottom: 20px;
        }
    }
}
</style>