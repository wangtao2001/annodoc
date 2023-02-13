<script setup lang='ts'>
import { labelSelect } from '@/methods'

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    keyword: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    }
})
</script>

<template>
    <div class="name" :style="{ 'background-color': color }" @click="labelSelect({
        name, keyword, color
    })">
        {{ name }}
        <div class="key">{{ keyword }}</div>
    </div>
</template>

<style scoped lang='less'>
.name {
    user-select: none;
    display: flex;
    align-items: center;
    flex-direction: row;
    // 背景颜色只能借助样式绑定
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    margin: 0 8px;
    transition: 0.4s;

    .key {
        margin-left: 6px;
        background-color: white;
        color: #666666;
        height: 20px;
        width: 20px;
        border-radius: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.name:hover {
    opacity: 0.8; // 纠结了一个小时结果一行代码解决
    transition: 0.4s;
}
</style>