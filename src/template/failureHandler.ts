import type ApiSdkError from '../client/apiSdkError'
import type Ctx from '../client/context'

/**
 * 失败处理器
 * 处理客户端与服务端交互过程中由于网络、服务器宕机等原因导致暂时无法提供服务的情况
 */
export default interface FailureHandler {

  /**
   * 通知错误信息
   *
   * @param error 异常信息
   */
  notifyError: (error: ApiSdkError | Error) => Promise<void>

  /**
   * 服务异常错误，恢复服务
   *
   * @param ctx 请求上下文
   */
  tryRestore: (ctx?: Ctx) => Promise<void>

  /**
   * 获取服务异常消息
   * 用于处理服务器宕机、网络异常等情况
   *
   * @param error 请求错误
   * @returns 格式化后的错误信息
   */
  failMsg: (error: ApiSdkError | Error) => string | void
}
