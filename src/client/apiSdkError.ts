import type Ctx from './context'
import { AxiosError } from 'axios'

/**
 * API SDK 错误类型枚举
 */
export enum ApiErrorType {
  /** 网络错误 */
  NETWORK = 'NETWORK',
  /** 请求超时 */
  TIMEOUT = 'TIMEOUT',
  /** 服务端错误 */
  SERVER = 'SERVER',
  /** 客户端错误 */
  CLIENT = 'CLIENT',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN',
}

/**
 * API SDK 错误类
 * 封装了 API 请求过程中的各种错误
 *
 * @author linden
 */
export default class ApiSdkError extends Error {
  /** 原始错误对象 */
  public readonly error?: Error
  /** 请求上下文 */
  public readonly ctx: Ctx
  /** 错误类型 */
  public readonly errorType: ApiErrorType
  /** 是否可重试 */
  public readonly retryable: boolean
  /** 建议的重试延迟（毫秒） */
  public readonly retryDelay: number
  /** HTTP 状态码 */
  public readonly statusCode?: number

  constructor(ctx: Ctx, error?: Error) {
    super(error?.message ?? 'API SDK Error')
    this.error = error
    this.ctx = ctx
    this.name = 'ApiSdkError'

    // 分析错误类型
    const { errorType, statusCode, retryable, retryDelay } = this.analyzeError(error)
    this.errorType = errorType
    this.statusCode = statusCode
    this.retryable = retryable
    this.retryDelay = retryDelay
  }

  /**
   * 分析错误类型并确定重试策略
   *
   * @param error 原始错误
   * @returns 错误分析结果
   */
  private analyzeError(error?: Error): {
    errorType: ApiErrorType
    statusCode?: number
    retryable: boolean
    retryDelay: number
  } {
    // 默认值
    let errorType = ApiErrorType.UNKNOWN
    let statusCode: number | undefined
    let retryable = false
    let retryDelay = 1000 // 默认重试延迟 1 秒

    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        errorType = ApiErrorType.TIMEOUT
        retryable = true
        retryDelay = 2000 // 超时错误重试延迟 2 秒
      }
      else if (error.code === 'ERR_NETWORK') {
        errorType = ApiErrorType.NETWORK
        retryable = true
        retryDelay = 3000 // 网络错误重试延迟 3 秒
      }
      else if (error.response) {
        statusCode = error.response.status

        if (statusCode >= 500) {
          errorType = ApiErrorType.SERVER
          retryable = true
          retryDelay = 5000 // 服务端错误重试延迟 5 秒
        }
        else if (statusCode >= 400) {
          errorType = ApiErrorType.CLIENT
          // 客户端错误通常不需要重试，除了 429 (Too Many Requests)
          retryable = statusCode === 429
          retryDelay = statusCode === 429 ? 10000 : 0 // 限流错误重试延迟 10 秒
        }
      }
    }

    return { errorType, statusCode, retryable, retryDelay }
  }

  /**
   * 获取格式化的错误信息
   *
   * @returns 格式化的错误信息
   */
  public getFormattedMessage(): string {
    const parts = [
      `[${this.errorType}]`,
      this.message,
      this.statusCode ? `Status: ${this.statusCode}` : '',
      `Path: ${this.ctx.path}`,
      `Method: ${this.ctx.method.toUpperCase()}`,
    ]

    return parts.filter(Boolean).join(' - ')
  }
}
