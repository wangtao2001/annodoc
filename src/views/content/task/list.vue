<script setup lang='tsx'>
import { Ref, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { LabelInfo, taskInfo, RelaInfo, textSatatus } from '@/interface'
import { MessagePlugin } from 'tdesign-vue-next'
import { downloadLocal } from '@/methods/util'
import upload from '@/components/upload.vue'
import { useStore } from '@/store'

const store = useStore()

const loadItem = async (id: string)=> {
    // 反正是全部再读一次
    allTasks.value = []
    const res = await axios.get(`/api/getResponses/tasks/${id}`)
    if (res.status == 200) {
        if (res.data.code == 20041) {
            const data = res.data.data
            const entitys: LabelInfo[] = []
            const relations: RelaInfo[] = []
            for (var entity of data.entitys) {
                entitys.push({
                    type: entity.type,
                    shortcut: entity.shortcut,
                    color: entity.color,
                    id: entity.id,
                })
            }
            for (var rela of data.relations) {
                relations.push({
                    type: rela.type,
                    id: rela.id,
                    entity1: rela.entity1,
                    entity2: rela.entity2,
                    bothway: rela.bothway,
                })
            }
            allTasks.value.push({
                type: data.type,
                id: data.id,
                taskName: data.taskName,
                description: data.description,
                createTime: data.createTime,
                modifyTime: data.modifyTime,
                entitys: entitys,
                relations: relations,
            })
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('获取数据失败')
}

const loadData = async() => {
    const res = await axios.get('/api/getResponses/allTasks')
    if (res.status == 200) { // 网络层
        if (res.data.code == 20041) { // 应用层
            const allIds: Array<string> = res.data.data
            for (var id of allIds) {
                await loadItem(id)
            }
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('获取数据失败')
    showDatas.value = allTasks.value.slice(0, pageSize)
    tableLoading.value = false
}

const pageSize: number = 6 // 每页显示的任务数
const allTasks: Ref<Array<taskInfo>> = ref([])  // 所有任务的信息
const showDatas: Ref<Array<taskInfo>> = ref([]) // 当前页的任务信息
const change = (current: number) => {
    showDatas.value = allTasks.value.slice((current - 1) * pageSize, current * pageSize)
}

loadData()

const router = useRouter()

const tableLoading = ref(true)
const columns = [
    { colKey: 'type', title: '类型', width: '40' },
    { colKey: 'id', title: 'ID', width: '50', ellipsis:true },
    { colKey: 'taskName', title: '名称', width: '50' },
    { colKey: 'description', title: '描述', width: '60', ellipsis:true  },
    { colKey: 'createTime', title: "创建时间", width: '80' },
    { colKey: 'modifyTime', title: '修改时间', width: '80' },
    { title: '操作', width: '50', cell: (h: any, { row }: { row: taskInfo }) => {
        return (
            <div>
                <t-link onClick={()=>{view(row)}} theme="success">查看</t-link>
                <t-link onClick={()=>{modify(row)}} theme="primary">修改</t-link>
                <t-popup content={()=> {
                        return (
                            <div>
                                <t-link theme="warning" > 发布 </t-link>
                                <t-link theme="primary" onClick={()=> {uploadFile(row)}} > 继续上传文件 </t-link>
                                <t-link theme="danger" onClick={()=>{deleteTask(row.id)}} > 删除 </t-link>
                            </div>
                        )
                    }}>
                    <t-link theme="primary" > 更多 </t-link>
                </t-popup>
            </div>
        )
    } },
]

const deleteTask = async (id: string) => {
    const res = await axios.delete(`/api/getResponses/deleteTask/${id}`)
    console.log(res)
    if (res.status == 200) {
        if (res.data.code == 20031) {
            MessagePlugin.success('删除成功')
            loadData()
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('删除失败')
}

const tabs = [
    { value: 1, title: '全部' },
    { value: 2, title: '医学文本' },
    { value: 3, title: '电子病历' }
]

const createTask = () => {
    router.push('/task/new')
}

var currentTask: taskInfo
const textSatatus: textSatatus = reactive({
    all:0, finalized:0, marked:0, unmarked:0, marking: 0
})
const viewDialog = ref(false)
const modifyDialog = ref(false)
const uploadDialog = ref(false)

const view = async (task: taskInfo) => {
    const res = await axios.get(`/api/getResponses/getMedicalNumber/${task.id}`)
    if (res.status == 200) {
        if (res.data.code == 20041) {
            const data = res.data.data
            textSatatus.all = data.all
            textSatatus.finalized = data.finalized
            textSatatus.marked = data.marked
            textSatatus.marking = data.marking
            textSatatus.unmarked = data.unmarked
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('获取数据失败')
    currentTask = task
    viewDialog.value = true
}
const modifyTaskData = reactive({ // 修改任务的数据
    type: '',
    id: '',
    taskName: '',
    description: '',
    modifyTime: ''
})
const modify = (task: taskInfo) => {
    modifyTaskData.id = task.id
    modifyTaskData.type = task.type
    modifyTaskData.taskName = task.taskName
    modifyTaskData.description = task.description
    modifyDialog.value = true
}
const modifyTaskPut = async ()=> {
    modifyTaskData.modifyTime = new Date().toLocaleString()
    if(modifyTaskData.taskName == '') {
        MessagePlugin.error('任务名称不能为空')
        return
    }
    const res = await axios.put('/api/resultAccepts/modifyTask', modifyTaskData)
    if (res.status == 200) {
        if (res.data.code == 20021) {
            MessagePlugin.success('修改成功')
            modifyDialog.value = false
            loadData()
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('修改失败')
}

const uploadFile = (task: taskInfo)=>{
    uploadDialog.value = true
    store.createTaskId = task.id // ipload组件使用的是store中存储的
}

// 下载最终标注结果
const downloadResult = async ()=> {
    const res = await axios.get(`/api/getResponses/getFinalizedText/${currentTask.id}`)
    if (res.status == 200) {
        if (res.data.code == 20041) {
            const data = res.data.data
            // 这里进行数据处理
            for (var text of data) {
                for (var enenty of text.entityResults){
                    delete enenty.textId
                    delete enenty.studentNumber
                    delete enenty.pass
                    currentTask.entitys.forEach(e => {
                        if (e.id == enenty.typeId) {
                            enenty.type = e.type
                        }
                    })
                    delete enenty.typeId
                }
                for (var rela of text.relationResults){
                    delete rela.textId
                    delete rela.studentNumber
                    delete rela.pass
                    currentTask.relations.forEach(r => {
                        if (r.id == rela.typeId) {
                            rela.type = r.type
                        }
                    })
                    delete rela.typeId
                }
            }
            downloadLocal(JSON.stringify(data , null, '\t'), `${currentTask.taskName}.json`)
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('获取数据失败')
}
</script>

<template>
    <div class="root">
        <div class="container">
            <t-tabs :default-value="1">
                <t-tab-panel v-for="tab in tabs" :value="tab.value" :label="tab.title">
                    <!--这个过滤器这样写有问题-->
                    <t-base-table :loading="tableLoading" class="table" :data="showDatas.filter(task => tab.title == '全部'? true : task.type == tab.title)" stripe bordered row-key="index" :columns="columns"></t-base-table>
                </t-tab-panel>
            </t-tabs>
            <div class="bottom">
                <t-button class="new" @click="createTask">创建任务</t-button>
                <t-pagination class="page" :total="allTasks.length" showPageNumber :showPageSize="false" :pageSize="pageSize"
                    showPreviousAndNextBtn totalContent @current-change="change"  />
            </div>
        </div>
        <t-dialog
            v-model:visible="viewDialog"
            :footer="false"
            :closeBtn="false"
            header="文本标注进度"
            >
            <div class="progess">
                <p>总文本数：{{ textSatatus.all }}</p>
                <div v-if="textSatatus.all != 0">
                    <p>已审核：{{ textSatatus.finalized }}</p>
                    <t-progress theme="line" color="#2ba471" :percentage=" Math.floor(textSatatus.finalized / textSatatus.all * 100)" />
                    <p>已完成：{{ textSatatus.marked }}</p>
                    <t-progress theme="line" :percentage=" Math.floor(textSatatus.marked / textSatatus.all * 100)" />
                    <p>未标注：{{ textSatatus.unmarked }}</p>
                    <t-progress theme="line" color="#e37318" :percentage=" Math.floor(textSatatus.unmarked / textSatatus.all * 100)" />
                    <p>标注中：{{ textSatatus.marking }}</p>
                    <t-progress theme="line" :color="{ from: '#0052D9', to: '#00A870' }" :percentage=" Math.floor(textSatatus.marking / textSatatus.all * 100)" />
                </div>
                <div class="footer">
                    <t-button variant="outline" @click="viewDialog = false">关闭</t-button>
                    <t-button @click="downloadResult" :disabled="(textSatatus.all != textSatatus.finalized) || textSatatus.all == 0" >下载标注结果</t-button>
                </div>
            </div>
        </t-dialog>
        <t-dialog
            v-model:visible="modifyDialog"
            :closeBtn="false"
            header="修改任务信息"
            @confirm="modifyTaskPut"
            >
            <t-form label-align="left">
                <t-form-item label="项目id" name="id">
                    <t-input v-model="modifyTaskData.id" disabled />
                </t-form-item>
                <t-form-item label="项目类型" name="type">
                    <t-select v-model="modifyTaskData.type">
                        <t-option label="医学文本" value="医学文本" />
                        <t-option label="电子病历" value="电子病历" :disabled="true" />
                    </t-select>
                </t-form-item>
                <t-form-item label="项目名称" name="name">
                    <t-input v-model="modifyTaskData.taskName" :maxlength="20" show-limit-number clearable />
                </t-form-item>
                <t-form-item label="项目描述" name="desc">
                    <t-textarea v-model="modifyTaskData.description" placeholder="简单描述项目，长度限制为100" :maxcharacter="100"
                        :autosize="{ minRows: 3, maxRows: 10 }" clearable />
                </t-form-item>
            </t-form>
        </t-dialog>
        <t-dialog
            v-model:visible="uploadDialog"
            :closeBtn="true"
            :footer="false"
            header="继续上传文件"
            width="600px"
            >
            <upload :multiple="true" />
            <p style="color: #999; margin-top: 5px;">
                支持多选, 扩展名 .txt, UTF-8编码方式
            </p>
        </t-dialog>
    </div>
</template>

<style scoped lang='less'>
.root {
    display: flex;
    justify-content: flex-start;
    user-select: none;

    .container {
        width: 85%;
        margin-left: 40px;

        .table {
            margin-top: 20px;
            margin-bottom: 20px;
        }
        
        .bottom {
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            .page {
                width: auto;
            }
        }
    }

    .progess {

        .footer {
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            margin-top: 10px;
            
            button {
                margin-left: 5px;
            }
        }
    }
}
</style>