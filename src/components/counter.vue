<script setup lang="ts">
import { request, getConfig } from '@/methods/request'
import { ref } from 'vue'
import { UserRole } from '@/interface'
import { statusStore } from '@/store'

const current = statusStore()

const currentNum = ref(0)
const allNum = ref(0)
const toCheckNum = ref(0)
const getCurrentNums = async () => {
    request(
        getConfig,
        `/api/getResponses/getOneHomeworkCompleted/${current.user.number}`,
        (data) => {
            currentNum.value = data.finish + 1
            allNum.value = data.all
        }
    )
}
const getToCheckNums = async () => {
    request(
        getConfig,
        `/api/getResponses/getToBeDone/${current.user.number}`,
        (data) => toCheckNum.value = data
    )
}

getToCheckNums()
</script>

<template>
    <div class="num" v-if="current.user.role == UserRole.checker || current.user.role == UserRole.teacher">{{ '已完成：' +
        toCheckNum }}</div>
</template>

<style lang="less" scoped>
.num {
    color: #0052d9;
    background-color: var(--counter-bgc);
    ;
    padding: 10px 20px;
}
</style>