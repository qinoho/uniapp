export default function injectToast() {
  return {
    name: 'vite-plugin-inject-toast',
    enforce: 'pre',
    transform(code: string, id: string) {
      // 统一路径分隔符为正斜杠，兼容 Windows
      const normalizedId = id.replace(/\\/g, '/')

      // 只处理 src/pages 目录下的 vue 文件，且排除 node_modules
      if (
        !normalizedId.includes('node_modules') &&
        normalizedId.includes('/src/pages/') &&
        normalizedId.endsWith('.vue')
      ) {
        console.log('Transforming:', normalizedId)
        // 查找最后一个 </template> 标签的位置
        const lastTemplateIndex = code.lastIndexOf('</template>')
        if (lastTemplateIndex !== -1) {
          // 在最后一个 </template> 标签前插入自定义组件
          const res =
            code.slice(0, lastTemplateIndex) +
            `  <uni-toast ref="uToast" />\n` +
            code.slice(lastTemplateIndex)
          return {
            code: res,
            map: null, // 暂不处理 sourcemap
          }
        }
      }
    },
  }
}
