<template>
  <view class="damping-test">
    <view class="header">
      <text class="title">阻尼效果测试</text>
      <text class="subtitle">验证平滑的下拉阻尼，无跳动</text>
    </view>

    <u-scroll-view
      ref="scrollViewRef"
      :height="'calc(100vh - 120px)'"
      @refresh="handleRefresh"
    >
      <!-- 自定义下拉刷新 -->
      <template #refresh="{ status, distance }">
        <view class="damping-refresh">
          <view class="damping-content">
            <!-- 实时数据显示 -->
            <view class="data-display">
              <text class="data-item">原始距离: {{ Math.round(rawDistance) }}px</text>
              <text class="data-item">计算距离: {{ Math.round(distance) }}px</text>
              <text class="data-item">阻尼比例: {{ dampingRatio.toFixed(3) }}</text>
              <text class="data-item">状态: {{ status }}</text>
            </view>

            <!-- 可视化指示器 -->
            <view class="visual-indicator">
              <view class="indicator-track">
                <view 
                  class="indicator-thumb"
                  :style="{ 
                    transform: `translateX(${Math.min((distance / 80) * 100, 100)}%)`,
                    backgroundColor: getIndicatorColor(status)
                  }"
                ></view>
              </view>
              <text class="threshold-mark">阈值: 80px</text>
            </view>

            <!-- 状态图标 -->
            <view class="status-icon">
              <text v-if="status === 'pulling'">⬇️</text>
              <text v-else-if="status === 'release'">🚀</text>
              <text v-else-if="status === 'loading'">⚡</text>
            </view>
          </view>
        </view>
      </template>

      <!-- 内容区域 -->
      <view class="content">
        <view class="info-section">
          <text class="section-title">阻尼函数说明</text>
          <text class="section-text">使用 tanh 函数实现平滑阻尼：</text>
          <text class="formula">distance = threshold × tanh(δ/threshold × 0.8) × 0.6</text>
          <text class="section-text">优势：</text>
          <text class="advantage">• 连续可导，无跳动点</text>
          <text class="advantage">• 自然的阻尼感受</text>
          <text class="advantage">• 平滑的状态过渡</text>
        </view>

        <view class="test-items">
          <view
            v-for="item in testItems"
            :key="item.id"
            class="test-item"
          >
            <text class="item-title">{{ item.title }}</text>
            <text class="item-desc">{{ item.description }}</text>
          </view>
        </view>
      </view>
    </u-scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const scrollViewRef = ref()
const rawDistance = ref(0)
const testItems = ref([
  { id: 1, title: '测试项目 1', description: '下拉测试阻尼效果的平滑性' },
  { id: 2, title: '测试项目 2', description: '观察距离计算的连续性' },
  { id: 3, title: '测试项目 3', description: '验证状态转换的流畅度' },
  { id: 4, title: '测试项目 4', description: '检查是否存在跳动现象' },
  { id: 5, title: '测试项目 5', description: '体验整体的交互感受' },
])

// 计算阻尼比例
const dampingRatio = computed(() => {
  if (rawDistance.value === 0) return 0
  const threshold = 80
  const normalizedDelta = rawDistance.value / threshold
  return Math.tanh(normalizedDelta * 0.8) * 0.6
})

// 模拟原始距离计算（用于显示）
const updateRawDistance = (distance: number) => {
  // 反推原始距离（近似）
  const threshold = 80
  const dampingFactor = 0.6
  rawDistance.value = (distance / threshold / dampingFactor) * threshold / 0.8
}

// 获取指示器颜色
const getIndicatorColor = (status: string) => {
  switch (status) {
    case 'pulling':
      return '#4facfe'
    case 'release':
      return '#00f2fe'
    case 'loading':
      return '#ffd700'
    default:
      return '#ccc'
  }
}

// 刷新处理
const handleRefresh = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 随机更新测试项目
  testItems.value = testItems.value.map((item, index) => ({
    ...item,
    title: `更新项目 ${index + 1}`,
    description: `刷新时间: ${new Date().toLocaleTimeString()}`
  }))
  
  scrollViewRef.value?.finishRefresh()
}
</script>

<style lang="scss" scoped>
.damping-test {
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
}

.header {
  padding: 20px;
  background: white;
  text-align: center;
  border-bottom: 1px solid #eee;

  .title {
    display: block;
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
    color: #666;
  }
}

.damping-refresh {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.damping-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  padding: 20px;
}

.data-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;

  .data-item {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 4px;
    font-family: monospace;
  }
}

.visual-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;

  .indicator-track {
    width: 120px;
    height: 6px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    position: relative;
    overflow: hidden;
  }

  .indicator-thumb {
    position: absolute;
    left: 0;
    top: 0;
    width: 20px;
    height: 100%;
    border-radius: 3px;
    transition: transform 0.1s ease;
  }

  .threshold-mark {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 8px;
  }
}

.status-icon {
  font-size: 32px;
  animation: pulse 1s ease-in-out infinite;
}

.content {
  padding: 20px;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .section-title {
    display: block;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
  }

  .section-text {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    line-height: 1.5;
  }

  .formula {
    display: block;
    font-size: 12px;
    color: #007aff;
    background: #f0f8ff;
    padding: 8px 12px;
    border-radius: 6px;
    margin: 12px 0;
    font-family: monospace;
  }

  .advantage {
    display: block;
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
    padding-left: 8px;
  }
}

.test-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.test-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .item-title {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .item-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.4;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
