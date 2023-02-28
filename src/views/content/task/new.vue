<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { ref, Ref } from 'vue'
import upload from '@/components/upload.vue'
const router = useRouter()

const cancel = () => {
    router.push('/task/list')
}

const pre = () => {
    step.value -= 1 // 这里可能要用到keepalive
}

const next = () => {
    const max = 1
    if (step.value < max) {
        step.value += 1
    }
}

const step: Ref<number> = ref(0)
</script>

<template>
    <div class="root">
        <div class="container">
            <t-form v-if="step == 0" label-align="left">
                <t-form-item label="项目类型" name="type">
                    <t-select>
                        <t-option key="text" label="医学文本" value="text" />
                        <t-option key="record" label="电子病历" value="record" />
                    </t-select>
                </t-form-item>
                <t-form-item label="项目名称" name="name">
                    <t-input />
                </t-form-item>
                <t-form-item label="项目描述" name="desc">
                    <t-textarea placeholder="简单描述项目，长度限制为100" :maxcharacter="100" :autosize="{ minRows: 5, maxRows: 10 }"
                        clearable />
                </t-form-item>
            </t-form>
            <t-form v-if="step == 1" label-align="left">
                <!--先把样式写出来，文件控制以后再说-->
                <t-form-item label="上传数据文件" name="type">
                    <div class="file">
                        <!--这个上传功能自己写-->
                        <upload :multiple="true" />
                        <p style="color: #999;">
                            支持多选，扩展名 .txt .doc .docx<br />
                            单个文件大小不超过20M，仅支持UTF-8编码方式
                        </p>
                    </div>
                </t-form-item>
            </t-form>
            <div class="op">
                <t-button @click="next">下一步</t-button>
                <t-button @click="pre" v-if="step > 0" theme="default" variant="outline">上一步</t-button>
                <t-button @click="cancel" theme="default" variant="outline">取消</t-button>
            </div>
        </div>
    </div>
</template>

<style scoped lang='less'>
.container {
    margin-left: 40px;
    width: 35vw;
    user-select: none;

    .file {
        display: flex;
        flex-direction: column;

        p {
            margin-top: 10px;
        }
    }

    .op {
        margin-top: 20px;
        display: flex;

        button {
            margin-right: 10px;
        }
    }
}
</style>