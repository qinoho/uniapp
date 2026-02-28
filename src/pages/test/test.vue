<template>
  <view class="pages_aa">
    <view class="scroll_box">
      <uni-pages :showTitle="true" ref="pageRef">
        <view @click="show">你哈好</view>
        <view v-for="item in 100">{{ item }}</view>

        <!-- <template #loadmore> 你好啊啊啊啊 </template> -->
        <view class="bottom_action"></view>
      </uni-pages>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// 导入uni组件对象类型8

const show = () => {
  uni.$showToast({
    title:
      '你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊',
    icon: 'loading',
    duration: 1500,
  })
  console.log(uni.$showToast)
}
</script>

<style lang="scss" scoped>
.pages_aa {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  .scroll_box {
    flex: 1;
    overflow: hidden;
  }
  .bottom_action {
    height: 100px;
    background-color: red;
    width: 300px;
    flex-shrink: 0;
  }
}
</style>
