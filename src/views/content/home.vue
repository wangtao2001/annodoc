<template>
    <t-layout class="content">
        <t-card  title="数据概览" class="data">
        </t-card>
        <t-card  title="当前得分" class="data">
        </t-card>
    </t-layout>
</template>

<style lang="less" scoped>

.content {
    padding: 0 20px;
}
.data {
    margin-top: 20px;
    user-select: none;
    width: 400px;

    @media screen and (max-width: 900px) {
        width: 100%;
    }
}
</style>