import { LabelInfo } from '@/interface'
import { mainStore, statusStore } from '@/store'
const store = mainStore()
const status = statusStore()

export function resultNumberToContent(number: number): string {
    for (var r of store.results) {
        if (number == r.number) {
            return r.content
        }
    }
    return ""
}

export function resultIdToContent(id: string): string {
    for (var r of store.results) {
        if (id == r.id) {
            return r.content
        }
    }
    return ""
}

export function resultIdToNumber(id: string): number {
    for (var r of store.results) {
        if (id == r.id) {
            return r.number
        }
    }
    return 0
}

export function relaNumberToContent(number: string): string {
    for (var r of status.currentRelas) {
        if (number == r.id) {
            return r.type
        }
    }
    return ""
}

export function resultNumberToLabelId(number: number): string {
    for (var r of store.results) {
        if (number == r.number) {
            return r.labelId
        }
    }
    return ""
}

export function resultNumberToId(number: number): string {
    for (var r of store.results) {
        if (number == r.number) {
            return r.id
        }
    }
    return ""
}

export function labelIdToLabel(id: string): LabelInfo | null {
    for (var l of status.currentLabels) {
        if (l.id == id) {
            return l
        }
    }
    return null
}

export function relaLabelToName(id: string): string {
    for (var r of status.currentRelas) {
        if (r.id == id) {
            return r.type
        }
    }
    return ""
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