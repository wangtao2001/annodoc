<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { corpusState, statusStore } from '@/store'
import { request, getConfig, postConfig } from '@/methods/request'
import { UserRole } from '@/interface'
import pubsub from 'pubsub-js'
import { domainToUnicode } from 'url'
const router = useRouter()
const corpus = corpusState() // 这个功能先不用了
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
    // 提交信息
    await request(
        postConfig, `/api/corpus/accept/${isStudent ? 'approveStudent' : 'approveChecker'}`,
        (data) => { },
        { number: state.user.number, corpusId: corpus.currentCorpusId, pairId: currentPairId, approve: radioValue.value },
        "提交成功"
    )
    // 路由跳转
    //window.open('/anno/corpus', "_self") 这里相当于重新请求页面了。。。
    init()
}


const init = async () => {
    radioValue.value = -1 // 重置状态数据
    await request(
        getConfig, `/api/corpus/getResponses/${isStudent ? 'getCorpusStudent' : 'getCorpusChecker'}?number=${state.user.number}&grade=${state.user.grade}`,
        (res) => {
            data.value.text = res.text.replace(/-+[\s\d]*-+\s*[xX]?\n?/g, '').replace(/国家市场监督管理总局发布\n?/g, '').replace(/国家市场监督管理总局规章\n?/g, '').replace(/国家药品监督管理局发布\n?/g, '').replace(/\n/g, '<br>').replace(/<img src=\"[a-z\d-]*.png\"\/>\n?。?/g, '') // 换行 // 分页符
            data.value.title = res.title
            data.value.chapter = res.chapter
            data.value.question = res.pair.question
            data.value.answer = res.pair.answer
            corpus.currentCorpusId = res.id // corpusId后面会继续使用就存到pinia中了
            currentPairId = res.pair.id //pairId只在当前页使用
        }, undefined, undefined,
        () => { router.push('/anno/type') }
    )
    // 通知计数器更新
    pubsub.publish('counterCheckUpdate')
}

init()
// let hasTip: boolean = false
// if (data.value.question.indexOf("问") == -1) {
//     hasTip = true
// }

const selectText = ref('') // 问题和答案中被选中的文本
onMounted(() => {
    const func = (e: Event) => {
        const s = window.getSelection()!
        if (s.rangeCount) {
            const rang = s.getRangeAt(0)
            if (rang.collapsed) {
                return
            }
            const tag: Element = e.target as Element
            let c: string
            if (tag.classList.contains('q')) c = data.value.question
            else c = data.value.answer
            selectText.value = c.substring(rang['startOffset'], rang['endOffset'])
        }
    }
    document.querySelector('.q')?.addEventListener('click', func)
    document.querySelector('.a')?.addEventListener('click', func)
    document.querySelector('.root')?.addEventListener('click', (e) => { // 其他位置取消选中
        const tag: Element = e.target as Element
        if (tag.classList.contains('q') || tag.classList.contains('a')) return
        selectText.value = ''
    })
})

watch(selectText, async (new_, old) => {
    var div = document.getElementById('content')!
    if (new_.length != 0) {
        div.innerHTML = data.value.text // 首先清除原有标记
        var highlightedText = div.innerHTML.replace(new RegExp(new_, 'g'), '<span class="highLight">' + new_ + '</span>')
        div.innerHTML = highlightedText
    }
    else {
        div.innerHTML = data.value.text
    }

})

</script>

<template>
    <div class="root">
        <div class="card">
            <t-card bordered class="text">
                <div class="info">{{ data.title + " " + data.chapter }}</div>
                <div id="content" v-html="data.text"></div>
            </t-card>
            <t-card bordered class="qa">
                <div class="q">{{ data.question }}</div>
                <div class="a">{{ data.answer }}</div>
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
        <t-back-top class="backTop" size="small" shape="circle" style="position: absolute; right: 30px; bottom: 100px"
            container="body"></t-back-top>
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

            .q,
            .a {
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
    .backTop {
        display: none;
    }

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