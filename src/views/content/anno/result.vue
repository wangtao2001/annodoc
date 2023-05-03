<script setup lang='ts'>
import { mainStore, statusStore } from '@/store'
import { useRouter } from 'vue-router'
import { ref, Ref } from 'vue'
import { downloadLocal } from '@/methods/util'
import axios from 'axios'
import { Result, RelaResult } from '@/interface'
import { resultNumberToId} from '@/methods/util'
import { MessagePlugin } from 'tdesign-vue-next';

const router = useRouter()

const store = mainStore()
const status = statusStore()
const columns = [
    { colKey: 'number', title: '编号'},
    { colKey: 'start', title: '起始'},
    { colKey: 'end', title: '终止'},
    { colKey: 'content', title: '内容'},
    { colKey: 'labelName', title: '标签类型'},
]
const realcColumns = [
    { colKey: 'startNumber', title: '起始实体编号'},
    { colKey: 'startContent', title: '起始实体内容'},
    { colKey: 'endNumber', title: '结束实体编号'},
    { colKey: 'endContent', title: '结束实体内容'},
    { colKey: 'relaName', title: '关系'},
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
            typeId: item.labelId,
        }
    })
    const new_rela = store.relaResults.map((item: RelaResult) => {
        return {
            id: item.id,
            entityResult1: resultNumberToId(item.startNumber),
            entityResult2: resultNumberToId(item.startNumber), // 最终结果给的是id而不是number，但是不能改RelaResult的类型
            typeId: item.relaId,
        }
    })
    return {
        'number': status.currentNumebr,
        'textId': status.currentTextId,
        'entitys': new_labels,
        'relations': new_rela,
        'pass': status.currnetRole === "student" ? 0: 2
    }
}

const localPriview = () => {
    // 下载到本地
    const jsonString = JSON.stringify(resultFormat() , null, '\t')
    downloadLocal(jsonString, 'data.json')
}

// 上传后端
const uploadResult = async () => {
    const data = resultFormat()
    console.log(data)
    const res = await axios.post('/api/resultAccepts/annotationResults', data)
    if(res.status == 200) {
        if (res.data.code == 20011) {
            MessagePlugin.success('提交成功')
            window.open('/anno/work?type=text', "_self") // 上传完再跳转不能用router.push
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('提交失败')
}

</script>

<template>
    <div class="root">
        <t-radio-group class="tab" @change="tabChange" default-value="1" variant="default-filled">
            <t-radio-button value="1">实体列表</t-radio-button>
            <t-radio-button value="2">关系列表</t-radio-button>
        </t-radio-group>
        <t-base-table v-if="showLabel" class="table" stripe bordered row-key="index" :data="data"
            :columns="columns"
            table-layout="auto"></t-base-table>
        <t-base-table v-else class="table" stripe bordered row-key="index" :data="relaData"
            :columns="realcColumns"
            table-layout="auto"></t-base-table>
        <!--分页功能-->
        <div class="bottom">
            <t-pagination class="page" :total="dataLength" showPageNumber :showPageSize="false" :pageSize="pageSize"
                showPreviousAndNextBtn totalContent @current-change="change" />
            <div class="option">
                <t-button variant="outline" @click="router.back()">返回</t-button>
                <t-button :disabled="store.results.length != 0 ? false : true" @click="localPriview">本地预览</t-button>
                <t-button :disabled="store.results.length != 0 ? false : true" @click="uploadResult">提交</t-button>
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
            margin-right: 8px;
        }
    }
}

@media screen and (max-width: 900px) {
    .root {
        margin-left: 20px;
        margin-right: 20px;
    }

    .tab {
        margin-right: 0;
    }

    .table {
        width: 100%;
    }

    .bottom {
        flex-direction: column;
        width: 100%;

        .option {
            margin-top: 10px;
        }
    }
}
</style>