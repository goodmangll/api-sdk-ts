import type { AxiosInstance, AxiosResponse } from 'axios'
import type Ctx from './context'
import Client from '.'
import { ContentType } from './types'

/**
 * FormData 序列化配置
 */
export interface FormDataOptions {
  /** 数组格式：indices = key[0], brackets = key[], repeat = key */
  arrayFormat?: 'indices' | 'brackets' | 'repeat'
  /** 是否允许 null 值（转为空字符串） */
  allowNull?: boolean
  /** 是否支持嵌套对象（使用点号分隔） */
  nested?: boolean
}

/**
 * Axios 客户端实现
 * 基于 Axios 的 HTTP 客户端
 *
 * @template R - 响应数据类型
 * @author linden
 */
export default class AxiosClient<R = unknown> extends Client<AxiosInstance, R> {
  /** FormData 序列化配置 */
  private readonly formDataOptions: FormDataOptions

  constructor(connector: AxiosInstance, formDataOptions?: FormDataOptions) {
    super(connector)
    this.formDataOptions = {
      arrayFormat: 'indices',
      allowNull: false,
      nested: true,
      ...formDataOptions,
    }
  }

  /**
   * 将对象转换为 FormData
   *
   * @param data 需要转换的对象
   * @returns 转换后的 FormData 对象
   */
  private toFormData(data: Record<string, unknown>): FormData {
    const { arrayFormat, allowNull, nested } = this.formDataOptions
    const formData = new FormData()

    const append = (key: string, value: unknown): void => {
      // 处理 null/undefined
      if (value === null || value === undefined) {
        if (allowNull) {
          formData.append(key, '')
        }
        return
      }

      // 处理 File/Blob
      if (value instanceof Blob || value instanceof File) {
        formData.append(key, value)
        return
      }

      // 处理数组
      if (Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
          // 数组中的文件直接追加
          if (item instanceof Blob || item instanceof File) {
            formData.append(key, item)
          }
          else {
            // 根据配置格式化数组键名
            let arrayKey: string
            if (arrayFormat === 'indices') {
              arrayKey = `${key}[${index}]`
            }
            else if (arrayFormat === 'brackets') {
              arrayKey = `${key}[]`
            }
            else {
              arrayKey = key
            }
            append(arrayKey, item)
          }
        }
        return
      }

      // 处理嵌套对象
      if (nested && typeof value === 'object' && value !== null) {
        for (const [subKey, subValue] of Object.entries(value)) {
          append(`${key}.${subKey}`, subValue)
        }
        return
      }

      // 处理基本类型（string, number, boolean）
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        formData.append(key, String(value))
      }
    }

    for (const [key, value] of Object.entries(data)) {
      append(key, value)
    }

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

    // 警告：GET 请求携带 JSON body 不符合常规用法
    if (method === 'get' && contentType === ContentType.JSON && data && Object.keys(data).length > 0) {
      console.warn(
        `[ApiSdk Warning] GET 请求携带 JSON body 不符合常规用法，某些代理或服务器可能不支持。建议使用 POST 或将参数放入 query。Path: ${path}`,
      )
    }

    let body: Record<string, unknown> | FormData = data ?? {}

    if (contentType === ContentType.FORM_DATA) {
      body = this.toFormData(body)
    }

    const res: AxiosResponse<R> = await this.connector.request({
      url: path,
      params,
      method,
      data: body,
      headers: headers as Record<string, string>,
    })
    return res.data
  }
}
