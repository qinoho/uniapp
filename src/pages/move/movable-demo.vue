<template>
  <view class="move-page">
    <!-- 演示：可拖拽 + 可配置吸附开关与阈值、初始位置 -->
    <uni-movable
      :direction="direction"
      :snap-to-border="snapToBorder"
      :snap-threshold="snapThreshold"
      :x="initX"
      :y="initY"
      @change="onChange"
      @drag-end="onDragEnd"
    >
      <view style="width: 60rpx; height: 60rpx; background-color: red"
        >拖拽我</view
      >
    </uni-movable>

    <!-- 简单控制区（不改样式，使用内联控件） -->
    <view style="padding: 12px; font-size: 26rpx">
      <view style="margin-bottom: 8px"
        >吸附:
        <switch
          :checked="snapToBorder"
          @change="e => (snapToBorder = e.detail.value)"
        />
      </view>
      <view style="margin-bottom: 8px"
        >吸附阈值: {{ snapThreshold }}
        <slider
          :value="snapThreshold"
          min="0"
          max="150"
          @changing="e => (snapThreshold = e.detail.value)"
          @change="e => (snapThreshold = e.detail.value)"
        />
      </view>
      <view
        style="
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        "
      >
        <text>初始X:</text>
        <input
          type="number"
          :value="String(initX)"
          @input="e => (initX = Number(e.detail.value || 0))"
          style="border: 1px solid #ddd; padding: 4px; min-width: 120rpx"
        />
        <text>初始Y:</text>
        <input
          type="number"
          :value="String(initY)"
          @input="e => (initY = Number(e.detail.value || 0))"
          style="border: 1px solid #ddd; padding: 4px; min-width: 120rpx"
        />
      </view>
      <view
        >方向:
        <picker :range="dirOptions" :value="dirIndex" @change="onDirChange">
          <view
            style="
              display: inline-block;
              border: 1px solid #ddd;
              padding: 4px 8px;
            "
            >{{ direction }}</view
          >
        </picker>
      </view>
      <view style="margin-top: 8px; color: #666"
        >当前位置: x={{ pos.x }}, y={{ pos.y }}</view
      >
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const snapToBorder = ref(true)
const snapThreshold = ref(50)
const initX = ref(0)
const initY = ref(0)
const pos = ref({ x: 0, y: 0 })

const dirOptions = ['all', 'vertical', 'horizontal', 'none']
const dirIndex = ref(0)
const direction = ref<'all' | 'vertical' | 'horizontal' | 'none'>(
  dirOptions[dirIndex.value] as any
)
const onDirChange = (e: any) => {
  dirIndex.value = Number(e.detail.value || 0)
  direction.value = dirOptions[dirIndex.value] as any
}

const onChange = (detail: any) => {
  if (!detail) return
  pos.value = { x: Math.round(detail.x || 0), y: Math.round(detail.y || 0) }
}

const onDragEnd = (detail: any) => {
  if (!detail) return
  pos.value = { x: Math.round(detail.x || 0), y: Math.round(detail.y || 0) }
}
</script>

<style scoped>
.move-page {
  width: 750rpx;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>

