# UniApp HTTP 请求工具

基于 UniApp 的网络请求封装库，模仿 Axios 设计，提供完整的请求/响应拦截器、错误处理、重试机制、缓存等功能。

## 📁 文件结构

```
src/http/
├── index.ts          # 主要的HTTP请求类和导出
├── types.ts          # TypeScript类型定义
├── config.ts         # 配置文件
├── utils.ts          # 工具函数
├── examples.ts       # 使用示例
└── README.md         # 文档
```

## 🚀 特性

- ✅ **类 Axios API** - 熟悉的接口，易于使用
- ✅ **请求/响应拦截器** - 灵活的请求和响应处理
- ✅ **自动重试机制** - 支持自定义重试策略和条件
- ✅ **智能缓存系统** - 内置缓存，提升性能
- ✅ **并发控制** - 防止重复请求，优化资源使用
- ✅ **完整的错误处理** - 统一的错误处理机制
- ✅ **TypeScript 支持** - 完整的类型定义
- ✅ **环境配置** - 支持多环境配置
- ✅ **请求统计** - 内置统计和监控功能
- ✅ **文件上传/下载** - 完整的文件处理支持

## 📦 安装使用

### 基础使用

```typescript
import http, { get, post } from '@/http'

// GET 请求
const response = await get<{ list: User[] }>('/api/users')
console.log(response.data.list)

// POST 请求
const result = await post<{ id: number }>('/api/users', {
  name: '张三',
  email: 'zhangsan@example.com'
})
```

### 配置基础URL

```typescript
import http from '@/http'

// 在 main.ts 或 app.vue 中配置
http.defaults.baseURL = 'https://api.example.com'
http.defaults.timeout = 10000
```

### 添加拦截器

```typescript
// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = uni.getStorageSync('token')
    if (token) {
      config.header.Authorization = `Bearer ${token}`
    }
    return config
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    if (response.data.code !== 200) {
      throw new Error(response.data.message)
    }
    return response
  },
  (error) => {
    if (error.statusCode === 401) {
      // 处理登录过期
      uni.reLaunch({ url: '/pages/login/login' })
    }
    return Promise.reject(error)
  }
)
```

## 🔧 高级功能

### 带重试的请求

```typescript
import { getWithRetry, postWithRetry } from '@/http'

// 带重试的 GET 请求
const response = await getWithRetry('/api/important-data', {
  retries: 3,           // 重试3次
  retryDelay: 1000,     // 重试间隔1秒
  cache: true,          // 启用缓存
  cacheTTL: 300000,     // 缓存5分钟
  retryCondition: (error) => {
    return error.statusCode >= 500
  }
})
```

### 缓存控制

```typescript
// 启用缓存的请求
const response = await getWithRetry('/api/data', {
  cache: true,
  cacheTTL: 600000  // 缓存10分钟
})

// 清除缓存
http.clearCache()           // 清除所有缓存
http.clearCache('/api/')    // 清除特定模式的缓存
```

### 并发控制

```typescript
// 相同的请求会自动合并
const promise1 = get('/api/data')
const promise2 = get('/api/data')  // 复用第一个请求

// 取消请求
http.cancelRequest('/api/data')     // 取消特定请求
http.cancelAllRequests()            // 取消所有请求
```

### 创建专用实例

```typescript
import { HttpRequest } from '@/http'

const userApi = new HttpRequest({
  baseURL: 'https://user-api.example.com',
  timeout: 8000,
  header: {
    'API-Version': 'v1'
  }
})
```

## 📋 API 参考

### 请求方法

```typescript
// 基础方法
http.get<T>(url, config?)
http.post<T>(url, data?, config?)
http.put<T>(url, data?, config?)
http.delete<T>(url, config?)
http.patch<T>(url, data?, config?)

// 带重试的方法
http.getWithRetry<T>(url, config?)
http.postWithRetry<T>(url, data?, config?)

// 通用请求方法
http.request<T>(config)
http.requestWithRetry<T>(config)
```

### 配置选项

```typescript
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  params?: Record<string, any>
  header?: Record<string, string>
  timeout?: number
  baseURL?: string
  // ... 更多配置
}
```

### 重试配置

```typescript
interface RetryConfig {
  retries?: number                              // 重试次数
  retryDelay?: number                          // 重试延迟
  retryCondition?: (error: RequestError) => boolean // 重试条件
}
```

## 🛠️ 工具函数

```typescript
import { 
  serializeParams,
  buildUrl,
  formatFileSize,
  CacheManager,
  RequestStats 
} from '@/http/utils'

// URL参数序列化
const queryString = serializeParams({ page: 1, size: 10 })

// URL构建
const fullUrl = buildUrl('https://api.com', '/users', { page: 1 })

// 文件大小格式化
const sizeText = formatFileSize(1024) // "1 KB"

// 缓存管理
const cache = new CacheManager()
cache.set('key', data, 300000)
const cachedData = cache.get('key')

// 请求统计
const stats = new RequestStats()
stats.recordRequest(true, 1000)
console.log(stats.getStats())
```

## 🔧 配置文件

### 环境配置

```typescript
// config.ts
export const environmentConfig = {
  development: {
    baseURL: 'http://localhost:3000/api',
    enableLogging: true
  },
  production: {
    baseURL: 'https://api.example.com',
    enableLogging: false
  }
}
```

### 错误码映射

```typescript
export const errorCodeMap = {
  400: '请求参数错误',
  401: '未授权访问',
  403: '禁止访问',
  404: '资源不存在',
  500: '服务器内部错误'
}
```

## 📝 使用示例

### 用户API

```typescript
import { get, post } from '@/http'
import type { BaseApiResponse, UserInfo } from '@/http/types'

export const userApi = {
  // 登录
  login: (params: LoginParams) => 
    post<BaseApiResponse<LoginResponse>>('/auth/login', params),
  
  // 获取用户信息
  getUserInfo: (userId: number) => 
    get<BaseApiResponse<UserInfo>>(`/users/${userId}`),
  
  // 获取用户列表（带缓存）
  getUserList: (params: ListParams) => 
    getWithRetry<BaseApiResponse<PaginatedResponse<UserInfo>>>('/users', {
      params,
      cache: true,
      cacheTTL: 300000,
      retries: 2
    })
}
```

### 文件上传

```typescript
export async function uploadFile(filePath: string) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'https://api.example.com/upload',
      filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: resolve,
      fail: reject
    })
  })
}
```

### 错误处理

```typescript
try {
  const response = await get('/api/data')
  console.log(response.data)
} catch (error) {
  if (error.statusCode === 404) {
    console.log('资源不存在')
  } else if (error.statusCode >= 500) {
    console.log('服务器错误')
  }
}
```

## 🔍 最佳实践

1. **环境配置**: 根据不同环境设置不同的API地址
2. **错误处理**: 统一处理错误，提供用户友好的提示
3. **缓存策略**: 合理使用缓存，提升用户体验
4. **重试机制**: 对重要接口启用重试，提高成功率
5. **类型安全**: 使用TypeScript确保类型安全
6. **性能监控**: 利用内置统计功能监控API性能

## 📄 许可证

MIT License
