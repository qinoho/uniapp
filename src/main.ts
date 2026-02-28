import { createSSRApp } from 'vue'
import App from './App.vue'

// 全局定义自定义toast
uni.$showToast = (options: any) => {
  uni.$emit('$showToast', options)
}

export function createApp() {
  const app = createSSRApp(App)
  return {
    app,
  }
}
