/**
 * 请求上下文
 *
 * @author linden
 */
export default interface Ctx {
  /** 请求路径 */
  path: string
  /** 请求方法 */
  method: string
  /** 内容类型 */
  contentType: string
  /** 请求头 */
  headers: Record<string, unknown>
  /** 请求体 */
  body: Record<string, unknown>
  /** 查询参数 */
  query: Record<string, unknown>
  /** 路径参数 */
  pathParams: Record<string, unknown>
  /** 自定义属性 */
  attribute: Record<string, unknown>
  /** 响应结果 */
  res?: unknown
  /** 错误 */
  error?: Error
  /** 请求取消控制器 */
  abortController?: AbortController
  /**
   * 取消请求
   * @param reason 取消原因
   */
  cancel?: (reason?: string) => void
}
