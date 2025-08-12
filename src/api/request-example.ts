/**
 * 网络请求工具使用示例
 */

import request, {
  get,
  post,
  getWithRetry,
  postWithRetry,
  UniRequest,
  EnhancedUniRequest,
  RequestConfig,
  ResponseData,
} from '../http/index'

// 1. 基础使用示例
export async function basicUsageExample() {
  try {
    // GET请求
    const response = await get<{ list: any[] }>('/api/users')
    console.log('用户列表:', response.data.list)

    // POST请求
    const createResponse = await post<{ id: number }>('/api/users', {
      name: '张三',
      email: 'zhangsan@example.com',
    })
    console.log('创建用户ID:', createResponse.data.id)

    // 使用完整配置
    const customResponse = await request.request({
      url: '/api/data',
      method: 'GET',
      timeout: 5000,
      header: {
        'Custom-Header': 'custom-value',
      },
    })
  } catch (error) {
    console.error('请求失败:', error)
  }
}

// 2. 带重试的请求示例
export async function retryExample() {
  try {
    // 带重试的GET请求，启用缓存
    const response = await getWithRetry<{ data: any }>('/api/important-data', {
      retries: 3,
      retryDelay: 1000,
      cache: true,
      cacheTTL: 600000, // 10分钟缓存
      retryCondition: error => {
        // 自定义重试条件：只有网络错误或5xx错误才重试
        return !error.statusCode || error.statusCode >= 500
      },
    })

    // 带重试的POST请求
    const postResponse = await postWithRetry(
      '/api/submit',
      {
        data: 'important data',
      },
      {
        retries: 2,
        retryDelay: 2000,
      }
    )
  } catch (error) {
    console.error('重试请求失败:', error)
  }
}

// 3. 自定义拦截器示例
export function setupCustomInterceptors() {
  // 添加请求拦截器 - 添加设备信息
  request.interceptors.request.use(config => {
    const systemInfo = uni.getSystemInfoSync()
    config.header = {
      ...config.header,
      'Device-Type': systemInfo.platform,
      'App-Version': systemInfo.version,
      'Device-Id': systemInfo.deviceId || 'unknown',
    }
    return config
  })

  // 添加响应拦截器 - 统计API调用
  request.interceptors.response.use(
    response => {
      // 记录API调用统计
      const apiStats = uni.getStorageSync('api_stats') || {}
      const url = response.config?.url || 'unknown'
      apiStats[url] = (apiStats[url] || 0) + 1
      uni.setStorageSync('api_stats', apiStats)

      return response
    },
    error => {
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
  const userApi = new EnhancedUniRequest({
    baseURL: 'https://api.example.com/user',
    timeout: 8000,
    header: {
      'Content-Type': 'application/json',
      'API-Version': 'v1',
    },
  })

  // 创建文件上传API实例
  const uploadApi = new UniRequest({
    baseURL: 'https://upload.example.com',
    timeout: 30000,
    header: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return { userApi, uploadApi }
}

// 5. 文件上传示例
export async function uploadFileExample() {
  try {
    // 选择文件
    const chooseResult =
      await new Promise<UniApp.ChooseImageSuccessCallbackResult>(
        (resolve, reject) => {
          uni.chooseImage({
            count: 1,
            success: resolve,
            fail: reject,
          })
        }
      )

    if (chooseResult.tempFilePaths.length > 0) {
      const filePath = chooseResult.tempFilePaths[0]

      // 上传文件
      const uploadResponse = await new Promise<ResponseData>(
        (resolve, reject) => {
          uni.uploadFile({
            url: 'https://api.example.com/upload',
            filePath: filePath,
            name: 'file',
            header: {
              Authorization: `Bearer ${uni.getStorageSync('token')}`,
            },
            success: res => {
              resolve({
                data: JSON.parse(res.data),
                statusCode: res.statusCode,
                header: {},
              })
            },
            fail: reject,
          })
        }
      )

      console.log('文件上传成功:', uploadResponse.data)
      return uploadResponse
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    uni.showToast({
      title: '文件上传失败',
      icon: 'none',
    })
  }
}

// 6. 下载文件示例
export async function downloadFileExample(url: string, filename: string) {
  try {
    const downloadResponse = await new Promise<UniApp.DownloadSuccessData>(
      (resolve, reject) => {
        uni.downloadFile({
          url: url,
          header: {
            Authorization: `Bearer ${uni.getStorageSync('token')}`,
          },
          success: resolve,
          fail: reject,
        })
      }
    )

    // 保存到相册（如果是图片）
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
      await new Promise<void>((resolve, reject) => {
        uni.saveImageToPhotosAlbum({
          filePath: downloadResponse.tempFilePath,
          success: () => {
            uni.showToast({
              title: '保存成功',
              icon: 'success',
            })
            resolve()
          },
          fail: reject,
        })
      })
    }

    return downloadResponse
  } catch (error) {
    console.error('文件下载失败:', error)
    uni.showToast({
      title: '文件下载失败',
      icon: 'none',
    })
  }
}

// 7. WebSocket连接示例（配合HTTP请求使用）
export class WebSocketManager {
  private socket: UniApp.SocketTask | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000

  async connect(url: string) {
    try {
      this.socket = uni.connectSocket({
        url: url,
        header: {
          Authorization: `Bearer ${uni.getStorageSync('token')}`,
        },
      })

      this.socket.onOpen(() => {
        console.log('WebSocket连接成功')
        this.reconnectAttempts = 0
      })

      this.socket.onError(error => {
        console.error('WebSocket错误:', error)
        this.handleReconnect()
      })

      this.socket.onClose(() => {
        console.log('WebSocket连接关闭')
        this.handleReconnect()
      })

      this.socket.onMessage(message => {
        console.log('收到消息:', message.data)
        // 处理消息
      })
    } catch (error) {
      console.error('WebSocket连接失败:', error)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(
          `尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        )
        // 这里需要重新调用connect方法
      }, this.reconnectInterval)
    }
  }

  send(data: any) {
    if (this.socket) {
      this.socket.send({
        data: JSON.stringify(data),
      })
    }
  }

  close() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

// 8. API接口定义示例
export interface UserInfo {
  id: number
  name: string
  email: string
  avatar?: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 用户相关API
export const userApi = {
  // 获取用户信息
  getUserInfo: (userId: number) =>
    get<ApiResponse<UserInfo>>(`/api/users/${userId}`),

  // 更新用户信息
  updateUserInfo: (userId: number, data: Partial<UserInfo>) =>
    post<ApiResponse<UserInfo>>(`/api/users/${userId}`, data),

  // 获取用户列表（带缓存和重试）
  getUserList: (page: number = 1, pageSize: number = 10) =>
    getWithRetry<ApiResponse<{ list: UserInfo[]; total: number }>>(
      '/api/users',
      {
        params: { page, pageSize },
        cache: true,
        cacheTTL: 300000, // 5分钟缓存
        retries: 2,
      }
    ),
}

// 导出默认配置的请求实例
export { request as default }

