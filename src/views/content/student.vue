<script lang="tsx" setup>
import {ref, onMounted,reactive, toRaw } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import * as xlsx from "xlsx"

const columns = [
    { colKey: 'number', title: '学号', width: 150},
    { colKey: 'name', title: '姓名'},
    // 其他信息
    {title: '操作', cell: (h: any, { row }: { row: any }) => {
        return (
            <t-popconfirm  theme="danger" content="确认删除吗">
                <t-link theme="danger" > 删除 </t-link>
            </t-popconfirm>
        )
    }}
]

const displayGrade = ref("19")


const openInput = ()=> {
    const input = document.getElementById('file-input') as HTMLInputElement
    input.click()
}
onMounted(()=> {
    const input = document.getElementById('file-input') as HTMLInputElement
    input.addEventListener("change", function () {
        if (input.files === null ) {
            return false
        } else if (!/\.(xls|xlsx)$/.test(input.files[0].name.toLowerCase())) {
            MessagePlugin.error("只支持xls和xlsx格式")
            return false
        }

        const fileReader = new FileReader()
        fileReader.readAsBinaryString(input.files[0])
        fileReader.onload = (ev) => {
            const workbook = xlsx.read(ev.target?.result, {
                type: "binary",
            })
            let worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const data = xlsx.utils.sheet_to_json(worksheet) 
            const newData: Array<{
                name: string,
                number: string
            }> = []
            data.forEach((d: any)=> {
                newData.push({
                    number: d.number.toString(),
                    name: d.name
                })
            })
            uploadStudent(newData)
        }
    })
})

const uploadStudent = async (data: Array<{name: string,number: string}>) => {
    console.log(data)
}

const formVisable = ref(false)
const newStudent = reactive({
    number: '',
    name: ''
})
const upNewStudent =  async ()=>{
    if (newStudent.number == '' || newStudent.name == '') {
        MessagePlugin.error('请填写完整信息')
        return
    }
    uploadStudent([toRaw(newStudent)])
}
</script>

<template>
    <t-layout>
        <t-select class="grade s" v-model="displayGrade">
            <t-option label="2019级" value="19" />
            <t-option label="2020级" value="20" />
        </t-select>
        <t-base-table
        class="table s"
        bordered        
        :columns="columns"
        table-layout="auto"
        row-key="number"
        ></t-base-table>
        <div class="s form" v-if="formVisable">
                <t-form>
                    <t-form-item label="学号" name="number">
                        <t-input  :maxlength="10" v-model="newStudent.number"  show-limit-number clearable />
                    </t-form-item>
                    <t-form-item label="姓名" name="name">
                        <t-input  :maxlength="10" v-model="newStudent.name"  show-limit-number clearable />
                    </t-form-item>
                </t-form>
                <div class="option">
                    <t-button variant="outline" @click="formVisable = false">取消</t-button>
                    <t-button @click="upNewStudent" >添加</t-button>
                </div>
            </div>
        <div class="s" v-if="!formVisable">
            <t-button @click="openInput" style="margin-right: 10px;">
                从文件添加
            </t-button>
            <input type="file" style="display: none;" id="file-input" accept=".xls,.xlsx" />
            <t-button @click="formVisable = true">手动添加</t-button>
        </div>
    </t-layout>
</template>

<style lang="less" scoped>
    .s {
        margin-left: 40px;
        user-select: none;
    }

    .grade {
        margin-top: 50px;
        width: 15%;
        margin-bottom: 20px;
    }

    .table  {
        width: 30%;
        margin-bottom: 20px;
    }

    .form {
        width: 30%;

        .option {
            margin-top: 20px;

            button {
                margin-right: 10px;
            }
        }
    }
</style>