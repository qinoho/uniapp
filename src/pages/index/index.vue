<template>
  <wd-config-provider :theme="themeStore.theme">
    <view :class="['page-container', themeStore.theme === 'dark' ? 'dark' : '']">
      <!-- <view class="bg" style="overflow: hidden; display: flex"> </view> -->
      <view>
        <image src="@/assets/111.png" mode="scaleToFill" />
      </view>
      <uni-movable
        :area-width="areaWidth"
        :area-height="areaHeight"
        :width="width"
        :height="height"
        :x="x"
        :y="y"
        :direction="direction"
        :damping="damping"
        :friction="friction"
        :disabled="disabled"
        :snap-to-border="snapToBorder"
        :snap-threshold="snapThreshold"
        @change="onChange"
        @dragStart="onDragStart"
        @dragEnd="onDragEnd"
        :snap-borders="['top', 'left']"
      >
        <view class="custom-content"> 自定义内容 </view>
      </uni-movable>
    </view>
  </wd-config-provider>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/store/useThemeStore'
const themeStore = useThemeStore()

const areaWidth = '100vw'
const areaHeight = '100vh'
const width = 60
const height = 60
const x = 0
const y = 0
const direction = 'all'
const damping = 20
const friction = 2
const disabled = false
const snapToBorder = true
const snapThreshold = 50

const onChange = (detail: any) => {
  console.log('change', detail)
}

const onDragStart = (position: { x: number; y: number }) => {
  console.log('dragStart', position)
}

const onDragEnd = (position: { x: number; y: number }) => {
  console.log('dragEnd', position)
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: var(--bg-color, #ffffff);
  color: var(--text-color, #000000);
  transition:
    background-color 0.3s,
    color 0.3s;
}
.bg {
  width: 100rpx;
  height: 100rpx;
  background-color: #f00;
  .fz {
    font-size: 100rpx;
  }
}
.content {
  width: 100rpx;
}
.test > .test2 {
  color: var(--text-color, #000000);
}
.custom-content {
  width: 100rpx;
  height: 100rpx;
}
</style>
