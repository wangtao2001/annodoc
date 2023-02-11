<script setup lang='ts'>
import Label from '@/components/label.vue'
import { ref, Ref } from 'vue'
import { LabelInfo } from '@/methods/interface'
import { labelSelect } from '@/methods'

// 不能用string类型，不然不会重新渲染
const text: Ref<string> = ref('冠状病毒是一个大型病毒家族，冠状病毒已知可引起感冒、中东呼吸综合征（MERS）和严重急性呼吸综合征（SARS）等较严重疾病。新型冠状病毒是以前从未在人体中发现的冠状病毒新毒株。\n人感染了冠状病毒后的常见体征有呼吸道症状、发热、咳嗽、气促和呼吸困难等。在较严重病例中，感染可导致肺炎、严重急性呼吸综合征、肾衰竭，甚至死亡。')

// 此值应当是用户选择后从后端读取的
const labels: Array<LabelInfo> = [{
    name: "疾病", keyword: "A", color: "#009ce0"
}, {
    name: "症状", keyword: "P", color: "#f9756d"
}, {
    name: "部位", keyword: "G", color: "#28a745"
}]

// 监听键盘事件
document.onkeydown = (e) => {
    labels.forEach((label) => {
        if (label.keyword === e.key.toUpperCase()) { // 因为展示的快捷键（包括用户选择的）都是大写，但是也要能够监听小写
            labelSelect(label)
        }
    })
}
</script>

<template>
    <t-card bordered header-bordered>
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
    //font-weight: lighter;
    line-height: 200%; // 行间距
    //font-family: 'Courier New', Courier, monospace;
}
</style>