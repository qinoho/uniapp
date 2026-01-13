<template>
  <view
    v-if="showPopup"
    class="uni-popup"
    :class="[popupClass, 'uni-popup--' + type]"
    @touchmove.stop.prevent
  >
    <view class="uni-popup__mask" @click="close" v-if="mask"></view>
    <view class="uni-popup__content" :class="contentClass" :style="contentStyle">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  show?: boolean
  type?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  mask?: boolean
  backgroundColor?: string
  radius?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  type: 'center',
  mask: true,
  backgroundColor: '#ffffff',
  radius: 0,
})

const emit = defineEmits(['update:show', 'change'])

const showPopup = ref(props.show)

watch(
  () => props.show,
  val => {
    showPopup.value = val
  }
)

const close = () => {
  showPopup.value = false
  emit('update:show', false)
  emit('change', { show: false })
}

const popupClass = computed(() => {
  return {
    'uni-popup--show': showPopup.value,
  }
})

const contentClass = computed(() => {
  return `uni-popup__content--${props.type}`
})

const contentStyle = computed(() => {
  return {
    backgroundColor: props.backgroundColor,
    borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius,
  }
})
</script>

<style lang="scss" scoped>
.uni-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  visibility: hidden;
  transition: visibility 0.3s;

  &--show {
    visibility: visible;
    .uni-popup__mask {
      opacity: 1;
    }
    .uni-popup__content {
      transform: translate(0, 0);
      opacity: 1;
    }
  }

  &__mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &__content {
    position: absolute;
    transition: transform 0.3s, opacity 0.3s;
    opacity: 0;

    &--center {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      /* center active transform handled by specific logic if needed, 
         but here we use the generic show class to reset transform. 
         Wait, for center, we need to keep centering. */
    }

    &--top {
      top: 0;
      left: 0;
      right: 0;
      transform: translateY(-100%);
    }

    &--bottom {
      bottom: 0;
      left: 0;
      right: 0;
      transform: translateY(100%);
    }

    &--left {
      top: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
    }

    &--right {
      top: 0;
      bottom: 0;
      right: 0;
      transform: translateX(100%);
    }
  }
}

/* Fix for center transform override */
.uni-popup--show .uni-popup__content--center {
  transform: translate(-50%, -50%) scale(1);
}
.uni-popup--show .uni-popup__content--top {
  transform: translateY(0);
}
.uni-popup--show .uni-popup__content--bottom {
  transform: translateY(0);
}
.uni-popup--show .uni-popup__content--left {
  transform: translateX(0);
}
.uni-popup--show .uni-popup__content--right {
  transform: translateX(0);
}
</style>
