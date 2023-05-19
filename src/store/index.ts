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
    // 对user的初始化在这里
    // token使用localStoge存在浏览器中 let token = localStorage.getItem('Authorization')
    const user: Ref<User> = ref({
        number: "", grade: 0, role: UserRole.student, login: false
    })
    // 通过taoken向后端请求当前登录信息并在这里重写
    user.value.number = "2020192462"
    user.value.grade = 19
    user.value.role = UserRole.teacher
    user.value.login = true
    
    const textId: Ref<string>= ref("")
    const text: Ref<string> = ref("")
    const taskId: Ref<string> = ref("")
    const entityLabels: Ref<Array<EntityLabelInfo>> = ref([])
    const relaLabels: Ref<Array<RelaLabelInfo>> = ref([])

    return {
        textId, taskId, entityLabels, relaLabels,
        text, user
    }
})