<script setup lang='ts'>
import AnnoCard from '@/components/anno-card.vue'
import RelaCard from '@/components/rela-card.vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/store'
import pubsub from 'pubsub-js'
import axios from 'axios'
import { ref, Ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { LabelInfo, RelaInfo } from '@/interface'

const store = useStore()
const router = useRouter()

var fl = true
const loadText = async() => {
    const res = await axios.get(`/api/getResponses/getTextToMarkStudent?grade=${store.currentGrade}&number=${store.currentNumebr}`)
    if (res.status == 200) {
        if (res.data.code == 20041) {
            store.currentText = res.data.data.text
            store.currentTextId = res.data.data.textId
            if (res.data.data.taskId == store.currentTaskId) {
                // 仍然属于同一个任务，不需要重新加载标签
                fl = false
            } else store.currentTaskId = res.data.data.taskId
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error("获取文本失败")
}

const loadLabels = async() => {
    const res = await axios.get(`/api/getResponses/tasks/${store.currentTaskId}`)
    if (res.status == 200) {
        if (res.data.code == 20041) {
            for (var entity of res.data.data.entitys) {
                store.currentLabels.push({
                    type: entity.type,
                    shortcut: entity.shortcut,
                    color: entity.color,
                    id: entity.id,
                })
            }
            for (var rela of res.data.data.relations) {
                store.currentRelas.push({
                    id: rela.id,
                    type: rela.type,
                    entity1: rela.entity1,
                    entity2: rela.entity2,
                    bothway: rela.bothway,
                })
            }
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error("获取标签失败")
}

loadText().then(() => {
    if (fl) loadLabels() // 一定要在loadText之后，因为loadText中会修改store中的currentTaskId
})



const cancel = () => {
    window.getSelection()!.empty()
    const allSpan = document.querySelectorAll('.onselect')
    for (var span of allSpan) { // 全部取消
        span.replaceWith(span.childNodes[1])
    }
    store.results.length = 0 // 清空store
    store.relaResults.length = 0
    // 清空relaView，组件通信，使用消息订阅发布
    pubsub.publish("cleanAll")
}

const returnType = () => {
    store.results.length = 0
    store.relaResults.length = 0
    router.push('/anno/type')
}

const finish = () => {
    router.push('/anno/result')
}

</script>

<template>
    <div class="root">
        <!--标注区域的卡片-->
        <div class="card">
            <AnnoCard style="margin-right: 20px; flex-grow: 1;"></AnnoCard>
            <RelaCard ></RelaCard>
        </div>
        <t-card class="bottom-card">
            <div class="option">
                <t-button variant="outline" @click="returnType">返回</t-button>
                <div class="next">
                    <t-button variant="outline" @click="cancel">全部取消</t-button>
                    <t-button @click="finish">完成</t-button>
                </div>
            </div>
        </t-card>
    </div>
</template>

<style scoped lang='less'>
// 对每个页面单独设置宽高
.root {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .card {
        display: flex;
        flex-direction: row;
        width: 90%;
    }

    .bottom-card {
        width: 90%;
        margin: 20px 0;

        .option {
            display: flex;
            justify-content: space-between;

            .next button {
                margin-left: 8px;
            }

        }
    }
}

button {
    user-select: none; // 除了选区部分其他都不能选，可能会出现问题
}
</style>