/**
 * HTTP请求工具函数
 */

import type { RequestConfig, ResponseData } from './index'
import { getErrorMessage } from './config'

// URL参数序列化
export function serializeParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })
  
  return searchParams.toString()
}

// URL拼接
export function buildUrl(baseURL: string, url: string, params?: Record<string, any>): string {
  let fullUrl = url
  
  // 拼接baseURL
  if (baseURL && !url.startsWith('http')) {
    fullUrl = baseURL.replace(/\/$/, '') + '/' + url.replace(/^\//, '')
  }
  
  // 添加查询参数
  if (params && Object.keys(params).length > 0) {
    const queryString = serializeParams(params)
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
    }
  }
  
  return fullUrl
}

// 深度合并对象
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  const source = sources.shift()
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  
  return deepMerge(target, ...sources)
}

// 判断是否为对象
export function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

// 生成唯一ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 重试函数
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries: number
    delay: number
    backoff?: number
    condition?: (error: any) => boolean
  }
): Promise<T> {
  const { retries, delay, backoff = 2, condition } = options
  
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && (!condition || condition(error))) {
      await sleep(delay)
      return retry(fn, {
        retries: retries - 1,
        delay: delay * backoff,
        backoff,
        condition
      })
    }
    throw error
  }
}

// 睡眠函数
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 超时包装器
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ])
}

// 并发控制
export class ConcurrencyLimiter {
  private running = 0
  private queue: Array<() => void> = []
  
  constructor(private limit: number) {}
  
  async run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.running--
          this.processQueue()
        }
      })
      
      this.processQueue()
    })
  }
  
  private processQueue() {
    if (this.running < this.limit && this.queue.length > 0) {
      const next = this.queue.shift()
      if (next) next()
    }
  }
}

// 缓存管理器
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  has(key: string): boolean {
    return this.get(key) !== null
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    return this.cache.size
  }
  
  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// 请求统计器
export class RequestStats {
  private stats = {
    total: 0,
    success: 0,
    error: 0,
    totalTime: 0,
    cacheHits: 0,
    retries: 0
  }
  
  recordRequest(success: boolean, duration: number, fromCache = false, retryCount = 0): void {
    this.stats.total++
    this.stats.totalTime += duration
    
    if (success) {
      this.stats.success++
    } else {
      this.stats.error++
    }
    
    if (fromCache) {
      this.stats.cacheHits++
    }
    
    if (retryCount > 0) {
      this.stats.retries += retryCount
    }
  }
  
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.total > 0 ? this.stats.success / this.stats.total : 0,
      errorRate: this.stats.total > 0 ? this.stats.error / this.stats.total : 0,
      averageTime: this.stats.total > 0 ? this.stats.totalTime / this.stats.total : 0,
      cacheHitRate: this.stats.total > 0 ? this.stats.cacheHits / this.stats.total : 0,
      retryRate: this.stats.total > 0 ? this.stats.retries / this.stats.total : 0
    }
  }
  
  reset(): void {
    this.stats = {
      total: 0,
      success: 0,
      error: 0,
      totalTime: 0,
      cacheHits: 0,
      retries: 0
    }
  }
}

// 网络状态检测
export function getNetworkStatus(): Promise<UniApp.GetNetworkTypeSuccess> {
  return new Promise((resolve, reject) => {
    uni.getNetworkType({
      success: resolve,
      fail: reject
    })
  })
}

// 检查网络连接
export async function isNetworkAvailable(): Promise<boolean> {
  try {
    const networkInfo = await getNetworkStatus()
    return networkInfo.networkType !== 'none'
  } catch {
    return false
  }
}

// 格式化错误信息
export function formatError(error: any): string {
  if (error.statusCode) {
    return getErrorMessage(error.statusCode, error.message)
  }
  
  if (error.code) {
    return getErrorMessage(error.code, error.message)
  }
  
  return error.message || '未知错误'
}

// 创建请求签名
export function createSignature(data: any, secret: string): string {
  // 这里可以实现具体的签名算法，比如HMAC-SHA256
  const timestamp = Date.now()
  const nonce = generateId()
  const signString = `${JSON.stringify(data)}${timestamp}${nonce}${secret}`
  
  // 简单的hash实现，实际项目中应该使用更安全的算法
  let hash = 0
  for (let i = 0; i < signString.length; i++) {
    const char = signString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16)
}

// 验证响应数据
export function validateResponse(response: ResponseData, validator?: (data: any) => boolean): boolean {
  if (!response || typeof response !== 'object') {
    return false
  }
  
  if (response.statusCode < 200 || response.statusCode >= 300) {
    return false
  }
  
  if (validator && !validator(response.data)) {
    return false
  }
  
  return true
}

// 导出所有工具函数
export default {
  serializeParams,
  buildUrl,
  deepMerge,
  isObject,
  generateId,
  formatFileSize,
  formatDuration,
  debounce,
  throttle,
  retry,
  sleep,
  withTimeout,
  ConcurrencyLimiter,
  CacheManager,
  RequestStats,
  getNetworkStatus,
  isNetworkAvailable,
  formatError,
  createSignature,
  validateResponse
}
