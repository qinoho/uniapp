/**
 * 基于uniapp的网络请求封装类
 * 模仿axios设计，支持请求/响应拦截器、错误处理、超时等功能
 */

// 请求方法类型
export type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'TRACE'
  | 'CONNECT'
// 请求配置接口
export interface RequestConfig {
  url: string
  method?: RequestMethod
  data?: any
  params?: Record<string, any>
  header?: Record<string, string>
  timeout?: number
  dataType?: 'json' | 'text' | 'base64'
  responseType?: 'text' | 'arraybuffer'
  sslVerify?: boolean
  withCredentials?: boolean
  firstIpv4?: boolean
  enableHttp2?: boolean
  enableQuic?: boolean
  enableCache?: boolean
  enableHttpDNS?: boolean
  httpDNSServiceId?: string
  enableChunked?: boolean
  forceCellularNetwork?: boolean
  enableCookie?: boolean
  cloudCache?: boolean | object
  defer?: boolean
  baseURL?: string
}

// 响应数据接口
export interface ResponseData<T = any> {
  data: T
  statusCode: number
  header: Record<string, string>
  cookies?: string[]
  errMsg?: string
}

// 请求重试配置
export interface RetryConfig {
  retries?: number
  retryDelay?: number
  retryCondition?: (error: RequestError) => boolean
}

// 拦截器接口
export interface Interceptor<T> {
  use(
    onFulfilled?: (value: T) => T | Promise<T>,
    onRejected?: (error: any) => any
  ): number
  eject(id: number): void
}

// 请求拦截器管理
class RequestInterceptorManager implements Interceptor<RequestConfig> {
  private handlers: Array<{
    fulfilled?: (value: RequestConfig) => RequestConfig | Promise<RequestConfig>
    rejected?: (error: any) => any
  }> = []

  use(
    onFulfilled?: (
      value: RequestConfig
    ) => RequestConfig | Promise<RequestConfig>,
    onRejected?: (error: any) => any
  ): number {
    this.handlers.push({
      fulfilled: onFulfilled,
      rejected: onRejected,
    })
    return this.handlers.length - 1
  }

  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = {}
    }
  }

  async forEach(fn: (handler: any) => void): Promise<void> {
    this.handlers.forEach(fn)
  }
}

// 响应拦截器管理
class ResponseInterceptorManager implements Interceptor<ResponseData> {
  private handlers: Array<{
    fulfilled?: (value: ResponseData) => ResponseData | Promise<ResponseData>
    rejected?: (error: any) => any
  }> = []

  use(
    onFulfilled?: (value: ResponseData) => ResponseData | Promise<ResponseData>,
    onRejected?: (error: any) => any
  ): number {
    this.handlers.push({
      fulfilled: onFulfilled,
      rejected: onRejected,
    })
    return this.handlers.length - 1
  }

  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = {}
    }
  }

  async forEach(fn: (handler: any) => void): Promise<void> {
    this.handlers.forEach(fn)
  }
}

// 请求错误类
export class RequestError extends Error {
  public config: RequestConfig
  public code?: string | number
  public statusCode?: number
  public response?: ResponseData

  constructor(
    message: string,
    config: RequestConfig,
    code?: string | number,
    response?: ResponseData
  ) {
    super(message)
    this.name = 'RequestError'
    this.config = config
    this.code = code
    this.statusCode = response?.statusCode
    this.response = response
  }
}

// 并发控制器
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

// 主要的请求类
export class HttpRequest {
  public defaults: RequestConfig = {
    method: 'GET',
    timeout: 10000,
    dataType: 'json',
    responseType: 'text',
    sslVerify: true,
    withCredentials: false,
    enableHttp2: false,
    enableQuic: false,
    enableCache: false,
    enableCookie: true,
    header: {
      'Content-Type': 'application/json',
    },
  }

  public interceptors = {
    request: new RequestInterceptorManager(),
    response: new ResponseInterceptorManager(),
  }

  private concurrencyController = new ConcurrencyController()
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >()

  constructor(config?: Partial<RequestConfig>) {
    if (config) {
      this.defaults = { ...this.defaults, ...config }
    }
  }

  // 合并配置
  private mergeConfig(config: RequestConfig): RequestConfig {
    const merged = { ...this.defaults, ...config }

    // 处理URL拼接
    if (merged.baseURL && merged.url && !merged.url.startsWith('http')) {
      merged.url =
        merged.baseURL.replace(/\/$/, '') + '/' + merged.url.replace(/^\//, '')
    }

    // 处理query参数
    if (merged.params && Object.keys(merged.params).length > 0) {
      const queryString = Object.keys(merged.params)
        .map(
          key =>
            `${encodeURIComponent(key)}=${encodeURIComponent(
              merged.params![key]
            )}`
        )
        .join('&')
      merged.url += (merged.url.includes('?') ? '&' : '?') + queryString
    }

    return merged
  }

  // 生成缓存key
  private generateCacheKey(config: RequestConfig): string {
    const { url, method, data, params } = config
    return `${method}:${url}:${JSON.stringify(data || {})}:${JSON.stringify(
      params || {}
    )}`
  }

  // 检查缓存
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    if (cached) {
      this.cache.delete(key)
    }
    return null
  }

  // 设置缓存
  private setCache(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  // 执行请求拦截器
  private async executeRequestInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let processedConfig = config

    await this.interceptors.request.forEach(async handler => {
      if (handler.fulfilled) {
        try {
          processedConfig = await handler.fulfilled(processedConfig)
        } catch (error) {
          if (handler.rejected) {
            await handler.rejected(error)
          }
          throw error
        }
      }
    })

    return processedConfig
  }

  // 执行响应拦截器
  private async executeResponseInterceptors(
    response: ResponseData
  ): Promise<ResponseData> {
    let processedResponse = response

    await this.interceptors.response.forEach(async handler => {
      if (handler.fulfilled) {
        try {
          processedResponse = await handler.fulfilled(processedResponse)
        } catch (error) {
          if (handler.rejected) {
            await handler.rejected(error)
          }
          throw error
        }
      }
    })

    return processedResponse
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 默认重试条件
  private defaultRetryCondition(error: RequestError): boolean {
    return (
      !error.statusCode || error.statusCode >= 500 || error.statusCode === 408
    )
  }

  // 主要的请求方法
  async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    try {
      // 合并配置
      let mergedConfig = this.mergeConfig(config)

      // 执行请求拦截器
      mergedConfig = await this.executeRequestInterceptors(mergedConfig)

      // 发起请求
      const response = await new Promise<ResponseData<T>>((resolve, reject) => {
        uni.request({
          ...mergedConfig,
          success: (res: any) => {
            const responseData: ResponseData<T> = {
              data: res.data,
              statusCode: res.statusCode,
              header: res.header,
              cookies: res.cookies,
            }
            resolve(responseData)
          },
          fail: (err: any) => {
            const error = new RequestError(
              err.errMsg || '网络请求失败',
              mergedConfig,
              err.errno,
              {
                data: null,
                statusCode: 0,
                header: {},
                errMsg: err.errMsg,
              }
            )
            reject(error)
          },
        })
      })

      // 检查HTTP状态码
      if (response.statusCode >= 400) {
        throw new RequestError(
          `HTTP Error: ${response.statusCode}`,
          mergedConfig,
          response.statusCode,
          response
        )
      }

      // 执行响应拦截器
      const processedResponse = await this.executeResponseInterceptors(response)

      return processedResponse
    } catch (error) {
      // 执行响应错误拦截器
      await this.interceptors.response.forEach(async handler => {
        if (handler.rejected) {
          try {
            await handler.rejected(error)
          } catch (interceptorError) {
            throw interceptorError
          }
        }
      })

      throw error
    }
  }

  // 带重试和缓存的请求
  async requestWithRetry<T = any>(
    config: RequestConfig & RetryConfig & { cache?: boolean; cacheTTL?: number }
  ): Promise<ResponseData<T>> {
    const {
      retries = 0,
      retryDelay = 1000,
      retryCondition,
      cache = false,
      cacheTTL = 300000,
      ...requestConfig
    } = config

    // 检查缓存
    if (cache && requestConfig.method === 'GET') {
      const cacheKey = this.generateCacheKey(requestConfig)
      const cachedData = this.getFromCache(cacheKey)
      if (cachedData) {
        return cachedData
      }
    }

    // 并发控制
    const concurrencyKey = this.generateCacheKey(requestConfig)

    return this.concurrencyController.execute(concurrencyKey, async () => {
      let lastError: RequestError

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await this.request<T>(requestConfig)

          // 设置缓存
          if (cache && requestConfig.method === 'GET') {
            const cacheKey = this.generateCacheKey(requestConfig)
            this.setCache(cacheKey, response, cacheTTL)
          }

          return response
        } catch (error) {
          lastError = error as RequestError

          // 检查是否应该重试
          if (attempt < retries) {
            const shouldRetry = retryCondition
              ? retryCondition(lastError)
              : this.defaultRetryCondition(lastError)

            if (shouldRetry) {
              await this.delay(retryDelay * Math.pow(2, attempt)) // 指数退避
              continue
            }
          }

          throw lastError
        }
      }

      throw lastError!
    })
  }

  // 便捷方法
  get<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  delete<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ResponseData<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }


  // 带重试的便捷方法
  getWithRetry<T = any>(
    url: string,
    config?: Partial<
      RequestConfig & RetryConfig & { cache?: boolean; cacheTTL?: number }
    >
  ): Promise<ResponseData<T>> {
    return this.requestWithRetry<T>({ ...config, url, method: 'GET' })
  }

  postWithRetry<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig & RetryConfig>
  ): Promise<ResponseData<T>> {
    return this.requestWithRetry<T>({ ...config, url, method: 'POST', data })
  }

  // 清除缓存
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  // 取消请求
  cancelRequest(url: string): void {
    const key = `GET:${url}:::`
    this.concurrencyController.cancel(key)
  }

  // 取消所有请求
  cancelAllRequests(): void {
    this.concurrencyController.cancelAll()
  }
}

// 创建默认实例
const http = new HttpRequest({
  baseURL: '', // 在这里设置你的API基础URL
  timeout: 10000,
  header: {
    'Content-Type': 'application/json',
  },
})

// 添加常用的请求拦截器
http.interceptors.request.use(
  config => {
    // 添加token
    const token = uni.getStorageSync('token')
    if (token) {
      config.header = {
        ...config.header,
        Authorization: `Bearer ${token}`,
      }
    }

    // 添加时间戳防止缓存
    if (config.method === 'GET') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }

    // 添加设备信息
    const systemInfo = uni.getSystemInfoSync()
    config.header = {
      ...config.header,
      'Device-Type': systemInfo.platform,
      'App-Version': systemInfo.version || '1.0.0',
      'Device-Id': systemInfo.deviceId || 'unknown',
    }

    console.log('请求发起:', config)
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 添加常用的响应拦截器
http.interceptors.response.use(
  response => {
    console.log('响应接收:', response)

    // 统一处理业务错误码
    if (
      response.data &&
      typeof response.data === 'object' &&
      'code' in response.data
    ) {
      if (response.data.code !== 200 && response.data.code !== 0) {
        throw new RequestError(
          response.data.message || '业务处理失败',
          {} as RequestConfig,
          response.data.code,
          response
        )
      }
    }

    return response
  },
  error => {
    console.error('响应错误:', error)

    // 统一错误处理
    if (error.statusCode === 401) {
      // token过期，清除本地存储并跳转登录
      uni.removeStorageSync('token')
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
      })
      // 可以在这里添加跳转到登录页的逻辑
      // uni.reLaunch({ url: '/pages/login/login' })
    } else if (error.statusCode === 403) {
      uni.showToast({
        title: '没有权限访问',
        icon: 'none',
      })
    } else if (error.statusCode >= 500) {
      uni.showToast({
        title: '服务器错误，请稍后重试',
        icon: 'none',
      })
    } else if (!error.statusCode) {
      uni.showToast({
        title: '网络连接失败',
        icon: 'none',
      })
    }

    return Promise.reject(error)
  }
)

// 导出实例和类
export default http

// 导出便捷方法
export const get = <T = any>(url: string, config?: Partial<RequestConfig>) =>
  http.get<T>(url, config)

export const post = <T = any>(
  url: string,
  data?: any,
  config?: Partial<RequestConfig>
) => http.post<T>(url, data, config)

export const put = <T = any>(
  url: string,
  data?: any,
  config?: Partial<RequestConfig>
) => http.put<T>(url, data, config)

export const del = <T = any>(url: string, config?: Partial<RequestConfig>) =>
  http.delete<T>(url, config)

export const patch = <T = any>(
  url: string,
  data?: any,
  config?: Partial<RequestConfig>
) => http.patch<T>(url, data, config)

// 带重试的便捷方法
export const getWithRetry = <T = any>(
  url: string,
  config?: Partial<
    RequestConfig & RetryConfig & { cache?: boolean; cacheTTL?: number }
  >
) => http.getWithRetry<T>(url, config)

export const postWithRetry = <T = any>(
  url: string,
  data?: any,
  config?: Partial<RequestConfig & RetryConfig>
) => http.postWithRetry<T>(url, data, config)

