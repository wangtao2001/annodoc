import { useStore } from '@/store'
import { relas } from '@/options'
const store = useStore()

export function resultNumberToContent(number: number): string {
    for (var r of store.results) {
        if (number == r.number) {
            return r.content
        }
    }
    return ""
}

export function relaIDToContent(number: number): string {
    for (var r of relas) {
        if (number == r.id) {
            return r.name
        }
    }
    return ""
}

export function resultNumberTokeyword(number: number): string {
    for (var r of store.results) {
        if (number == r.number) {
            return r.labelKeyword
        }
    }
    return ""
}