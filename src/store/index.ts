import { defineStore } from 'pinia'
import { Result } from '@/methods/interface'
import {reactive, ref} from 'vue'

export const useStore = defineStore('main', () => {
    const results: Array<Result> = reactive([])
    const resultsContainer = ref() // 灵光一现的点子
    return {
        results, resultsContainer
    }
})

