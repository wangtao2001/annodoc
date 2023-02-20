<script setup lang='ts'>
import { taskInfo } from '@/interface/index.js'
import { useRouter } from 'vue-router'
const router = useRouter()

// 这里应当从后端读取一个任务列表
// 打开某一个具体的标注任务，把这个id传给work.vue，它在获取那段文本
// 标记完成传输的时候也要带上id

const allTasks: Array<taskInfo> = [ // 这里的数据都是虚拟的
    {
        'id': '1000',
        'title': 'TASK1：消化性溃疡',
        'status': 0
    },
    {
        'id': '1001',
        'title': 'TASK2：冠状病毒',
        'status': 1
    },
    {
        'id': '1002',
        'title': 'TASK3：骨折',
        'status': 0
    }
]

const anno = (task: taskInfo) => {
    router.push({
        path: '/anno/work', query: { id: task.id }
    })
}
</script>

<template>
    <div class="root">
        <t-list class="list">
            <t-list-item v-for="task in allTasks" :key="task.id">
                <div>
                    {{ task.title }}
                    <t-tag v-if="task.status == 0" theme="danger" variant="light">未完成</t-tag>
                    <t-tag v-else theme="success" variant="light">已完成</t-tag>
                </div>
                <template #action>
                    <t-link @click="anno(task)" v-if="task.status == 0" theme="primary" hover="color"
                        style="margin-left: 16px"> 标记
                    </t-link>
                    <t-link v-else theme="primary" hover="color" style="margin-left: 16px"> 查看结果
                    </t-link>
                </template>
            </t-list-item>
        </t-list>
    </div>
</template>

<style scoped lang='less'>
.root {
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
}

.list {
    border: 1px solid #dddddd;
    width: 70vw;
}
</style>