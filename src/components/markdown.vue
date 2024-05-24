<script setup lang="ts">
import axios from 'axios'
import {ref, watch} from 'vue'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/base16/darcula.css'

const marked = new Marked(
    markedHighlight({
      async: false,
      langPrefix: 'hljs language-', // 代码高亮
      highlight(code, lang, info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
);

const content = ref('')
const props = defineProps({
  src: String,
  text: String
})

watch(props,  async () => {
  if (props.src != undefined) {
    const response = await axios.get(props.src)
    const data = response.data
    const list = props.src.split('.')
    const suffix = list[list.length-1]
    if (suffix == 'txt') content.value = txt2html(data)
    else if (suffix == 'html') content.value = data
    else if (suffix == 'md') content.value = marked.parse(data) as string
  } else if (props.text != undefined) {
    content.value = marked.parse(props.text) as string
  }
})

const txt2html = (txt: string): string => {
  let htmlText = txt.replace(/&/g, '&amp;')
  htmlText = htmlText.replace(/</g, '&lt;')
  htmlText = htmlText.replace(/>/g, '&gt;')
  htmlText = htmlText.replace(/ /g, '&nbsp;')
  htmlText = htmlText.replace(/\n/g, '<br>')
  return htmlText
}

</script>

<template>
    <div v-html="content"></div>
</template>
