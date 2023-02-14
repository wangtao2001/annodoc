// 标签信息
export interface LabelInfo {
    name: string,
    keyword: string, // 这里其实应该还有一些限制，也就是只能26个字母，包括label组件的defineProps
    color: string
}

// 标记结果
export interface Result {
    start: number,
    end: number,
    content: string,
    labelKeyword: string,
    labelName: string
}

// 标注任务的简描述信息
export interface taskInfo {
    id: string,
    title: string,
    status: number // 状态位
}