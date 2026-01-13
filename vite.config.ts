import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// import detectTemplateAssets from './plugins/detect-static.js'
// import excludeUnusedAssets from './plugins/exclude-unused-assets.js'
import { detectStatic } from 'tinyplugins'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    detectStatic({
      extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
      srcRoot: 'src',
      enableReplace: true,
      replacementFn: (originalPath, resolvedPath) => {
        console.log('-------------------------------------------', originalPath)
        const str = originalPath.replace(111, 333)
        console.log('=====================', str)
        return str
      },
    }),
  ],
})

