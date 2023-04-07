import { LabelInfo, RelaInfo } from '@/interface'

// 这里面的东西应该都是从后端读取的

// 实体类别，keyword就是他们的唯一标识（标签信息）
export const labels: Array<LabelInfo> = [{
    type: "疾病", shortcut: "A", color: "#009ce0", id: "0"
}, {
    type: "症状", shortcut: "P", color: "#f9756d", id: "1"
}, {
    type: "部位", shortcut: "G", color: "#28a745", id: "2"
}]

// 关系类别
export const relas: Array<RelaInfo> = [{
    type: "并发症", id: "0", entity1: "1", entity2: "1", bothway: false // 疾病与疾病之间
}, {
    type: "发病部位", id: "1", entity1: "0", entity2: "2", bothway: false // 部位与疾病之间
}, {
    type: "别名", id: "2", entity1: "0", entity2: "0", bothway: false // 疾病与疾病之间
}]