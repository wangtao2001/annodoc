<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue'
import { useStore } from '@/store'
import { relaOption } from '@/interface'
import { relas } from '@/options'
import { resultNumberToLabelId, resultIDToContent, relaIDToContent } from '@/methods/util'
import { v4 as uuidv4 } from 'uuid'
import pubsub from 'pubsub-js'
import { MessagePlugin } from 'tdesign-vue-next'

const store = useStore()

// 命名规则 rela1关系起点 rela2关系终点 allRela能够展示出来的关系 relas所有关系

const visibleModal = ref(false) // 控制对话框

const relaView: Array<{ start: number, end: number, rela: string, id: string }> = reactive([])
// 这个应该需要能够根据store内容来填充
// 这个就保证了根据store的结果还能展示出来
// anno-card也需要有这个功能
// 缓存组件是一种方法，但是不能用
// 更进一步，从标注结果返回标注状态，第一步就是把标注结果往store中存
if (store.relaResults.length != 0) {
    for (var r of store.relaResults) {
        relaView.push({
            id: r.id,
            start: r.startNumber,
            end: r.endNumber,
            rela: r.relaName
        })
    }
}

pubsub.subscribe('cleanAll', () => {
    relaView.length = 0
})

pubsub.subscribe('piniaToRelaView', () => {
    relaView.length = 0
    for (var r of store.relaResults) {
        relaView.push({
            start: r.startNumber,
            end: r.endNumber,
            rela: r.relaName,
            id: r.id
        })
    }
})


var isreverse = false // 是否存在选择的关系方向于规定不同
const dialogConfim = () => { // 点击确定对话框关闭
    // 往store中存
    if (rela1Number.value != -1 && rela1Number.value != -1 && relaID.value != "") {
        // 如果是单向关系这里就要调整顺序了
        const data = {
            id: uuidv4(),
            startNumber: rela1Number.value,
            startContent: resultIDToContent(rela1Number.value),
            endNumber: rela2Number.value,
            endContent: resultIDToContent(rela2Number.value),
            relaId: relaID.value,
            relaName: relaIDToContent(relaID.value)
        }
        if (isreverse) {
            data.startNumber = rela2Number.value
            data.endNumber = rela1Number.value
            data.startContent = resultIDToContent(rela2Number.value)
            data.endContent = resultIDToContent(rela2Number.value)
        }
        if (data.startNumber == data.endNumber) { // 起点终点不能是一个
            MessagePlugin.error('关系起点与终点重复')
            return
        }
        for (var r of store.relaResults) {  // 去重
            if (r.startNumber == data.startNumber && r.endNumber == data.endNumber) {
                MessagePlugin.error('关系重复')
                return
            }
        }
        store.relaResults.push(data)
        visibleModal.value = false
        // 展示内容
        relaView.push({
            start: data.startNumber,
            end: data.endNumber,
            rela: data.relaName,
            id: data.id
        })
    }
}

const rela1Options: Array<relaOption> = [] // 关系起点的选择的内容
const rela2Options = rela1Options // 关系终点选择的内容


const addRela = () => { // 打开对话框
    visibleModal.value = true
    rela1Options.length = 0 // 首先清空
    rela1Number.value = -1 // 全都恢复默认
    rela1Title.value = '选择关系起点'
    rela2Number.value = -1
    rela2Title.value = '选择关系终点'
    allRelaTitle.value = '选择关系'
    relaID.value = ""
    isreverse = false
    for (var r of store.results) { // 重新装载
        rela1Options.push({
            content: r.number.toString() + ' ' + r.content,
            id: r.number
        })
    }
}

const rela1Title = ref("选择关系起点") // 关系起点的title
const rela1Number = ref(-1) // 关系起点选择的id
const rela1Choose = (data: relaOption) => {
    rela1Title.value = data.content
    rela1Number.value = data.id as number
}

const rela2Title = ref("选择关系起点") // 关系起点的title
const rela2Number = ref(-1) // 关系起点选择的Number
const rela2Choose = (data: relaOption) => {
    rela2Title.value = data.content
    rela2Number.value = data.id as number
}

const allRelaOptions: Array<relaOption> = [] // 关系选择的内容
// 这里面的内容需要根据选择的关系起点和终点来展示，比如选择了两个疾病，就只能展示并发症这一种
const allRelaDisabled = ref(true) // 在没有选择起点和终点时这个选择是禁用的
// 监听起点和终点有没有选择
const ids = computed(() => { //合到一起便于侦听
    return { rela1Number, rela2Number }
})
watch(ids, () => {
    if (rela1Number.value != -1 && rela2Number.value != -1) {
        // 两个都选择了才取消选择关系的禁用
        const keyword1 = resultNumberToLabelId(rela1Number.value)
        const keyword2 = resultNumberToLabelId(rela2Number.value)
        allRelaOptions.length = 0

        for (var r of relas) {
            if ((r.startId == keyword1 && r.endId == keyword2) || (r.startId == keyword2 && r.endId == keyword1)) {
                if (!r.bothway && r.startId == keyword2) { // 反向了
                    isreverse = true
                }
                allRelaOptions.push({
                    content: r.name,
                    id: r.id
                })
            }
        }
        allRelaDisabled.value = false
    }
}, { deep: true })

const allRelaTitle = ref("选择关系") // 关系的title
const relaID = ref("") // 关系的id
const allRelaChoose = (data: relaOption) => {
    allRelaTitle.value = data.content
    relaID.value = data.id as string
}

const deleteRela = (id: string) => {
    var index = 0
    for (var r of relaView) {
        index += 1
        if (r.id == id) {
            relaView.splice(index - 1, 1)
            store.relaResults.splice(index - 1, 1) // 下标可以共用
            break
        }
    }
}

</script>

<template>
    <t-card bordered>
        <div class="rela-area">
            <div class="list" v-for="r in relaView" :key="r.id">
                <div class="info">
                    {{ r.start }}
                    <t-icon name="slash" />
                    {{ r.end }}
                    <t-icon name="arrow-right" />
                    {{ r.rela }}
                </div>
                <t-link theme="danger" @click="deleteRela(r.id)" hover="color"> 删除 </t-link>
            </div>
            <t-button class="add-rela" @click="addRela" theme="primary">
                <template #icon><t-icon name="add" /></template>
                新增关系
            </t-button>
            <t-dialog style="user-select: none;" v-model:visible="visibleModal" header="新增关系" mode="modal" draggable
                :on-confirm="dialogConfim">
                <template #body>
                    <t-dropdown @click="rela1Choose" :options="rela1Options" :disabled="store.results.length == 0">
                        <t-space>
                            <t-button variant="text">
                                {{ rela1Title }}
                                <template #suffix> <t-icon name="chevron-down" size="16" /></template>
                            </t-button>
                        </t-space>
                    </t-dropdown>
                    <t-dropdown @click="rela2Choose" :options="rela2Options" :disabled="store.results.length == 0">
                        <t-space>
                            <t-button variant="text">
                                {{ rela2Title }}
                                <template #suffix> <t-icon name="chevron-down" size="16" /></template>
                            </t-button>
                        </t-space>
                    </t-dropdown>
                    <t-dropdown @click="allRelaChoose" :options="allRelaOptions" :disabled="allRelaDisabled">
                        <t-space>
                            <t-button variant="text">
                                {{ allRelaTitle }}
                                <template #suffix> <t-icon name="chevron-down" size="16" /></template>
                            </t-button>
                        </t-space>
                    </t-dropdown>
                </template>
            </t-dialog>
        </div>
    </t-card>
</template>

<style scoped lang="less">
.rela-area {
    .add-rela {
        width: 100%;
        padding: 0 40px;
    }
}

.list {
    margin-bottom: 5px;
    user-select: none;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
</style>