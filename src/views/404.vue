<template>
    <div class="content">
        <img src="@/assets/404.png" />
        <t-link @click="router.push('/')" theme="primary">返回首页</t-link>
    </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped lang="less">
.content {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    img {
        max-width: 60%;
        max-height: 60%;
    }
}
</style>