import { defineStore } from 'pinia'
import { Result, RelaResult } from '@/interface'
import {reactive, ref} from 'vue'

export const useStore = defineStore('main', () => {
    const results: Array<Result> = reactive([])
    const resultsContainer = ref() // 灵光一现的点子
    const relaResults: Array<RelaResult> = reactive([])
    return {
        results, resultsContainer, relaResults
    }
})

