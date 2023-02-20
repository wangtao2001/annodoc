// 标签信息
export interface LabelInfo {
    name: string,
    keyword: string, // 这里其实应该还有一些限制，也就是只能26个字母，包括label组件的defineProps,keyword就是唯一标识
    color: string
}

// 关系信息
export interface RelaInfo {
    name: string,
    id: number,
    start: string,
    end: string,
    // 关系可以是单向的也可以是双向的，这里给一个标识符
    // 如果是双向关系，无论是选择的是A->B还是B->A后端都要判对
    // 如果是单向关系，前端用户无论怎么选择都可以，在提交后端时自动调整，以期标注减少难度
    bothway: boolean
}

// 标记结果
export interface Result {
    number: number, // 序号
    start: number,
    end: number,
    content: string,
    labelKeyword: string,
    labelName: string,
    // 为了删除标签的时候快速定位，决定把span自己存进去
    span?: HTMLSpanElement // 便于下载到本地时删除
}

// 关系标记结果
export interface RelaResult {
    startContent: string,
    startNumber: number,
    endNumber: number,
    endContent: string,
    relaId: number,
    relaContent: string,
    id: string // 这个不需要排序，为了避免新增删除时候number的难以操作，我就用uuid
}

// 标注任务的简描述信息
export interface taskInfo {
    id: string,
    title: string,
    status: number // 状态位
}

// 下拉选择关系的配置项
export interface relaOption {
    content: string,
    id: number
}