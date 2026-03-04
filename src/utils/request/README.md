# HttpRequest 网络请求工具

基于 uni-app `uni.request` 封装的网络请求类，设计参考 axios，支持拦截器、重试、缓存与并发控制。

---

## 快速开始

### 基础请求

```ts
import request, { get, post, put, del } from '@/utils/request'

// GET 请求
const res = await get<{ name: string }>('/api/user')
console.log(res.data) // { name: '...' }

// POST 请求
const res = await post('/api/login', { username: 'admin', password: '123' })

// PUT 请求
await put('/api/user/1', { name: 'new name' })

// DELETE 请求
await del('/api/user/1')
```

### 带查询参数

```ts
const res = await get('/api/users', {
  params: { page: 1, size: 20, status: 'active' },
})
// 实际请求: GET /api/users?page=1&size=20&status=active
```

### 自定义 Header

```ts
const res = await post('/api/upload', formData, {
  header: { 'Content-Type': 'multipart/form-data' },
  timeout: 30000,
})
```

---

## 重试 & 缓存

```ts
import { getWithRetry, postWithRetry } from '@/utils/request'

// 自动重试 (指数退避: 1s → 2s → 4s)
const res = await getWithRetry('/api/important-data', {
  retries: 3, // 最大重试次数
  retryDelay: 1000, // 基础延迟 (ms)
})

// GET 请求缓存 (5分钟 TTL)
const res = await getWithRetry('/api/config', {
  cache: true,
  cacheTTL: 300000, // 缓存有效期 (ms)，默认 5 分钟
})
```

### 自定义重试条件

```ts
const res = await getWithRetry('/api/data', {
  retries: 2,
  retryCondition: error => {
    // 仅在 5xx 或超时时重试
    return !error.statusCode || error.statusCode >= 500
  },
})
```

---

## 拦截器

### 请求拦截器

```ts
// 添加
const id = request.interceptors.request.use(
  config => {
    config.header = { ...config.header, 'X-Custom': 'value' }
    return config // 必须返回 config
  },
  error => Promise.reject(error),
)

// 移除
request.interceptors.request.eject(id)
```

### 响应拦截器

```ts
request.interceptors.response.use(
  response => {
    // 统一提取 data 层
    if (response.data?.code !== 0) {
      return Promise.reject(new Error(response.data?.message))
    }
    return response
  },
  error => {
    if (error.statusCode === 401) {
      // 跳转登录页
      uni.navigateTo({ url: '/pages/login/login' })
    }
    return Promise.reject(error)
  },
)
```

---

## 创建独立实例

```ts
import { HttpRequest } from '@/utils/request'

const customRequest = new HttpRequest({
  baseURL: 'https://other-api.example.com',
  timeout: 15000,
  header: { 'X-App-Id': 'my-app' },
})

// 给新实例单独添加拦截器
customRequest.interceptors.request.use(config => {
  // ...
  return config
})
```

---

## 结合 TypeScript 泛型

```ts
import type { BaseApiResponse, PaginatedResponse } from '@/utils/request/index.d'
import { get } from '@/utils/request'

// 定义业务类型
interface UserInfo {
  id: number
  name: string
  avatar: string
}

// 单条数据
const res = await get<BaseApiResponse<UserInfo>>('/api/user/1')
const user = res.data.data // 类型: UserInfo

// 分页数据
const listRes = await get<BaseApiResponse<PaginatedResponse<UserInfo>>>('/api/users')
const users = listRes.data.data.list // 类型: UserInfo[]
```

---

## 缓存管理

```ts
import request from '@/utils/request'

// 清除所有缓存
request.clearCache()

// 清除匹配 pattern 的缓存
request.clearCache('/api/user')
```

---

## 错误处理

```ts
import { get } from '@/utils/request'
import { RequestError } from '@/utils/request'

try {
  await get('/api/data')
} catch (error) {
  if (error instanceof RequestError) {
    console.log(error.statusCode) // HTTP 状态码
    console.log(error.code) // 错误代码
    console.log(error.config) // 请求配置
    console.log(error.response) // 响应数据 (如果有)
  }
}
```

---

## 内置行为

| 功能           | 说明                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| **Token 注入** | 自动从 `uni.getStorageSync('token')` 读取并添加 `Authorization: Bearer <token>` |
| **开发日志**   | `import.meta.env.DEV` 时自动打印请求/响应日志                                   |
| **401 处理**   | 自动清除 token 并 Toast 提示                                                    |
| **5xx 处理**   | Toast 提示"服务器开小差了"                                                      |
| **并发控制**   | 相同请求自动复用 Promise，避免重复发射                                          |
| **缓存上限**   | 最多缓存 100 条（LRU 淘汰最早的）                                               |

---

## API 速查

### 导出方法

| 方法            | 签名                                                   |
| --------------- | ------------------------------------------------------ |
| `get`           | `<T>(url, config?) => Promise<ResponseData<T>>`        |
| `post`          | `<T>(url, data?, config?) => Promise<ResponseData<T>>` |
| `put`           | `<T>(url, data?, config?) => Promise<ResponseData<T>>` |
| `del`           | `<T>(url, config?) => Promise<ResponseData<T>>`        |
| `getWithRetry`  | `<T>(url, config?) => Promise<ResponseData<T>>`        |
| `postWithRetry` | `<T>(url, data?, config?) => Promise<ResponseData<T>>` |

### RequestConfig 扩展字段

| 字段             | 类型                  | 默认值   | 说明               |
| ---------------- | --------------------- | -------- | ------------------ |
| `baseURL`        | `string`              | `''`     | 基础 URL，自动拼接 |
| `params`         | `Record<string, any>` | -        | URL 查询参数       |
| `cache`          | `boolean`             | `false`  | 是否缓存 GET 响应  |
| `cacheTTL`       | `number`              | `300000` | 缓存有效期 (ms)    |
| `retries`        | `number`              | `0`      | 最大重试次数       |
| `retryDelay`     | `number`              | `1000`   | 基础重试延迟 (ms)  |
| `retryCondition` | `(error) => boolean`  | 5xx/超时 | 自定义重试判断函数 |
