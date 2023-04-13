<script setup lang='ts'>
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import { ref, Ref } from 'vue'
import { downloadLocal } from '@/methods/util'
import axios from 'axios'
import { Result, RelaResult } from '@/interface'
import { resultNumberToId} from '@/methods/util'
import { MessagePlugin } from 'tdesign-vue-next';

const router = useRouter()

const store = useStore()
const columns = [
    { colKey: 'number', title: '编号', width: '50' },
    { colKey: 'start', title: '起始', width: '50' },
    { colKey: 'end', title: '终止', width: '50' },
    { colKey: 'content', title: '内容', width: '120' },
    { colKey: 'labelName', title: '标签类型', width: '50' },
]
const realcColumns = [
    { colKey: 'startNumber', title: '起始实体编号', width: '50' },
    { colKey: 'startContent', title: '起始实体内容', width: '50' },
    { colKey: 'endNumber', title: '结束实体编号', width: '50' },
    { colKey: 'endContent', title: '结束实体内容', width: '50' },
    { colKey: 'relaName', title: '关系', width: '50' },
]
const pageSize: number = 6
const data: Ref<Array<Object>> = ref(store.results.slice(0, pageSize)) // 默认首页是第一页 6个
const relaData: Ref<Array<Object>> = ref(store.relaResults.slice(0, pageSize))
const change = (current: number) => {
    // 一个包含对象类型值的 ref 可以响应式地替换整个对象
    data.value = store.results.slice((current - 1) * pageSize, current * pageSize)
    relaData.value = store.relaResults.slice((current - 1) * pageSize, current * pageSize)
}

const showLabel = ref(true)

const dataLength = ref(store.results.length) // 初始值
const tabChange = () => {
    showLabel.value = !showLabel.value
    if (showLabel.value) {
        dataLength.value = store.results.length
    } else {
        dataLength.value = store.relaResults.length
    }
}

const resultFormat = () => {
    const labels = store.results // 这一步是为了去除无效的span字段
    const new_labels = labels.map((item: Result) => {
        return {
            id: item.id,
            start: item.start,
            end: item.end,
            type: item.labelId,
        }
    })
    const new_rela = store.relaResults.map((item: RelaResult) => {
        return {
            id: item.id,
            entityResult1: resultNumberToId(item.startNumber),
            entityResult2: resultNumberToId(item.startNumber), // 最终结果给的是id而不是number，但是不能改RelaResult的类型
            type: item.relaId,
        }
    })
    return {
        'studentNumber': '2020192462',
        'textId': '000000000',
        'entitys': new_labels,
        'relations': new_rela,
    }
}

const localPriview = () => {
    // 下载到本地
    const jsonString = JSON.stringify(resultFormat() , null, '\t')
    downloadLocal(jsonString, 'data.json')
}

// 上传后端
const uploadResult = async () => {
    const res = await axios.post('/api/resultAccepts/annotationResults', resultFormat())
    if(res.status == 200) {
        if (res.data.code == 20041) {
            MessagePlugin.success('提交成功')
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('提交失败')
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
            <t-pagination class="page" :total="dataLength" showPageNumber :showPageSize="false" :pageSize="pageSize"
                showPreviousAndNextBtn totalContent @current-change="change" />
            <div class="option">
                <t-button variant="outline" @click="router.back()">返回</t-button>
                <t-button :disabled="store.results.length != 0 ? false : true" @click="localPriview">本地预览</t-button>
                <t-button :disabled="store.results.length != 0 ? false : true" @click="uploadResult">提交</t-button>
                <t-button >下一份</t-button>
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
    margin: 0 15% 20px 0;
}

.table {
    width: 70%;
}

.bottom {
    display: flex;
    width: 70%;
    justify-content: space-between;
    margin: 20px 0;

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