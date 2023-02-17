<script setup lang='ts'>
import Label from '@/components/label.vue'
import { ref, Ref } from 'vue'
import { LabelInfo } from '@/methods/interface'
import { labelSelect } from '@/methods'


const props = defineProps({
    text: {
        type: String,
        required: true
    }
})

// 不能用string类型，不然不会重新渲染
const text: Ref<string> = ref(props.text)

// 此值应当是用户选择后从后端读取的
const labels: Array<LabelInfo> = [{
    name: "疾病", keyword: "A", color: "#009ce0"
}, {
    name: "症状", keyword: "P", color: "#f9756d"
}, {
    name: "部位", keyword: "G", color: "#28a745"
}, {
    name: "人名", keyword: "F", color: "#ffd664"
}]

// 监听键盘事件
document.onkeydown = (e) => {
    labels.forEach((label) => {
        if (label.keyword === e.key.toUpperCase()) { // 因为展示的快捷键（包括用户选择的）都是大写，但是也要能够监听小写
            labelSelect(label)
        }
    })
}

// 在考虑要不要根据results存储的结果来实现从resulte页返回时标记结果仍在
</script>

<template>
    <t-card header-bordered>
        <div class="anno-area" v-html="text">
        </div>
        <template #actions>
            <Label v-for="label in labels" :name="label.name" :keyword="label.keyword" :color="label.color"></Label>
        </template>
</t-card>
</template>

<style scoped lang='less'>
.anno-area {
    font-size: 16px;
    letter-spacing: 2px; // 字体间距
    width: 50vw;
    color: #191919;
    //font-weight: lighter;
    line-height: 200%; // 行间距
    //font-family: 'Courier New', Courier, monospace;
}
</style>