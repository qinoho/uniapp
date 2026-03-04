/**
 * 网络请求相关类型定义
 * 供业务层使用的扩展类型
 */

// 扩展 uniapp 的请求类型
declare namespace UniApp {
  interface RequestOptions {
    cloudCache?: boolean | object
    defer?: boolean
  }
}

/**
 * 通用 API 响应数据结构（供业务层继承使用）
 * @example
 * ```ts
 * const res = await get<BaseApiResponse<UserInfo>>('/api/user')
 * console.log(res.data.data) // UserInfo
 * ```
 */
export interface BaseApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
  traceId?: string
}

/**
 * 分页数据响应
 */
export interface PaginatedResponse<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 从实现文件重新导出核心类型
export type { RequestConfig, RequestMethod, ResponseData, RetryConfig } from './index'

export { HttpRequest, RequestError } from './index'

