/**
 * HTTP请求配置文件
 */

import type { RequestConfig, EnvironmentConfig } from './types'

// 环境配置
export const environmentConfig: EnvironmentConfig = {
  development: {
    baseURL: 'http://localhost:3000/api',
    enableLogging: true,
    enableMock: false
  },
  production: {
    baseURL: 'https://api.example.com',
    enableLogging: false,
    enableMock: false
  },
  testing: {
    baseURL: 'https://test-api.example.com',
    enableLogging: true,
    enableMock: true
  }
}

// 获取当前环境配置
export function getCurrentEnvConfig() {
  const env = process.env.NODE_ENV || 'development'
  return environmentConfig[env as keyof EnvironmentConfig]
}

// 默认请求配置
export const defaultConfig: Partial<RequestConfig> = {
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
    'Accept': 'application/json'
  }
}

// 重试配置
export const retryConfig = {
  retries: 3,
  retryDelay: 1000,
  maxRetryDelay: 10000,
  retryCondition: (error: any) => {
    // 网络错误或5xx服务器错误时重试
    return !error.statusCode || error.statusCode >= 500
  }
}

// 缓存配置
export const cacheConfig = {
  defaultTTL: 300000, // 5分钟
  maxCacheSize: 100,  // 最大缓存条目数
  enableCache: true
}

// 并发控制配置
export const concurrencyConfig = {
  maxConcurrent: 10,
  queueTimeout: 30000
}

// 安全配置
export const securityConfig = {
  enableCSRF: false,
  csrfTokenHeader: 'X-CSRF-Token',
  enableEncryption: false,
  enableSignature: false
}

// 日志配置
export const logConfig = {
  enableConsole: true,
  enableStorage: false,
  maxStorageSize: 1024 * 1024, // 1MB
  enableRemote: false
}

// 性能监控配置
export const performanceConfig = {
  enableTiming: true,
  enableMemoryUsage: false,
  enableNetworkUsage: false,
  reportInterval: 60000 // 1分钟
}

// 错误码映射
export const errorCodeMap = {
  400: '请求参数错误',
  401: '未授权访问',
  403: '禁止访问',
  404: '资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  409: '资源冲突',
  422: '请求参数验证失败',
  429: '请求过于频繁',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时'
}

// 业务错误码映射
export const businessErrorCodeMap = {
  10001: '用户不存在',
  10002: '密码错误',
  10003: '账号已被锁定',
  10004: '验证码错误',
  10005: '验证码已过期',
  20001: '权限不足',
  20002: '资源不存在',
  20003: '操作失败',
  30001: '参数错误',
  30002: '数据格式错误',
  30003: '数据验证失败'
}

// 获取错误信息
export function getErrorMessage(code: number, defaultMessage?: string): string {
  return errorCodeMap[code as keyof typeof errorCodeMap] || 
         businessErrorCodeMap[code as keyof typeof businessErrorCodeMap] || 
         defaultMessage || 
         '未知错误'
}

// 请求头配置
export const headerConfig = {
  common: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  get: {},
  post: {
    'Content-Type': 'application/json'
  },
  put: {
    'Content-Type': 'application/json'
  },
  delete: {},
  patch: {
    'Content-Type': 'application/json'
  }
}

// API版本配置
export const apiVersionConfig = {
  default: 'v1',
  user: 'v2',
  order: 'v1',
  payment: 'v3'
}

// 接口地址配置
export const apiEndpoints = {
  // 用户相关
  user: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    profile: '/user/profile',
    list: '/users',
    detail: '/users/:id',
    update: '/users/:id',
    delete: '/users/:id'
  },
  
  // 文件相关
  file: {
    upload: '/files/upload',
    download: '/files/download/:id',
    delete: '/files/:id'
  },
  
  // 系统相关
  system: {
    config: '/system/config',
    health: '/system/health',
    version: '/system/version'
  }
}

// 构建完整的API地址
export function buildApiUrl(category: string, action: string, params?: Record<string, any>): string {
  const endpoints = apiEndpoints as any
  let url = endpoints[category]?.[action]
  
  if (!url) {
    throw new Error(`API endpoint not found: ${category}.${action}`)
  }
  
  // 替换路径参数
  if (params) {
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key])
    })
  }
  
  return url
}

// Mock数据配置
export const mockConfig = {
  enabled: false,
  delay: 1000,
  successRate: 0.9,
  responses: {
    '/api/users': {
      code: 200,
      message: 'success',
      data: {
        list: [
          { id: 1, name: '张三', email: 'zhangsan@example.com' },
          { id: 2, name: '李四', email: 'lisi@example.com' }
        ],
        total: 2
      }
    },
    '/api/auth/login': {
      code: 200,
      message: 'success',
      data: {
        token: 'mock-token-123456',
        userInfo: {
          id: 1,
          name: '张三',
          email: 'zhangsan@example.com'
        }
      }
    }
  }
}

// 导出合并后的配置
export const httpConfig = {
  ...defaultConfig,
  ...getCurrentEnvConfig(),
  retry: retryConfig,
  cache: cacheConfig,
  concurrency: concurrencyConfig,
  security: securityConfig,
  log: logConfig,
  performance: performanceConfig,
  headers: headerConfig,
  apiVersion: apiVersionConfig,
  endpoints: apiEndpoints,
  mock: mockConfig
}

export default httpConfig
