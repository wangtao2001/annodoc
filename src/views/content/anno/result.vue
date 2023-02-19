<script setup lang='ts'>
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import { ref, Ref, computed } from 'vue'

const router = useRouter()

const store = useStore()
const columns = [
    { colKey: 'number', title: '编号', width: '50' },
    { colKey: 'start', title: '起始', width: '50' },
    { colKey: 'end', title: '终止', width: '50' },
    { colKey: 'content', title: '内容', width: '150' },
    { colKey: 'labelName', title: '标签类型', width: '50' },
]
const realcColumns = [
    { colKey: 'startNumber', title: '起始实体编号', width: '50' },
    { colKey: 'startContent', title: '起始实体内容', width: '50' },
    { colKey: 'endNumber', title: '结束实体编号', width: '50' },
    { colKey: 'endContent', title: '结束实体内容', width: '50' },
    { colKey: 'relaContent', title: '关系', width: '50' },
]
const data: Ref<Array<Object>> = ref(store.results.slice(0, 6)) // 默认首页是第一页 6个
const relaData: Ref<Array<Object>> = ref(store.relaResults.slice(0, 6))
const change = (current: number) => {
    // 一个包含对象类型值的 ref 可以响应式地替换整个对象
    data.value = store.results.slice((current - 1) * 6, current * 6)
    relaData.value = store.relaResults.slice((current - 1) * 6, current * 6)
}

const localPriview = () => {
    // 下载到本地

    const labels = store.results // 这一步是为了去除无效的span字段
    for (var l of labels) {
        delete l.span
    }
    const jsonString = JSON.stringify({
        'label': labels, // 这里最好把span字段排除掉
        'relation': store.relaResults
    }, null, '\t')
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'data.json'
    document.body.appendChild(link)
    link.click()
}

const showLabel = ref(true)

const dataLength = ref(store.results.length) // 初始值
const tabChange = () => {
    showLabel.value = !showLabel.value
    if (showLabel.value) {
        dataLength.value = store.results.length
    } else {
        console.log('修改')
        dataLength.value = store.relaResults.length
    }
}

</script>

<template>
    <div class="root">
        <t-radio-group class="tab" @change="tabChange" default-value="1">
            <t-radio-button value="1">实体列表</t-radio-button>
            <t-radio-button value="2">关系列表</t-radio-button>
        </t-radio-group>
        <t-base-table v-if="showLabel" class="table" stripe bordered row-key="index" :data="data"
            :columns="columns"></t-base-table>
        <t-base-table v-else class="table" stripe bordered row-key="index" :data="relaData"
            :columns="realcColumns"></t-base-table>
        <!--分页功能-->
        <div class="bottom">
            <t-pagination class="page" :total="dataLength" showPageNumber :showPageSize="false" :pageSize="6"
                showPreviousAndNextBtn totalContent @current-change="change" />
            <div class="option">
                <t-button @click="router.back()">返回</t-button>
                <t-button :disabled="store.results.length != 0 ? false : true" @click="localPriview">本地预览</t-button>
                <t-button :disabled="store.results.length != 0 ? false : true">提交</t-button>
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
    user-select: none;
}

.tab {
    align-self: flex-end;
    margin: 0 12vw 20px 0;
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