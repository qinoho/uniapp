import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const theme = ref<'light' | 'dark'>('light')

    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }

    const setTheme = (newTheme: 'light' | 'dark') => {
      theme.value = newTheme
    }

    const initTheme = () => {
      // 也可以根据系统当前主题进行初始化
      const sysInfo = uni.getSystemInfoSync()
      if (sysInfo.theme && ['light', 'dark'].includes(sysInfo.theme)) {
        // theme.value = sysInfo.theme as 'light' | 'dark'
      }
    }

    return {
      theme,
      toggleTheme,
      setTheme,
      initTheme,
    }
  },
  {
    persist: true,
  },
)
