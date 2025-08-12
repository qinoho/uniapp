/**
 * 网络请求相关类型定义
 */

// 扩展uniapp的请求类型
declare namespace UniApp {
  interface RequestOptions {
    cloudCache?: boolean | object
    defer?: boolean
  }
}

// 通用API响应格式
export interface BaseApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
  traceId?: string
}

// 分页响应格式
export interface PaginatedResponse<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 文件上传响应
export interface UploadResponse {
  url: string
  filename: string
  size: number
  type: string
  hash?: string
}

// 错误响应格式
export interface ErrorResponse {
  code: number
  message: string
  details?: any
  timestamp: number
}

// 请求状态枚举
export enum RequestStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

// 缓存策略枚举
export enum CacheStrategy {
  NO_CACHE = 'no-cache',
  CACHE_FIRST = 'cache-first',
  NETWORK_FIRST = 'network-first',
  CACHE_ONLY = 'cache-only',
  NETWORK_ONLY = 'network-only',
}

// 重试策略配置
export interface RetryStrategy {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
  jitter: boolean
}

// 请求监控数据
export interface RequestMetrics {
  url: string
  method: string
  startTime: number
  endTime: number
  duration: number
  statusCode: number
  success: boolean
  retryCount: number
  fromCache: boolean
}

// 全局配置接口
export interface GlobalConfig {
  baseURL: string
  timeout: number
  retryStrategy: RetryStrategy
  cacheStrategy: CacheStrategy
  enableMetrics: boolean
  enableLogging: boolean
  headers: Record<string, string>
}

// 拦截器函数类型
export type RequestInterceptorFn = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>
export type ResponseInterceptorFn = (
  response: ResponseData
) => ResponseData | Promise<ResponseData>
export type ErrorInterceptorFn = (error: any) => any

// 请求队列项
export interface QueueItem {
  id: string
  config: RequestConfig
  resolve: (value: any) => void
  reject: (reason: any) => void
  timestamp: number
  priority: number
}

// 并发控制配置
export interface ConcurrencyConfig {
  maxConcurrent: number
  queueTimeout: number
  priorityQueue: boolean
}

// 缓存项接口
export interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
  etag?: string
  lastModified?: string
}

// 网络状态
export interface NetworkStatus {
  isConnected: boolean
  networkType: string
  isWifi: boolean
  isCellular: boolean
}

// 请求统计信息
export interface RequestStats {
  totalRequests: number
  successRequests: number
  errorRequests: number
  averageResponseTime: number
  cacheHitRate: number
  retryRate: number
}

// 环境配置
export interface EnvironmentConfig {
  development: {
    baseURL: string
    enableLogging: boolean
    enableMock: boolean
  }
  production: {
    baseURL: string
    enableLogging: boolean
    enableMock: boolean
  }
  testing: {
    baseURL: string
    enableLogging: boolean
    enableMock: boolean
  }
}

// Mock配置
export interface MockConfig {
  enabled: boolean
  delay: number
  successRate: number
  responses: Record<string, any>
}

// 请求生命周期钩子
export interface RequestHooks {
  beforeRequest?: (config: RequestConfig) => void
  afterResponse?: (response: ResponseData) => void
  onError?: (error: any) => void
  onRetry?: (attempt: number, error: any) => void
  onCache?: (key: string, data: any) => void
}

// 安全配置
export interface SecurityConfig {
  enableCSRF: boolean
  csrfTokenHeader: string
  enableEncryption: boolean
  encryptionKey: string
  enableSignature: boolean
  signatureSecret: string
}

// 日志级别
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// 日志配置
export interface LogConfig {
  level: LogLevel
  enableConsole: boolean
  enableStorage: boolean
  maxStorageSize: number
  enableRemote: boolean
  remoteEndpoint?: string
}

// 性能监控配置
export interface PerformanceConfig {
  enableTiming: boolean
  enableMemoryUsage: boolean
  enableNetworkUsage: boolean
  reportInterval: number
  reportEndpoint?: string
}

// 请求适配器接口
export interface RequestAdapter {
  name: string
  support: (config: RequestConfig) => boolean
  request: (config: RequestConfig) => Promise<ResponseData>
}

// 插件接口
export interface RequestPlugin {
  name: string
  install: (instance: any) => void
  uninstall?: (instance: any) => void
}

// 中间件接口
export interface RequestMiddleware {
  name: string
  priority: number
  process: (
    config: RequestConfig,
    next: () => Promise<ResponseData>
  ) => Promise<ResponseData>
}

// 请求转换器
export interface RequestTransformer {
  request?: (data: any, headers: Record<string, string>) => any
  response?: (data: any) => any
}

// 响应验证器
export interface ResponseValidator {
  validate: (response: ResponseData) => boolean
  message?: string
}

// 请求调度器配置
export interface SchedulerConfig {
  strategy: 'fifo' | 'lifo' | 'priority'
  maxQueueSize: number
  queueTimeout: number
  batchSize: number
  batchTimeout: number
}

// 断路器配置
export interface CircuitBreakerConfig {
  enabled: boolean
  failureThreshold: number
  recoveryTimeout: number
  monitoringPeriod: number
}

// 限流配置
export interface RateLimitConfig {
  enabled: boolean
  maxRequests: number
  timeWindow: number
  strategy: 'sliding' | 'fixed'
}

// 健康检查配置
export interface HealthCheckConfig {
  enabled: boolean
  endpoint: string
  interval: number
  timeout: number
  retries: number
}

// 导出所有类型
export * from '.'

