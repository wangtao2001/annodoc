<script setup lang="ts">
import { request, getConfig } from '@/methods/request'
import { ref } from 'vue'
import { UserRole } from '@/interface'
import { statusStore } from '@/store'

const current = statusStore()

const currentNum = ref(0)
const allNum = ref(0)
const toCheckNum = ref(0)
const getCurrentNums = async() => {
    request(
        getConfig,
        `/api/getResponses/getOneHomeworkCompleted/${current.user.number}`,
        (data) => {
            currentNum.value = data.finish+1
            allNum.value = data.all
        }
    )
}
const getToCheckNums = async () => {
    request(
        getConfig,
        `/api/getResponses/getToBeDone/${current.user.number}`,
        (data)=> toCheckNum.value = data
    )
}

if (current.user.role == UserRole.student) getCurrentNums()
else getToCheckNums()
</script>

<template>
    <div class="num">{{current.user.role == UserRole.student ? '当前：' + currentNum + '/' + allNum : '已完成：' + toCheckNum }}</div>
</template>

<style lang="less" scoped>
    .num {
        color: #0052d9;
        background-color: var(--counter-bgc);;
        padding: 10px 20px;
    }
</style>