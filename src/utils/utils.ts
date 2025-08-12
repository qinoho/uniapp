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

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null
  let isInvokedImmediate = false

  return function (this: any, ...args: Parameters<T>) {
    const callNow = immediate && !isInvokedImmediate

    // 清除之前的定时器
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    if (callNow) {
      // 立即执行
      func.apply(this, args)
      isInvokedImmediate = true
    }

    // 设置新的定时器
    timeoutId = setTimeout(() => {
      if (!immediate) {
        func.apply(this, args)
      }
      isInvokedImmediate = false
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 节流间隔时间（毫秒）
 * @param options 配置选项
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: {
    leading?: boolean // 是否在开始时执行
    trailing?: boolean // 是否在结束时执行
  } = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options
  let timeoutId: number | null = null
  let lastExecTime = 0
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null

  const execute = () => {
    lastExecTime = Date.now()
    timeoutId = null
    if (lastArgs) {
      func.apply(lastThis, lastArgs)
      lastArgs = null
      lastThis = null
    }
  }

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const timeSinceLastExec = now - lastExecTime

    lastArgs = args
    lastThis = this

    if (timeSinceLastExec >= delay) {
      // 如果距离上次执行已经超过延迟时间
      if (leading) {
        execute()
      } else {
        lastExecTime = now
        if (trailing && timeoutId === null) {
          timeoutId = setTimeout(execute, delay)
        }
      }
    } else {
      // 如果还在延迟时间内
      if (trailing && timeoutId === null) {
        const remainingTime = delay - timeSinceLastExec
        timeoutId = setTimeout(execute, remainingTime)
      }
    }
  }
}

/**
 * 简化版节流函数（常用于滚动事件）
 * @param func 要节流的函数
 * @param delay 节流间隔时间（毫秒），默认16ms（约60fps）
 * @returns 节流后的函数
 */
export function throttleScroll<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 16
): (...args: Parameters<T>) => void {
  return throttle(func, delay, { leading: true, trailing: true })
}
