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
    },
    disabled: {
        type: Boolean, // 做展示用
        required: true
    },
    id: {
        type: String,
        required: true
    }
})

const click = () => {
    if (!props.disabled) {
        labelSelect({
            type: props.name,
            shortcut: props.keyword,
            color: props.color,
            id: props.id
        })
    }
}
</script>

<template>
    <div class="name" :style="{ 'background-color': color }" @click="click">
        {{ name }}
        <div class="key" :style="{ 'color': color }">{{ keyword }}</div>
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
    padding: 3px 10px;
    border-radius: 20px;
    margin: 0 8px;
    transition: 0.4s;

    @media screen and (max-width: 900px) {
        margin: 2px 2px;
    }

    .key {
        margin-left: 6px;
        background-color: white;
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