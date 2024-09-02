<script setup lang='ts'>
import textIcon from '@/assets/1.png'
import recordIcon from '@/assets/3.png'
import qaIcon from '@/assets/4.png'
import descIcon from '@/assets/2.png'
import { useRouter } from 'vue-router'
import { AnnoType } from '@/interface'
import { MessagePlugin } from 'tdesign-vue-next'

const router = useRouter()

const annoType: Array<AnnoType> = [
    {
        id: 0,
        title: '实体标注',
        img: textIcon,
        content: '',
        link: '/anno/work',
        disabled: false,
        new: false
    }
    , {
        id: 1,
        title: '问句采纳',
        img: recordIcon,
        content: '',
        link: '/anno/corpus-v2',
        disabled: false,
        new: false
    }
    , {
        id: 2,
        title: '生成QA',
        img: qaIcon,
        content: '',
        link: '/anno/generate-qa',
        disabled: false,
        new: false
  }
  , {
      id: 3,
      title: '文件表格描述',
      img: descIcon,
      content: '',
      link: '/anno/description',
      disabled: false,
      new: false
  }
]

const annoType2: Array<AnnoType> = [
  {
    id: 0,
    title: '淋巴水肿',
    img: descIcon,
    content: '',
    disabled: true,
    new: true,
    link:"/anno/lbsz"
  }
]

const anno = (type: AnnoType)=> {
    if(type.disabled) {
        MessagePlugin.error('暂无待做任务')
    } else router.push(type.link)
}
</script>

<template>
    <div class="root">
        <div class="container">
            <div class="label">文本标注:</div>
            <div class="tasks">
              <template  v-for="t in annoType"  :key="t.id">
              <div class="card" @click="anno(t)" v-if="!t.disabled">
                    <div class="top">
                        <img :src="t.img" />
                        <div class="title">{{ t.title }}</div>
                        <t-tag v-if="t.new" theme="primary" variant="light">NEW</t-tag>
                    </div>
                    <div class="content">
                        {{ t.content }}
                    </div>
                </div>
              </template>
            </div>
          <div class="label">图像标注:</div>
          <div class="tasks">
            <template  v-for="t in annoType2"  :key="t.id">
              <div class="card" @click="anno(t)" v-if="!t.disabled">
                <div class="top">
                  <img :src="t.img" />
                  <div class="title">{{ t.title }}</div>
                  <t-tag v-if="t.new" theme="primary" variant="light">NEW</t-tag>
                </div>
                <div class="content">
                  {{ t.content }}
                </div>
              </div>
            </template>
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
        flex-direction: column;

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