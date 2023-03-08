<script setup lang='ts'>
import textIcon from '@/assets/1.png'
import recordIcon from '@/assets/2.png'
import { useRouter } from 'vue-router'

const router = useRouter()

const tasks = [
    {
        id: 0,
        title: '医学文本',
        img: textIcon,
        content: '',
        link: '/anno/work?type=text'
    }, {
        id: 1,
        title: '电子病历',
        img: recordIcon, // require是webpack的做法
        content: '',
        link: '/anno/work?type=record'
    }
]
</script>

<template>
    <div class="root">
        <div class="container">
            <div class="label">文本标注:</div>
            <div class="tasks">
                <div class="card" @click="router.push(task.link)" bordered v-for="task in tasks" :key="task.id">
                    <div class="top">
                        <img :src="task.img" />
                        <div class="title">{{ task.title }}</div>
                        <t-tag theme="primary" variant="light">NEW</t-tag>
                    </div>
                    <div class="content">
                        {{ task.content }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang='less'>
.root {
    user-select: none;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-left: 20px;

    .container {
        display: flex;
        flex-direction: row;

        .label {
            margin-right: 40px;
        }

        .tasks {
            display: flex;
            flex-direction: row;

            .card {
                padding: 15px;
                border: 1px solid #ddd;
                margin: 0 5px;

                .top {
                    display: flex;
                    flex-direction: row;

                    img {
                        height: 22px;
                        width: 22px;
                        margin-right: 7px;
                    }

                    .title {
                        font-size: 16px;
                        font-weight: 700;
                    }
                }

                .content {
                    color: #999;
                    font-size: 8px;
                    margin-left: 29px;
                }
            }
        }
    }
}
</style>