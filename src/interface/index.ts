// 实体标签信息
export interface EntityLabelInfo {
    type: string, // 名称
    shortcut: string,
    color: string,
    id: string
}

// 关系标签信息
export interface RelaLabelInfo {
    type: string, // 名称
    id: string,
    entity1: EntityLabelInfo["id"],
    entity2: EntityLabelInfo["id"], // 实体标签的id
    // 关系可以是单向的也可以是双向的，这里给一个标识符
    // 如果是双向关系，无论是选择的是A->B还是B->A后端都要判对
    // 如果是单向关系，前端用户无论怎么选择都可以，在提交后端时自动调整，以期标注减少难度
    bothway: boolean
}

// 实体标记结果
export interface EntityResult {
    id: string, // 唯一标识
    number: number, // 序号，这二者都是唯一的
    start: number,
    end: number,
    content: string,
    labelId: EntityLabelInfo["id"],
    labelName: EntityLabelInfo["type"],
    // 为了删除and重构标签的时候快速定位
    span?: HTMLSpanElement
}

// 关系标记结果
export interface RelaResult {
    id: string
    startContent: EntityResult["content"],
    startNumber: EntityResult["number"],
    endNumber: EntityResult["number"],
    endContent: EntityResult["content"],
    relaId: RelaLabelInfo["id"],
    relaName: RelaLabelInfo["type"],
}

// 下拉选择关系的配置项
export interface RelaOption {
    content: string,
    id: string | number // 对关系来说就是string(关系的id)对实体来说就是numebr(关系的number) 
}

// 等待上传的文件信息
interface UploadInfo {
    index: number
    name: string,
    size: string,
    status: number // 2未上传 0已上传 1上传失败 3正在上传
    uploaded: number // 已经上传的数量
}

// 上传的文件组
export interface UplodaFiles {
    info: UploadInfo,
    files: Array<File>
}

// 任务的信息
export interface TaskInfo {
    id: string,
    type: string,
    taskName: string,
    description: string,
    createTime: string,
    modifyTime: string,
    entitys: Array<EntityLabelInfo>,
    relations: Array<RelaLabelInfo>,
    grade: number, // 表示哪一级学生
    priority: number
}

//学生信息
export interface StudentInfo {
    number: string,
    name: string,
    grade: string,
    score: number,
    finish: number,
    language: string
}

// 系统支持的标注类型
export interface AnnoType {
    id: number,
    title: string,
    img: string,
    content: string,
    link: string,
    disabled: boolean,
    new: boolean
}

//每个任务的标注进度（对应的文本状态）
export interface TextSatatus {
    all: number,
    finalized: number,
    marked: number,
    unmarked: number,
    marking: number
}

export interface User {
    number: string,
    grade: string,
    role: UserRole,
    login: boolean
}

export enum UserRole {
    student, teacher, checker
}