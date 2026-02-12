/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Vue 3 编译器宏声明
declare global {
  interface Uni {
    $showToast: (options: any) => void
  }
}

export {}

