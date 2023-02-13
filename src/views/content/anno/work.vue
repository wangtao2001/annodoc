<script setup lang='ts'>
import AnnoCard from '@/components/anno-card.vue'
import { annoResult2Json } from '@/methods'
import { useRouter } from 'vue-router'
import { useStore } from '@/store'

const store = useStore()
const router = useRouter()

const cancel = () => {
    window.getSelection()!.empty()
    const allSpan = document.querySelectorAll('.onselect')
    for (var span of allSpan) { // 全部取消
        span.replaceWith(span.innerHTML)
    }
}

const returnList = () => {
    router.push('/anno/list')
}

const finish = () => {
    const results = annoResult2Json(document.querySelector('.anno-area') as HTMLDivElement)
    console.log(results) // 这个值需要在组件间传递，需要存到pinia中
    //其实包括anno - card中的labels也要存，这个后面在处理
    router.push('/anno/result')
}

</script>

<template>
    <div class="root">
        <!--标注区域的卡片-->
        <AnnoCard></AnnoCard>
        <t-card style="margin-top: 20px;">
            <div class="option">
                <t-button @click="returnList">返回</t-button>
                <div class="bottom">
                    <t-button @click="cancel">全部取消</t-button>
                    <t-button @click="finish">完成</t-button>
                </div>
            </div>
        </t-card>
    </div>
</template>

<style scoped lang='less'>
// 对每个页面单独设置宽高
.root {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}


.option {
    display: flex;
    width: 50vw;
    justify-content: space-between;

    .bottom button {
        margin-left: 8px;
    }

}

button {
    user-select: none; // 除了选区部分其他都不能选，可能会出现问题
}
</style>