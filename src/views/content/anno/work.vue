<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { mainStore, statusStore } from '@/store'
import pubsub from 'pubsub-js'
import {request, getConfig} from '@/methods/request'
import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import {labelIdToLabel, idToResult, idToRela} from '@/methods/util'
import { v4 as uuidv4 } from 'uuid'

const store = mainStore()
const status = statusStore()
const router = useRouter()


var entityResults: Array<any>
var relationResults: Array<any>

const hasText = ref(false) // 用来渲染页面, 避免没有任务时出现空页面
const isStudent = status.currentUser.role === 'student'
var hasAlreadyResult = false

var fl = true
const loadText = async() => {
    request(
        getConfig,
        `/api/getResponses/${isStudent ? "getTextToMarkStudent": "getTextToMarkChecker" }?grade=${status.currentUser.grade}&number=${status.currentUser.number}`,
        (data) => {
            hasText.value = true
            if(!isStudent && data.entityResults.length != 0) { // 有没有已经标注好的结果，没有就是0
                hasAlreadyResult = true
            }
            status.currentText = isStudent ? data.text : data.originalText // 后端设计缺陷
            status.currentTextId = data.textId
            if (hasAlreadyResult) {
                // 将后端结果转换为Result 和 RelaResult
                // 这里先不做，加载完实体和关系类型后在做
                entityResults = data.entityResults
                relationResults = data.relationResults
            }
            if (data.taskId == status.currentTaskId) {
                // 仍然属于同一个任务，不需要重新加载标签
                fl = false
            } else status.currentTaskId = data.taskId
        },
        undefined, undefined,
        () => router.push('/anno/type')
    )
}

const loadLabels = async() => {
    request(
        getConfig,
        `/api/getResponses/tasks/${status.currentTaskId}`,
        (data) => {
            for (var entity of data.entitys) {
                status.currentLabels.push({
                    type: entity.type,
                    shortcut: entity.shortcut,
                    color: entity.color,
                    id: entity.id,
                })
            }
            for (var rela of data.relations) {
                status.currentRelas.push({
                    id: rela.id,
                    type: rela.type,
                    entity1: rela.entity1,
                    entity2: rela.entity2,
                    bothway: rela.bothway,
                })
            }
        }
    )
}

const asyncComponent = ref(false)
const init = async ()=> {
    await loadText()
    if (fl) await loadLabels()
     // 等实体关系标签加载结束
    if (hasAlreadyResult) {
        // 先做实体
        // 这里需要重置id
        const entityIdToNew = new Map()
        store.results.length = 0 // 先清空
        for(var i=0; i< entityResults.length; i++) {
            const c = entityResults[i]
            const newId = uuidv4()
            entityIdToNew.set(c.id, newId)
            c.id = newId
            store.results.push({
                id: c.id,
                number: i,
                start: c.start,
                end: c.end,
                content: status.currentText.slice(c.start, c.end),
                labelId: c.typeId,
                labelName: labelIdToLabel(c.typeId)!.type
            })
        }
        // 再做关系
        store.relaResults.length = 0
        for (var i=0; i< relationResults.length; i++) {
            const c = relationResults[i]
            // 更新start和id entity的id
            c.entityResult1 = entityIdToNew.get(c.entityResult1)
            c.entityResult2 = entityIdToNew.get(c.entityResult2)
            store.relaResults.push({
                id: uuidv4(), // 关心更改id不需要记录
                startContent: idToResult(c.entityResult1)!.content,
                startNumber: idToResult(c.entityResult1)!.number,
                endContent: idToResult(c.entityResult2)!.content,
                endNumber: idToResult(c.entityResult2)!.number,
                relaId: c.typeId,
                relaName: idToRela(c.typeId)!.type
            })
        }
    }
    if (hasAlreadyResult) {
        MessagePlugin.info("请进行审核")
    } else if (!hasAlreadyResult && status.currentUser.role !== 'student') {
        MessagePlugin.warning("请进行标注")
    }
    asyncComponent.value = true // 确保父组件这些配置项加载完成之后加载子组件
}

init()

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
    <div class="root" v-if="hasText">
        <!--标注区域的卡片-->
        <div class="card" v-if="asyncComponent">
            <AnnoCard class="anno-card" ></AnnoCard>
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

        .anno-card {
            margin-right: 20px; 
            flex-grow: 1;
        }
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

@media screen and (max-width: 900px) {
    .card {
        flex-direction: column !important;

        .anno-card {
            margin: 0 !important;
            margin-bottom: 10px !important;
        }
    }
}
</style>