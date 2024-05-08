<script setup lang="tsx">
import { onMounted, ref, Ref, toRaw, watch } from 'vue'
import { useRouter } from 'vue-router'
import { statusStore } from '@/store'
import { getConfig, postConfig, request } from '@/methods/request'
import { UserRole } from '@/interface'
import pubsub from 'pubsub-js'
import { MessagePlugin } from 'tdesign-vue-next'
import { dragControllerDiv } from '@/methods/util'
import { ViewListIcon } from 'tdesign-icons-vue-next'

const router = useRouter()
const state = statusStore()

const custReg: Array<{ r: object, replace: string }> = [
]
interface qa {
  id: string,
  question: string,
  answer: string,
  approve: string,
  newQuestion: string, // 修改后的问题 双向绑定
  newAnswer: string,
  modify: boolean, // 是否进行修改
  upModify: boolean // 是否已经提交了修改
}

interface corpus {
  id: string
  text: string,
  title: string,
  chapter: string,
  qas: Array<qa>,
}

const data: Ref<corpus> = ref({
  id: "",
  text: "",
  title: "",
  chapter: "",
  qas: []
})


const next = async () => {
  selectAll.value = false
  selecting.value = false
  for (let qa of data.value.qas) {
    let status: number = parseInt(qa.approve)
    if (qa.upModify) { // 表示已经上传了新的修改过后的数据 那这条自然就是不采纳了
      status = 0
    }
    await request(
      postConfig,
      '/api/corpus/accept/approveChecker',
      () => {
      },
      { number: state.user.number, corpusId: data.value.id, pairId: qa.id, approve: status },
    )
  }
  MessagePlugin.success('提交成功')
  init()
}


const init = async () => {
  console.clear()
  historyData.value = [] // 重置历史记录
  // 重置各个选择状态： 直接在填充数据的时候解决了
  // 对各个问题的修改值和状态：直接放到对象中了

  if (state.user.role == UserRole.student) {
    MessagePlugin.error('该功能暂不支持学生使用').then()
    router.back()
  }
  await request(
    getConfig, `/api/corpus/getResponses/getCorpusCheckerAll?number=${state.user.number}`,
     async (res) => {
      let text = res.text
      for (let reg of custReg) { // 过滤掉文本中一些不太好的字符串
        text = text.replace(reg.r, reg.replace)
      }
      text = text.replace(/\n/g, '<br/>') // 替换换行
      // data不需要初始化 重新赋值就可以解决
      data.value.text = text
      data.value.title = res.title
      data.value.chapter = res.chapter
      data.value.id = res.id
      data.value.qas.length = 0 // 确保不是多次添加
      for (let ob of res.pairs) {

        if (ob.modify) {
          await request(getConfig, `/api/corpus/getResponses/getModifyPair?corpusId=${res.id}&pairId=${ob.id}`, (r)=>{
            console.log(`%c问题：${ob.question}\n答案：${ob.answer}%c\n已经被你修改为新的表述：%c\n问题：${r.question}\n答案：${r.answer}`, 'color: red;', 'font-weight:700','color: green;')
          })
        }

        data.value.qas.push({
          question: ob.question, answer: ob.answer, id: ob.id, approve: '-1', newQuestion: ob.question, newAnswer: ob.answer, modify: false, upModify: false
        })
      }
      state.taskId = res.taskId
    }, undefined, undefined,
    () => { router.push('/anno/type') }
  )
  // 通知计数器更新
  pubsub.publish('counterCheckUpdate')
  // 重置历史记录
  historyData.value.length = 0  // 为了页面init的时候重新请求
}


// 选中高亮
const selectText = ref('')
const selectTextFunc = (c: string) => {
  const s = window.getSelection()!
  if (s.rangeCount) {
    const rang = s.getRangeAt(0)
    if (rang.collapsed) {
      return
    }
    selectText.value = c.substring(rang['startOffset'], rang['endOffset'])
  }
}
const selectTextCancel = (e: Event) => {
  const tag: Element = e.target as Element
  if (tag.classList.contains('q') || tag.classList.contains('a')) return
  selectText.value = ''
}
watch(selectText, async (new_) => {
  let div = document.getElementById('content')!
  if (new_.length != 0) {
    div.innerHTML = data.value.text // 首先清除原有标记
    // 原文文本中可能有一些空格，这里也考虑到正则中
    const r = new RegExp(new_.replace(/ /g, '').split('').join('\\s*'), 'g')
    // 通过替换子节点实现高亮
    div.innerHTML = div.innerHTML.replace(r, '<span class="highLight">' + new_ + '</span>')
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

// 问题修改的相关逻辑

let timer: NodeJS.Timeout
const errorUpload = (type: string) => { // 这里应该做一个防抖
  clearTimeout(timer)
  timer = setTimeout(() => {
    request(
      postConfig,
      '/api/corpus/accept/errorUpload',
      () => { },
      { corpusId: data.value.id, pairId: data.value.qas[0].id, number: state.user.number, text: data.value.text, question: data.value.qas[0].question, answer: data.value.qas[0].answer, type: type, taskId: state.taskId },
      "上报成功"
    )
  }, 500)
}

onMounted(() => {

  dragControllerDiv()
})

const errorType: Array<{ 'text': string, 'type': string }> = [
  { 'text': '片段重复', type: 'repeat' },
  { 'text': '包含乱码', type: 'messy' },
  { 'text': '无法识别', type: 'serious' },
  { 'text': '其他问题', type: 'other' },
]

interface History {
  time: string, corpusContent: string, questionContent: string, corpusId: string, pairId: string, approve: string, answerContent: string,
  title: string, chapter: string, id: string
}
let historyPageIndex = ref(0) // 当前页
let historyPageLimit = ref(5) // 每页数量
let historyCount = ref(0) // 总数
const historyVisible = ref(false)
const historyData: Ref<Array<History>> = ref([])
const historyGet = async () => {
  await request( // 请求的历史纪录都是当前任务下的
    getConfig, `/api/corpus/getResponses/getHistory?number=${state.user.number}&taskId=${state.taskId}&limit=${historyPageLimit.value}&pageIndex=${historyPageIndex.value}`,
    async (data) => {
      for (let d of data) {
        let corpusContext = ''
        let questionContent = ''
        let answerContent = ''
        let title = ''
        let chapter = ''
        await request(getConfig,
          `/api/corpus/getResponses/getCorpusById?id=${d.corpusId}`,
          (data) => {
            corpusContext = data.text
            title = data.title
            chapter = data.chapter
            for (let p of data.pairs) {
              if (d.pairId == p.id) {
                questionContent = p.question
                answerContent = p.answer
              }
            }
          })
        historyData.value.push({
          id: d.id,
          time: d.time,
          corpusContent: corpusContext,
          questionContent: questionContent,
          corpusId: d.corpusId,
          answerContent: answerContent,
          title: title,
          chapter: chapter,
          pairId: d.pairId,
          approve: d.approve
        })
      }
      historyData.value.sort((a, b) => {
        return b.time.localeCompare(a.time)
      }) // 排序
    }
  )
}

const openDrawer = async () => {
  // 先看总数有多少
  await request( // 请求的历史纪录都是当前任务下的
    getConfig, `/api/corpus/getResponses/getHistoryCount?number=${state.user.number}&taskId=${state.taskId}`,
    (data) => {
      historyCount.value = Number.parseInt(data)
    }
  )
  historyVisible.value = true
  if (historyData.value.length == 0) {
    historyGet().then()
  }
}
const historyModifyVisible = ref(false)
const currentHistory: Ref<History> = ref({
  time: '', corpusContent: '', questionContent: '', corpusId: '', pairId: '', approve: '', answerContent: '', title: '', chapter: '', id: ''
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
          <t-button disabled="" >确认修改</t-button> :
          <t-button onClick={() => { historyModifyUpload() }}>确认修改</t-button>
      }
    </>
  )
}
const historyModifyUpload = async () => {
  if (state.user.role == UserRole.student) {
    MessagePlugin.error('学生身份暂不支持修改历史记录').then()
  }
  // 相同的提交接口
  await request(
    postConfig, '/api/corpus/accept/approveChecker',
    () => {
      historyModifyVisible.value = false
      historyVisible.value = false
      historyData.value.length = 0 // 最简单的重置的方法
      historyPageIndex.value = 0 // 当前页
      historyCount.value = 0 // 总数
    },
    { number: state.user.number, corpusId: currentHistory.value.corpusId, pairId: currentHistory.value.pairId, approve: parseInt(historyNewApprove.value), historyId: currentHistory.value.id },
    "提交成功"
  )
}
const addMoreHistory = () => {
  if (historyPageIndex.value == 99) MessagePlugin.error('不支持加载更多了')
  else {
    historyPageIndex.value += 1  // page索引增加要放在获取前面
    historyGet()
  }
}

// 取消选择的状态
const deselect = () => {
  for (let ob of data.value.qas) {
    ob.approve = '-1'
  }
  selecting.value = false
  selectAll.value = false
}
// 观察是否正在选择
const selecting = ref(false)
// 观察是否全部选择
const selectAll = ref(false)
watch(data.value.qas, (qas) => {
  qas = toRaw(qas)
  for (let ob of qas) {
    if (ob.approve != '-1') {
      selecting.value = true
      return
    }
  }
  selecting.value = false
})
watch(data.value.qas, (qas) => {
  qas = toRaw(qas)
  for (let ob of qas) {
    if (ob.approve == '-1') {
      selectAll.value = false
      return
    }
  }
  selectAll.value = true
})

// 修改相关控制逻辑
const uploadModify = async (ob: qa) => {
  if (ob.question == ob.newQuestion && ob.answer == ob.newAnswer) {
    MessagePlugin.error('未修改任何内容').then()
    return
  }
  // 提交修改后的内容
  request(
    postConfig,
    '/api/corpus/accept/modify',
    () => { },
    { corpusId: data.value.id, pairId: ob.id, number: state.user.number, text: data.value.text, question: ob.newQuestion, answer: ob.newAnswer, taskId: state.taskId },
    "修改成功"
  ).then()
  ob.upModify = true // 表示已经上传
  ob.approve = "1"
  // 这里的逻辑是 修改完了后台会上传修改过后的数据,对原来的数据是不采纳
  // 但是在前台的展示是新的数据和采纳
  // 这一步转换在最后提交数据的时候完成
  ob.question = ob.newQuestion
  ob.answer = ob.newAnswer
  ob.modify = false // 把多行文本框去掉
}



init() // 最后调用
</script>

<template>
  <div class="root" @click="selectTextCancel">
    <div class="card" :style="flexRow ? 'flex-direction: row; height: 100%;' : 'flex-direction: column;'">
      <t-card class="text" :style="flexRow ? 'height: 100%;' : 'margin-right: 0; width: 100%'">
        <div class="info">{{ data.title + " " + data.chapter }}</div>
        <div id="content" v-html="data.text"></div>
        <div style="margin-top: 30px;">
          <p style=" color: #8f8e8e;">文本片段问题上报：</p>
          <span v-for="error in errorType" :key="error.type">
            <t-link style="margin-right: 2px;" @click="() => { errorUpload(error.type) }" theme="primary">{{ error.text
              }}</t-link>
          </span>
        </div>
      </t-card>
      <div class="resize" title="调整横向距离" v-show="flexRow">
        <span>⋮</span>
      </div>
      <t-card class="qa" :style="flexRow ? 'height: 100%;' : 'margin-right: 0; width: 100%; margin-top: 20px;'">
        <div v-for="(qa, idx) in data.qas" :key="qa.id">
          <div v-show="!qa.modify" class="q" @click="() => { selectTextFunc(qa.question) }">{{ qa.question }}</div>
          <div v-show="qa.modify" :style="flexRow ? 'width: 100%;' : 'width: 50%; '">
            <!--suppress JSValidateTypes -->
            <t-textarea v-model:value="qa.newQuestion" />
          </div>
          <div v-show="!qa.modify" class="a" @click="() => { selectTextFunc(qa.answer) }">{{ qa.answer }}</div>
          <div v-show="qa.modify && qa.answer.length !== 0"
            :style="flexRow ? 'width: 100%; margin-top: 10px;' : 'width: 50%; margin-top: 10px;'">
            <!--suppress JSValidateTypes -->
            <t-textarea v-model:value="qa.newAnswer" />
          </div>
          <div class="radio-group">
            <div>
              <t-link :disabled="qa.upModify" @click="qa.modify = !qa.modify; qa.approve = '-1'" theme="primary">{{
    qa.modify ? '取消修改' : '问句修改' }}</t-link>
              <t-link v-if="qa.modify" theme="success" @click="() => { uploadModify(qa) }"> 提交修改 </t-link>
            </div>
            <!--suppress JSValidateTypes -->
            <t-radio-group v-if="!qa.modify" v-model:value="qa.approve">
              <t-radio :disabled="qa.upModify" value=0>不采纳</t-radio>
              <t-radio :disabled="qa.upModify" value=1>采纳</t-radio>
            </t-radio-group>
          </div>
          <t-divider v-if="idx !== data.qas.length - 1" />
        </div>
      </t-card>
    </div>
    <t-card class="bottom-card">
      <div class="option">
        <div>
          <t-button variant="outline" @click="router.push('/anno/type')">返回</t-button>
          <t-button class="flex" variant="outline" @click="flexChange">{{ flexRow ? '上下布局' : '左右布局'
            }}</t-button>
          <t-button variant="outline" @click="openDrawer">历史记录</t-button>
          <t-drawer size="medium" v-model:visible="historyVisible">
            <template #header>
              <ViewListIcon />
              <p style="margin-left: 10px;">标注历史记录</p>
            </template>
            <template #footer>
              <t-space>
                <t-button variant="outline" @click="historyVisible = false"> 取消 </t-button>
                <t-button variant="text" theme="default" disabled="">单次加载数量：</t-button>
                <t-input-number v-model="historyPageLimit" :min="1" :max="10" />
              </t-space>
            </template>
            <div>
              <t-collapse style="margin-bottom: 5px;" v-for="(item, index) in historyData" :key="index">
                <t-collapse-panel :header="'最后提交时间：' + item.time">
                  <template #headerRightContent>
                    <t-space size="small">
                      <t-button variant="outline" @click="() => historyModify(item)" size="small">查看</t-button>
                    </t-space>
                  </template>
                  <div class="singe-line">文本：{{ item.corpusContent }}</div>
                  <div class="singe-line">问题：{{ item.questionContent }}</div>
                </t-collapse-panel>
              </t-collapse>
              <t-link theme="primary" style="margin-top: 10px;" @click="addMoreHistory"
                v-if="historyData.length < historyCount">加载更多</t-link>
              <p v-else style="margin-top: 10px;">无更多历史记录</p>
            </div>
          </t-drawer>
        </div>
        <t-dialog width="50%" :confirm-btn="historyApproveBtn" v-model:visible="historyModifyVisible">
          <t-space direction="vertical" style="width: 100%;">
            <!--suppress JSValidateTypes -->
            <t-textarea readonly="" :value="currentHistory.corpusContent" :autosize="{ minRows: 2, maxRows: 10 }" />
            <t-textarea readonly=""
              :value="currentHistory.answerContent ? currentHistory.questionContent + '\n\n' + currentHistory.answerContent : currentHistory.questionContent"
              :autosize="{ minRows: 2, maxRows: 10 }" />
          </t-space>
          <t-space style="margin-top: 20px;">
            <p>当前选择：</p>
            <!--suppress JSValidateTypes -->
            <t-radio-group v-model:value="historyNewApprove">
              <t-radio value=0>不采纳</t-radio>
              <t-radio value=1>采纳</t-radio>
            </t-radio-group>
          </t-space>
        </t-dialog>
        <div class="next">
          <t-button variant="outline" :disabled="!selecting" @click="deselect">取消选择</t-button>
          <t-button @click="next" :disabled="!selectAll">提交</t-button>
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
        margin-top: 10px;
        width: 100%;
        display: flex;
        justify-content: space-between;
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