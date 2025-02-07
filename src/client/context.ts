import ApiSdkError from "./apiSdkError"
import { ContentType } from "./type"

/**
 * 请求上下文
 * 
 * @author linden
 */
export default interface Ctx {
    /** 路径 */
    path: string
    /** 请求方式 */
    method: string
    /** 数据类型 */
    contentType: ContentType
    /** 数据 */
    body?: Record<string, unknown>
    /** url上?带的参数 */
    query?: Record<string, unknown>
    /** url上/后面的参数 */
    pathParams?: Record<string, unknown>
    /** 请求头 */
    headers?: Record<string, unknown>
    /** 返回结果 */
    res?: unknown
    /** 错误 */
    error?: ApiSdkError
    /** 其他属性 */
    attribute: Record<string, unknown>
}