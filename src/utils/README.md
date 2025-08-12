# UniApp 网络请求工具

基于 uniapp 的网络请求封装类，模仿 axios 设计，提供完整的请求/响应拦截器、错误处理、重试机制、缓存等功能。

## 特性

- 🚀 **类 Axios API** - 熟悉的 API 设计，易于上手
- 🔄 **请求/响应拦截器** - 灵活的请求和响应处理
- 🔁 **自动重试** - 支持自定义重试策略和条件
- 💾 **智能缓存** - 内置缓存机制，提升性能
- 🎯 **并发控制** - 防止重复请求，优化网络资源
- 📱 **UniApp 优化** - 针对 UniApp 环境特别优化
- 🛡️ **错误处理** - 统一的错误处理和用户提示
- 📊 **请求统计** - 内置请求统计和监控
- 🔧 **TypeScript** - 完整的类型定义支持

## 快速开始

### 基础使用

```typescript
import request, { get, post } from '@/utils/request'

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
import request from '@/utils/request'

// 在 main.ts 或 app.vue 中配置
request.defaults.baseURL = 'https://api.example.com'
request.defaults.timeout = 10000
```

### 添加请求拦截器

```typescript
// 添加 token
request.interceptors.request.use(
  (config) => {
    const token = uni.getStorageSync('token')
    if (token) {
      config.header = {
        ...config.header,
        'Authorization': `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

### 添加响应拦截器

```typescript
// 统一错误处理
request.interceptors.response.use(
  (response) => {
    // 处理业务错误码
    if (response.data.code !== 200) {
      uni.showToast({
        title: response.data.message,
        icon: 'none'
      })
      throw new Error(response.data.message)
    }
    return response
  },
  (error) => {
    // 处理HTTP错误
    if (error.statusCode === 401) {
      uni.showToast({
        title: '登录已过期',
        icon: 'none'
      })
      // 跳转到登录页
    }
    return Promise.reject(error)
  }
)
```

## 高级功能

### 带重试的请求

```typescript
import { getWithRetry, postWithRetry } from '@/utils/request'

// 带重试的 GET 请求
const response = await getWithRetry('/api/important-data', {
  retries: 3,           // 重试3次
  retryDelay: 1000,     // 重试间隔1秒
  cache: true,          // 启用缓存
  cacheTTL: 300000,     // 缓存5分钟
  retryCondition: (error) => {
    // 自定义重试条件
    return error.statusCode >= 500
  }
})

// 带重试的 POST 请求
const result = await postWithRetry('/api/submit', data, {
  retries: 2,
  retryDelay: 2000
})
```

### 缓存控制

```typescript
// 启用缓存的 GET 请求
const response = await getWithRetry('/api/data', {
  cache: true,
  cacheTTL: 600000  // 缓存10分钟
})

// 清除缓存
request.clearCache()           // 清除所有缓存
request.clearCache('/api/')    // 清除特定模式的缓存
```

### 并发控制

```typescript
// 相同的请求会自动合并，避免重复请求
const promise1 = get('/api/data')
const promise2 = get('/api/data')  // 这个请求会复用第一个请求的结果

// 取消请求
request.cancelRequest('/api/data')     // 取消特定请求
request.cancelAllRequests()            // 取消所有请求
```

### 创建专用实例

```typescript
import { EnhancedUniRequest } from '@/utils/request'

// 创建用户API实例
const userApi = new EnhancedUniRequest({
  baseURL: 'https://user-api.example.com',
  timeout: 8000,
  header: {
    'API-Version': 'v1'
  }
})

// 使用专用实例
const users = await userApi.get('/users')
```

## API 参考

### 请求配置 (RequestConfig)

```typescript
interface RequestConfig {
  url: string                    // 请求URL
  method?: RequestMethod         // 请求方法
  data?: any                     // 请求数据
  params?: Record<string, any>   // URL参数
  header?: Record<string, string> // 请求头
  timeout?: number               // 超时时间
  baseURL?: string              // 基础URL
  // ... 更多配置
}
```

### 响应数据 (ResponseData)

```typescript
interface ResponseData<T = any> {
  data: T                        // 响应数据
  statusCode: number             // HTTP状态码
  header: Record<string, string> // 响应头
  cookies?: string[]             // Cookie
}
```

### 重试配置 (RetryConfig)

```typescript
interface RetryConfig {
  retries?: number                              // 重试次数
  retryDelay?: number                          // 重试延迟
  retryCondition?: (error: RequestError) => boolean // 重试条件
}
```

## 错误处理

### 错误类型

```typescript
class RequestError extends Error {
  config: RequestConfig      // 请求配置
  code?: string | number     // 错误代码
  statusCode?: number        // HTTP状态码
  response?: ResponseData    // 响应数据
}
```

### 统一错误处理

```typescript
try {
  const response = await get('/api/data')
} catch (error) {
  if (error instanceof RequestError) {
    console.log('请求配置:', error.config)
    console.log('状态码:', error.statusCode)
    console.log('错误信息:', error.message)
  }
}
```

## 最佳实践

### 1. 环境配置

```typescript
// config/request.ts
const config = {
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000
  },
  production: {
    baseURL: 'https://api.example.com',
    timeout: 5000
  }
}

const env = process.env.NODE_ENV || 'development'
request.defaults = { ...request.defaults, ...config[env] }
```

### 2. API 模块化

```typescript
// api/user.ts
import { get, post } from '@/utils/request'

export const userApi = {
  getProfile: () => get<UserProfile>('/user/profile'),
  updateProfile: (data: Partial<UserProfile>) => 
    post<UserProfile>('/user/profile', data),
  getList: (params: ListParams) => 
    get<PaginatedResponse<User>>('/users', { params })
}
```

### 3. 类型安全

```typescript
// 定义API响应类型
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 使用泛型确保类型安全
const response = await get<ApiResponse<User[]>>('/api/users')
const users = response.data.data // 类型为 User[]
```

### 4. 错误边界

```typescript
// 在页面组件中使用
export default {
  async onLoad() {
    try {
      const response = await userApi.getProfile()
      this.userInfo = response.data
    } catch (error) {
      // 错误已经在拦截器中处理，这里可以做额外处理
      console.error('加载用户信息失败:', error)
    }
  }
}
```

## 注意事项

1. **内存管理**: 长时间运行的应用应定期清理缓存
2. **网络状态**: 在网络不稳定时适当增加重试次数
3. **并发限制**: 避免同时发起过多请求
4. **错误处理**: 确保所有请求都有适当的错误处理
5. **类型安全**: 使用 TypeScript 时定义准确的类型

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础请求功能
- 添加拦截器支持
- 实现重试机制
- 添加缓存功能
- 支持并发控制
