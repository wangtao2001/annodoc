import { LabelInfo } from "@/methods/interface";

export function labelSelect(label: LabelInfo) {
    var rang = window.getSelection()!.getRangeAt(0);
    var span: HTMLSpanElement = document.createElement("span")
    span.className = "onselect"
    span.style.backgroundColor = label.color // 选区的背景颜色
    rang.surroundContents(span)
    window.getSelection()!.empty()
    return
}