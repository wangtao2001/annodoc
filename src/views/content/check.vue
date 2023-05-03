<script lang="tsx" setup>
import axios from 'axios'
import { reactive, ref } from 'vue'
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

const data = ref([])
const loadData= async () => {
    data.value = []
    const res = await axios.get('/api/getResponses/allChecker');
    if (res.status == 200) {
        if (res.data.code == 20041) {
            data.value = res.data.data
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('请求失败')
}

const deleteCheck = async (data: any) => {
    const res = await axios.delete(`/api/getResponses/deleteChecker/${data.number}`)
    console.log(res)
    if (res.status == 200) {
        if (res.data.code == 20031) {
            MessagePlugin.success('删除成功')
            loadData()
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('删除失败')
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
    const res = await axios.post('/api/resultAccepts/insertChecker', newChecker)
    console.log(res)
    if (res.status == 200) {
        if (res.data.code == 20011) {
            MessagePlugin.success('添加成功')
            loadData()
            formVisable.value = false
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('添加失败')
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

@media screen and (max-width: 900px) {
    .table {
        width: auto;
        margin: 30px 20px 0 20px;
    }

    .form {
        width: auto;
        margin: 20px 20px 0 20px;
    }
}
</style>