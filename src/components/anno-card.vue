<script setup lang='ts'>
import Label from '@/components/label.vue'
import { ref, Ref, nextTick } from 'vue'
import { labelSelect, resultsToLabeledDiv } from '@/methods'
import { statusStore, mainStore } from '@/store'

const status = statusStore()
const store = mainStore()

// 监听键盘事件
document.onkeydown = (e) => {
    status.currentLabels.forEach((label) => {
        if (label.shortcut === e.key.toUpperCase()) { // 因为展示的快捷键（包括用户选择的）都是大写，但是也要能够监听小写
            labelSelect(label)
        }
    })
}

// 返回时刚刚标注的状态保持住，从store的状态来同步这个结果
if (store.results.length != 0) {
    const labeledDiv = resultsToLabeledDiv()
    labeledDiv.classList.add('anno-area')
    nextTick(() => {
        document.querySelector('.container')?.firstChild?.replaceWith(labeledDiv)
    })
}

</script>

<template>
    <t-card header-bordered>
        <div class="container">
            <div class="anno-area">
                {{ status.currentText }}
            </div>
        </div>
        <template #actions>
            <Label :disabled="false" v-for="label in status.currentLabels" :name="label.type" :keyword="label.shortcut"
                :color="label.color" :id="label.id"></Label>
        </template>
    </t-card>
</template>

<style lang='less'>
.anno-area {
    font-size: 16px;
    letter-spacing: 2px; // 字体间距
    color: var(--reading-text-color);
    //font-weight: lighter;
    line-height: 200%; // 行间距
    //font-family: 'Courier New', Courier, monospace;
}
</style>