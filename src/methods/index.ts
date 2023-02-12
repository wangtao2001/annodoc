import { LabelInfo } from "@/methods/interface";

export function labelSelect(label: LabelInfo) {
    const s = window.getSelection()!
    if (s.rangeCount) {
        const rang = s.getRangeAt(0)
        if (rang.collapsed) { // 不太熟悉Range对象，这一行是为了避免有时会选中一个空选区
            return
        }
        const span: HTMLSpanElement = document.createElement("span")
        span.className = "onselect"
        span.style.backgroundColor = label.color // 选区的背景颜色
        span.onclick = (e) => { // 删除包裹
            const currentSpan = e.target as HTMLElement
            currentSpan.replaceWith(currentSpan.innerText) // 用文字替换span标签
        }
        rang.surroundContents(span) // 用一个span标签包裹取值范围
        window.getSelection()!.empty()
    }
}