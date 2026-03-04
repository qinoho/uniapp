/**
 * 基于 uni-app 的网络请求封装类
 * 支持请求/响应拦截器、错误处理、重试、缓存控制及并发控制
 */

// ===================== 类型定义 =====================

export type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'TRACE'
  | 'CONNECT'

export interface RequestConfig {
  url: string
  method?: RequestMethod
  data?: any
  params?: Record<string, any>
  header?: Record<string, string>
  timeout?: number
  dataType?: 'json' | 'text' | 'base64'
  responseType?: 'text' | 'arraybuffer'
  baseURL?: string
  // 扩展配置
  cache?: boolean
  cacheTTL?: number
  retries?: number
  retryDelay?: number
  retryCondition?: (error: RequestError) => boolean
  [key: string]: any
}

export interface ResponseData<T = any> {
  data: T
  statusCode: number
  header: Record<string, string>
  cookies?: string[]
  errMsg?: string
  config: RequestConfig
}

export interface RetryConfig {
  retries?: number
  retryDelay?: number
  retryCondition?: (error: RequestError) => boolean
}

// ===================== 拦截器类型 =====================

interface RequestInterceptorHandler {
  onFulfilled?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  onRejected?: (error: any) => any
}

interface ResponseInterceptorHandler {
  onFulfilled?: (response: ResponseData) => ResponseData | Promise<ResponseData>
  onRejected?: (error: any) => any
}

interface InterceptorManager<H> {
  handlers: Array<H | null>
  use(onFulfilled?: H['onFulfilled' & keyof H], onRejected?: H['onRejected' & keyof H]): number
  eject(id: number): void
}

function createInterceptorManager<
  H extends { onFulfilled?: any; onRejected?: any },
>(): InterceptorManager<H> {
  const handlers: Array<H | null> = []
  return {
    handlers,
    use(onFulfilled?: any, onRejected?: any): number {
      handlers.push({ onFulfilled, onRejected } as H)
      return handlers.length - 1
    },
    eject(id: number): void {
      if (handlers[id]) handlers[id] = null
    },
  }
}

// ===================== 辅助类 =====================

/**
 * 并发控制器：防止完全相同的请求同时发出，直接复用 Promise
 */
class ConcurrencyController {
  private pending: Map<string, Promise<any>> = new Map()

  async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key)!
    }

    const promise = fn().finally(() => {
      this.pending.delete(key)
    })

    this.pending.set(key, promise)
    return promise
  }

  cancel(key: string): void {
    this.pending.delete(key)
  }

  cancelAll(): void {
    this.pending.clear()
  }
}

/**
 * 请求错误类
 */
export class RequestError extends Error {
  public config: RequestConfig
  public code?: string | number
  public statusCode?: number
  public response?: ResponseData

  constructor(
    message: string,
    config: RequestConfig,
    code?: string | number,
    response?: ResponseData,
  ) {
    super(message)
    this.name = 'RequestError'
    this.config = config
    this.code = code
    this.statusCode = response?.statusCode
    this.response = response
  }
}

// ===================== 主类封装 =====================

export class HttpRequest {
  public defaults: Partial<RequestConfig> = {
    method: 'GET',
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
    },
    baseURL: '',
  }

  public interceptors = {
    request: createInterceptorManager<RequestInterceptorHandler>(),
    response: createInterceptorManager<ResponseInterceptorHandler>(),
  }

  private concurrencyController = new ConcurrencyController()
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly MAX_CACHE_SIZE = 100

  constructor(config?: Partial<RequestConfig>) {
    if (config) {
      this.defaults = this.deepMerge(this.defaults, config)
    }
  }

  /**
   * 基础请求方法
   */
  async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    let mergedConfig = this.mergeConfig(config)

    // 1. 执行请求拦截器 (异步串行)
    try {
      for (const handler of this.interceptors.request.handlers) {
        if (handler?.onFulfilled) {
          mergedConfig = await handler.onFulfilled(mergedConfig)
        }
      }
    } catch (error) {
      return this.handleResponseError(error, mergedConfig)
    }

    // 2. 发起真实请求
    try {
      const response = await this.dispatchRequest<T>(mergedConfig)

      // 3. 执行响应拦截器 (异步串行)
      let processedResponse: ResponseData<any> = response
      for (const handler of this.interceptors.response.handlers) {
        if (handler?.onFulfilled) {
          processedResponse = await handler.onFulfilled(processedResponse)
        }
      }
      return processedResponse as ResponseData<T>
    } catch (error) {
      return this.handleResponseError(error, mergedConfig)
    }
  }

  /**
   * 带重试和缓存逻辑的高阶请求
   */
  async requestWithRetry<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    const {
      cache = false,
      cacheTTL = 300000,
      retries = 0,
      retryDelay = 1000,
      retryCondition,
    } = { ...this.defaults, ...config }

    // 处理缓存
    if (cache && config.method === 'GET') {
      const cacheKey = this.generateCacheKey(config)
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }

    // 处理并发控制
    const concurrencyKey = this.generateCacheKey(config)

    return this.concurrencyController.execute(concurrencyKey, async () => {
      let lastError: any
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await this.request<T>(config)
          // 成功则缓存
          if (cache && config.method === 'GET') {
            this.setCache(this.generateCacheKey(config), response, cacheTTL)
          }
          return response
        } catch (error) {
          lastError = error
          const shouldRetry =
            attempt < retries &&
            (retryCondition
              ? retryCondition(error as RequestError)
              : this.defaultRetryCondition(error as RequestError))
          if (shouldRetry) {
            const delayTime = retryDelay * Math.pow(2, attempt)
            await new Promise(resolve => setTimeout(resolve, delayTime))
            continue
          }
          throw lastError
        }
      }
      throw lastError
    })
  }

  // ===================== 内部私有方法 =====================

  private async dispatchRequest<T>(config: RequestConfig): Promise<ResponseData<T>> {
    return new Promise((resolve, reject) => {
      // 剔除内部使用的扩展字段，避免传给 uni.request
      const {
        baseURL: _baseURL,
        cache: _cache,
        cacheTTL: _cacheTTL,
        retries: _retries,
        retryDelay: _retryDelay,
        retryCondition: _retryCondition,
        _t,
        ...uniConfig
      } = config

      uni.request({
        ...uniConfig,
        success: (res: any) => {
          const response: ResponseData<T> = {
            data: res.data,
            statusCode: res.statusCode,
            header: res.header,
            cookies: res.cookies,
            config,
          }
          if (res.statusCode >= 400) {
            reject(
              new RequestError(`HTTP Error: ${res.statusCode}`, config, res.statusCode, response),
            )
          } else {
            resolve(response)
          }
        },
        fail: (err: any) => {
          reject(new RequestError(err.errMsg || 'Network Error', config, err.errno))
        },
      })
    })
  }

  private async handleResponseError(error: any, config: RequestConfig): Promise<any> {
    for (const handler of this.interceptors.response.handlers) {
      if (handler?.onRejected) {
        try {
          await handler.onRejected(error)
        } catch (innerError) {
          error = innerError
        }
      }
    }
    return Promise.reject(error)
  }

  private mergeConfig(config: RequestConfig): RequestConfig {
    const merged = this.deepMerge(this.defaults, config) as RequestConfig

    // URL 校验与拼接
    if (!merged.url) throw new RequestError('Request URL is required', merged)

    if (merged.baseURL && !merged.url.startsWith('http')) {
      const base = merged.baseURL.replace(/\/$/, '')
      const path = merged.url.replace(/^\//, '')
      merged.url = `${base}/${path}`
    }

    // Params 序列化 (排除 null/undefined)
    if (merged.params) {
      const parts: string[] = []
      Object.keys(merged.params).forEach(key => {
        const val = merged.params![key]
        if (val === null || typeof val === 'undefined') return
        if (Array.isArray(val)) {
          val.forEach(v => parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`))
        } else {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
        }
      })
      if (parts.length > 0) {
        merged.url += (merged.url.includes('?') ? '&' : '?') + parts.join('&')
      }
    }

    return merged
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target }
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = { ...target[key], ...source[key] }
      } else {
        result[key] = source[key]
      }
    }
    return result
  }

  private generateCacheKey(config: RequestConfig): string {
    const { url, method, data, params } = config
    const filteredParams = params ? { ...params } : {}
    delete filteredParams._t
    return `${method}:${url}:${JSON.stringify(data || {})}:${JSON.stringify(filteredParams)}`
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any, ttl: number): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      } else {
        throw new Error('Cache is full')
      }
    }
    this.cache.set(key, { data, timestamp: Date.now(), ttl })
  }

  private defaultRetryCondition(error: RequestError): boolean {
    return !error.statusCode || error.statusCode >= 500 || error.statusCode === 408
  }

  // ===================== 公共便捷方法 =====================

  get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>,
  ): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }

  getWithRetry<T = any>(url: string, config?: Partial<RequestConfig>): Promise<ResponseData<T>> {
    return this.requestWithRetry<T>({ ...config, url, method: 'GET' })
  }

  postWithRetry<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>,
  ): Promise<ResponseData<T>> {
    return this.requestWithRetry<T>({ ...config, url, method: 'POST', data })
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) this.cache.delete(key)
      }
    } else {
      this.cache.clear()
    }
  }
}

// ===================== 导出实例 =====================

const request = new HttpRequest({
  baseURL: import.meta.env.DEV ? '' : '', // 按需设置生产环境 baseURL
  timeout: 10000,
})

// 预设拦截器：Token 注入
request.interceptors.request.use((config: RequestConfig) => {
  const token = uni.getStorageSync('token')
  if (token) {
    config.header = {
      ...config.header,
      Authorization: `Bearer ${token}`,
    }
  }

  // 开发环境下打印日志
  if (import.meta.env.DEV) {
    console.log(`[Request] ${config.method} ${config.url}`, config)
  }

  return config
})

// 预设拦截器：基础错误处理
request.interceptors.response.use(
  (response: ResponseData) => {
    if (import.meta.env.DEV) {
      console.log(`[Response] ${response.config.method} ${response.config.url}`, response)
    }
    return response
  },
  (error: any) => {
    const { statusCode } = error
    if (statusCode === 401) {
      uni.removeStorageSync('token')
      uni.showToast({ title: '登录已过期', icon: 'none' })
    } else if (statusCode >= 500) {
      uni.showToast({ title: '服务器开小差了', icon: 'none' })
    }
    return Promise.reject(error)
  },
)

export default request
export const get = request.get.bind(request)
export const post = request.post.bind(request)
export const put = request.put.bind(request)
export const del = request.delete.bind(request)
export const getWithRetry = request.getWithRetry.bind(request)
export const postWithRetry = request.postWithRetry.bind(request)

