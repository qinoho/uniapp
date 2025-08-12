/**
 * HTTP请求工具使用示例
 */

import http, { 
  get, 
  post, 
  getWithRetry, 
  postWithRetry, 
  HttpRequest,
  RequestConfig,
  ResponseData 
} from './index'
import type { 
  BaseApiResponse, 
  PaginatedResponse, 
  UserInfo, 
  LoginParams, 
  LoginResponse,
  ListParams,
  UploadResponse 
} from './types'

// 1. 基础使用示例
export async function basicUsageExample() {
  try {
    // GET请求
    const response = await get<BaseApiResponse<{ list: UserInfo[] }>>('/api/users')
    console.log('用户列表:', response.data.data.list)
    
    // POST请求
    const createResponse = await post<BaseApiResponse<UserInfo>>('/api/users', {
      name: '张三',
      email: 'zhangsan@example.com'
    })
    console.log('创建用户:', createResponse.data.data)
    
    // 使用完整配置
    const customResponse = await http.request({
      url: '/api/data',
      method: 'GET',
      timeout: 5000,
      header: {
        'Custom-Header': 'custom-value'
      }
    })
    
  } catch (error) {
    console.error('请求失败:', error)
  }
}

// 2. 带重试的请求示例
export async function retryExample() {
  try {
    // 带重试的GET请求，启用缓存
    const response = await getWithRetry<BaseApiResponse<any>>('/api/important-data', {
      retries: 3,
      retryDelay: 1000,
      cache: true,
      cacheTTL: 600000, // 10分钟缓存
      retryCondition: (error) => {
        // 自定义重试条件：只有网络错误或5xx错误才重试
        return !error.statusCode || error.statusCode >= 500
      }
    })
    
    // 带重试的POST请求
    const postResponse = await postWithRetry('/api/submit', {
      data: 'important data'
    }, {
      retries: 2,
      retryDelay: 2000
    })
    
  } catch (error) {
    console.error('重试请求失败:', error)
  }
}

// 3. 自定义拦截器示例
export function setupCustomInterceptors() {
  // 添加请求拦截器 - 添加用户ID
  http.interceptors.request.use(
    (config) => {
      const userId = uni.getStorageSync('userId')
      if (userId) {
        config.header = {
          ...config.header,
          'User-Id': userId
        }
      }
      return config
    }
  )
  
  // 添加响应拦截器 - 统计API调用
  http.interceptors.response.use(
    (response) => {
      // 记录API调用统计
      const apiStats = uni.getStorageSync('api_stats') || {}
      const url = response.config?.url || 'unknown'
      apiStats[url] = (apiStats[url] || 0) + 1
      uni.setStorageSync('api_stats', apiStats)
      
      return response
    },
    (error) => {
      // 记录错误统计
      const errorStats = uni.getStorageSync('error_stats') || {}
      const errorKey = `${error.statusCode || 'network'}_error`
      errorStats[errorKey] = (errorStats[errorKey] || 0) + 1
      uni.setStorageSync('error_stats', errorStats)
      
      return Promise.reject(error)
    }
  )
}

// 4. 创建专用API实例示例
export function createApiInstances() {
  // 创建用户API实例
  const userApi = new HttpRequest({
    baseURL: 'https://api.example.com/user',
    timeout: 8000,
    header: {
      'Content-Type': 'application/json',
      'API-Version': 'v1'
    }
  })
  
  // 创建文件上传API实例
  const uploadApi = new HttpRequest({
    baseURL: 'https://upload.example.com',
    timeout: 30000,
    header: {
      'Content-Type': 'multipart/form-data'
    }
  })
  
  return { userApi, uploadApi }
}

// 5. 文件上传示例
export async function uploadFileExample(): Promise<UploadResponse | undefined> {
  try {
    // 选择文件
    const chooseResult = await new Promise<UniApp.ChooseImageSuccessCallbackResult>((resolve, reject) => {
      uni.chooseImage({
        count: 1,
        success: resolve,
        fail: reject
      })
    })
    
    if (chooseResult.tempFilePaths.length > 0) {
      const filePath = chooseResult.tempFilePaths[0]
      
      // 上传文件
      const uploadResponse = await new Promise<ResponseData<UploadResponse>>((resolve, reject) => {
        uni.uploadFile({
          url: 'https://api.example.com/upload',
          filePath: filePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          },
          success: (res) => {
            resolve({
              data: JSON.parse(res.data),
              statusCode: res.statusCode,
              header: {}
            })
          },
          fail: reject
        })
      })
      
      console.log('文件上传成功:', uploadResponse.data)
      return uploadResponse.data
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    uni.showToast({
      title: '文件上传失败',
      icon: 'none'
    })
  }
}

// 6. 下载文件示例
export async function downloadFileExample(url: string, filename: string) {
  try {
    const downloadResponse = await new Promise<UniApp.DownloadSuccessData>((resolve, reject) => {
      uni.downloadFile({
        url: url,
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        success: resolve,
        fail: reject
      })
    })
    
    // 保存到相册（如果是图片）
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
      await new Promise<void>((resolve, reject) => {
        uni.saveImageToPhotosAlbum({
          filePath: downloadResponse.tempFilePath,
          success: () => {
            uni.showToast({
              title: '保存成功',
              icon: 'success'
            })
            resolve()
          },
          fail: reject
        })
      })
    }
    
    return downloadResponse
  } catch (error) {
    console.error('文件下载失败:', error)
    uni.showToast({
      title: '文件下载失败',
      icon: 'none'
    })
  }
}

// 7. API接口定义示例
export const userApi = {
  // 登录
  login: (params: LoginParams) => 
    post<BaseApiResponse<LoginResponse>>('/api/auth/login', params),
  
  // 获取用户信息
  getUserInfo: (userId: number) => 
    get<BaseApiResponse<UserInfo>>(`/api/users/${userId}`),
  
  // 更新用户信息
  updateUserInfo: (userId: number, data: Partial<UserInfo>) => 
    post<BaseApiResponse<UserInfo>>(`/api/users/${userId}`, data),
  
  // 获取用户列表（带缓存和重试）
  getUserList: (params: ListParams = {}) => 
    getWithRetry<BaseApiResponse<PaginatedResponse<UserInfo>>>('/api/users', {
      params,
      cache: true,
      cacheTTL: 300000, // 5分钟缓存
      retries: 2
    }),
  
  // 删除用户
  deleteUser: (userId: number) => 
    http.delete<BaseApiResponse<boolean>>(`/api/users/${userId}`)
}

// 8. 批量请求示例
export async function batchRequestExample() {
  try {
    // 并发请求多个接口
    const [userInfo, userList, userStats] = await Promise.all([
      userApi.getUserInfo(1),
      userApi.getUserList({ page: 1, pageSize: 10 }),
      get<BaseApiResponse<any>>('/api/users/stats')
    ])
    
    console.log('用户信息:', userInfo.data.data)
    console.log('用户列表:', userList.data.data.list)
    console.log('用户统计:', userStats.data.data)
    
  } catch (error) {
    console.error('批量请求失败:', error)
  }
}

// 9. 错误处理示例
export async function errorHandlingExample() {
  try {
    const response = await get('/api/might-fail')
    console.log('请求成功:', response.data)
  } catch (error: any) {
    if (error.statusCode === 404) {
      console.log('资源不存在')
    } else if (error.statusCode >= 500) {
      console.log('服务器错误')
    } else if (!error.statusCode) {
      console.log('网络错误')
    } else {
      console.log('其他错误:', error.message)
    }
  }
}

// 10. 环境配置示例
export function setupEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development'
  
  const config = {
    development: {
      baseURL: 'http://localhost:3000/api',
      timeout: 10000
    },
    production: {
      baseURL: 'https://api.example.com',
      timeout: 5000
    },
    testing: {
      baseURL: 'https://test-api.example.com',
      timeout: 8000
    }
  }
  
  // 更新默认配置
  Object.assign(http.defaults, config[env as keyof typeof config])
}

// 导出默认配置的请求实例
export { http as default }
