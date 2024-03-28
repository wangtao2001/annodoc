<template>
    <t-layout class="content">
        <div class="card">
            <div class="title">姓名：{{ currentStudent.name }}</div>
            <div class="title">学号：{{ current.user.number }}</div>
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
import { request, getConfig } from '@/methods/request'
import { StudentInfo } from '@/interface'

const current = statusStore()

const all = ref(0)

const currentStudent: Ref<StudentInfo> = ref({
    number: current.user.number,
    name: '',
    grade: current.user.grade,
    score: 0,
    finish: 0,
    language: ''
})

const loadInfo = async () => {
    request(
        getConfig,
        `/api/getResponses/getByStudentNumber/${current.user.number}`,
        (data) => {
            currentStudent.value.score = data.score
            currentStudent.value.name = data.name
        }
    )
}

const loadFinsh = async () => {
    request(
        getConfig,
        `/api/getResponses/getOneHomeworkCompleted/${current.user.number}`,
        (data) => {
            all.value = data.all
            currentStudent.value.finish = data.finish
        }
    )
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