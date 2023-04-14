<script lang="tsx" setup>

const columns = [
    { colKey: 'number', title: '学号/工号'},
    { colKey: 'name', title: '姓名'},
    {title: '操作', cell: (h: any, { row }: { row: any }) => {
        return (
            <t-link theme="danger" > 删除 </t-link>
        )
    }}
]

const data: Array<any> = [{
    number: 2020192462,
    name: "aaa"
}]
</script>

<template>
    <t-layout>
        <t-base-table
        class="table"
        bordered
        :data="data"
        :columns="columns"
        table-layout="auto"
        ></t-base-table>
    </t-layout>
</template>

<style lang="less" scoped>
    .table {
        margin-left: 40px;
        margin-top: 50px;
        width: 30%;
        user-select: none;
    }
</style>