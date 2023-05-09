<script setup lang="ts">
import { request, getConfig } from '@/methods/request'
import { ref } from 'vue'
import { statusStore } from '@/store'

const status = statusStore()

const currentNum = ref(0)
const allNum = ref(0)
const toCheckNum = ref(0)
const getCurrentNums = async() => {
    request(
        getConfig,
        `/api/getResponses/getOneHomeworkCompleted/${status.currentUser.number}`,
        (data) => {
            currentNum.value = data.finish+1
            allNum.value = data.all
        }
    )
}
const getToCheckNums = async () => {
    request(
        getConfig,
        '/api/getResponses/getToBeDone',
        (data)=> toCheckNum.value = data
    )
}

if (status.currentUser.role === 'student') getCurrentNums()
else getToCheckNums()
</script>

<template>
    <div class="num">{{status.currentUser.role === 'student' ? '当前：' + currentNum + '/' + allNum : '剩余未完成：' + toCheckNum }}</div>
</template>

<style lang="less" scoped>
    .num {
        color: #0052d9;
        background-color: var(--counter-bgc);;
        padding: 10px 20px;
    }
</style>