<template>
    <t-layout>
        <div class="container">
            请勿轻易修改
            <t-form class="form" :label-align="labelAalign" v-for="option in allOptions" :key="option.id">
                <t-form-item :label="optionsNameDict.get(option.optionName)">
                    <t-input class="input" v-model="option.optionValue" :disabled="disModify" />
                </t-form-item>
            </t-form>
            <t-button theme="default" variant="outline" @click="disModify = true" v-if="!disModify">取消</t-button>
            <t-button  @click="modify">{{disModify ? '修改' : '保存'}}</t-button>
        </div>
    </t-layout>
</template>

<script setup lang="ts">
import {getConfig, postConfig, request} from '@/methods/request'
import {ref, Ref} from 'vue'

const optionsNameDict = new Map<string, string>()
optionsNameDict.set("textNums", "每位学生待做数量")

const disModify = ref(true)

const modify = () => {
    if (disModify.value) {
        disModify.value = false
    } else {
        request(
            postConfig,
            "/api/resultAccepts/updateOption",
            () => {
                getAllOptions(),
                disModify.value = true
            },
            allOptions.value,
            "修改成功"
        )
    }
}

const allOptions: Ref<Array<{id: number, optionName: string, optionValue: string}>> = ref([])

const getAllOptions = async () => {
    request(
        getConfig,
        "/api/getResponses/getAllOptions",
        (data) => {
            allOptions.value = data
        }
    )
}

getAllOptions()


const labelAalign = window.innerWidth <= 900 ? 'top': 'left'
</script>

<style scoped lang="less">
.container {
    padding: 40px;
    width: 35vw;
    user-select: none;
    .form {
        margin-bottom: 10px;
    }
    
    .input {
        margin-left: 30px;
    }

    button {
        margin-right: 10px;
    }
}

@media screen and (max-width: 900px) {
    .container {
        padding: 10px 20px;
        width: 100%;

        .input {
            margin: 0;
        }
    }
}
</style>