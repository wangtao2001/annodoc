import { defineStore } from 'pinia'
import { Result } from '@/methods/interface'
import {reactive} from 'vue'

export const useStore = defineStore('main', () => {
    const results: Array<Result> = reactive([])
    return {
        results
    }
})

