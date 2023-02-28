<script setup lang='ts'>
import Label from '@/components/label.vue'
import { ref, Ref, nextTick } from 'vue'
import { labelSelect } from '@/methods'
import { useStore } from '@/store'
import { labels } from '@/options'

const store = useStore()

const props = defineProps({
    text: {
        type: String,
        required: true
    }
})

// 不能用string类型，不然不会重新渲染
const text: Ref<string> = ref(props.text)


// 监听键盘事件
document.onkeydown = (e) => {
    labels.forEach((label) => {
        if (label.keyword === e.key.toUpperCase()) { // 因为展示的快捷键（包括用户选择的）都是大写，但是也要能够监听小写
            labelSelect(label)
        }
    })
}

// 返回时刚刚标注的状态保持住
var rawText = ref(true)
// 本来想用keepalive的结果没有用
if (typeof store.resultsContainer != 'undefined') {
    rawText.value = false
    nextTick(() => {
        document.querySelector('.container')?.appendChild(store.resultsContainer)
    })
}

</script>

<template>
    <t-card header-bordered>
        <div class="container">
            <div v-if="rawText" class="anno-area">
                {{ text }}
            </div>
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
    width: 53vw;
    color: #191919;
    //font-weight: lighter;
    line-height: 200%; // 行间距
    //font-family: 'Courier New', Courier, monospace;
}
</style>