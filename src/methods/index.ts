import { LabelInfo, Result } from "@/interface"
import { useStore } from '@/store'
import { MessagePlugin } from 'tdesign-vue-next'
import pubsub from 'pubsub-js'
import { v4 as uuidv4 } from 'uuid'

const store = useStore()

// 总方法
export function labelSelect(label: LabelInfo) {
    const s = window.getSelection()!
    if (s.rangeCount) {
        const rang = s.getRangeAt(0)
        if (rang.collapsed) { // 表示Range的起始位置和结束位置重合，为了避免有时会选中一个空选区
            return
        }
        const span = createSpanAndInsert(rang, label)
        console.log(span)
        // 嵌套选择的话就把内层取消
        // 这里还有一种更简单的方式，就是禁止后面的选择，但是暂时实现不了
        const innerSpans = span.querySelectorAll('.onselect')
        for (var innerSpan of innerSpans) {
            // 以下和删除单个标签一样的
            deleteALabel(innerSpan)
        }
        // 每次标记就应该把状态同步到pinia中，而不是最后统一扫描
        const div = document.querySelector('.anno-area') as HTMLDivElement
        var offset = 0
        var insert: boolean = false // 由于没有类似py的for-else结构
        for (var ele of div.childNodes) {
            // 查找当前span在所有文字中的偏移
            if (ele == span) {
                // 查到了当前的偏移，就可以1添加一条记录，并且2给标签插入一个序号
                // 这个序号必需要等到找到在pinia中的位置后才可以
                // 要求results能够排序，那就不能简单的push，而是插入排序
                // 还有一种方法就是push完了sort
                const currentResult: Result = { // 待插入的信息
                    id: uuidv4(),
                    number: 0,
                    start: offset,
                    end: offset + span.innerText.length,
                    content: span.innerText,
                    labelId: label.id,
                    labelName: label.type,
                    span: span
                }
                // 1.1首端插入
                if (store.results.length == 0) {
                    currentResult.number = 0 // 第一个
                    store.results.push(currentResult)
                    insert = true
                } else { // 1.2中间插入
                    var index = 0
                    for (var result of store.results) { // 不再使用forEach循环
                        index += 1
                        if (result.start >= offset) {
                            currentResult.number = index - 1
                            // 中间插入的话就把它后面的序号全都+1
                            for (var r of store.results) {
                                if (r.number >= currentResult.number) {
                                    r.number += 1 // (1)改动pinia中的
                                    piniaSyncLabelNumber(r) // (2)改动标签上的
                                }
                            }
                            // (3)改动关系pinia中的
                            for (var re of store.relaResults) {
                                if (re.startNumber >= currentResult.number) {
                                    re.startNumber += 1
                                }
                                if (re.endNumber >= currentResult.number) {
                                    re.endNumber +=1
                                }
                            }
                            // (4)改动展示的关系数据
                            pubsub.publish("piniaToRelaView")
                            store.results.splice(index-1, 0, currentResult)
                            insert = true
                            break
                        }
                    }
                }
                // 1.3尾端插入
                if (!insert) {
                    console.log("hhhhh")
                    currentResult.number = store.results.length
                    store.results.push(currentResult)
                }

                // 给每个标签前加一个序号!!!!
                const i = document.createElement('i')
                i.innerText = currentResult.number.toString()
                span.insertBefore(i, span.firstChild)
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
            if (result.span!.innerText.length == 0) {
                result.span!.click()
                break
            }
        }
    }
}

// 核心方法：创造一个span标签包裹标注的内容
function createSpanAndInsert(rang: Range, label: LabelInfo): HTMLSpanElement {
    const span: HTMLSpanElement = document.createElement("span")
    span.className = "onselect"
    span.style.backgroundColor = label.color // 选区的背景颜色
    // span.setAttribute("labelKeyword", label.keyword)
    // span.setAttribute("labelName", label.name) // 尽量在HTML层面信息传递多一点
    span.onclick = (e) => { // 删除包裹
        const currentSpan = e.target as HTMLElement
        deleteALabel(currentSpan)
    }
    // rang.surroundContents(span) // 用一个span标签包裹取值范围
    span.appendChild(rang.extractContents())
    rang.insertNode(span)// 用这种方法  x图标就不用伪元素放上去了
    return span
}

// 删除一个标签：完成以下四件事
function deleteALabel(currentSpan: Element) {
    // 1对sotre也要更改
    var index = 0
    var tmp = 0 // 用于记录当前等待删除的标签的number
    for (var result of store.results) {
        index+=1
        if (result.span == currentSpan) {
            tmp = result.number
            // 1.1 判断当前有没有关系存在，有的话就不予删除，然后把比当前关系大的标号更改
            for (var s of store.relaResults) {
                if (s.startNumber == tmp || s.endNumber == tmp) {
                    MessagePlugin.error('请先删除相关关系')
                    return
                }
                if (s.startNumber >= tmp) {
                    s.startNumber -= 1
                }
                if (s.endNumber >= tmp) {
                    s.endNumber -=1
                }
            }
            pubsub.publish("piniaToRelaView")
            // 删除
            store.results.splice(index-1, 1)
            break
        }
    }
    // 2对序号的更改
    for (var r of store.results) {
        if (r.number > tmp) {
            r.number -= 1
            piniaSyncLabelNumber(r)
        }
    }
    // 3用文字替换span标签
    currentSpan.replaceWith(currentSpan.childNodes[1])
}

// 将pinia中的序号同步到标签上
function piniaSyncLabelNumber(r: Result) {
    const tmp = r.span!.firstChild as HTMLPreElement
    tmp.innerText = r.number.toString()
}

// 从store.results产生一个标注过的div
export function resultsToLabeledDiv(): HTMLDivElement {
    const text = store.text
    const div = document.createElement('div')
    var offest = 0
    for (var r of store.results) {
        div.appendChild(document.createTextNode(text.substring(offest, r.start)))
        div.appendChild(r.span!)
        offest = r.end
    }
    div.appendChild(document.createTextNode(text.substring(offest-1, text.length)))
    return div
}