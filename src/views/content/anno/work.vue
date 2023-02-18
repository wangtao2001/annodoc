<script setup lang='ts'>
import AnnoCard from '@/components/anno-card.vue'
import RelaCard from '@/components/rela-card.vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/store'
import task from '../../../../data/task.json'

const store = useStore()
const route = useRoute()
const router = useRouter()

var text: string = ""
// 获取id参数确定唯一的任务
const taskId: string = route.query.id as string
// 这里应当是从后端获取文本，暂时就模拟查找了
for (var obj of task) {
    if (obj.id == taskId) {
        text = obj.text
        break
    }
}


const cancel = () => {
    window.getSelection()!.empty()
    const allSpan = document.querySelectorAll('.onselect')
    for (var span of allSpan) { // 全部取消
        span.replaceWith(span.childNodes[1])
    }
    store.results.length = 0 // 清空store
}

const returnList = () => {
    store.results.length = 0
    store.resultsContainer = undefined
    router.push('/anno/list')
}

const finish = () => {
    store.resultsContainer = document.querySelector('.anno-area')
    router.push('/anno/result')
}

</script>

<template>
    <div class="root">
        <!--标注区域的卡片-->
        <div class="card">
            <AnnoCard :text="text"></AnnoCard>
            <RelaCard></RelaCard>
        </div>
        <t-card class="bottom-card" style="margin-top: 20px;">
            <div class="option">
                <t-button @click="returnList">返回</t-button>
                <div class="next">
                    <t-button @click="cancel">全部取消</t-button>
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
        width: 70vw;
        justify-content: space-between;
    }

    .bottom-card {
        width: 70vw;

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