<script lang="tsx" setup>
import {request, getConfig, deleteConfig, postConfig} from '@/methods/request'
import { reactive, ref, Ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'


const columns = [
    { colKey: 'number', title: '学号/工号'},
    { colKey: 'name', title: '姓名'},
    {title: '操作', cell: (h: any, { row }: { row: any }) => {
        return (
            <t-popconfirm  on-confirm={()=>{deleteCheck(row)}} theme="danger" content="确认删除吗">
                <t-link theme="danger" > 删除 </t-link>
            </t-popconfirm>
        )
    }}
]

const data: Ref<Array<{
    number: string, name: string
}>> = ref([])

const loadData = async () => {
    data.value = []
    request(
        getConfig,
        '/api/getResponses/allChecker',
        (resData) => {
            data.value = resData
        }
    )
}

const deleteCheck = async (data: any) => {
    request(
        deleteConfig,
        `/api/getResponses/deleteChecker/${data.number}`,
        () => {
            loadData()
        },
        undefined, "删除成功"
    )
}

loadData()

const formVisable = ref(false)
const newChecker = reactive({
    number: '',
    name: ''
})
const upNewChecker =  async ()=>{
    if (newChecker.number == '' || newChecker.name == '') {
        MessagePlugin.error('请填写完整信息')
        return
    }
    request(
        postConfig,
        '/api/resultAccepts/insertChecker',
        () => {
            loadData()
            formVisable.value = false
        },
        newChecker,
        "添加成功"
    )
    newChecker.number = ''
    newChecker.name = ''
}

const labelAalign = window.innerWidth <= 900 ? 'top': 'left'
</script>

<template>
    <t-layout>
        <t-base-table
        class="table"
        bordered        
        :data="data"
        :columns="columns"
        table-layout="auto"
        row-key="number"
        ></t-base-table>
        <!--移动端将表格转换为列表，全部场景-->
        <div class="form list">
            <div class="list-item" v-for="d in data" :key="d.number">
                <div>{{ d.number + ' / ' + d.name }}</div>
                <t-popconfirm  @confirm="deleteCheck(d)" theme="danger" content="确认删除吗">
                    <t-link theme="danger" > 删除 </t-link>
                </t-popconfirm>
            </div>
        </div>
        <div class="form">
            <div v-if="formVisable">
                <t-form :label-align="labelAalign">
                    <t-form-item label="学号/工号" name="number">
                        <t-input v-model="newChecker.number" :maxlength="10" show-limit-number clearable />
                    </t-form-item>
                    <t-form-item label="姓名" name="name">
                        <t-input v-model="newChecker.name" :maxlength="10" show-limit-number clearable />
                    </t-form-item>
                </t-form>
                <div class="option">
                    <t-button variant="outline" @click="formVisable = false">取消</t-button>
                    <t-button @click="upNewChecker">添加</t-button>
                </div>
            </div>
            <t-button v-if="!formVisable" @click="formVisable = true">添加</t-button>
        </div>
        
    </t-layout>
</template>

<style lang="less" scoped>
.table {
    margin: 50px 40px 0 40px;
    width: 350px;
    user-select: none;
}

.form {
    margin: 20px 40px 0 40px;
    width: 350px;

    .option {
        margin-top: 20px;
        display: flex;
        flex-direction: row;

        button {
            margin-right: 10px;
        }
    }
}

.list {
    display: none;
}

@media screen and (max-width: 900px) {
    .table {
        display: none;
    }

    .form {
        width: auto;
        margin: 20px 20px 0 20px;
    }

    .list {
        display: block;
        border: 1px solid var( --common-border);
        padding: 20px 20px;

        .list-item {
            display: flex;
            justify-content: space-between;
        }
    }

    .list-item:nth-child(n + 2) {
        margin-top: 10px;
    }
}
</style>