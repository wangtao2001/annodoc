import axios from 'axios'
import { MessagePlugin } from 'tdesign-vue-next'

interface RequestConfig {
    method: Function
    statusCode1: string, statusCode2: string
}
  
export const getConfig: RequestConfig = {
    method: axios.get,
    statusCode1: "20041", statusCode2: "20031"
}
  
export const postConfig: RequestConfig = {
    method: axios.post,
    statusCode1: "20011", statusCode2: "20021"
}

export async function request(
    config: RequestConfig, 
    url: string, 
    successOption: (data: any) => void,
    data?: object, 
    successMessage?: string, 
    errorOption?: () => void
) {
    var res
    if (config == getConfig) {
        res = await config.method(url)
    } else res = await config.method(url, data)
    if (res.status == 200) {
        if (res.data.code == config.statusCode1 || res.data.code == config.statusCode2) {
            if (successMessage !== undefined) {
                MessagePlugin.success(successMessage)
            }
            successOption(res.data.data)
        } else {
            if (errorOption !== undefined) {
                errorOption()
            }
            MessagePlugin.error(res.data.msg)
        }
    } else MessagePlugin.error('网络请求失败')
}

