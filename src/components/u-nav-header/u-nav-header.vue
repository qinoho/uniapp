<template>
  <!-- 导航栏 -->
  <view class="u-nav" :style="navBarStyle">
    <slot name="navBar">
      <view class="u-nav-content">
        <!-- 左侧返回按钮 -->
        <view class="u-nav-left" v-if="props.showBack">
          <slot name="navLeft">
            <text @click="handleBack" class="u-nav-back-icon"> 返回 </text>
          </slot>
        </view>
        <!-- 标题 -->
        <view class="u-nav-title">
          <slot name="navTitle">
            <text class="u-nav-title-text"> {{ props.title || '' }} </text>
          </slot>
        </view>
        <!-- 右侧操作区 -->
        <view class="u-nav-right">
          <slot name="navRight"></slot>
        </view>
      </view>
    </slot>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { getSystemInfoFn } from '@/utils/utils'
// import { getCurrentPages } from '@dcloudio/uni-app'

// 定义 Props 类型
interface Props {
  title?: string
  showBack?: boolean
  backgroundColor?: string
  navBarHeight?: string | number
}

// 定义 Props 默认值
const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: true,
  navBarHeight: '',
  backgroundColor: '#ffffff',
})

const statusBarHeight = ref<number>(0)
const navBarHeightValue = ref<number>(44)

// 定义 Emits
const emit = defineEmits<{
  back: []
}>()

// 系统信息
let systemInfo = {}
onBeforeMount(async () => {
  systemInfo = await getSystemInfoFn()
  calculateSafeArea()
})

// 计算属性
const navBarStyle = computed(() => ({
  height: navBarHeightValue.value + 'px',
  backgroundColor: props.backgroundColor,
  paddingTop: statusBarHeight.value + 'px',
}))

const calculateSafeArea = () => {
  // 状态栏高度
  statusBarHeight.value = systemInfo.statusBarHeight || 0

  // 导航栏高度
  if (props.navBarHeight) {
    navBarHeightValue.value =
      typeof props.navBarHeight === 'string'
        ? parseInt(props.navBarHeight)
        : props.navBarHeight
  } else {
    navBarHeightValue.value = systemInfo.navBarHeight
  }
}

const handleBack = () => {
  emit('back')
  // 默认返回行为
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({
      url: '/pages/index/index',
    })
  }
}
</script>

<style lang="scss" scoped>
.u-nav {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  box-sizing: border-box;
  &-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
  }

  &-title {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 16px;
    font-weight: bold;
  }
  &-left,
  &-right {
    display: flex;
    align-items: center;
    flex: 1;
  }
}
</style>
