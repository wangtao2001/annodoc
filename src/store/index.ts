import { defineStore } from 'pinia'
import { Result, RelaResult, LabelInfo, RelaInfo } from '@/interface'
import {reactive, Ref ,ref} from 'vue'

export const useStore = defineStore('main', () => {
    const results: Array<Result> = reactive([])
    const relaResults: Array<RelaResult> = reactive([])
    const createTaskId: Ref<string> = ref("")

    const currentNumebr: Ref<string> = ref("2020192462") // 模拟登录的学号
    const currentGrade: Ref<number> = ref(19)   // 模拟登录的年级

    const currentTextId: Ref<string>= ref("")
    const currentText: Ref<string> = ref("")
    const currentTaskId: Ref<string> = ref("")
    const currentLabels: Ref<Array<LabelInfo>> = ref([])
    const currentRelas: Ref<Array<RelaInfo>> = ref([])
    return {
        results, relaResults, createTaskId, currentNumebr, currentTextId, currentTaskId, currentGrade, currentLabels, currentRelas,
        currentText
    }
})

