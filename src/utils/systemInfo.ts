// 系统信息接口（使用UniApp的GetSystemInfoResult类型）
type SystemInfo = UniApp.GetSystemInfoResult

// 胶囊按钮信息接口
interface MenuButtonInfo {
  width: number
  height: number
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * 获取系统信息
 * @returns Promise<SystemInfo>
 */
export function getSystemInfo(): Promise<SystemInfo> {
  return new Promise((resolve, reject) => {
    uni.getSystemInfo({
      success: res => {
        resolve(res)
      },
      fail: err => {
        reject(err)
      },
    })
  })
}

/**
 * 获取胶囊按钮信息
 * @returns MenuButtonInfo
 */
export function getMenuButtonBoundingClientRect(): MenuButtonInfo {
  // #ifdef MP-WEIXIN
  return uni.getMenuButtonBoundingClientRect()
  // #endif

  // #ifdef H5 || APP-PLUS
  // 非微信小程序环境返回默认值（APP-PLUS环境下，胶囊按钮信息获取失败，返回默认值）
  return {
    width: 0,
    height: 88,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }
  // #endif
}
