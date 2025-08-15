import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

import detectTemplateAssets from './plugins/detect-static.js'
import excludeUnusedAssets from './plugins/exclude-unused-assets.js'
// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'public',
  assetsInclude: ['src/staticfile/*'],
  plugins: [
    (() => {
      const detectPlugin = detectTemplateAssets({
        extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
        srcRoot: 'src',
        enableReplace: false,
        replacementFn: (originalPath, resolvedPath) => {
          if (originalPath.includes('logo.png')) {
            return 'https://cdn.example.com/logo.png'
          }
          return null
        },
      })

      return [
        detectPlugin,
        excludeUnusedAssets({
          extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
          srcRoot: 'src',
          getDetectedAssets: detectPlugin.getDetectedAssets,
          additionalChecks: [
            // 额外的检测规则，比如检查某些特殊文件
            filePath => {
              return filePath.includes('always-keep')
            },
          ],
        }),
      ]
    })(),
    uni(),
  ],
})

