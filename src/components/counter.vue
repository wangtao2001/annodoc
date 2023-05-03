<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { statusStore } from '@/store'

const status = statusStore()

const currentNum = ref(0)
const allNum = ref(0)
const toCheckNum = ref(0)
const getCurrentNums = async() => {
    const res = await axios.get(`/api/getResponses/getOneHomeworkCompleted/${status.currentNumebr}`)
    if (res.status == 200) {
        if (res.data.code == 20041) {
            currentNum.value = res.data.data.finish+1
            allNum.value = res.data.data.all
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error("网络错误")
}
const getToCheckNums = async () => {
    const res = await axios.get('/api/getResponses/getToBeDone')
    if (res.status == 200) {
        if (res.data.code == 20041) {
            toCheckNum.value = res.data.data
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error("网络错误")
}

if (status.currnetRole === 'student') getCurrentNums()
else getToCheckNums()
</script>

<template>
    <div class="num">{{status.currnetRole === 'student' ? '当前：' + currentNum + '/' + allNum : '剩余未完成：' + toCheckNum }}</div>
</template>

<style lang="less" scoped>
    .num {
        margin: 0 40px 0 0;
        color: #0052d9;
        background-color: var(--counter-bgc);;
        padding: 10px 20px;
    }
</style>