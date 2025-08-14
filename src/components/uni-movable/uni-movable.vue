<template>
  <movable-area class="movable-area" :id="areaId" :style="areaStyle">
    <template v-if="direction === 'all'">
      <movable-view
        class="movable-view"
        :style="viewStyle"
        :x="currentX"
        :y="currentY"
        direction="all"
        :damping="damping"
        :friction="friction"
        :disabled="disabled"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
        @change="onChange"
      >
        <slot>
          <view class="default-content">
            <text class="default-text">拖拽我</text>
          </view>
        </slot>
      </movable-view>
    </template>
    <template v-else-if="direction === 'vertical'">
      <movable-view
        class="movable-view"
        :style="viewStyle"
        :x="currentX"
        :y="currentY"
        direction="vertical"
        :damping="damping"
        :friction="friction"
        :disabled="disabled"
        @change="onChange"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <slot>
          <view class="default-content">
            <text class="default-text">拖拽我</text>
          </view>
        </slot>
      </movable-view>
    </template>
    <template v-else-if="direction === 'horizontal'">
      <movable-view
        class="movable-view"
        :style="viewStyle"
        :x="currentX"
        :y="currentY"
        direction="horizontal"
        :damping="damping"
        :friction="friction"
        :disabled="disabled"
        @change="onChange"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <slot>
          <view class="default-content">
            <text class="default-text">拖拽我</text>
          </view>
        </slot>
      </movable-view>
    </template>
    <template v-else-if="direction === 'none'">
      <view class="movable-view" :style="viewStyle">
        <slot>
          <view class="default-content">
            <text class="default-text">拖拽我</text>
          </view>
        </slot>
      </view>
    </template>
  </movable-area>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  nextTick,
  watch,
  getCurrentInstance,
  reactive,
} from 'vue'

// Props 定义
interface Props {
  areaWidth?: string | number // 可移动区域宽度，默认 100%
  areaHeight?: string | number // 可移动区域高度，默认 100%
  width?: string | number // 拖拽项宽度，默认 60px
  height?: string | number // 拖拽项高度，默认 60px
  x?: number // 初始 X，默认 0
  y?: number // 初始 Y，默认 0
  direction?: 'all' | 'vertical' | 'horizontal' | 'none' // 移动方向
  damping?: number // 阻尼
  friction?: number // 摩擦
  disabled?: boolean // 禁用
  snapToBorder?: boolean // 释放后吸附边界
  snapThreshold?: number // 吸附触发阈值（px）
}

const currentInstance = getCurrentInstance()

const props = withDefaults(defineProps<Props>(), {
  areaWidth: '100%',
  areaHeight: '100%',
  width: '60px',
  height: '60px',
  x: 0,
  y: 0,
  direction: 'all',
  damping: 20,
  friction: 2,
  disabled: false,
  snapToBorder: true,
  snapThreshold: 50,
})

// Emits 定义
interface Emits {
  (e: 'change', detail: any): void
  (e: 'dragStart', position: { x: number; y: number }): void
  (e: 'dragEnd', position: { x: number; y: number }): void
}
const emit = defineEmits<Emits>()

// 状态
const areaId = `movable-area-${Math.random().toString(36).slice(2, 9)}`
const oldPos = reactive({ x: 0, y: 0 })
const currentX = ref(props.x)
const currentY = ref(props.y)
const isDragging = ref(false)
const areaRect = ref({ width: 0, height: 0 })
const itemRect = ref({ width: 0, height: 0 })

// 样式（不动你的样式，这里仅提供默认宽高 100% 行内 style，可被父容器控制）
const areaStyle = computed(() => ({
  width:
    typeof props.areaWidth === 'number'
      ? `${props.areaWidth}px`
      : props.areaWidth,
  height:
    typeof props.areaHeight === 'number'
      ? `${props.areaHeight}px`
      : props.areaHeight,
}))

// 这里不覆写你的 .movable-view 宽高样式，如需自定义可自行扩展
const viewStyle = computed(() => ({}))

// 读取区域与拖拽项尺寸
const readSizes = async () => {
  await nextTick()
  const q = uni.createSelectorQuery().in(currentInstance)
  q.select(`#${areaId}`).boundingClientRect((rect: any) => {
    if (rect) {
      areaRect.value = { width: rect.width, height: rect.height }
    }
  })
  q.select(`#${areaId} .movable-view`)
    .boundingClientRect((rect: any) => {
      if (rect) {
        itemRect.value = { width: rect.width, height: rect.height }
      }
    })
    .exec()
}

// 将位置限制在区域内
const clampToBounds = (x: number, y: number) => {
  const iw = itemRect.value.width || 60 // 回退为 60px
  const ih = itemRect.value.height || 60
  const maxX = Math.max(0, (areaRect.value.width || 0) - iw)
  const maxY = Math.max(0, (areaRect.value.height || 0) - ih)
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  }
}

// 根据阈值吸附到最近边界
const snapToNearestBorder = (x: number, y: number) => {
  if (!props.snapToBorder) return { x, y }
  const iw = itemRect.value.width || 60
  const ih = itemRect.value.height || 60
  const w = areaRect.value.width || 0
  const h = areaRect.value.height || 0
  const leftDist = x
  const rightDist = Math.max(0, w - (x + iw))
  return { x: leftDist < rightDist ? 0 : w - iw, y }
}

// 初始化位置（限制在范围内）
const initializePosition = () => {
  const pos = clampToBounds(props.x, props.y)
  currentX.value = pos.x
  currentY.value = pos.y
}

// 事件
const onChange = (e: any) => {
  const { x, y } = e.detail || {}
  oldPos.x = x
  oldPos.y = y
  emit('change', e.detail)
}

const onTouchStart = (_e: any) => {
  isDragging.value = true
  emit('dragStart', { x: currentX.value, y: currentY.value })
}
const onTouchEnd = (_e: any) => {
  isDragging.value = false

  const { x, y } = snapToNearestBorder(oldPos.x, oldPos.y)

  setPosition(x, y)
}
onMounted(async () => {
  await readSizes()
  initializePosition()
})

// 当初始位置 props 变化时，重置当前位置
watch(
  () => [props.x, props.y],
  () => {
    setPosition(props.x, props.y)
  }
)

// 暴露方法
const setPosition = (x: number, y: number) => {
  if (isDragging.value) return // 正在拖拽中，不处理位置更新
  currentX.value = oldPos.x
  currentY.value = oldPos.y

  nextTick(() => {
    currentX.value = x
    currentY.value = y
    emit('dragEnd', { x: currentX.value, y: currentY.value })
  })
}
const getPosition = () => ({ x: oldPos.x, y: oldPos.y })
const reset = () => setPosition(props.x, props.y)
const refreshSize = async () => {
  await readSizes()
  initializePosition()
}

defineExpose({ setPosition, getPosition, reset, refreshSize })
</script>

<style scoped>
.movable-area {
  background-color: transparent;
  position: relative;
  overflow: hidden;
  touch-action: none; /* 避免 H5 下页面滚动拦截拖拽 */
  pointer-events: none;
  z-index: 9999;
}

.movable-view {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  pointer-events: auto;
  z-index: 9999;
}

.default-content {
  width: 100%;
  height: 100%;
}
</style>
