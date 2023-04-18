// 标签信息
export interface LabelInfo {
    type: string, // 名称
    shortcut: string, // 这里其实应该还有一些限制，也就是只能26个字母，包括label组件的defineProps
    color: string,
    id: string
}

// 关系信息
export interface RelaInfo {
    type: string, // 名称
    id: string,
    entity1: string,
    entity2: string, // 实体标签的id
    // 关系可以是单向的也可以是双向的，这里给一个标识符
    // 如果是双向关系，无论是选择的是A->B还是B->A后端都要判对
    // 如果是单向关系，前端用户无论怎么选择都可以，在提交后端时自动调整，以期标注减少难度
    bothway: boolean
}

// 标记结果
export interface Result {
    id: string, // 唯一标识
    number: number, // 序号，这二者都是唯一的
    start: number,
    end: number,
    content: string,
    labelId: string,
    labelName: string,
    // 为了删除标签的时候快速定位，决定把span自己存进去
    span: HTMLSpanElement // 便于下载到本地时删除
}

// 关系标记结果
export interface RelaResult {
    id: string
    startContent: string,
    startNumber: number,
    endNumber: number,
    endContent: string,
    relaId: string,
    relaName: string,
}

// 下拉选择关系的配置项
export interface relaOption {
    content: string,
    id: string | number // 对关系来说就是string(关系的id)对标签来说就是numebr(关系的number) 
}

// 等待上传的信息
interface uploadInfo {
    index: number
    name: string,
    size: string,
    status: number // 2未上传 0已上传 1上传失败 3正在上传
    uploaded: number // 已经上传的数量
}

// 上传的文件组
export interface uplodaFiles {
    info: uploadInfo,
    files: Array<File>
}

// 任务的信息
// 文件的信息我这里不写
// 流程是，一旦创建了任务名称，就给他一个uuid，上传文件的时候带上这个uuid就行
export interface taskInfo {
    id: string,
    type: string,
    taskName: string,
    description: string,
    createTime: string,
    modifyTime: string,
    entitys: Array<LabelInfo>,
    relations: Array<RelaInfo>,
    grade: number, // 表示哪一级学生
}

// 标注的类型：医学文本、电子病历、医学图像...
export interface annoType {
    id: number,
    title: string,
    img: string,
    content: string,
    link: string,
    disabled: boolean
}

//每个任务的标注进度（对应的文本状态）
export interface textSatatus {
    all: number,
    finalized: number,
    marked: number,
    unmarked: number,
    marking: number
}