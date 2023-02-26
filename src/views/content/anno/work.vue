<script setup lang='ts'>
import AnnoCard from '@/components/anno-card.vue'
import RelaCard from '@/components/rela-card.vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/store'
import pubsub from 'pubsub-js'

const store = useStore()
const router = useRouter()
const route = useRoute()

console.log(route.query)

var text: string = "冠状病毒是一个大型病毒家族，冠状病毒已知可引起感冒、中东呼吸综合征（MERS）和严重急性呼吸综合征（SARS）等较严重疾病。新型冠状病毒是以前从未在人体中发现的冠状病毒新毒株。\n人感染了冠状病毒后的常见体征有呼吸道症状、发热、咳嗽、气促和呼吸困难等。在较严重病例中，感染可导致肺炎、严重急性呼吸综合征、肾衰竭，甚至死亡。"


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

const returnList = () => {
    store.results.length = 0
    store.relaResults.length = 0
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
            <AnnoCard :text="text" style="margin-right: 20px;"></AnnoCard>
            <RelaCard style="flex-grow: 1;"></RelaCard>
        </div>
        <t-card class="bottom-card">
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
        width: 75vw;
    }

    .bottom-card {
        width: 75vw;
        margin-top: 20px;

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