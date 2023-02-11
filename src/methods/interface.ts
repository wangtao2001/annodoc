export interface LabelInfo {
    name: string,
    keyword: string, // 这里其实应该还有一些限制，也就是只能26个字母，包括label组件的defineProps
    color: string
}