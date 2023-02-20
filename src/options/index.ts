import { LabelInfo, RelaInfo } from '@/interface'

// 这里面的东西应该都是从后端读取的

// 实体类别，keyword就是他们的唯一标识（标签信息）
export const labels: Array<LabelInfo> = [{
    name: "疾病", keyword: "A", color: "#009ce0"
}, {
    name: "症状", keyword: "P", color: "#f9756d"
}, {
    name: "部位", keyword: "G", color: "#28a745"
}]

// 关系类别
export const relas: Array<RelaInfo> = [{
    name: "并发症", id: 0, start: "A", end: "A", bothway: false // 疾病与疾病之间
}, {
    name: "发病部位", id: 1, start: "G", end: "A", bothway: false // 部位与疾病之间
}]