<script lang="tsx" setup>
import {ref, onMounted,reactive, toRaw, Ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { StudentInfo } from '@/interface'
import * as xlsx from "xlsx"
import { NotifyPlugin } from 'tdesign-vue-next'
import {request, getConfig, deleteConfig, postConfig} from '@/methods/request'

const columns = [
    { colKey: 'number', title: '学号'},
    { colKey: 'name', title: '姓名'},
    { colKey: 'score', title: '得分'},
    { colKey: 'finish', title: '完成数量'},
    // 其他信息
    {title: '操作', cell: (h: any, { row }: { row: any }) => {
        return (
            <t-popconfirm  theme="danger" on-confirm={()=>{deleteStudent(row)}} content="确认删除吗">
                <t-link theme="danger" > 删除 </t-link>
            </t-popconfirm>
        )
    }}
]

const deleteStudent = async (row: StudentInfo) => {
    request(
        deleteConfig,
        `/api/getResponses/deleteStudent/${row.number}`,
        () => {
            allStudents.value = []
            loadData(displayGrade.value)
        },
        undefined,
        "删除成功",
        undefined
    )
}

const allStudents: Ref<Array<StudentInfo>> = ref([])
const pageSize = 6
const viewStudents: Ref<Array<StudentInfo>> = ref([]) // 实际展示出来的，为了分页和搜索
var tempView : Array<StudentInfo>// 缓存

const displayGrade = ref("19") // 默认19级

const loadData = async (grade: number | string) =>  {
    request(
        getConfig, 
        `/api/getResponses/getAllStudentNumberByGrade/${grade}`, 
        async (data) => {
            const allStudents: Array<string> = data
                for (var number of allStudents) {
                    await loadItem(number)
                }
        }, 
        undefined, undefined,
        () => {
            viewStudents.value = []
        }
    )
}

const loadItem = async (number: number | string)=> {
    request(
        getConfig,
        `/api/getResponses/getByStudentNumber/${number}`,
        (data) => {
            allStudents.value.push({
                number: data.number,
                name: data.name,
                score: data.score,
                finish: data.finish,
                grade: data.grade
            })
            viewStudents.value = allStudents.value.slice(0, pageSize)
            tempView = viewStudents.value
        }
    )
}

loadData(displayGrade.value)


const openInput = ()=> {
    const input = document.getElementById('file-input') as HTMLInputElement
    NotifyPlugin('warning', { title: '提示', content: '表格至少需要number与name两列' })
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
                number: string,
                grade: number
            }> = []
            data.forEach((d: any)=> {
                newData.push({
                    number: d.number.toString(), // 保证上传的文件有这两列
                    name: d.name,
                    grade: Number(displayGrade.value)
                })
            })
            uploadStudent(newData)
        }
    })
})

const uploadStudent = async (data: Array<{name: string,number: string}>) => {
    request(
        postConfig,
        '/api/resultAccepts/batchAddStudent',
        () => {
            formVisable.value = false
            allStudents.value = []
            loadData(displayGrade.value)
        },
        data,
        "添加成功"
    )
}

const formVisable = ref(false)
const newStudent = reactive({
    number: '',
    name: '',
    grade: Number(displayGrade.value)
})
const upNewStudent =  async ()=>{
    if (newStudent.number == '' || newStudent.name == '') {
        MessagePlugin.error('请填写完整信息')
        return
    }
    uploadStudent([toRaw(newStudent)])
    newStudent.number = ''
    newStudent.name = ''
}

const changeGrade = (value: string)=> {
    allStudents.value = []
    loadData(value)
}

const labelAalign = window.innerWidth <= 900 ? 'top': 'left'

const changePage = (current: number) => {
    viewStudents.value = allStudents.value.slice((current - 1) * pageSize, current * pageSize)
    tempView = viewStudents.value
}

const searchValue = ref("")
const clearSearch = () => {
    searchValue.value = ""
}
const searchChange = (value: string)=> {
    if (value.length == 0) { // 清空的时候
        viewStudents.value = tempView!
        return
    }
    const t = []
    for (var s of allStudents.value) {
        if (s.number.toString().includes(value)) {
            t.push(s)
        }
    }
    viewStudents.value = t
}
</script>

<template>
    <t-layout>
        <div class="s select">
            <t-select class="grade" @change="changeGrade" v-model="displayGrade">
                <t-option label="2019级" value="19" />
                <t-option label="2020级" value="20" />
                </t-select>
            <t-input class="search" @change="searchChange" v-model="searchValue" placeholder="请输入学号" :maxlength="10" show-limit-number clearable>
                <template #suffixIcon>
                    <t-icon name="search" />
                </template>
            </t-input>
        </div>
        <t-base-table
        class="table s"
        bordered        
        :columns="columns"
        :data="viewStudents"
        table-layout="auto"
        row-key="number"
        ></t-base-table>
        <div class="s list">
            <div class="list-item" v-for="d in viewStudents" :key="d.number">
                <div class="stu">
                    <div class="title">{{ d.number + ' / ' + d.name }}</div>
                    <div class="info">{{ '得分：' + d.score + '&nbsp;&nbsp; 完成数量：' + d.finish}}</div>
                </div>
                <t-popconfirm @confirm="deleteStudent(d)" theme="danger" content="确认删除吗">
                    <t-link theme="danger" > 删除 </t-link>
                </t-popconfirm>
            </div>
        </div>
        <t-pagination v-show="searchValue.length == 0" class=" page s" :total="allStudents.length" showPageNumber :showPageSize="false" :pageSize="8"
                showPreviousAndNextBtn totalContent  @current-change="changePage" />
        <div class="s form" v-if="formVisable">
            <t-form :label-align="labelAalign">
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
        <div class="s" v-if="!formVisable && searchValue.length ==0">
            <t-button @click="openInput" style="margin-right: 10px;">
                从文件添加
            </t-button>
            <input type="file" style="display: none;" id="file-input" accept=".xls,.xlsx" />
            <t-button @click="formVisable = true">手动添加</t-button>
        </div>
        <div v-else class="s" v-if="searchValue.length != 0">
            <t-button variant="outline" theme="default" @click="clearSearch" >清空搜索</t-button>
        </div>
    </t-layout>
</template>

<style lang="less" scoped>
    .s {
        margin-left: 40px;
        user-select: none;
        margin: 10px 40px 10px 40px;
    }

    .select {
        width: 40%;
        display: flex;
        flex-direction: row;
        margin-top: 40px;
        justify-content: space-between;

        .grade, .search {
            width: 47%;
        }
    }

    .page {
        width: 40%;
    }

    .table  {
        width: 500px;
    }

    .form {
        width: 350px;

        .option {
            margin-top: 20px;

            button {
                margin-right: 10px;
            }
        }
    }

    .list {
        display: none;
    }

@media screen and (max-width: 900px) {
    .s {
        margin: 10px 20px;
        width: auto;
    }

    .table {
        display: none;
    }

    .select {
        margin-top: 20px;
        flex-direction: column;
        
        .grade, .search {
            width: 100%;
        }

        .search {
            margin-top: 10px;
        }
    }

    .list {
        display: block;
        border: 1px solid var( --common-border);
        padding: 20px 20px;

        .list-item {
            display: flex;
            justify-content: space-between;

            .stu {
                .title {
                    font-weight: 600;
                }
            }
        }
    }

    .list-item:nth-child(n + 2) {
        margin-top: 10px;
    }
}
</style>