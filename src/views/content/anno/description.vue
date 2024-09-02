<script setup lang='ts'>
import VueOfficeDocx from '@vue-office/docx'
import VueOfficeExcel from '@vue-office/excel'
import '@vue-office/docx/lib/index.css'
import '@vue-office/excel/lib/index.css'
import markdown from '@/components/markdown.vue'
import { ref } from 'vue'
import { useRouter } from "vue-router"
import { UserRole } from "@/interface"
import { MessagePlugin } from "tdesign-vue-next"
import {statusStore} from "@/store"
import {getConfig, postConfig, request} from "@/methods/request"
import pubsub from 'pubsub-js'
const router = useRouter()
const state = statusStore()


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

const data = ref({
  id: '',
  taskId: '',
  text1: '',
  text2: '',
  filePath: '',
  pageIndex: 0,
  suffix: ''
})

const init = async () => {
  if (state.user.role == UserRole.student) {
    MessagePlugin.error('该功能暂不支持学生使用').then()
    router.back()
  }
  pubsub.publish('counterCheckUpdate')
  await request(
      getConfig, `/api/description/getResponses/getTaskChecker?number=${state.user.number}`,
      (res) => {
        data.value.id = res.id
        data.value.text1 = res.text1
        data.value.taskId = res.taskId
        data.value.pageIndex = res.pageIndex
        data.value.filePath = 'https://anno.cpu.edu.cn/' + res.filePath
        const list = res.filePath.split('.')
        data.value.suffix = list[list.length-1]
        // 预先填充表单 ================
        let tmp = res.filePath.split('/')
        description.value.filename = tmp[tmp.length-1]
        tmp = res.text1.split('###')
        description.value.chaptername = tmp[0]
        description.value.tablename = tmp[1]
        description.value.pageIndex = res.pageIndex
        // ============================
      }, undefined, undefined, () => { router.push('/anno/type')}
  )
}

const errorHandler = () => {
  console.log('出现错误')
}

const approve = async (nan: boolean) => {
  if (nan) data.value.text2 = 'NaN'
  else
  data.value.text2 = description.value.filename + '###'
  + description.value.chaptername + '###'
  + description.value.tablename + '###'
  + description.value.pageIndex + '###'
  + description.value.pageEnd + '###'
  + description.value.desc
  await request(
      postConfig,
      '/api/description/accept/acceptChecker',
      () => {
      },
      {id: data.value.id, taskId: data.value.taskId, text: data.value.text2, number: state.user.number},
  )
  MessagePlugin.success('提交成功').then()
  await init()
}

const description = ref({
  filename: '', chaptername: '', tablename: '', pageIndex: 0, pageEnd: 0, desc: ''
})

init()
</script>

<template>
  <div class="root">
    <div class="card" :style="flexRow ? 'flex-direction: row; height: 100%;' : 'flex-direction: column;'">
      <div class="file" :style="flexRow ? 'margin-right: 20px; width: 1000px; height: 700px;' : 'margin-bottom: 20px; width: 100%; height: 500px;'">
        <!--限制：非所有的浏览器都能使用iframe预览pdf, docx类型无法翻页-->
        <iframe
            v-if="data.suffix == 'pdf'"
            :src='data.filePath + `#page=${data.pageIndex}`'
            class="container"
        />
        <vue-office-docx
            v-else-if="data.suffix == 'docx'"
            :src='data.filePath'
            class="container"
            @error="errorHandler"
        />
        <vue-office-excel
            v-else-if="data.suffix == 'xlsx' || data.suffix == 'xls'"
            :src='data.filePath'
            class="container"
            @error="errorHandler"
        />
        <markdown v-else-if="data.suffix == 'md' || data.suffix == 'txt' || data.suffix == 'html'"
                  :src="data.filePath"
                  class="container"
        ></markdown>
      </div>
      <div class="text">
        <!-- <t-card class="text1" :style="flexRow ? 'min-height: 100px;' : ''">
          <markdown :text="data.text1" />
        </t-card> -->
        <t-card class="text2">
          <t-form :data="description">
            <t-form-item label="文件名" name="filename">
              <t-input v-model="description.filename" disabled></t-input>
            </t-form-item>
            <t-form-item label="章节名" name="chaptername">
              <t-input v-model="description.chaptername"></t-input>
            </t-form-item>
            <t-form-item label="表格名" name="tablename">
              <t-input v-model="description.tablename"></t-input>
            </t-form-item>
            <t-form-item label="表格起点页" name="pageIndex">
              <t-input-number
                v-model="description.pageIndex"
                theme="column"
                :min="0"
                style="width: 150px"
              ></t-input-number>
            </t-form-item>
            <t-form-item label="表格终点页" name="pageEnd">
              <t-input-number
                v-model="description.pageEnd"
                theme="column"
                :min="0"
                style="width: 150px"
              ></t-input-number>
            </t-form-item>
            <t-form-item label="表格描述" name="desc">
              <t-textarea 
              placeholder="请输入内容"
              :autosize="{ minRows: 3, maxRows: 7 }"
              v-model="description.desc"
              >
              </t-textarea>
            </t-form-item>
          </t-form>
        </t-card>
      </div>
    </div>
    <t-card class="bottom-card">
      <div class="option">
        <div>
          <t-button variant="outline" @click="router.push('/anno/type')">返回</t-button>
          <t-button class="flex" variant="outline" @click="flexChange">{{ flexRow ? '上下布局' : '左右布局'}}</t-button>
        </div>
        <div class="next">
          <t-button variant="outline" @click="()=>{approve(false)}" >跳过</t-button>
          <t-button @click="()=>{approve(true)}" :disabled="description.tablename.length == 0" >提交</t-button>
        </div>
      </div>
    </t-card>
  </div>
</template>

<style scoped lang='less'>
.root {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0 20px 0 20px;
  flex-direction: column;

  .card {
    display: flex;

    .file {
      border: 1px solid #ddd;
    }

    .text {
      flex-grow: 1;
      display: flex;
      flex-direction: column;

      .text1 {
        margin-bottom: 20px;
      }

      .text2 {
        flex-grow: 1;
      }
    }
  }
}

.container {
  width: 100%;
  height: 100%;
  border: 0;
}

.bottom-card {
  margin: 20px 0 20px 0;

  .option {
    display: flex;
    justify-content: space-between;

    button {
      margin: 4px;
    }
  }
}
</style>