import { getSystemInfo, getMenuButtonBoundingClientRect } from './systemInfo'

// 系统参数接口
interface SystemInfoInterface {
  px: number // rpx换算px的比例
  rpx: number // px换算rpx的比例
  scrollHeight: number // 可使用窗口高度
  statusBarHeight: number // 状态栏高度
  screenHeight: number // 屏幕高度
  screenWidth: number // 屏幕宽度
  bottomHeight: number // 苹果手机底部bottom高度
  platform: string // 客户端平台
  navBarHeight: number // 顶部导航高度
  menuButtonHeight: number // 右上角胶囊高
  menuButtonWidth: number // 右上角胶囊宽
  safeAreaInsets: UniApp.SafeAreaInsets | undefined
  safeArea: UniApp.SafeArea | undefined
}

/**
 * 获取系统信息
 * @returns Promise<SystemInfoInterface>
 */
export async function getSystemInfoFn(): Promise<SystemInfoInterface> {
  try {
    const systemInfo = await getSystemInfo()
    const menuButtonInfo = getMenuButtonBoundingClientRect()

    // 计算rpx和px的换算比例
    const screenWidth = systemInfo.screenWidth
    const px = screenWidth / 750 // 750是设计稿宽度
    const rpx = 750 / screenWidth

    // 计算可使用窗口高度
    const scrollHeight = systemInfo.windowHeight

    // 计算底部安全区域高度（主要针对iPhone X及以上机型）
    let bottomHeight = 0
    if (systemInfo.safeAreaInsets) {
      bottomHeight = systemInfo.safeAreaInsets.bottom
    } else if (systemInfo.safeArea) {
      bottomHeight = systemInfo.screenHeight - systemInfo.safeArea.bottom
    }

    // 计算顶部导航高度
    const navBarHeight =
      (menuButtonInfo.top - Number(systemInfo.statusBarHeight)) * 2 +
      menuButtonInfo.height +
      Number(systemInfo.statusBarHeight)

    return {
      px,
      rpx,
      scrollHeight,
      statusBarHeight: systemInfo.statusBarHeight || 0,
      screenHeight: systemInfo.screenHeight || 0,
      screenWidth: systemInfo.screenWidth || 0,
      bottomHeight,
      platform: systemInfo.platform || '',
      navBarHeight,
      menuButtonHeight: menuButtonInfo.height,
      menuButtonWidth: menuButtonInfo.width,
      safeAreaInsets: systemInfo.safeAreaInsets,
      safeArea: systemInfo.safeArea,
    }
  } catch (error) {
    console.error('获取系统参数失败:', error)
    throw error
  }
}

/**
 * 同步获取rpx转px（需要先调用getSystemParams初始化）
 * @param rpxValue rpx值
 * @param px 换算比例
 * @returns px值
 */
export function rpxToPxSync(rpxValue: number, px: number): number {
  return rpxValue * px
}

/**
 * 同步获取px转rpx（需要先调用getSystemParams初始化）
 * @param pxValue px值
 * @param rpx 换算比例
 * @returns rpx值
 */
export function pxToRpxSync(pxValue: number, rpx: number): number {
  return pxValue * rpx
}
