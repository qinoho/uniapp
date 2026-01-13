<template>
  <view class="uni-toast" v-if="showToast" :class="{ 'uni-toast--show': showToast }">
    <view class="uni-toast__content">
      <view v-if="icon" class="uni-toast__icon">
        <text v-if="icon === 'success'" class="uni-icon">✓</text>
        <text v-else-if="icon === 'error'" class="uni-icon">✕</text>
        <text v-else-if="icon === 'loading'" class="uni-icon uni-loading"></text>
      </view>
      <text class="uni-toast__text">{{ title }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ToastOptions {
  title: string
  icon?: 'success' | 'error' | 'loading' | 'none'
  duration?: number
  mask?: boolean
}

const showToast = ref(false)
const title = ref('')
const icon = ref<'success' | 'error' | 'loading' | 'none'>('none')
let timer: any = null

const show = (options: ToastOptions) => {
  if (timer) clearTimeout(timer)

  title.value = options.title || ''
  icon.value = options.icon || 'none'
  const duration = options.duration || 1500

  showToast.value = true

  if (duration > 0) {
    timer = setTimeout(() => {
      hide()
    }, duration)
  }
}

const hide = () => {
  showToast.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

defineExpose({
  show,
  hide,
})
</script>

<style lang="scss" scoped>
.uni-toast {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  pointer-events: none; // Allow clicks through transparent area

  &__content {
    background-color: rgba(0, 0, 0, 0.7);
    padding: 12px 24px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 80%;
    pointer-events: auto; // Capture clicks on toast itself
  }

  &__icon {
    margin-bottom: 8px;
    .uni-icon {
      font-size: 32px;
      color: #fff;
    }
    .uni-loading {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 2px solid #fff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  &__text {
    color: #fff;
    font-size: 14px;
    text-align: center;
    line-height: 1.5;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
