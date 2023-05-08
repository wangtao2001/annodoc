import { defineStore } from 'pinia'
import { Result, RelaResult, LabelInfo, RelaInfo, User } from '@/interface'
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
    const currentUser: Ref<User> = ref({
        number: "2020192462", grade: 19, role: "admin" 
    })

    const currentTextId: Ref<string>= ref("")
    const currentText: Ref<string> = ref("")
    const currentTaskId: Ref<string> = ref("")
    const currentLabels: Ref<Array<LabelInfo>> = ref([])
    const currentRelas: Ref<Array<RelaInfo>> = ref([])

    return {
        currentTextId, currentTaskId, currentLabels, currentRelas,
        currentText, currentUser
    }
})