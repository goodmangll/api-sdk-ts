import type { AxiosInstance, AxiosResponse } from 'axios'
import type Ctx from './context'
import type { FormDataOptions, UrlEncodedOptions } from './serializers'
import Client from '.'
import {
  CustomSerializer,
  FormDataSerializer,
  JsonSerializer,
  SerializerFactory,
  TextSerializer,
  UrlEncodedSerializer,
} from './serializers'
import { BodyType } from './types'

/**
 * 序列化器配置选项
 */
export interface SerializerOptions {
  /** FormData 序列化配置 */
  formData?: FormDataOptions
  /** URL 编码序列化配置 */
  urlEncoded?: UrlEncodedOptions
}

/**
 * Axios 客户端实现
 * 基于 Axios 的 HTTP 客户端
 *
 * @template R - 响应数据类型
 * @author linden
 */
export default class AxiosClient<R = unknown> extends Client<AxiosInstance, R> {
  constructor(connector: AxiosInstance, options?: SerializerOptions) {
    super(connector)
    this.initializeSerializers(options)
  }

  /**
   * 初始化序列化器
   *
   * @param options 序列化器配置选项
   */
  private initializeSerializers(options?: SerializerOptions): void {
    // 注册 JSON 序列化器
    SerializerFactory.register(BodyType.JSON, new JsonSerializer())

    // 注册 FormData 序列化器
    SerializerFactory.register(
      BodyType.FORM_DATA,
      new FormDataSerializer(options?.formData),
    )

    // 注册 URL 编码序列化器
    SerializerFactory.register(
      BodyType.FORM_URLENCODED,
      new UrlEncodedSerializer(options?.urlEncoded),
    )

    // 注册文本序列化器
    SerializerFactory.register(BodyType.TEXT, new TextSerializer())

    // 注册自定义序列化器
    SerializerFactory.register(BodyType.CUSTOM, new CustomSerializer())
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
    if (method === 'get' && contentType === BodyType.JSON && data && Object.keys(data).length > 0) {
      console.warn(
        `[ApiSdk Warning] GET 请求携带 JSON body 不符合常规用法，某些代理或服务器可能不支持。建议使用 POST 或将参数放入 query。Path: ${path}`,
      )
    }

    // 1. 获取序列化器并处理数据
    const serializer = SerializerFactory.get(contentType)
    const body = serializer.serialize(data ?? {})

    // 2. 检查是否已设置 Content-Type（装饰器或参数级别）
    // 注意：decorators 中已经规范化为 'Content-Type'，无需检查多个大小写
    const hasCustomContentType = headers['Content-Type'] !== undefined

    // 3. 如果未设置，使用序列化器的默认值
    if (!hasCustomContentType) {
      const defaultContentType = serializer.getDefaultContentType()
      if (defaultContentType) {
        headers['Content-Type'] = defaultContentType
      }
    }

    // 4. 发送请求
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
