import { LabelInfo, Result } from "@/methods/interface"
import { useStore } from '@/store'

const store = useStore()

export function labelSelect(label: LabelInfo) {
    const s = window.getSelection()!
    if (s.rangeCount) {
        const rang = s.getRangeAt(0)
        if (rang.collapsed) { // 表示Range的起始位置和结束位置重合，为了避免有时会选中一个空选区
            return
        }
        const span: HTMLSpanElement = document.createElement("span")
        span.className = "onselect"
        span.style.backgroundColor = label.color // 选区的背景颜色
        span.setAttribute("labelKeyword", label.keyword)
        span.setAttribute("labelName", label.name) // 尽量在HTML层面信息传递多一点
        span.onclick = (e) => { // 删除包裹
            const currentSpan = e.target as HTMLElement
            // 对sotre也要更改
            var index = 0
            for (var result of store.results) {
                index+=1
                if (result.span == currentSpan) {
                    // 删除
                    store.results.splice(index-1, 1)
                    break
                }
            }
            currentSpan.replaceWith(currentSpan.innerText) // 用文字替换span标签
        }
        // rang.surroundContents(span) // 用一个span标签包裹取值范围
        span.appendChild(rang.extractContents())
        rang.insertNode(span)// 用这种方法  x图标就不用伪元素放上去了
        // 嵌套选择的话就把内层取消
        // 这里还有一种更简单的方式，就是禁止后面的选择，但是暂时实现不了
        const innerSpans = span.querySelectorAll('.onselect')
        for (var innerSpan of innerSpans) {
            innerSpan.replaceWith(innerSpan.innerHTML)
            // 对store也要更改
            var index = 0
            for (var result of store.results) {
                index += 1
                if (result.span == innerSpan) {
                    // 删除
                    store.results.splice(index-1, 1)
                    break
                }
            }
        }
        // 每次标记就应该把状态同步到pinia中，而不是最后统一扫描
        const div = document.querySelector('.anno-area') as HTMLDivElement
        var offset = 0
        var insert: Boolean = false // 由于没有类似py的for-else结构
        for (var ele of div.childNodes) {
            // 查找当前span在所有文字中的偏移
            if (ele == span) { // 查到了当前的偏移，就可以添加一条记录
                // 要求results能够排序，那就不能简单的push，而是插入排序
                // 还有一种方法就是push完了sort
                const currentResult: Result = {
                    start: offset,
                    end: offset + span.innerText.length,
                    content: span.innerText,
                    labelKeyword: label.keyword,
                    labelName: label.name,
                    span: span
                }
                if (store.results.length == 0) {
                    store.results.push(currentResult)
                    insert = true
                } else {
                    var index = 0
                    for (var result of store.results) { // 不再使用forEach循环
                        index += 1
                        if (result.start >= offset) {
                            store.results.splice(index-1, 0, currentResult)
                            insert = true
                            break
                        }
                    }
                }
                if (!insert) {
                    store.results.push(currentResult)
                }
                break
            } else { // 偏移向前进
                offset += ele.textContent!.length // 如果后面我们要加标签的话这里还要-1
            }
        }
        window.getSelection()!.empty()
        // 补一个补丁： 删除所有空选区
        // 当选区划过文字停在一个label一般上时，会产生一个空选区
        // 这其实是extractContents方法造成的，他在提取range中包含的内容时会把label完整的提取出来
        for (var result of store.results) {
            if (result.span.innerText.length == 0) {
                result.span.click()
            }
        }
    }
}