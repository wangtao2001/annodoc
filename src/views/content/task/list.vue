<script setup lang='tsx'>
import { Ref, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {request, getConfig, putConfig, deleteConfig} from '@/methods/request'
import { EntityLabelInfo, TaskInfo, RelaLabelInfo, TextSatatus } from '@/interface'
import { MessagePlugin } from 'tdesign-vue-next'
import { downloadLocal } from '@/methods/util'
import { mainStore } from '@/store'

const store = mainStore()

const loadItem = async (id: string)=> {
    await request(
        getConfig,
        `/api/getResponses/tasks/${id}`,
        (data) => {
            const entitys: EntityLabelInfo[] = []
            const relations: RelaLabelInfo[] = []
            if(data.deleted) {
                return
            }
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
                grade: data.grade,
            })
        }
    )
}

const loadData = async() => {
    allTasks.value = [] // 相当于刷新页面
    request(
        getConfig,
        '/api/getResponses/allTasks',
        async (allIds) => {
            for (var id of allIds) {
                await loadItem(id)
            }
        }
    )
    showDatas.value = allTasks.value.slice(0, pageSize)
    tableLoading.value = false
}

const pageSize: number = 6 // 每页显示的任务数
const allTasks: Ref<Array<TaskInfo>> = ref([])  // 所有任务的信息
const showDatas: Ref<Array<TaskInfo>> = ref([]) // 当前页的任务信息
const change = (current: number) => {
    showDatas.value = allTasks.value.slice((current - 1) * pageSize, current * pageSize)
}

loadData()

const router = useRouter()

const tableLoading = ref(true)
const columns = [
    { colKey: 'type', title: '类型', width: '40' },
    { colKey: 'id', title: 'ID', width: '50', ellipsis:true },
    { title: '名称', width: '60', ellipsis:true, cell: (h: any, { row }: { row: TaskInfo }) => {
        return (
            <div class='task_name'>
                <>{
                    row.grade == 0? 
                <t-tag theme="warning" variant="light">未发布</t-tag> :
                <t-tag theme="success" variant="light">已发布</t-tag>
                }</>
                <p>{row.taskName}</p>
            </div>
        )
    } },
    { colKey: 'description', title: '描述', width: '60', ellipsis:true  },
    // { colKey: 'createTime', title: "创建时间", width: '80' },
    { colKey: 'modifyTime', title: '修改时间', width: '55' },
    { title: '操作', width: '50', cell: (h: any, { row }: { row: TaskInfo }) => {
        return (
            <div>
                <t-link onClick={()=>{view(row)}} theme="success">查看</t-link>
                <t-link onClick={()=>{modify(row)}} theme="primary">修改</t-link>
                <t-popup content={()=> {
                        return (
                            <div>
                                <>{
                                    row.grade == 0?
                                    <t-link theme="warning" onClick={()=>{releaseDialog.value = true; currentTask = row}} > 发布 </t-link>: ''
                                }
                                </>
                                <t-link theme="primary" onClick={()=> {uploadFile(row)}} > 继续上传文件 </t-link>
                                <t-popconfirm on-confirm={()=>{deleteTask(row.id)}} theme="danger" content="确认删除吗">
                                    <t-link theme="danger" > 删除 </t-link>
                                </t-popconfirm>
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
    request(
        deleteConfig,
        `/api/getResponses/deleteTask/${id}`,
        () => loadData(),
        undefined,
        "删除成功"
    )
}

const tabs = [
    { value: 1, title: '全部' },
    { value: 2, title: '医学文本' },
    { value: 3, title: '电子病历' }
]

const createTask = () => {
    router.push('/task/new')
}

var currentTask: TaskInfo
const textSatatus: TextSatatus = reactive({
    all:0, finalized:0, marked:0, unmarked:0, marking: 0
})
const viewDialog = ref(false)
const modifyDialog = ref(false)
const uploadDialog = ref(false)
const releaseDialog = ref(false)

const view = async (task: TaskInfo) => {
    request(
        getConfig,
        `/api/getResponses/getMedicalNumber/${task.id}`,
        (data) => {
            textSatatus.all = data.all
            textSatatus.finalized = data.finalized
            textSatatus.marked = data.marked
            textSatatus.marking = data.marking
            textSatatus.unmarked = data.unmarked
        }
    )
    currentTask = task
    viewDialog.value = true
}
const modifyTaskData = reactive({ // 修改任务的数据
    type: '',
    id: '',
    taskName: '',
    description: '',
    modifyTime: '',
    grade: 0
})
const modify = (task: TaskInfo) => {
    modifyTaskData.id = task.id
    modifyTaskData.type = task.type
    modifyTaskData.taskName = task.taskName
    modifyTaskData.description = task.description
    modifyTaskData.grade = task.grade
    modifyDialog.value = true
}
const modifyTaskPut = async ()=> {
    modifyTaskData.modifyTime = new Date().toLocaleString()
    if(modifyTaskData.taskName == '') {
        MessagePlugin.error('任务名称不能为空')
        return
    }
    request(
        putConfig,
        '/api/resultAccepts/modifyTask',
        () => {
            modifyDialog.value = false
            loadData()
        },
        modifyTaskData,
        '修改成功'
    )
}

const uploadFile = (task: TaskInfo)=>{
    uploadDialog.value = true
    store.createTaskId = task.id // ipload组件使用的是store中存储的
}

const grade = ref('')
const releaseTask = async ()=> {
    request(
        putConfig,
        '/api/resultAccepts/assignTask',
        ()=> {
            releaseDialog.value = false
            loadData()
        }, 
        { id: currentTask.id, grade: grade.value },
        '发布成功'
    )
}

const downloadResult = async ()=> {
    request(
        getConfig,
        `/api/getResponses/getFinalizedText/${currentTask.id}`,
        (data) => {
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
        }
    )
}

const colseTask = async () => {
    request(
        getConfig,
        `/api/getResponses/endHomework/${closeTaskGrade.value}`,
        () => closeTaskDialog.value = false,
        undefined,
        '操作成功'
    )
}

const closeTaskDialog = ref(false)
const closeTaskGrade = ref("")

const labelAalign = window.innerWidth <= 900 ? 'top': 'left'
</script>

<template>
    <div class="root">
        <div class="container">
            <t-tabs :default-value="1">
                <t-tab-panel v-for="tab in tabs" :value="tab.value" :label="tab.title">
                    <!--这个过滤器这样写有问题-->
                    <t-base-table :loading="tableLoading" class="table" :data="showDatas.filter(task => tab.title == '全部'? true : task.type == tab.title)" stripe bordered row-key="index" :columns="columns"></t-base-table>
                    <div class="list">
                        <div class="list-item" v-for="d in showDatas.filter(task => tab.title == '全部'? true : task.type == tab.title) " :key="d.id">
                            <div class="left">
                                <div class="title">
                                    {{ d.type + '/' + d.taskName }}
                                    <t-tag v-if="d.grade == 0" theme="warning" variant="light">未发布</t-tag>
                                    <t-tag v-else theme="success" variant="light">已发布</t-tag>
                                </div>
                                <div class="desc">
                                    {{ d.description }}
                                </div>
                                <div class="time">
                                    {{ '最后修改时间：' + d.modifyTime }}
                                </div>
                                <div class="option">
                                    <t-link underline @click="view(d)" theme="success">查看</t-link>
                                    <t-link underline @click="modify(d)" theme="primary">修改</t-link>
                                    <t-link underline theme="warning" v-if="d.grade == 0" @click="releaseDialog = true; currentTask = d" > 发布 </t-link>
                                    <t-link underline theme="primary" @click="uploadFile(d)" > 继续上传文件 </t-link>
                                    <t-popconfirm @confirm="deleteTask(d.id)" theme="danger" content="确认删除吗">
                                        <t-link underline theme="danger" > 删除 </t-link>
                                    </t-popconfirm>
                                </div>
                            </div>
                        </div>
                    </div>
                </t-tab-panel>
            </t-tabs>
            <div class="bottom">
                <t-pagination class="page" :total="allTasks.length" showPageNumber :showPageSize="false" :pageSize="pageSize"
                    showPreviousAndNextBtn totalContent @current-change="change"  />
                <div class="option">
                    <t-button class="new" style="margin-right: 10px;" @click="createTask">创建任务</t-button>
                    <t-button theme="danger" @click="closeTaskDialog = true" >提前结束任务</t-button>
                </div>
            </div>
        </div>
        <t-dialog
            v-model:visible="closeTaskDialog"
            :closeBtn="false"
            header="提前结束任务"
            @confirm="colseTask"
            >
            <t-form :label-align="labelAalign">
                <t-form-item label="选择年级" name="grade">
                    <t-input v-model="closeTaskGrade" show-limit-number clearable  />
                </t-form-item>
            </t-form>
        </t-dialog>
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
            <t-form :label-align="labelAalign">
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
                <t-form-item label="发布年级" name="grade" v-if="modifyTaskData.grade !=0">
                    <t-input v-model="modifyTaskData.grade" show-limit-number clearable  />
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
        <t-dialog
            v-model:visible="releaseDialog"
            :closeBtn="false"
            header="发布任务"
            @confirm="releaseTask"
            >
            <t-form :label-align="labelAalign">
                <t-form-item label="发布年级">
                    <t-input v-model="grade" show-limit-number clearable />
                </t-form-item>
            </t-form>
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

.list {
    display: none;
}

@media screen and (max-width: 900px) {
    .root {
        justify-content: center;
        padding: 0 20px;
    }

    .container {
        margin: 0 !important;
        width: 100% !important;
    }

    .bottom {
        flex-direction: column !important;

        .option {
            flex-direction: column !important;
        }

        .page {
                width: auto;
            }
    }

    .table {
        display: none;
    }

    .list {
        display: block;
        border: 1px solid var( --common-border);
        padding: 20px 20px;
        margin: 20px 0;

        .title {
            font-weight: 600;
        }

        .time {
            color: #999;
        }
    }

    .list-item:nth-child(n + 2) {
            margin-top: 10px;
    }
}

</style>