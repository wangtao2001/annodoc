<script setup lang="tsx">
import { ref, watch, onMounted, Ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { corpusState, statusStore } from '@/store'
import { request, getConfig, postConfig } from '@/methods/request'
import { UserRole } from '@/interface'
import pubsub from 'pubsub-js'
import { MessagePlugin } from 'tdesign-vue-next'
import { dragControllerDiv } from '@/methods/util'
import { ViewListIcon } from 'tdesign-icons-vue-next'

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

const radioValue = ref("-1") // 初始状态谁都不选

const next = async () => {
    if (questionModifyFlag.value) {
        if (newQuetionValue.value == data.value.question && newAnswerValue.value == data.value.answer) {
            MessagePlugin.warning('未修改任何内容')
            return
        }
        // 提交修改
        request(
            postConfig,
            '/api/corpus/accept/modify',
            () => { },
            { corpusId: corpus.currentCorpusId, pairId: currentPairId, number: state.user.number, text: data.value.text, question: newQuetionValue.value, answer: newAnswerValue.value, taskId: state.taskId },
            "修改成功"
        )
        // 修改提交后这条自动就是不采纳
        await request(
            postConfig, `/api/corpus/accept/${isStudent ? 'approveStudent' : 'approveChecker'}`,
            (data) => { },
            { number: state.user.number, corpusId: corpus.currentCorpusId, pairId: currentPairId, approve: 0 },
        )
    }
    else {
        // 提交信息
        await request(
            postConfig, `/api/corpus/accept/${isStudent ? 'approveStudent' : 'approveChecker'}`,
            (data) => { },
            { number: state.user.number, corpusId: corpus.currentCorpusId, pairId: currentPairId, approve: parseInt(radioValue.value) },
            "提交成功"
        )
    }
    // 路由跳转
    //window.open('/anno/corpus', "_self") 这里相当于重新请求页面了。。。
    init()
}

const custReg: Array<{ r: object, replace: string }> = [
]

const init = async () => {
    historyData.value = [] // 历史记录
    radioValue.value = '-1' // 重置状态数据（注意！！）
    newQuetionValue.value = ''
    newAnswerValue.value = ''
    questionModifyFlag.value = false
    answerModifyFlag.value = false
    await request(
        getConfig, `/api/corpus/getResponses/${isStudent ? 'getCorpusStudent' : 'getCorpusChecker'}?number=${state.user.number}&grade=${state.user.grade}`,
        (res) => {
            let text = res.text
            for (let reg of custReg) { // 过滤掉文本中一些不太好的字符串
                text = text.replace(reg.r, reg.replace)
            }
            data.value.text = text
            data.value.title = res.title
            data.value.chapter = res.chapter
            data.value.question = res.pair.question
            data.value.answer = res.pair.answer
            state.taskId = res.taskId
            corpus.currentCorpusId = res.id // corpusId后面会继续使用就存到pinia中了
            currentPairId = res.pair.id //pairId只在当前页使用
            newQuetionValue.value = data.value.question
            newAnswerValue.value = data.value.answer
        }, undefined, undefined,
        () => { router.push('/anno/type') }
    )
    // 通知计数器更新
    pubsub.publish('counterCheckUpdate')
}

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
        // 原文文本中可能有一些空格，这里也考虑到正则中
        const r = new RegExp(new_.replace(/ /g, '').split('').join('\\s*'), 'g')
        var highlightedText = div.innerHTML.replace(r, '<span class="highLight">' + new_ + '</span>')
        div.innerHTML = highlightedText
    }
    else {
        div.innerHTML = data.value.text
    }

})

const flexRow = ref(true)
const flexChange = () => {
    if (flexRow.value) {
        localStorage.setItem('flexRow', 'false')
    } else {
        localStorage.setItem('flexRow', 'true')
    }
    flexRow.value = !flexRow.value
}
const local = localStorage.getItem('flexRow')
if (local === 'false') {
    flexChange()
}

const questionModifyFlag = ref(false)
const answerModifyFlag = ref(false)
const modify = () => {
    // 首先取消已经选择的
    radioValue.value = '-1'
    questionModifyFlag.value = !questionModifyFlag.value
    answerModifyFlag.value = !answerModifyFlag.value
}
const newQuetionValue = ref('')
const newAnswerValue = ref('')

let timer: NodeJS.Timeout
const errorUpload = (type: string) => { // 这里应该做一个防抖
    clearTimeout(timer)
    timer = setTimeout(() => {
        request(
            postConfig,
            '/api/corpus/accept/errorUpload',
            () => { },
            { corpusId: corpus.currentCorpusId, pairId: currentPairId, number: state.user.number, text: data.value.text, question: newQuetionValue.value, answer: newAnswerValue.value, type: type, taskId: state.taskId },
            "上报成功"
        )
    }, 500)
}

onMounted(() => {
    document.onkeydown = (e) => { // 使用Tab键和Enter快捷提交
        if (e.key == 'Tab') {
            if (radioValue.value == '-1' || radioValue.value == '1') radioValue.value = '0'
            else radioValue.value = '1'
        }
        if ((e.key == 'Enter' || e.key == 'q') && (radioValue.value != '-1' || questionModifyFlag.value)) next() // 满足提交条件
    }

    // 两侧可拖动的div
    dragControllerDiv()
})

const errorType: Array<{ 'text': string, 'type': string }> = [
    { 'text': '片段重复', type: 'repeat' },
    { 'text': '包含乱码', type: 'messy' },
    { 'text': '表格转文字', type: 'table' },
    { 'text': '其他问题', type: 'other' },
]

interface History {
    time: string,corpusContent: string, questionContent : string, corpusId: string, pairId: string, approve: string, answerContent: string,
    title: string, chapter: string, id: string
}
const historyVisible = ref(false)
const historyData: Ref<Array<History>> = ref([])
const openDrawer = async () => {
    console.log('打开侧边栏')
    console.log(historyData.value.length)
    historyVisible.value = true
    if (historyData.value.length == 0) {
    await request( // 请求的历史纪录都是当前任务下的
        getConfig, `/api/corpus/getResponses/getHistory?number=${state.user.number}&taskId=${state.taskId}&limit=20`,
        async (data) => {
            for (var d of data) {
                var corpusContext = ''
                var questionContent = ''
                var answerContent = ''
                var title = ''
                var chapter = ''
                await request( getConfig, 
                `/api/corpus/getResponses/getCorpusById?id=${d.corpusId}`, 
                (data) =>{
                    corpusContext = data.text
                    title = data.title
                    chapter = data.chapter
                    for (var p of data.pairs) {
                        if (d.pairId == p.id) {
                            questionContent = p.question
                            answerContent = p.answer
                        }
                    }
                })
                historyData.value.push({id: d.id,
                    time: d.time, 
                    corpusContent: corpusContext, 
                    questionContent: questionContent, 
                    corpusId: d.corpusId, 
                    answerContent: answerContent,
                    title: title,
                    chapter: chapter,
                    pairId: d.pairId,
                    approve: d.approve})
            }
            historyData.value.sort((a, b) => {
                return b.time.localeCompare(a.time)
            }) // 排序
        }
    )}
}
const historyModifyVisible = ref(false)
const currentHistory: Ref<History> = ref({
    time: '',corpusContent: '', questionContent : '', corpusId: '', pairId: '', approve: '', answerContent: '', title: '', chapter: '', id: ''
}) // 初始化
const historyModify = (current: History) => { // 打开卡片的时候数据才加载
    historyModifyVisible.value = true
    currentHistory!.value = current
    historyNewApprove.value = current.approve // 默认值
}
const historyNewApprove = ref('0') // 修改之后的值绑定到这里
const historyApproveBtn = () => { // 历史记录修改提交定制按钮
    return (
        <>
            {
                historyNewApprove.value == currentHistory.value.approve ?
                <t-button disabled >确认修改</t-button> :
                <t-button onClick={()=>{historyModifyUpload()}}>确认修改</t-button>
            }
        </>
    )
}
const historyModifyUpload = async () => {
    if (state.user.role == UserRole.student) {
        MessagePlugin.error('学生身份暂不支持修改历史记录')
    }
    // 相同的提交接口
    await request(
            postConfig, '/api/corpus/accept/approveChecker',
            () => {
                historyModifyVisible.value = false
                historyVisible.value = false
                historyData.value.length = 0 // 最简单的重置的方法
             },
            { number: state.user.number, corpusId: currentHistory.value.corpusId, pairId: currentHistory.value.pairId, approve: parseInt(historyNewApprove.value),  historyId: currentHistory.value.id},
            "提交成功"
        )
}


init() // 最后调用
</script>

<template>
    <div class="root">
        <div class="card" :style="flexRow ? 'flex-direction: row; height: 100%;' : 'flex-direction: column;'">
            <t-card bordered class="text" :style="flexRow ? 'height: 100%;' : 'margin-right: 0; width: 100%'">
                <div class="info">{{ data.title + " " + data.chapter }}</div>
                <div id="content" v-html="data.text"></div>
                <div style="margin-top: 30px;">
                    <p style=" color: #8f8e8e;">文本片段问题上报：</p>
                    <span v-for="error in errorType" :key="error.type">
                        <t-link style="margin-right: 2px;" @click="() => { errorUpload(error.type) }" theme="primary">{{
                            error.text }}</t-link>
                    </span>
                </div>
            </t-card>
            <div class="resize" title="调整横向距离" v-show="flexRow">
                <span>⋮</span>
                <!--https://juejin.cn/post/7029640316999172104-->
            </div>
            <t-card bordered class="qa"
                :style="flexRow ? 'height: 100%;' : 'margin-right: 0; width: 100%; margin-top: 20px;'">
                <div class="q" v-show="!questionModifyFlag">{{ data.question }}</div>
                <div v-show="questionModifyFlag" :style="flexRow ? 'width: 100%;' : 'width: 50%; '">
                    <t-textarea v-model:value="newQuetionValue" />
                </div>
                <div class="a" v-show="!questionModifyFlag">{{ data.answer }}</div>
                <div v-show="questionModifyFlag && data.answer.length != 0"
                    :style="flexRow ? 'width: 100%; margin-top: 10px;' : 'width: 50%; margin-top: 10px;'">
                    <t-textarea v-model:value="newAnswerValue" />
                </div>
                <t-radio-group v-if="!questionModifyFlag" class="radio-group" v-model:value="radioValue">
                    <t-radio value=0>不采纳</t-radio>
                    <t-radio value=1>采纳</t-radio>
                </t-radio-group>
            </t-card>
        </div>
        <t-card class="bottom-card">
            <div class="option">
                <div>
                    <t-button variant="outline" @click="router.push('/anno/type')">返回</t-button>
                    <t-button class="flex" variant="outline" @click="flexChange">{{ flexRow ? '上下布局' : '左右布局'
                    }}</t-button>
                    <t-button variant="outline" @click="openDrawer">历史记录</t-button>
                    <t-drawer size="medium" v-model:visible="historyVisible" >
                        <template #header>
                            <ViewListIcon/>
                            <p style="margin-left: 10px;">标注历史记录</p>
                        </template>
                        <template #footer>
                            <t-button variant="outline" @click="historyVisible = false"> 取消 </t-button>
                        </template>
                        <div>
                            <t-collapse style="margin-bottom: 5px;" v-for="(item, index) in historyData" :key="index">
                                <t-collapse-panel :header="'最后提交时间：' + item.time">
                                    <template #headerRightContent>
                                        <t-space size="small">
                                        <t-button variant="outline" @click="() => historyModify(item)" size="small">查看</t-button> <!--转到历史页面，还是不要用户当前页面了~~~~-->
                                        </t-space>
                                    </template>
                                    <div class="singe-line">文本：{{ item.corpusContent }}</div>
                                    <div class="singe-line">问题：{{ item.questionContent }}</div>
                                </t-collapse-panel>
                            </t-collapse>
                            <p style="margin-top: 10px;">{{ historyData.length != 0 ? '仅展示最近提交的前20条'  : '暂无历史记录' }}</p>
                        </div>
                    </t-drawer>
                </div>
                <t-dialog
                width="50%"
                :confirm-btn="historyApproveBtn" 
                v-model:visible="historyModifyVisible">
                    <t-space direction="vertical" style="width: 100%;">
                    <t-textarea readonly :value="currentHistory.corpusContent" :autosize="{ minRows: 1, maxRows: 5 }" />
                    <t-textarea readonly :value="currentHistory.answerContent ? currentHistory.questionContent + '\n\n' + currentHistory.answerContent: currentHistory.questionContent" :autosize="{ minRows: 1, maxRows: 5 }" />
                    </t-space>
                    <t-space style="margin-top: 20px;" >
                        <p>当前选择：</p>
                        <t-radio-group v-model:value="historyNewApprove" >
                            <t-radio value=0 >不采纳</t-radio>
                            <t-radio value=1>采纳</t-radio>
                        </t-radio-group>
                    </t-space>
                </t-dialog>
                <div class="next">
                    <t-button variant="outline" :disabled="radioValue == '-1'" @click="radioValue = '-1'"
                        v-if="!questionModifyFlag">取消选择</t-button>
                    <t-button @click="modify"> {{ !questionModifyFlag ? '问句修改' : '取消修改' }}</t-button>
                    <t-button :disabled="radioValue == '-1' && !questionModifyFlag" @click="next">{{ !questionModifyFlag ?
                        '下一条'
                        : '修改提交'
                    }}</t-button>
                </div>
            </div>
        </t-card>
        <t-back-top class="backTop" size="small" shape="circle" style="position: absolute; right: 30px; bottom: 100px"
            container="body"></t-back-top>
    </div>
</template>

<style scoped lang="less">
.singe-line {
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
    white-space: nowrap;
}

.root {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;

    .card {
        width: 90%;
        height: 100%;
        overflow: hidden;
        margin-bottom: 20px;
        overflow: hidden;


        .text {
            width: calc(50% - 10px);
            float: left;
            display: flex;
            align-items: center;

            .info {
                margin-bottom: 10px;
                color: #747474;
            }
        }

        .qa {
            float: left;
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
        margin-bottom: 30px;

        .option {
            display: flex;
            justify-content: space-between;

            button {
                margin: 4px;
            }
        }
    }
}

button {
    user-select: none;
}

/*拖拽区div样式*/
.resize {
    cursor: ew-resize;
    float: left;
    position: relative;
    width: 10px;
    height: 100%;
    font-size: 32px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
}

/*拖拽区鼠标悬停样式*/
.resize:hover {
    color: #e4e4e4;
}

@media screen and (max-width: 900px) {

    .resize {
        display: none;
    }

    .flex {
        display: none;
    }

    .backTop {
        display: none;
    }

    .card {
        flex-direction: column !important;

        .text {
            height: auto !important;
            width: 100% !important;
            margin: 0 !important;
            margin-bottom: 20px !important;
        }

        .qa {
            height: auto !important;
            width: 100% !important;
            margin: 0 !important;
        }
    }

    .bottom-card {
        margin-top: 10px;
    }

}
</style>