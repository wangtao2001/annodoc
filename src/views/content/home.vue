<template>
    <t-layout class="content">
        <div class="card">
            <div class="title">姓名：{{ currentStudent.name }}</div>
            <div class="title">学号：{{ status.currentUser.number }}</div>  
        </div>
        <div class="card">
            <div class="title">完成情况：{{ currentStudent.finish }} / {{ all }}</div>
        </div>
        <div class="card">
            <div class="title">当前得分：{{ currentStudent.score }} / 100</div>
        </div>
    </t-layout>
</template>

<script lang="ts" setup>
import { ref, Ref } from 'vue'
import { statusStore } from '@/store'
import axios from 'axios'
import { StudentInfo } from '@/interface'
import { MessagePlugin } from 'tdesign-vue-next'

const status = statusStore()

const all = ref(0)

const currentStudent: Ref<StudentInfo> = ref({
    number: status.currentUser.number,
    name: '',
    grade: status.currentUser.grade,
    score: 0,
    finish: 0
})

const loadInfo = async ()=> {
    const res = await axios.get(`/api/getResponses/getByStudentNumber/${status.currentUser.number}`)
    if (res.status == 200) {
        if (res.data.code == 20041) {
            const data = res.data.data
            currentStudent.value.score = data.score
            currentStudent.value.name = data.name
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('获取数据失败')
}

const loadFinsh = async()=> {
    const res = await axios.get(`/api/getResponses/getOneHomeworkCompleted/${status.currentUser.number}`)
    if (res.status == 200) {
        if (res.data.code == 20041) {
            const data = res.data.data
            all.value = data.all
            currentStudent.value.finish = data.finish
        } else MessagePlugin.error(res.data.msg)
    } else MessagePlugin.error('获取数据失败')
}

loadInfo()
loadFinsh()
</script>

<style lang="less" scoped>
.content {
    padding: 20px 20px 0 20px;
}
.card {
    user-select: none;
    width: 400px;
    height: 70px;
    margin-bottom: 20px;
    border: 1px solid var(--common-border);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    user-select: none;

    .title {
        margin: 5px 20px;
    }
}

@media screen and (max-width: 900px) {
    .card {
        width: 100%;
    }
}
</style>