<script setup lang='ts'>
import AnnoCard from '@/components/anno-card.vue'

</script>

<template>
    <t-layout class="root">
        <!--标注区域的卡片-->
        <AnnoCard></AnnoCard>
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
</style>