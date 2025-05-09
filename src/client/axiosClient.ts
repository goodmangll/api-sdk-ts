import type { AxiosInstance, AxiosResponse } from 'axios'
import type Ctx from './context'
import Client from '.'
import { ContentType } from './type'

/**
 * Axios 客户端实现
 * 基于 Axios 的 HTTP 客户端
 *
 * @template R - 响应数据类型
 * @author linden
 */
export default class AxiosClient<R = unknown> extends Client<AxiosInstance, R> {
  /**
   * 将对象转换为 FormData
   *
   * @param data 需要转换的对象
   * @returns 转换后的 FormData 对象
   */
  private toFormData(data: Record<string, unknown>): FormData {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof Blob || value instanceof File) {
        formData.append(key, value)
      }
      else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, String(item))
        })
      }
      else {
        formData.append(key, String(value))
      }
    })
    return formData
  }

  /**
   * 执行 HTTP 请求
   *
   * @param ctx 请求上下文
   * @returns 请求响应数据
   * @throws Error 当请求配置无效或请求失败时
   */
  public async doRequest(ctx: Ctx): Promise<R> {
    const { path, method, contentType, body: data, query: params, headers } = ctx
    if (method === 'get' && contentType === ContentType.JSON) {
      throw new Error('GET 请求不能使用 JSON 格式')
    }

    let body: Record<string, unknown> | FormData = data ?? {}

    if (contentType === ContentType.FORM_DATA) {
      body = this.toFormData(body)
    }

    // 创建取消控制器
    const abortController = new AbortController()
    ctx.abortController = abortController

    // 添加取消方法
    ctx.cancel = (reason?: string) => {
      abortController.abort(reason ?? '请求被取消')
    }

    const res: AxiosResponse<R> = await this.connector.request({
      url: path,
      params,
      method,
      data: body,
      headers: headers as Record<string, string>,
      signal: abortController.signal,
    })
    return res.data
  }
}
