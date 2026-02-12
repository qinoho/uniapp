<template>
  <movable-area class="movable-area" :id="areaId" :style="areaStyle">
    <!-- direction='none' 时使用普通 view 代替 movable-view -->
    <movable-view
      v-if="direction !== 'none'"
      class="movable-view"
      :style="viewStyle"
      :x="currentX"
      :y="currentY"
      :direction="direction"
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
    <view v-else class="movable-view" :style="viewStyle">
      <slot>
        <view class="default-content">
          <text class="default-text">拖拽我</text>
        </view>
      </slot>
    </view>
  </movable-area>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, getCurrentInstance, reactive } from 'vue'

// 吸附边界类型
type SnapBorder = 'top' | 'left' | 'right' | 'bottom'

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
  snapThreshold?: number // 吸附触发阈值（px），距边界小于此值时触发吸附
  snapBorders?: SnapBorder[] // 可吸附的边界方向，默认 ['left', 'right']，可选 'top' | 'left' | 'right' | 'bottom'
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
  snapBorders: () => ['left', 'right'] as SnapBorder[],
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

// 解析尺寸值为数字（px）
const parseSizeValue = (val: string | number): number => {
  if (typeof val === 'number') return val
  return parseFloat(val) || 0
}

// 区域样式
const areaStyle = computed(() => ({
  width: typeof props.areaWidth === 'number' ? `${props.areaWidth}px` : props.areaWidth,
  height: typeof props.areaHeight === 'number' ? `${props.areaHeight}px` : props.areaHeight,
}))

// .movable-view 宽高样式
const viewStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

/**
 * 获取 SelectorQuery 的组件上下文
 * - 小程序：需要传入 currentInstance?.proxy 才能正确查询组件内部节点
 * - H5/App：传入 currentInstance 即可
 */
const getQueryContext = () => {
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  return currentInstance?.proxy
  // #endif
  // #ifndef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  return currentInstance
  // #endif
}

// 读取区域与拖拽项尺寸
const readSizes = (): Promise<void> => {
  return new Promise(resolve => {
    nextTick(() => {
      const ctx = getQueryContext()
      const q = uni.createSelectorQuery().in(ctx)
      q.select(`#${areaId}`).boundingClientRect()
      q.select(`#${areaId} .movable-view`).boundingClientRect()
      q.exec((results: any[]) => {
        if (results && results[0]) {
          areaRect.value = { width: results[0].width, height: results[0].height }
        }
        if (results && results[1]) {
          itemRect.value = { width: results[1].width, height: results[1].height }
        }
        resolve()
      })
    })
  })
}

// 获取元素实际宽高（优先使用读取到的尺寸，降级使用 props）
const getItemSize = () => {
  const iw = itemRect.value.width || parseSizeValue(props.width) || 60
  const ih = itemRect.value.height || parseSizeValue(props.height) || 60
  return { iw, ih }
}

// 将位置限制在区域内
const clampToBounds = (x: number, y: number) => {
  const { iw, ih } = getItemSize()
  const maxX = Math.max(0, (areaRect.value.width || 0) - iw)
  const maxY = Math.max(0, (areaRect.value.height || 0) - ih)
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  }
}

/**
 * 根据 snapBorders 配置吸附到最近的允许边界
 * 计算当前位置到每个允许边界的距离，选择距离最近的边界吸附
 */
const snapToNearestBorder = (x: number, y: number) => {
  if (!props.snapToBorder) return { x, y }

  const borders = props.snapBorders
  if (!borders || borders.length === 0) return { x, y }

  const { iw, ih } = getItemSize()
  const w = areaRect.value.width || 0
  const h = areaRect.value.height || 0

  // 构建候选吸附点：每个允许的边界生成一个 { snapX, snapY, dist }
  const candidates: { x: number; y: number; dist: number }[] = []

  if (borders.includes('left')) {
    candidates.push({ x: 0, y, dist: x })
  }
  if (borders.includes('right')) {
    candidates.push({ x: Math.max(0, w - iw), y, dist: Math.abs(w - iw - x) })
  }
  if (borders.includes('top')) {
    candidates.push({ x, y: 0, dist: y })
  }
  if (borders.includes('bottom')) {
    candidates.push({ x, y: Math.max(0, h - ih), dist: Math.abs(h - ih - y) })
  }

  // 无候选项则不吸附
  if (candidates.length === 0) return { x, y }

  // 选择距离最近的边界
  candidates.sort((a, b) => a.dist - b.dist)
  const nearest = candidates[0]

  return { x: nearest.x, y: nearest.y }
}

// 初始化位置（限制在范围内）
const initializePosition = () => {
  const pos = clampToBounds(props.x, props.y)
  currentX.value = pos.x
  currentY.value = pos.y
  oldPos.x = pos.x
  oldPos.y = pos.y
}

// 事件：movable-view 的 change 回调
const onChange = (e: any) => {
  const detail = e.detail || {}
  const { x, y, source } = detail
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  // 小程序端：通过 source 区分用户拖拽和程序触发
  if (source === 'touch' || source === 'friction' || source === 'out-of-bounds') {
    oldPos.x = x ?? oldPos.x
    oldPos.y = y ?? oldPos.y
  }
  // #endif
  // #ifdef H5 || APP-PLUS
  // H5/App 端：source 可能为空字符串或 undefined，在拖拽态下始终更新
  if (
    isDragging.value ||
    source === 'touch' ||
    source === 'friction' ||
    source === 'out-of-bounds'
  ) {
    oldPos.x = x ?? oldPos.x
    oldPos.y = y ?? oldPos.y
  }
  // #endif
  emit('change', detail)
}

const onTouchStart = (_e: any) => {
  isDragging.value = true
  emit('dragStart', { x: oldPos.x, y: oldPos.y })
}

const onTouchEnd = (_e: any) => {
  isDragging.value = false

  // #ifdef H5
  // H5 端：touchend 时 change 事件可能尚未触发完毕，需延迟处理吸附
  setTimeout(() => {
    const { x, y } = snapToNearestBorder(oldPos.x, oldPos.y)
    applyPosition(x, y)
    emit('dragEnd', { x, y })
  }, 50)
  // #endif
  // #ifndef H5
  const { x, y } = snapToNearestBorder(oldPos.x, oldPos.y)
  applyPosition(x, y)
  emit('dragEnd', { x, y })
  // #endif
}

onMounted(async () => {
  await readSizes()
  initializePosition()
})

// 当初始位置 props 变化时，重置当前位置
watch(
  () => [props.x, props.y],
  ([newX, newY]) => {
    setPosition(newX as number, newY as number)
  },
)

/**
 * 内部方法：强制更新 movable-view 的位置
 * 先设为旧值再 nextTick 设为目标值，解决 Vue 响应式相同值不触发更新的问题
 */
const applyPosition = (x: number, y: number) => {
  // 先设置到一个不同的位置，强制 Vue 检测到变化
  currentX.value = oldPos.x
  currentY.value = oldPos.y

  nextTick(() => {
    const clamped = clampToBounds(x, y)
    currentX.value = clamped.x
    currentY.value = clamped.y
    oldPos.x = clamped.x
    oldPos.y = clamped.y
  })
}

// 暴露方法：设置位置
const setPosition = (x: number, y: number) => {
  if (isDragging.value) return // 正在拖拽中，不处理位置更新
  applyPosition(x, y)
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
  /* #ifdef H5 */
  touch-action: none; /* H5 端：阻止浏览器默认触摸行为，避免拖拽时页面滚动 */
  pointer-events: none; /* H5 端：穿透区域事件，仅 movable-view 响应 */
  /* #endif */
  /* #ifdef APP-PLUS */
  pointer-events: none; /* App 端：同 H5 穿透处理 */
  /* #endif */
  z-index: 9999;
}

.movable-view {
  display: flex;
  align-items: center;
  justify-content: center;
  /* #ifdef H5 || APP-PLUS */
  pointer-events: auto; /* H5/App 端：恢复拖拽项事件响应 */
  /* #endif */
  z-index: 9999;
}

.default-content {
  width: 100%;
  height: 100%;
}
</style>
