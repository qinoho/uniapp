import type { App } from 'vue'
import UPages from './u-pages/u-pages.vue'
import UScrollView from './u-scroll-view/u-scroll-view.vue'

// 组件列表
const components = [
  UPages,
  UScrollView
]

// 全局注册组件
export const setupComponents = (app: App) => {
  components.forEach(component => {
    app.component(component.name || component.__name, component)
  })
}

// 按需导出
export {
  UPages,
  UScrollView
}

export default {
  install: setupComponents
}
