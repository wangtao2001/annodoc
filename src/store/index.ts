import { defineStore } from 'pinia'
import { Result, RelaResult } from '@/interface'
import {reactive, Ref ,ref} from 'vue'

export const useStore = defineStore('main', () => {
    const results: Array<Result> = reactive([])
    const relaResults: Array<RelaResult> = reactive([])
    const text: Ref<string> = ref("") // 待标注的文本
    return {
        results, relaResults, text
    }
})

