import { defineStore } from 'pinia'
import { Result, RelaResult, LabelInfo, RelaInfo } from '@/interface'
import {reactive, Ref ,ref} from 'vue'

export const mainStore = defineStore('main', () => {
    const results: Array<Result> = reactive([])
    const relaResults: Array<RelaResult> = reactive([])
    const createTaskId: Ref<string> = ref("")

    return {
        results, relaResults, createTaskId
    }
})

export const statusStore = defineStore('current', () => {
    const currentNumebr: Ref<string> = ref("2020192462") // 模拟登录的学号
    const currentGrade: Ref<number> = ref(19)   // 模拟登录的年级 
    const currnetRole: Ref<string> = ref("student") // 用以做权限控制 student  | admin | checker

    const currentTextId: Ref<string>= ref("")
    const currentText: Ref<string> = ref("")
    const currentTaskId: Ref<string> = ref("")
    const currentLabels: Ref<Array<LabelInfo>> = ref([])
    const currentRelas: Ref<Array<RelaInfo>> = ref([])

    return {
        currentNumebr, currentTextId, currentTaskId, currentGrade, currentLabels, currentRelas,
        currentText, currnetRole
    }
})

export const infoStore = defineStore('info', () => {
    const mobileDevice: boolean = window.innerWidth <= 500

    return {
        mobileDevice
    }
})

