import { LabelInfo, Result } from "@/methods/interface";

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
        span.setAttribute("labelKeyword", label.keyword)
        span.setAttribute("labelName", label.name) // 尽量在HTML层面信息传递多一点
        span.onclick = (e) => { // 删除包裹
            const currentSpan = e.target as HTMLElement
            currentSpan.replaceWith(currentSpan.innerText) // 用文字替换span标签
        }
        rang.surroundContents(span) // 用一个span标签包裹取值范围
        window.getSelection()!.empty()
    }
}

export function annoResult2Json(div: HTMLDivElement) {
    const results: Array<Result> = []
    var offset: number = 0
    div.childNodes.forEach((ele: Node) => {
        if (ele.nodeType == Node.TEXT_NODE) { // node是text类型
            offset += ele.textContent!.length // chatgpt比google管用
        } else if (ele.nodeType == Node.ELEMENT_NODE) {
            const span = ele as HTMLSpanElement // 强制类型转换
            results.push({
                start: offset,
                end: offset + span.innerText.length,
                content: span.innerText,
                labelKeyword: span.getAttribute('labelKeyword')!,
                labelName: span.getAttribute('labelName')!
            })
            offset += span.innerText.length
        }
    })
    return results
}