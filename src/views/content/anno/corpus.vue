<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { corpusState, statusStore } from '@/store'
import { request, getConfig, postConfig } from '@/methods/request'
import { UserRole } from '@/interface'
const router = useRouter()
const corpus = corpusState()
const state = statusStore()
const isStudent = state.user.role == UserRole.student

const data = ref({
    text: "",
    title: "",
    chapter: "",
    question: "",
    answer: ""
})
let currentPairId = ""

const radioValue = ref(-1) // 初始状态谁都不选

const next = async () => {
    console.log(radioValue.value)
    // 提交信息
    await request(
        postConfig, `/api/corpus/accept/${isStudent ? 'approveStudent': 'approveChecker'}`,
        (data) => {
            console.log(data)
        },
        {number: state.user.number, corpusId: corpus.currentCorpusId ,pairId: currentPairId, approve: radioValue.value},
        "提交成功"
    )
    // 路由跳转
    window.open('/anno/corpus', "_self")
}


const init = async () => {
    await request(
        getConfig, `/api/corpus/getResponses/${isStudent ? 'getCorpusStudent': 'getCorpusChecker'}?number=${state.user.number}&currentCorpusId=${corpus.currentCorpusId}&grade=${state.user.grade}`,
        (res) => {
            data.value.text = res.text.replace(/\\n/g, '<br>') // 换行
            data.value.title = res.title
            data.value.chapter = res.chapter
            data.value.question = res.pair.question
            data.value.answer = res.pair.answer
            corpus.currentCorpusId = res.id // corpusId后面会继续使用就存到pinia中了
            currentPairId = res.pair.id //pairId只在当前页使用
        }, undefined, undefined,
        () => {router.push('/anno/type')}
    )
}

init()
let hasTip: boolean = false
if (data.value.question.indexOf("问") == -1) {
    hasTip = true
}
</script>

<template>
    <div class="root">
        <div class="card">
            <t-card bordered class="text">
                <div class="info">{{ data.title + "  " + data.chapter }}</div>
                <div v-html="data.text"></div>
            </t-card>
            <t-card bordered class="qa">
                <div class="q"><span v-if="!hasTip">问句：</span>{{ data.question }}</div>
                <div class="a"><span v-if="!hasTip">回答：</span>{{ data.answer }}</div>
                <t-radio-group class="radio-group" v-model:value="radioValue">
                    <t-radio value=0>不采纳</t-radio>
                    <t-radio value=1>采纳</t-radio>
                </t-radio-group>
            </t-card>
        </div>
        <t-card class="bottom-card">
            <div class="option">
                <t-button variant="outline" @click="router.push('/anno/type')">返回</t-button>
                <div class="next">
                    <t-button variant="outline" :disabled="radioValue == -1" @click="radioValue = -1">取消选择</t-button>
                    <t-button :disabled="radioValue == -1" @click="next">下一条</t-button>
                </div>
            </div>
        </t-card>
    </div>
</template>

<style scoped lang="less">
.root {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .card {
        display: flex;
        flex-direction: row;
        width: 90%;

        .text {
            width: 50%;
            margin-right: 20px;
            display: flex;
            align-items: center;

            .info {
                margin-bottom: 10px;
                color: #747474;
            }
        }

        .qa {
            width: 50%;
            .q, .a {
                margin: 10px 0;
            }

            .radio-group {
                margin-top: 30px;
                width: 100%;
                justify-content: flex-end;
            }

            span {
                font-weight: bold;
                margin: 20px 0;
            }
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
    user-select: none;
}

@media screen and (max-width: 900px) {
    .card {
        flex-direction: column !important;

        .text {
            width: 100% !important;
            margin: 0 !important;
            margin-bottom: 10px !important;
        }

        .qa {
            width: 100% !important;
            margin: 0 !important;
        }
    }

}
</style>