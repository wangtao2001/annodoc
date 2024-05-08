<script lang="tsx" setup>
import { request, getConfig, postConfig } from '@/methods/request'
import { reactive, ref, Ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { UserRole } from '@/interface'


const columns = [
    { colKey: 'number', title: '学号/工号' },
    {
        title: '姓名', cell: (h: any, { row }: { row: any }) => {
            return (
                <div class='checker_name'>
                    <p>{row.name}</p>
                    <>{
                        row.role == UserRole.teacher ?
                            <t-tag theme="warning" variant="light">管理员</t-tag> :
                            <t-tag theme="success" variant="light">审核员</t-tag>
                    }</>
                </div>
            )
        }
    },
    { colKey: 'done', title: '完成数量' },
    {
        title: '语言偏好', cell: (h: any, { row }: { row: any }) => {
            return (
                <>{row.language == 'EN-US' ? <p>英文</p> : <p>中文</p>}</>
            )
        }
    },
    {
        title: '操作', cell: (h: any, { row }: { row: any }) => {
            return (
                <>
                <t-link theme="primary" onClick={()=>changeLanguage(row)}>切换语言偏好</t-link>
                <t-popconfirm on-confirm={() => { deleteCheck(row) }} theme="danger" content="确认删除吗">
                    <t-link theme="danger" > 删除 </t-link>
                </t-popconfirm>
                </>
            )
        }
    }
]

const changeLanguage = async (row: any) => {
    const oldLang = row.language
    let newLang = '';
    if (oldLang=='ZH-CN' || oldLang.length==0 || oldLang == null) {
        newLang = 'EN-US'
    }
    else newLang = 'ZH-CN'
    await request(
        getConfig,
        `/api/getResponses/changeLanguageChecker?number=${row.number}&language=${newLang}`,
        ()=>{}, undefined, '修改成功'
    )
    allChecker.value.forEach(c => {
        if (c.number ==  row.number) c.language = newLang
    })
}

const allChecker: Ref<Array<{
    number: string, name: string, role: UserRole, done: number, language: string
}>> = ref([])

const loadData = async () => {
    allChecker.value = []
    await request( // 这里有先后顺序
        getConfig,
        '/api/getResponses/allChecker',
        (resData) => {
            for (var row of resData) {
                allChecker.value.push({
                    number: row.number,
                    name: row.name,
                    role: UserRole.checker,
                    done: row.toBeDone, // 完成数量
                    language: row.language
                })
            }
        }
    )
    request(
        getConfig,
        '/api/getResponses/allManager',
        (data) => {
            for (var r of data) {
                for (var c of allChecker.value) {
                    if (c.number == r.number) {
                        c.role = UserRole.teacher
                    }
                }
            }
        }
    )
    allChecker.value.sort((a, b) => {
        if (a.language == 'EN-US') return 1
        else return -1
    })
}

const deleteCheck = async (data: any) => {
    // 删除也是做两遍
    if (data.role == UserRole.teacher) {
        request(
            getConfig,
            `/api/getResponses/deleteManager/${data.number}`,
            () => { }
        )
    }
    request(
        getConfig,
        `/api/getResponses/deleteChecker/${data.number}`,
        () => {
            loadData()
        },
        undefined, "删除成功"
    )
}

loadData()

const formVisable = ref(false)
const newData = reactive({
    number: '',
    name: '',
    language: 'ZH-CN'
})
const upNewData = async () => {
    if (newData.number == '' || newData.name == '') {
        MessagePlugin.error('请填写完整信息')
        return
    }
    // 现在管理员里面添加一遍
    if (newRole.value == 'teacher') {
        request(
            postConfig,
            '/api/resultAccepts/insertManager',
            () => { },
            newData,
        )
    }
    // 审核员一定会添加
    request(
        postConfig,
        '/api/resultAccepts/insertChecker',
        () => {
            loadData()
            formVisable.value = false
        },
        newData,
        "添加成功"
    )
    newData.number = ''
    newData.name = ''
    newData.language = ''
}

const labelAalign = window.innerWidth <= 900 ? 'top' : 'left'

const newRole = ref('checker')

const zeroDone = () => {
    request(
        getConfig,
        '/api/getResponses/zeroChecker',
        () => {
            loadData()
        },
        undefined, "重置成功"
    )
}
</script>

<template>
    <t-layout>
        <t-base-table class="table" bordered :data="allChecker" :columns="columns" table-layout="auto"
            row-key="number"></t-base-table>
        <!--移动端将表格转换为列表，全部场景-->
        <div class="form list">
            <div class="list-item" v-for="d in allChecker" :key="d.number">
                <div>{{ d.number + ' / ' + d.name + '/' + d.done }}</div>
                <t-tag v-if="d.role == UserRole.teacher" theme="warning" variant="light">管理员</t-tag>
                <t-tag v-else theme="success" variant="light">审核员</t-tag>
                <div>
                    <t-link theme="primary" @click="changeLanguage(d)">切换语言偏好</t-link>
                    <t-popconfirm @confirm="deleteCheck(d)" theme="danger" content="确认删除吗">
                        <t-link theme="danger"> 删除 </t-link>
                    </t-popconfirm>
                </div>
            </div>
        </div>
        <div class="form">
            <div v-if="formVisable">
                <t-form :label-align="labelAalign">
                    <t-form-item label="权限" name="role">
                        <t-select v-model="newRole">
                            <t-option label="审核员" value="checker" />
                            <t-option label="管理员" value="teacher" />
                        </t-select>
                    </t-form-item>
                    <t-form-item label="学号/工号" name="number">
                        <t-input v-model="newData.number" :maxlength="10" show-limit-number clearable />
                    </t-form-item>
                    <t-form-item label="姓名" name="name">
                        <t-input v-model="newData.name" :maxlength="10" show-limit-number clearable />
                    </t-form-item>
                    <t-form-item label="语言偏好" name="language">
                        <t-select v-model="newData.language">
                            <t-option label="中文" value="ZH-CN" />
                            <t-option label="英文" value="EN-US" />
                        </t-select>
                    </t-form-item>
                </t-form>
                <div class="option">
                    <t-button variant="outline" @click="formVisable = false">取消</t-button>
                    <t-button @click="upNewData">添加</t-button>
                </div>
            </div>
            <t-button v-if="!formVisable" @click="formVisable = true" style="margin-right: 10px;">添加</t-button>
            <t-popconfirm @confirm='zeroDone' theme="danger" content="确认重置吗">
                <t-button v-if="!formVisable">重置完成数量</t-button>
            </t-popconfirm>
        </div>

    </t-layout>
</template>

<style lang="less" scoped>
.table {
    margin: 50px 40px 0 40px;
    width: 600px !important;
    user-select: none;
}

.form {
    margin: 20px 40px 20px 40px;
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
        border: 1px solid var(--common-border);
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