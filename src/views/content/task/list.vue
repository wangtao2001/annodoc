<script setup lang='tsx'>
import { Ref, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { LabelInfo, taskInfo, RelaInfo, textSatatus } from '@/interface'
import { MessagePlugin } from 'tdesign-vue-next'

const loadItem = async (id: string)=> {
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
                    type: rela.name,
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

loadData()

const pageSize: number = 6 // 每页显示的任务数
const allTasks: Ref<Array<taskInfo>> = ref([])  // 所有任务的信息
const showDatas: Ref<Array<taskInfo>> = ref([]) // 当前页的任务信息
const change = (current: number) => {
    showDatas.value = allTasks.value.slice((current - 1) * pageSize, current * pageSize)
}

const router = useRouter()

const tableLoading = ref(true)
const columns = [
    { colKey: 'type', title: '类型', width: '40' },
    { colKey: 'id', title: 'ID', width: '50', ellipsis:true },
    { colKey: 'taskName', title: '名称', width: '50' },
    { colKey: 'description', title: '描述', width: '60' },
    { colKey: 'createTime', title: "创建时间", width: '80' },
    { colKey: 'modifyTime', title: '修改时间', width: '80' },
    { title: '操作', width: '50', cell: (h: any, { row }: { row: taskInfo }) => {
        return (
            <div>
                <t-link onClick={()=>{view(row)}} theme="success">查看</t-link>
                <t-link theme="primary">修改</t-link>
                <t-popconfirm content="确认删除吗" theme="danger" on-confirm={()=>deleteTask(row.id)}>
                    <t-link theme="danger" > 删除 </t-link>
                </t-popconfirm>
            </div>
        )
    } },
]

const deleteTask = (id: string) => {
    console.log(id)
    console.log("删除")
}

const tabs = [
    { value: 1, title: '全部' },
    { value: 2, title: '医学文本' },
    { value: 3, title: '电子病历' }
]

const createTask = () => {
    router.push('/task/new')
}

const textSatatus: textSatatus = reactive({
    all:0, finalized:0, marked:0, unmarked:0, marking: 0
})
const viewDialog = ref(false)
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
    viewDialog.value = true
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
            closeBtn
            v-model:visible="viewDialog"
            :footer="false"
            >
            <div class="progess">
                <div class="head">
                    <h4>文本标注进度</h4>
                    <p>总数：{{ textSatatus.all }}</p>
                </div>
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
                    <t-button @click="" :disabled="true" >下载标注结果</t-button>
                </div>
            </div>
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
        .head {
            display: flex;
            flex-direction: row;
            margin-bottom: 10px;

            p {
                margin-left: 10px;
            }
        }

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