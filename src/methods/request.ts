import axios from 'axios'
import { MessagePlugin } from 'tdesign-vue-next'

interface RequestConfig {
    method: Function
    statusCode: string
}
  
export const getConfig: RequestConfig = {
    method: axios.get,
    statusCode: "20041",
}
  
export const postConfig: RequestConfig = {
    method: axios.post,
    statusCode: "20011",
}
  
export const deleteConfig: RequestConfig = {
    method: axios.delete,
    statusCode: "20031",
}

export const putConfig: RequestConfig = {
    method: axios.put,
    statusCode: "20021",
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
    if (config == getConfig || config == deleteConfig) {
        res = await config.method(url)
    } else res = await config.method(url, data)

    if (res.status == 200) {
        console.log(res.data)
        if (res.data.code == config.statusCode) {
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

