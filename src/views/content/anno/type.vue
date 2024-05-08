<script setup lang='ts'>
import textIcon from '@/assets/1.png'
import recordIcon from '@/assets/3.png'
import qaIcon from '@/assets/4.png'
import { useRouter } from 'vue-router'
import { AnnoType } from '@/interface'
import { MessagePlugin } from 'tdesign-vue-next'

const router = useRouter()

const annoType: Array<AnnoType> = [
    {
        id: 0,
        title: '医学文本',
        img: textIcon,
        content: '',
        link: '/anno/work',
        disabled: true,
        new: false
    }
    , {
        id: 1,
        title: '问句采纳',
        img: recordIcon,
        content: '',
        link: '/anno/corpus-v2',
        disabled: false,
        new: true
    }
]

const anno = (type: AnnoType)=> {
    if(type.disabled) {
        MessagePlugin.error('暂无任务')
    } else router.push(type.link)
}
</script>

<template>
    <div class="root">
        <div class="container">
            <div class="label">文本标注:</div>
            <div class="tasks">
                <div class="card" @click="anno(type)" bordered v-for="type in annoType" :key="type.id">
                    <div class="top">
                        <img :src="type.img" />
                        <div class="title">{{ type.title }}</div>
                        <t-tag v-if="type.new" theme="primary" variant="light">NEW</t-tag>
                    </div>
                    <div class="content">
                        {{ type.content }}
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
            margin-bottom: 10px;
        }

        .tasks {
            display: flex;
            flex-direction: row;

            .card {
                padding: 15px;
                border: 1px solid var(--common-border);
                margin: 5px 5px 5px 0;

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
                        margin-right: 5px;
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

@media screen and (max-width: 900px) {
    .container, .tasks {
        flex-direction: column !important;
    }
}
</style>