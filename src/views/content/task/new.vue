<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { ref, Ref, reactive, watch, nextTick } from 'vue'
import upload from '@/components/upload.vue'
import { LabelInfo, RelaInfo, taskInfo } from '@/interface'
import { MessagePlugin } from 'tdesign-vue-next'
import Label from '@/components/label.vue'
import Rela from '@/components/real.vue'
import { v4 as uuidv4 } from 'uuid'
import { downloadLocal } from '@/methods/util'
const router = useRouter()

const step: Ref<number> = ref(0)

const cancel = () => {
    router.push('/task/list')
}


const maxPage = 2
const pre = () => {
    step.value -= 1
    if (step.value < maxPage) {
        nextText.value = '下一步'
    }
}

const nextText = ref('下一步')

const next = () => {
    if (step.value == 0) {
        if (basicInfo.name == '' || basicInfo.type == '') {
            MessagePlugin.error('请填写项目名称或类型')
            return
        }
    }
    if (step.value == maxPage) {
        //  生成配置文件
        const newTask: taskInfo = {
            id: taskId,
            type: basicInfo.type,
            taskName: basicInfo.name,
            description: basicInfo.desc,
            createTime: new Date().toLocaleString(),
            modifyTime: new Date().toLocaleString(),
            entitys: allLabels,
            relations: allRelas

        }
        // 下载到本地预览一下
        const jsonString = JSON.stringify(newTask, null, '\t')
        downloadLocal(jsonString, 'data.json')
    }
    if (step.value < maxPage) {
        step.value += 1
    }
    if (step.value == 1) { // 创建了文件名称之后就要分配id
        taskId = uuidv4()
    }
    if (step.value == maxPage) {
        nextText.value = '本地预览'
    }
}

// page 0
// 表单
const basicInfo = reactive({
    name: '',
    type: '',
    desc: ''
})

// page 1
var taskId = ''

// page 2
const labelAddVisible = ref(false) // 添加实体
const relaAddVisible = ref(false) // 添加关系
// 打开添加页面
const labelAddVisibleOpen = () => {
    if (allLabels.length == 26) {
        MessagePlugin.error('不能再添加更多关系')
        return
    }
    labelAddVisible.value = true
}
// 表单输入确定
const labelAddConfim = () => {
    if (addLabelFrom.name == '' || addLabelFrom.keyword == '' || addLabelFrom.color == '') {
        MessagePlugin.error('请填写完整')
        return
    }
    allLabels.push({
        id: uuidv4(),
        type: addLabelFrom.name,
        shortcut: addLabelFrom.keyword,
        color: addLabelFrom.color
    })
    for (var i = 0; i < keywords.length; i++) {
        if (keywords[i] == addLabelFrom.keyword) {
            keywords.splice(i, 1)
            break
        }
    }
    addLabelFrom.name = ''
    addLabelFrom.keyword = ''
    addLabelFrom.color = ''
    labelAddVisible.value = false
}
const relaAddConfim = () => {
    if (addRelaFrom.name == '' || addRelaFrom.strat == '' || addRelaFrom.end == '') {
        MessagePlugin.error('请填写完整')
        return
    }
    allRelas.push({
        id: uuidv4(),
        type: addRelaFrom.name,
        entity1: addRelaFrom.strat,
        entity2: addRelaFrom.end,
        bothway: addRelaFrom.bothway
    })
    addRelaFrom.name = ''
    addRelaFrom.strat = ''
    addRelaFrom.end = ''
    relaAddVisible.value = false
}

const keywords: Array<string> = reactive([]) // 快捷键容器即A-Z
for (var i = 65; i <= 90; i++) {
    keywords.push(String.fromCharCode(i))
}
// 输入的表单
const addLabelFrom = reactive({
    name: '',
    keyword: '',
    color: ''
})
const addRelaFrom = reactive({
    strat: '',
    end: '',
    name: '',
    bothway: false
})
// 所有添加过的标签、关系
const allLabels: Array<LabelInfo> = reactive([])
const allRelas: Array<RelaInfo> = reactive([])

const deletaLabel = (id: string) => {
    var i = 0
    for (var l of allLabels) {
        if (l.id == id) {
            allLabels.splice(i, 1)
        }
        i += 1
    }
}

const deletaRela = (id: string) => {
    var i = 0
    for (var r of allRelas) {
        if (r.id == id) {
            allRelas.splice(i, 1)
        }
        i += 1
    }
}

// 工具函数
const labelIdToName = (id: string): string => {
    for (var l of allLabels) {
        if (l.id == id) {
            return l.type
        }
    }
    return ""
}

</script>

<template>
    <div class="root">
        <div class="container">
            <t-form v-if="step == 0" label-align="left">
                <t-form-item label="项目类型" name="type">
                    <t-select v-model="basicInfo.type">
                        <t-option label="医学文本" value="医学文本" />
                        <t-option label="电子病历" value="电子病历" />
                    </t-select>
                </t-form-item>
                <t-form-item label="项目名称">
                    <t-input v-model="basicInfo.name" :maxlength="20" show-limit-number clearable />
                </t-form-item>
                <t-form-item label="项目描述">
                    <t-textarea v-model="basicInfo.desc" placeholder="简单描述项目，长度限制为100" :maxcharacter="100"
                        :autosize="{ minRows: 5, maxRows: 10 }" clearable />
                </t-form-item>
            </t-form>
            <t-form v-if="step == 1" label-align="left">
                <!--先把样式写出来，文件控制以后再说-->
                <t-form-item label="上传数据文件">
                    <div class="file">
                        <!--这个上传功能自己写-->
                        <upload :multiple="true" />
                        <p style="color: #999;">
                            支持多选，扩展名 .txt .doc .docx<br />
                            单个文件大小不超过20M，仅支持UTF-8编码方式
                        </p>
                    </div>
                </t-form-item>
            </t-form>
            <t-form v-if="step == 2" label-align="left">
                <t-form-item label="实体配置">
                    <div class="label s">
                        <div class="con">
                            <p v-if="allLabels.length == 0">配置的实体标签将显示在这里</p>
                            <t-popconfirm @confirm="deletaLabel(l.id)" v-for="l in allLabels" content="确认删除吗"
                                theme="danger">
                                <Label :name="l.type" :keyword="l.shortcut" :color="l.color" :disabled="true"
                                    :id="l.id"></Label>
                            </t-popconfirm>
                        </div>
                        <div class="add" @click="labelAddVisibleOpen">
                            <t-icon name="add" />
                            添加实体
                        </div>
                    </div>
                </t-form-item>
                <t-form-item label="关系配置">
                    <div class="rela s">
                        <div class="con">
                            <p v-if="allRelas.length == 0">配置的实体标签将显示在这里</p>
                            <t-popconfirm v-for="r in allRelas" @confirm="deletaRela(r.id)" content="确认删除吗">
                                <Rela :name="r.type" :start-name="labelIdToName(r.entity1)"
                                    :end-name="labelIdToName(r.entity2)" :bothway="r.bothway">
                                </Rela>
                            </t-popconfirm>
                        </div>
                        <div class="add" @click="relaAddVisible = true">
                            <t-icon name="add" />
                            添加关系
                        </div>
                    </div>
                </t-form-item>
            </t-form>
            <div class="op">
                <t-button @click="next">{{ nextText }}</t-button>
                <t-button @click="pre" v-if="step > 0" theme="default" variant="outline">上一步</t-button>
                <t-button @click="cancel" theme="default" variant="outline">取消</t-button>
            </div>
        </div>
    </div>
    <!--对话框-->
    <t-dialog style="user-select: none" v-model:visible="labelAddVisible" mode="modal" draggable
        :on-confirm="labelAddConfim">
        <div>
            <t-form label-align="left">
                <t-form-item label="实体名称">
                    <t-input v-model="addLabelFrom.name" :maxlength="10" show-limit-number clearable />
                </t-form-item>
                <t-form-item label="标注快捷键">
                    <t-select v-model="addLabelFrom.keyword">
                        <t-option v-for="k in keywords" :value="k" />
                    </t-select>
                </t-form-item>
                <t-form-item label="标签配色">
                    <t-color-picker v-model="addLabelFrom.color" :swatchColors="null" :format="['RGB']"
                        :colorModes="['monochrome']" :show-primary-color-preview="false" />
                </t-form-item>
            </t-form>
        </div>
    </t-dialog>
    <t-dialog style="user-select: none" v-model:visible="relaAddVisible" mode="modal" draggable :on-confirm="relaAddConfim">
        <div>
            <t-form label-align="left">
                <t-form-item label="关系名称">
                    <t-input v-model="addRelaFrom.name" :maxlength="10" show-limit-number clearable />
                </t-form-item>
                <t-form-item label="起点实体类型">
                    <t-select v-model="addRelaFrom.strat">
                        <t-option v-for="l in allLabels" :label="l.type" :value="l.id" />
                    </t-select>
                </t-form-item>
                <t-form-item label="终点实体类型">
                    <t-select v-model="addRelaFrom.end">
                        <t-option v-for="l in allLabels" :label="l.type" :value="l.id" />
                    </t-select>
                </t-form-item>
                <t-form-item label="双向关系">
                    <t-switch v-model="addRelaFrom.bothway" />
                </t-form-item>
            </t-form>
        </div>
    </t-dialog>
</template>

<style scoped lang='less'>
.container {
    margin-left: 40px;
    width: 35vw;
    user-select: none;

    .file {
        display: flex;
        flex-direction: column;

        p {
            margin-top: 10px;
        }
    }

    .s {
        width: 100%;

        .con {
            border: 1px dashed #ddd;
            min-height: 100px;
            margin-bottom: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #ddd;
            font-size: 10px;
            flex-wrap: wrap;
        }

        .add {
            border: 1px dashed #ddd;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #595959;
            font-size: 13px;
        }
    }

    .op {
        margin: 20px 0;
        display: flex;

        button {
            margin-right: 10px;
        }
    }
}

.t-dialog {
    user-select: none;
    width: 10px !important;
}
</style>