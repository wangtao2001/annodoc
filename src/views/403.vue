<template>
    <div class="content">
        <img src="@/assets/403.png" />
        <div>您可能没有访问此平台的权限，申请权限可以联系 <a href="mailto:3323051562@stu.cpu.edu.com">这里</a></div>
        <t-link @click="logout" theme="warning">退出登录</t-link>
    </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next'
const logout = () => {
    window.location.href = 'http://id.cpu.edu.cn/sso/logout?service=https://anno.cpu.edu.cn'
    MessagePlugin.warning("正在退出, 即将返回登录页")
}
</script>

<style scoped lang="less">
.content {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    user-select: none;

    img {
        max-width: 60%;
        max-height: 60%;
    }
}

a {
    color: black;
}
</style>