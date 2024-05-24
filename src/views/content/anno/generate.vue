<script setup lang="tsx">
import { ref, Ref, onMounted } from 'vue'
import { dragControllerDiv } from '@/methods/util'
import { v4 as uuidv4 } from 'uuid'
import { getConfig, postConfig, request } from '@/methods/request'
import {statusStore} from "@/store"
import {UserRole} from "@/interface";
import {MessagePlugin} from "tdesign-vue-next";
import {useRouter} from "vue-router";

const state = statusStore()
const router = useRouter()

onMounted(() => {
  dragControllerDiv()
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

interface QA {
  id: string,
  question: string,
  hasAnswer: boolean,
  answer: string
}

const QAs: Ref<Array<QA>> = ref([])

const newQuestion = ref('')
const newAnswer = ref('')
const inputtingQuestion = ref(false)
const inputtingAnswerId = ref('')

const cancelNewQuestion = () => {
  inputtingQuestion.value = false
  newQuestion.value = ''
}
const confirmNewQuestion = () => {
  inputtingQuestion.value= false
  QAs.value.push({
    id: uuidv4(),
    question: newQuestion.value,
    hasAnswer: false,
    answer: ''
  })
  newQuestion.value = ''
}
const cancelNewAnswer = () => {
  inputtingAnswerId.value = ''
  newAnswer.value = ''
}
const confirmNewAnswer = (id: string) => {
  inputtingAnswerId.value = ''
  QAs.value.forEach(qa => {
    if (qa.id === id) {
      qa.hasAnswer = true
      qa.answer = newAnswer.value
    }
  })
  newAnswer.value = ''
}

const deleteQuestionAndAnswer = (id: string) => {
  QAs.value = QAs.value.filter(function(qa) {
    return qa.id !== id
  });
}
const deleteAnswer = (id: string) => {
  QAs.value.forEach(qa => {
    if (qa.id === id) {
      qa.hasAnswer= false
      qa.answer = ''
    }
  })
}

const approve = async () => {
  await request(
      postConfig,
      '/api/qa/accept/approveChecker',
      () => {
      },
      {id: data.value.id, taskId: data.value.taskId, pairs: QAs.value, number: state.user.number, type: 1},
  )
  MessagePlugin.success('提交成功').then()
  await init()
}

const data = ref({
  id: "",
  taskId: "",
  text: "",
  title: "",
  chapter: ""
})

const init = async () => {
  if (state.user.role == UserRole.student) {
    MessagePlugin.error('该功能暂不支持学生使用').then()
    router.back()
  }
  await request(
      getConfig, `/api/qa/getResponses/getCorpusChecker?number=${state.user.number}`,
      (res) => {
        data.value.taskId = res.taskId
        data.value.id = res.id
        data.value.text = res.text
        data.value.chapter = res.chapter
        data.value.title = res.title
      },undefined, undefined, () => { router.push('/anno/type')}
  )
}

init()

</script>

<template>
  <div class="root">
    <div class="card" :style="flexRow ? 'flex-direction: row; height: 100%;' : 'flex-direction: column;'">
      <t-card class="text" :style="flexRow ? 'height: 100%;' : 'margin-right: 0; width: 100%'">
        <div class="info">{{ data.title + " " + data.chapter }}</div>
        <div id="content" v-html="data.text"></div>
      </t-card>
      <div class="resize" title="调整横向距离" v-show="flexRow">
        <span>⋮</span>
      </div>
      <t-card class="qa" :style="flexRow ? 'height: 100%;' : 'margin-right: 0; width: 100%; margin-top: 20px;'">
        <p style="margin-bottom: 10px;color: #747474;">对{{flexRow ? '左侧': '上方'}}文本生成问题和答案：</p>
        <div v-for="(qa, idx) in QAs">
          <div style="margin: 10px 0 10px 0;">
          <div>问题：{{ qa.question }}</div>
          <div v-if="qa.hasAnswer">答案：{{ qa.answer }}</div>
          </div>
          <div v-if="inputtingAnswerId === qa.id">
          <t-textarea placeholder="请输入答案" v-model:value="newAnswer" />
            <t-space>
              <t-link theme="primary" @click="cancelNewAnswer" > 取消 </t-link>
              <t-link theme="primary" @click="()=>{confirmNewAnswer(qa.id)}" > 确认 </t-link>
            </t-space>
          </div>
          <t-space v-else>
            <t-link v-if="!qa.hasAnswer" @click="() => {inputtingAnswerId = qa.id}" theme="primary" underline> 添加答案 </t-link>
            <t-link theme="danger" @click="()=>{deleteQuestionAndAnswer(qa.id)}" underline> 删除问题 </t-link>
            <t-link v-if="qa.hasAnswer" @click="()=>{deleteAnswer(qa.id)}" theme="danger" underline> 删除答案 </t-link>
          </t-space>
          <t-divider v-if="idx !== QAs.length - 1 || inputtingQuestion" />
        </div>
        <div v-if="inputtingQuestion">
          <t-textarea placeholder="请输入问题" v-model:value="newQuestion" />
          <t-space>
            <t-link theme="primary" @click="cancelNewQuestion" > 取消 </t-link>
            <t-link theme="primary" @click="confirmNewQuestion" > 确认 </t-link>
          </t-space>
        </div>
      </t-card>
    </div>
    <t-card class="bottom-card">
      <div class="option">
        <div>
          <t-button variant="outline" @click="router.push('/anno/type')">返回</t-button>
          <t-button class="flex" variant="outline" @click="flexChange">{{ flexRow ? '上下布局' : '左右布局'}}</t-button>
        </div>
        <div class="next">
          <t-button :disabled="inputtingQuestion || inputtingAnswerId.length !==0" @click="()=>{inputtingQuestion = true}" >添加问题</t-button>
          <t-button :disabled="QAs.length===0" @click="approve">提交</t-button>
        </div>
      </div>
    </t-card>
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