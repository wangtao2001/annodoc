import { EntityLabelInfo, EntityResult, RelaLabelInfo } from '@/interface'
import { mainStore, statusStore } from '@/store'
const store = mainStore()
const current = statusStore()

export function numberToResult(number: number): EntityResult | null {
    for (var r of store.entityResults) {
        if (number == r.number) {
            return r
        }
    }
    return null
}

export function idToResult(id: string): EntityResult | null {
    for (var r of store.entityResults) {
        if (id == r.id) {
            return r
        }
    }
    return null
}

export function idToRela(id: string): RelaLabelInfo | null {
    for (var r of current.relaLabels) {
        if (r.id == id) {
            return r
        }
    }
    return null
}

export function numberToRela(number: string): RelaLabelInfo | null {
    for (var r of current.relaLabels) {
        if (number == r.id) {
            return r
        }
    }
    return null
}

export function labelIdToLabel(id: string): EntityLabelInfo | null {
    for (var l of current.entityLabels) {
        if (l.id == id) {
            return l
        }
    }
    return null
}

export function fileListToArray(fileList: FileList): Array<File> {
    const arr: Array<File> = []
    for (var i = 0; i < fileList.length; i++) {
        arr.push(fileList.item(i)!)
    }
    return arr
}

export function fileSizeSum(files: Array<File>): string {
    var num = 0
    for (var f of files) {
        num += f.size
    }
    return filesize(num)
}

function filesize(size: number): string {//把字节转换成正常文件大小
    var num = 1024.00
    if (size < num)
        return size + "B";
    if (size < Math.pow(num, 2))
        return (size / num).toFixed(2) + "KB"
    if (size < Math.pow(num, 3))
        return (size / Math.pow(num, 2)).toFixed(2) + "MB"
    if (size < Math.pow(num, 4))
        return (size / Math.pow(num, 3)).toFixed(2) + "G"
    return (size / Math.pow(num, 4)).toFixed(2) + "T"
}
  
export function downloadLocal(data: string, name: string) {
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
}

export function corpusDemo() {
    return [
        {   
            "text": "这是第1段文字",
            "title": "文字标题",
            "chapter": "章节标题",
            "pairs": [
            {
                "question": "这是第1个问题",
                "answer": "这是第1个问题的答案"
            },
            {
                "question": "这是第2个问题",
                "answer": "这是第2个问题的答案" 
            },
            {
                "question": "这是第3个问题",
                "answer": "这是第3个问题的答案"
            }]
        }, {
            "text": "这是第2段文字",
            "title": "文字标题",
            "chapter": "章节标题",
            "pairs": [
            {
                "question": "这是第1个问题",
                "answer": "这是第1个问题的答案"
            }]
        }
    ]
}