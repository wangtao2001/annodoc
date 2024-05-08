<script setup lang="tsx">
import { ref } from 'vue'
import router from "@/router"

const init =  () => {

}

const flexRow = ref(true)
const flexChange = () => {
  if (flexRow.value) {
    localStorage.setItem('flexRow', 'false')
  } else {
    localStorage.setItem('flexRow', 'true')
  }
  flexRow.value = !flexRow.value
}
const local = localStorage.getItem('flexRow')
if (local === 'false') {
  flexChange()
}



init()
</script>

<template>
  <div class="root">
    <div class="card" :style="flexRow ? 'flex-direction: row; height: 100%;' : 'flex-direction: column;'">
      <t-card class="text" :style="flexRow ? 'height: 100%;' : 'margin-right: 0; width: 100%'">
        这是一段文字
      </t-card>
      <div class="resize" title="调整横向距离" v-show="flexRow">
        <span>⋮</span>
      </div>
      <t-card class="qa" :style="flexRow ? 'height: 100%;' : 'margin-right: 0; width: 100%; margin-top: 20px;'">
       示例
      </t-card>
    </div>
    <t-card class="bottom-card">
      <div class="option">
        <div>
          <t-button variant="outline" @click="router.push('/anno/type')">返回</t-button>
          <t-button class="flex" variant="outline" @click="flexChange">{{ flexRow ? '上下布局' : '左右布局'}}</t-button>
        </div>
        <div class="next">
          <t-button variant="outline">取消</t-button>
          <t-button >提交</t-button>
        </div>
      </div>
    </t-card>
  </div>
</template>

<style scoped lang="less">
.singe-line {
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  white-space: nowrap;
}

.root {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;

  .card {
    width: 90%;
    height: 100%;
    overflow: hidden;
    margin-bottom: 20px;

    .text {
      width: calc(50% - 10px);
      float: left;
      display: flex;
      align-items: center;

      .info {
        margin-bottom: 10px;
        color: #747474;
      }
    }

    .qa {
      float: left;
      width: 50%;

      .q,
      .a {
        margin: 10px 0;
      }

      .radio-group {
        margin-top: 10px;
        width: 100%;
        display: flex;
        justify-content: space-between;
      }

      span {
        font-weight: bold;
        margin: 20px 0;
      }
    }
  }

  .bottom-card {
    width: 90%;
    margin-bottom: 30px;

    .option {
      display: flex;
      justify-content: space-between;

      button {
        margin: 4px;
      }
    }
  }
}

button {
  user-select: none;
}

/*拖拽区div样式*/
.resize {
  cursor: ew-resize;
  float: left;
  position: relative;
  width: 10px;
  height: 100%;
  font-size: 32px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

/*拖拽区鼠标悬停样式*/
.resize:hover {
  color: #e4e4e4;
}

@media screen and (max-width: 900px) {

  .resize {
    display: none;
  }

  .flex {
    display: none;
  }

  .backTop {
    display: none;
  }

  .card {
    flex-direction: column !important;

    .text {
      height: auto !important;
      width: 100% !important;
      margin: 0 !important;
      margin-bottom: 20px !important;
    }

    .qa {
      height: auto !important;
      width: 100% !important;
      margin: 0 !important;
    }
  }

  .bottom-card {
    margin-top: 10px;
  }

}
</style>