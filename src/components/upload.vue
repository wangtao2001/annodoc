<script setup lang='tsx'>
import { onMounted, ref, Ref, watch, reactive } from 'vue'
import { fileListToArray, fileSizeSum } from '@/methods/util'
import { ErrorCircleFilledIcon, CheckCircleFilledIcon, CloseCircleFilledIcon } from 'tdesign-icons-vue-next'
import { uploadInfo } from '@/interface'

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
            beforeUploadFiles.push(fileListToArray(e.dataTransfer.files))
            updataFileData()
        }
    })

    // 监听按钮选择文件的事件
    const input = document.getElementById('file-input') as HTMLInputElement
    input.addEventListener("change", function () {
        if (input.files?.length != 0) {
            beforeUploadFiles.push(fileListToArray(input.files!))
            updataFileData()
        }
        // 这里由于change事件的特殊性，没有考虑去重
    })

})

// 通过按钮打开input标签
const openInput = () => {
    const input = document.getElementById('file-input') as HTMLInputElement
    input.click()
}

const props = defineProps({
    multiple: Boolean // 多文件
})

const beforeUploadFiles: Array<Array<File>> = reactive([]) // 等待上传的文件列表
// 为了减少表格展示的数量，一起多选的文件为一组，一起上传，这可能不符合上传尽量小的原则

// 参考t-design的逻辑
// 一旦有文件上传了就不在展示拖拽上传的区域
const uploadArea: Ref<boolean> = ref(true)
const updataFileData = () => {
    data.length = 0
    var i = 0
    for (var arr of beforeUploadFiles) {
        data.push({
            index: i,
            name: `${arr[0].name} 等${arr.length}个文件`,
            size: fileSizeSum(arr),
            status: 2
        })
        i += 1
    }
}
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
    { label: '未上传', theme: 'warning', icon: <ErrorCircleFilledIcon /> },
]
const columns = [
    { colKey: 'name', title: '文件名', width: '200' },
    { colKey: 'size', title: '大小', width: '100' },
    {
        colKey: 'status', title: '状态', width: '150', cell: (h: any, { row }: { row: uploadInfo }) => {
            // 这里的意思是获取传入对象的row属性，这里的row就代表data的每一项
            // 通过status数字控制
            return (
                <t-tag shape="round" theme={statusNameListMap[row.status].theme} variant="light-outline">
                    {statusNameListMap[row.status].icon}
                    {statusNameListMap[row.status].label}
                </t-tag>
            )
        }
    },
    {
        colKey: 'op', title: '操作', width: '50', cell: (h: any, { row }: { row: uploadInfo }) => {
            return (
                <t-link theme="primary" onClick={() => {
                    beforeUploadFiles.splice(row.index, 1)
                    updataFileData()
                }}>删除</t-link>
            )
        }
    },
]

const data: Array<uploadInfo> = reactive([])

</script>

<template>
    <input type="file" style="display: none;" id="file-input" :multiple="props.multiple" />
    <t-button class="up-button" variant="outline" @click="openInput">
        <template #icon><t-icon name="arrow-up" /></template>
        {{ beforeUploadFiles.length == 0 ? '选择文件' : '继续选择' }}
    </t-button>
    <!--这里选择v-show的原因是为了input标签任然在dom中-->
    <div v-show="uploadArea" class="up-area">
        点击上方“选择文件”或将文件拖拽到此区域
    </div>
    <div v-if="!uploadArea" class="table-area">
        <t-base-table size="small" class="table" row-key="index" :data="data" :columns="columns"></t-base-table>
        <div class="op">
            <t-button variant="outline" :disabled="true">取消上传</t-button>
            <t-button>上传</t-button>
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