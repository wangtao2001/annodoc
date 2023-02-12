<script setup lang='ts'>
import AnnoCard from '@/components/anno-card.vue'

const cancel = () => {
    window.getSelection()!.empty()
    const allSpan = document.querySelectorAll('.onselect')
    for (var span of allSpan) { // 全部取消
        span.replaceWith(span.innerHTML)
    }
}

</script>

<template>
    <t-layout class="root">
        <!--标注区域的卡片-->
        <AnnoCard></AnnoCard>
        <t-card style="margin-top: 20px;">
            <div class="bottom">
                <t-button @click="cancel">全部取消</t-button>
                <t-button @click="">完成</t-button>
            </div>
        </t-card>
    </t-layout>
</template>

<style scoped lang='less'>
// 对每个页面单独设置宽高
.root {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.bottom {
    width: 50vw;
    display: flex;
    justify-content: flex-end;

    .t-button {
        margin: 0 8px;
    }
}
</style>