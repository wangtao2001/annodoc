<script setup lang='ts'>
import { useStore } from '@/store'
import { ref, Ref } from 'vue'

const store = useStore()
const columns = [
    { colKey: 'start', title: '起始', width: '100' },
    { colKey: 'end', title: '终止', width: '100' },
    { colKey: 'content', title: '内容', width: '100' },
    { colKey: 'labelName', title: '标签类型', width: '100' },
]
const data: Ref<Array<Object>> = ref(store.results.slice(0, 6)) // 默认首页是第一页 6个
const change = (current: number) => {
    // 一个包含对象类型值的 ref 可以响应式地替换整个对象
    data.value = store.results.slice((current - 1) * 6, current * 6)
}

const localPriview = () => {
    // 下载到本地
    const jsonString = JSON.stringify(store.results, null, '\t')
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'data.json'
    document.body.appendChild(link)
    link.click()
}
</script>

<template>
    <div class="root">
        <t-base-table class="table" stripe bordered row-key="index" :data="data" :columns="columns"></t-base-table>
        <!--分页功能-->
        <div class="bottom">
            <t-pagination class="page" :total="store.results.length" showPageNumber :showPageSize="false" :pageSize="6"
                showPreviousAndNextBtn totalContent @current-change="change" />
            <div class="option">
                <t-button @click="localPriview">本地预览</t-button>
                <t-button>提交</t-button>
            </div>
        </div>
    </div>
</template>

<style scoped lang='less'>
.root {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
}

.table {
    width: 50vw;
}

.bottom {
    display: flex;
    width: 50vw;
    justify-content: space-between;
    margin-top: 20px;

    .page {
        width: auto;
    }

    .option {
        display: flex;

        .t-button {
            margin-left: 8px;
        }
    }
}
</style>