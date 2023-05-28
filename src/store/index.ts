import { defineStore } from 'pinia'
import { EntityResult, RelaResult, EntityLabelInfo, RelaLabelInfo, User, UserRole } from '@/interface'
import {reactive, Ref ,ref} from 'vue'

export const mainStore = defineStore('main', () => {
    const entityResults: Array<EntityResult> = reactive([])
    const relaResults: Array<RelaResult> = reactive([])
    const createTaskId: Ref<string> = ref("")

    return {
        entityResults, relaResults, createTaskId
    }
})


export const statusStore = defineStore('current', () => {
    const user: Ref<User> = ref({
        number: "", grade: "", role: UserRole.student, login: false
    })
    const userRoles: Ref<Array<UserRole>> = ref([])

    
    const textId: Ref<string>= ref("")
    const text: Ref<string> = ref("")
    const taskId: Ref<string> = ref("")
    const entityLabels: Ref<Array<EntityLabelInfo>> = ref([])
    const relaLabels: Ref<Array<RelaLabelInfo>> = ref([])

    return {
        textId, taskId, entityLabels, relaLabels,
        text, user, userRoles
    }
})