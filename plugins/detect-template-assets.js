import { parse } from '@vue/compiler-sfc'
import path from 'path'

export default function detectTemplateAssets(options = {}) {
  const { extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'] } = options
  const detectedAssets = new Set()

  return {
    name: 'detect-template-assets',
    enforce:'pre',
    transform(code, id) {
      // 只处理 .vue 文件
      if (!id.endsWith('.vue')) return
      try {
        const { descriptor } = parse(code)
        const template = descriptor.template?.content

        if (template) {
          // 检测静态 src 属性（排除动态绑定）
          const staticSrcRegex = /(?<!:)src\s*=\s*["']([^"']+)["']/g
          // 检测 background-image 等 CSS 中的资源
          const urlRegex = /url\s*\(\s*["']?([^"')]+)["']?\s*\)/g
          // 检测动态绑定 :src
          const dynamicSrcRegex = /:src\s*=\s*["']([^"']+)["']/g

          let match

          console.log(template)
          console.log('检测=》》',staticSrcRegex.exec(template))
          // console.log("id=>>>>>>", id)
          // 检测静态 src
          // while ((match = srcRegex.exec(template)) !== null) {
          //   const assetPath = match[1]
          //   if (this.isStaticAsset(assetPath, extensions)) {
          //     detectedAssets.add(assetPath)
          //     console.log(`📦 检测到静态资源: ${assetPath} (在 ${id})`)
          //   }
          // }

          // // 检测 CSS url()
          // while ((match = urlRegex.exec(template)) !== null) {
          //   const assetPath = match[1]
          //   if (this.isStaticAsset(assetPath, extensions)) {
          //     detectedAssets.add(assetPath)
          //     console.log(`📦 检测到CSS资源: ${assetPath} (在 ${id})`)
          //   }
          // }

          // // 检测动态绑定
          // while ((match = dynamicSrcRegex.exec(template)) !== null) {
          //   const bindingValue = match[1]
          //   console.log(`⚠️  检测到动态绑定: ${bindingValue} (在 ${id}) - 需要手动检查`)
          // }
        }
      } catch (error) {
        console.warn(`解析 Vue 文件失败: ${id}`, error)
      }
    },

    buildStart() {
      console.log('🔍 开始检测模板中的静态资源...')
      detectedAssets.clear()
    },

    buildEnd() {
      console.log('\n📊 检测结果汇总:')
      console.log(`共检测到 ${detectedAssets.size} 个静态资源:`)
      detectedAssets.forEach(asset => {
        console.log(`  - ${asset}`)
      })
    },

    isStaticAsset(assetPath, extensions) {
      // 排除外部链接和数据URL
      if (assetPath.startsWith('http') || assetPath.startsWith('data:')) {
        return false
      }

      const ext = path.extname(assetPath).toLowerCase()
      return extensions.includes(ext)
    }
  }
}
