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
  /** 请求被取消 */
  CANCELED = 'CANCELED',
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
  /** HTTP 状态码 */
  public readonly statusCode?: number

  constructor(ctx: Ctx, error?: Error) {
    super(error?.message ?? 'API SDK Error')
    this.error = error
    this.ctx = ctx
    this.name = 'ApiSdkError'

    // 分析错误类型
    const { errorType, statusCode } = this.analyzeError(error)
    this.errorType = errorType
    this.statusCode = statusCode
  }

  /**
   * 分析错误类型
   *
   * @param error 原始错误
   * @returns 错误分析结果
   */
  private analyzeError(error?: Error): {
    errorType: ApiErrorType
    statusCode?: number
  } {
    // 默认值
    let errorType = ApiErrorType.UNKNOWN
    let statusCode: number | undefined

    if (error instanceof AxiosError) {
      // 处理取消请求
      if (error.code === 'ERR_CANCELED') {
        errorType = ApiErrorType.CANCELED
      }
      else if (error.code === 'ECONNABORTED') {
        errorType = ApiErrorType.TIMEOUT
      }
      else if (error.code === 'ERR_NETWORK') {
        errorType = ApiErrorType.NETWORK
      }
      else if (error.response) {
        statusCode = error.response.status

        if (statusCode >= 500) {
          errorType = ApiErrorType.SERVER
        }
        else if (statusCode >= 400) {
          errorType = ApiErrorType.CLIENT
        }
      }
    }

    return { errorType, statusCode }
  }

  /**
   * 获取格式化的错误信息
   *
   * @returns 格式化的错误信息
   */
  public getFormattedMessage(): string {
    // 取消请求的特殊处理
    if (this.errorType === ApiErrorType.CANCELED) {
      return `[CANCELED] Request was canceled - Path: ${this.ctx.path}`
    }

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
