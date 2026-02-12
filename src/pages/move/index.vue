<template>
  <uni-pages
    @scrolltoupper="scrolltoupperFn"
    :showTitle="true"
    :enable-refresh="true"
    :enable-load-more="true"
    @loadmore="loadmoreFn"
    @refresh="refreshFn"
    :defaultLoadMoreStatus="defaultLoadMoreStatus"
    ref="pageRef"
  >
    <view>你哈好</view>
    <view v-for="item in list">{{ item }}</view>

    <!-- <template #loadmore> 你好啊啊啊啊 </template> -->
  </uni-pages>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// const list = ref(Array.from({ length: 50 }).map((_, i) => i))
const list = ref<any>([1, 2, 3])
const pageRef = ref<InstanceType<any>>(null)
const defaultLoadMoreStatus = ref('more')
const scrolltoupperFn = () => {
  console.log('scrolltoupper')
}
console.log(getCurrentPages())
const refreshFn = () => {
  console.log('2222222222222222')
  setTimeout(() => {
    console.log('refresh-fnished-----')
    list.value = [1, 2, 3]
    pageRef.value.finishRefresh()
  }, 2000)
}
const count = ref(0)
const loadmoreFn = () => {
  if (count.value == 3) {
    pageRef.value.finishLoadMore(false)
    return
  }
  console.log('1111111111111111111111')
  setTimeout(() => {
    console.log('fnished-----')
    list.value.push(...Array.from({ length: 50 }).map(i => 100))
    pageRef.value.finishLoadMore()
    count.value++
  }, 2000)
}
</script>

<style lang="scss" scoped></style>
