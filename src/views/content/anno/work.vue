<script setup lang='ts'>
import AnnoCard from '@/components/anno-card.vue'
import RelaCard from '@/components/rela-card.vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/store'
import pubsub from 'pubsub-js'

const store = useStore()
const router = useRouter()

var text: string = "消化性溃疡，又称胃及十二指肠溃疡。这是指胃、小肠前段（十二指肠）或幽门，有时也包含了食道下端的黏膜损伤（溃疡）。在胃发生的溃疡称作胃溃疡，在小肠的开头部分所发生的溃疡则是十二指肠溃疡。最常见的症状是会因为吃东西而改善的上腹痛，或者晚上因肚子痛而醒来。胃溃疡的疼痛大多被用“烧灼感”或“闷痛”描述，其他常见的症状还包括打嗝、呕吐、不明原因的体重减轻、或是胃口不佳，但年纪较大的患者中约有三分之一完全没有症状 。胃溃疡若不处理，可能会演变成出血、穿孔、或是胃出口阻塞，出血的发生率约为15%。"


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
    store.resultsContainer = undefined
    router.push('/anno/type')
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
                <t-button @click="returnType">返回</t-button>
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