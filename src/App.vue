<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useThemeStore } from './store/useThemeStore'

onLaunch(() => {
  console.log('App Launch')
  const themeStore = useThemeStore()
  themeStore.initTheme()
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>
<style>
/* 定义全局主题 CSS 变量（白天模式） */
page,
:root {
  --bg-color: #ffffff;
  --text-color: #000000;
  --card-bg-color: #f5f5f5;
  --border-color: #e6e6e6;
  --text-color-secondary: #828282;
  --text-color-inverse: #ffffff;
  background-color: var(--bg-color);
  color: var(--text-color);
}

/* 暗黑模式覆盖 */
.dark,
.dark page {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --card-bg-color: #2b2d36;
  --border-color: #3d3e46;
  --text-color-secondary: #aaaaaa;
  --text-color-inverse: #1a1a1a;
}
</style>
