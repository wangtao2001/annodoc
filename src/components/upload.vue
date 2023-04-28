<script setup lang='tsx'>
import { onMounted, ref, Ref, watch, reactive } from 'vue'
import { fileListToArray, fileSizeSum } from '@/methods/util'
import { ErrorCircleFilledIcon, CheckCircleFilledIcon, CloseCircleFilledIcon } from 'tdesign-icons-vue-next'
import { uplodaFiles } from '@/interface'
import { MessagePlugin } from 'tdesign-vue-next'
import { mainStore } from '@/store'
import axios from 'axios'

const store = mainStore()

onMounted(() => {
    const upArea = document.querySelector('.up-area') as HTMLDivElement
    // 防止浏览器默认打开文件
    upArea.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.stopPropagation()
    })

    // 文件被拖拽进入区域
    upArea.addEventListener('dragenter', () => {
        upArea.style.borderColor = '#eee'
    });

    // 文件离开区域
    upArea.addEventListener('dragleave', () => {
        upArea.style.background = '#fff'
    });

    // 文件被放下
    upArea.addEventListener('drop', (e) => {
        e.preventDefault()
        e.stopPropagation()

        // 获取拖拽进来的文件
        if (e.dataTransfer != null) {
            const files = e.dataTransfer.files
            for (var i=0; i< files.length; i++) {
                if (files[i].type != 'text/plain') {
                    MessagePlugin.error("请检查文件类型")
                    return
                }
            }
            beforeUploadFilesPush(fileListToArray(files))
        }
    })

    // 监听按钮选择文件的事件
    const input = document.getElementById('file-input') as HTMLInputElement
    input.addEventListener("change", function () {
        if (input.files?.length != 0) {
            beforeUploadFilesPush(fileListToArray(input.files!))
        }
        // 这里由于change事件的特殊性，没有考虑去重
    })

})

// 不管是拖拽上传还是点击按钮，都需要往beforeUploadFiles中添加文件组和其对应的信息
const beforeUploadFilesPush = (s: Array<File>) => {
    beforeUploadFiles.push({
                info: {
                    index: beforeUploadFiles.length,
                    name: s.length == 1? `${s[0].name}` :`${s[0].name} 等${s.length}个文件`,
                    size: fileSizeSum(s),
                    status: 2,
                    uploaded: 0
                },
                files: s
            })
}

// 通过按钮打开input标签
const openInput = () => {
    const input = document.getElementById('file-input') as HTMLInputElement
    input.click()
}

const props = defineProps({
    multiple: Boolean // 多文件
})

const beforeUploadFiles: Array<uplodaFiles> = reactive([]) // 等待上传的文件列表和其所对应的信息
// 为了减少表格展示的数量，一起多选的文件为一组，一起上传，这可能不符合上传尽量小的原则

// 参考t-design的逻辑
// 一旦有文件上传了就不在展示拖拽上传的区域
const uploadArea: Ref<boolean> = ref(true)

watch(beforeUploadFiles, () => {
    if (beforeUploadFiles.length != 0) {
        uploadArea.value = false
    } else {
        uploadArea.value = true
    }
})

const statusNameListMap = [
    { label: '上传成功', theme: 'success', icon: <CheckCircleFilledIcon /> },
    { label: '上传失败', theme: 'danger', icon: <CloseCircleFilledIcon /> },
    { label: '等待上传', theme: 'warning', icon: <ErrorCircleFilledIcon /> },
]
const columns = [
    { colKey: 'info.name', title: '文件名', width: '200' },
    { colKey: 'info.size', title: '大小', width: '100' },
    {
        title: '状态', width: '150', cell: (h: any, { row }: { row: uplodaFiles }) => {
            // 这里的意思是获取传入对象的row属性，这里的row就代表data的每一项
            // 通过status数字控制
            // 等待上传、上传成功或失败是展示文字，上传中则是变化的进度（转圈圈）
            return (<>
                    {
                        row.info.status == 3 
                        ? <t-loading text={Math.floor(row.info.uploaded / row.files.length * 100) + '%'} size="small"></t-loading>
                        : <t-tag shape="round" theme={statusNameListMap[row.info.status].theme} variant="light-outline">
                            {statusNameListMap[row.info.status].icon}
                            {statusNameListMap[row.info.status].label}
                        </t-tag>
                    }
                </>)
        }
    },
    {
        title: '操作', width: '50', cell: (h: any, { row }: { row: uplodaFiles }) => {
            return (
                <t-link theme="primary" onClick={() => {
                    if(row.info.status == 3) {
                        MessagePlugin.error("文件正在上传中")
                        return
                    }
                    beforeUploadFiles.splice(row.info.index, 1)
                }}>删除</t-link>
            )
        }
    },
]
// 文件上传
const uploadFile =  async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('taskId', store.createTaskId)
    const response = await axios.post('/api/fileOperation/fileUpload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data
}

const upload = async () => {
    for (var files of beforeUploadFiles) {
        if (files.info.status == 0) {
            continue
        }
        files.info.status = 3
        for (var file of files.files) {
            const data = await uploadFile(file).catch((err)=> {
                files.info.status = 3
                // 这里也应该有错误处理
            })
            if (data.code == 40011) {
                files.info.uploaded ++
            } else {
                files.info.status = 3
                break // 这里的错误处理有问题，某一个文件上传失败，这一组前面的也作废了，再次上传会导致重复的问题
            }
            if (files.info.uploaded == files.files.length) {
                files.info.status = 0
            }
        }
    }
}

</script>

<template>
    <input type="file" style="display: none;" id="file-input" accept=".txt" :multiple="props.multiple" />
    <t-button class="up-button" variant="outline" @click="openInput">
        <template #icon><t-icon name="arrow-up" /></template>
        {{ beforeUploadFiles.length == 0 ? '选择文件' : '继续选择' }}
    </t-button>
    <!--这里选择v-show的原因是为了input标签任然在dom中-->
    <div v-show="uploadArea" class="up-area">
        点击上方“选择文件”或将文件拖拽到此区域
    </div>
    <div v-if="!uploadArea" class="table-area">
        <t-base-table size="small" class="table" row-key="index" :data="beforeUploadFiles" :columns="columns"></t-base-table>
        <div class="op">
            <t-button variant="outline" :disabled="true">取消上传</t-button>
            <t-button @click="upload">上传</t-button>
        </div>
    </div>
</template>

<style scoped lang='less'>
.up-button {
    width: 120px;
}

.up-area {
    width: 450px;
    height: 200px;
    border: 1px dashed #ddd;
    margin-top: 10px;
    color: #ddd;
    user-select: none;
    font-size: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.table-area {
    margin-top: 10px;

    .op {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;

        button {
            margin-left: 5px;
        }
    }
}
</style>