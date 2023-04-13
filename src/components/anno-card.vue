<script setup lang='ts'>
import Label from '@/components/label.vue'
import { ref, Ref, nextTick } from 'vue'
import { labelSelect, resultsToLabeledDiv } from '@/methods'
import { useStore } from '@/store'
import { labels } from '@/options'

const store = useStore()


// 监听键盘事件
document.onkeydown = (e) => {
    labels.forEach((label) => {
        if (label.shortcut === e.key.toUpperCase()) { // 因为展示的快捷键（包括用户选择的）都是大写，但是也要能够监听小写
            labelSelect(label)
        }
    })
}

// 返回时刚刚标注的状态保持住，从store的状态来同步这个结果
if (store.results.length != 0) {
    const labeledDiv = resultsToLabeledDiv()
    nextTick(() => {
        document.querySelector('.anno-area')?.firstChild?.replaceWith(labeledDiv)
    })
}

</script>

<template>
    <t-card header-bordered>
        <div class="container">
            <div class="anno-area">
                {{ store.text }}
            </div>
        </div>
        <template #actions>
            <Label :disabled="false" v-for="label in labels" :name="label.type" :keyword="label.shortcut"
                :color="label.color" :id="label.id"></Label>
        </template>
    </t-card>
</template>

<style scoped lang='less'>
.anno-area {
    font-size: 16px;
    letter-spacing: 2px; // 字体间距
    color: #191919;
    //font-weight: lighter;
    line-height: 200%; // 行间距
    //font-family: 'Courier New', Courier, monospace;
}
</style>