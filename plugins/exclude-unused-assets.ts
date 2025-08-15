import type { Plugin } from 'vite'
import path from 'path'
import fs from 'fs'

export interface ExcludeUnusedAssetsOptions {
  extensions?: string[]
  srcRoot?: string
  // 从 detect-static 插件获取已检测到的资源列表
  getDetectedAssets?: () => Set<string>
  // 额外的资源检测规则
  additionalChecks?: Array<(filePath: string) => boolean>
}

export default function excludeUnusedAssets(
  options: ExcludeUnusedAssetsOptions = {}
): Plugin {
  const {
    extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
    srcRoot = 'src',
    getDetectedAssets,
    additionalChecks = [],
  } = options

  const usedAssets = new Set<string>()
  const allAssets = new Set<string>()

  return {
    name: 'exclude-unused-assets',
    enforce: 'post', // 在其他插件之后执行

    buildStart() {
      console.log('🔍 开始扫描项目中的所有静态资源...')

      // 扫描 src 目录下的所有静态资源
      const scanDirectory = (dir: string) => {
        if (!fs.existsSync(dir)) return

        const files = fs.readdirSync(dir, { withFileTypes: true })

        for (const file of files) {
          const fullPath = path.join(dir, file.name)

          if (file.isDirectory()) {
            scanDirectory(fullPath)
          } else {
            const ext = path.extname(file.name).toLowerCase()
            if (extensions.includes(ext)) {
              allAssets.add(fullPath)
            }
          }
        }
      }

      scanDirectory(srcRoot)
      console.log(`📊 发现 ${allAssets.size} 个静态资源文件`)

      // 立即从 detect-static 插件获取已使用资源
      let index = 0
      console.log('first=>>>>>>', getDetectedAssets)
      if (getDetectedAssets) {
        console.log('getDetectedAssets====' + index++, getDetectedAssets())
        const detectedAssets = getDetectedAssets()
        detectedAssets.forEach(asset => usedAssets.add(asset))
        console.log(`📦 从检测插件获取到 ${detectedAssets.size} 个已使用资源`)
      }
    },

    generateBundle(options, bundle) {
      // 1. 从 detect-static 插件获取已检测到的资源

      // 3. 执行额外的检测规则
      additionalChecks.forEach(checkFn => {
        allAssets.forEach(asset => {
          if (checkFn(asset)) {
            usedAssets.add(asset)
          }
        })
      })

      // 4. 找出未使用的资源并从 bundle 中移除
      const unusedAssets: string[] = []

      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName]
        if (chunk.type === 'asset') {
          const ext = path.extname(fileName).toLowerCase()
          if (extensions.includes(ext)) {
            // 检查这个资源是否被使用
            const isUsed = Array.from(usedAssets).some(usedAsset => {
              const usedFileName = path.basename(usedAsset)
              const bundleFileName = path.basename(fileName)
              // 考虑到 Vite 会给文件名添加 hash，所以需要模糊匹配
              return bundleFileName.includes(usedFileName.split('.')[0])
            })

            if (!isUsed) {
              unusedAssets.push(fileName)
              delete bundle[fileName]
            }
          }
        }
      })

      // 5. 输出统计信息
      console.log('\n📊 资源使用统计:')
      console.log(`总资源数: ${allAssets.size}`)
      console.log(`已使用: ${usedAssets.size}`)
      console.log(`已移除: ${unusedAssets.length}`)

      if (unusedAssets.length > 0) {
        console.log('\n🗑️  已移除的未使用资源:')
        unusedAssets.forEach(asset => {
          console.log(`  - ${asset}`)
        })
      }

      if (usedAssets.size > 0) {
        console.log('\n✅ 保留的已使用资源:')
        Array.from(usedAssets).forEach(asset => {
          console.log(`  - ${path.relative(process.cwd(), asset)}`)
        })
      }
    },

    buildEnd() {
      console.log('🔍 开始分析资源使用情况...')

      // 1. 从 detect-static 插件获取已检测到的资源
      if (getDetectedAssets) {
        const detectedAssets = getDetectedAssets()
        detectedAssets.forEach(asset => usedAssets.add(asset))
        console.log(`📦 从检测插件获取到 ${detectedAssets.size} 个已使用资源`)
      }

      // 2. 执行额外的检测规则
      additionalChecks.forEach(checkFn => {
        allAssets.forEach(asset => {
          if (checkFn(asset)) {
            usedAssets.add(asset)
          }
        })
      })

      // 3. 找出未使用的资源
      const unusedAssets: string[] = []
      allAssets.forEach(asset => {
        if (!usedAssets.has(asset)) {
          unusedAssets.push(asset)
        }
      })

      // 4. 输出统计信息
      console.log('\n📊 资源使用统计:')
      console.log(`总资源数: ${allAssets.size}`)
      console.log(`已使用: ${usedAssets.size}`)
      console.log(`未使用: ${unusedAssets.length}`)

      if (unusedAssets.length > 0) {
        console.log('\n⚠️  发现未使用的资源:')
        unusedAssets.forEach(asset => {
          console.log(`  - ${path.relative(process.cwd(), asset)}`)
        })
        console.log('\n💡 建议手动删除这些文件以减小打包体积')
      }
    },
    resolveId(id, importer) {
      const ext = path.extname(id).toLowerCase()
      if (extensions.includes(ext)) {
        let resolvedPath = id

        // 解析完整路径
        if (id.startsWith('@/')) {
          resolvedPath = path.resolve(srcRoot, id.replace('@/', ''))
        } else if (id.startsWith('./') || id.startsWith('../')) {
          resolvedPath = path.resolve(path.dirname(importer || ''), id)
        }

        resolvedPath = path.normalize(resolvedPath)

        // 检查是否为未使用资源
        if (allAssets.has(resolvedPath)) {
          // 在这里获取最新的使用情况
          if (getDetectedAssets) {
            const detectedAssets = getDetectedAssets()
            detectedAssets.forEach(asset => usedAssets.add(asset))
          }

          if (!usedAssets.has(resolvedPath)) {
            console.log(
              `🚫 阻止未使用资源: ${path.relative(process.cwd(), resolvedPath)}`
            )
            return false // 阻止资源进入打包流程
          }
        }
      }
      return null
    },
  }
}
