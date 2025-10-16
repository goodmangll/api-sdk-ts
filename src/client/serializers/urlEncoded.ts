/**
 * URL 编码序列化器
 *
 * @author linden
 */

import { BaseSerializer } from './types'

/**
 * URL 编码序列化配置
 */
export interface UrlEncodedOptions {
  /** 数组格式：indices = key[0], brackets = key[], repeat = key */
  arrayFormat?: 'indices' | 'brackets' | 'repeat'
  /** 是否允许 null 值（转为空字符串） */
  allowNull?: boolean
}

/**
 * URL 编码序列化器
 *
 * 将对象转换为 application/x-www-form-urlencoded 格式
 * 格式：key1=value1&key2=value2
 */
export class UrlEncodedSerializer extends BaseSerializer {
  private readonly options: Required<UrlEncodedOptions>

  constructor(options?: UrlEncodedOptions) {
    super()
    this.options = {
      arrayFormat: 'brackets',
      allowNull: false,
      ...options,
    }
  }

  /**
   * 将对象转换为 URL 编码字符串
   *
   * @param data 需要转换的对象
   * @returns URL 编码字符串
   */
  serialize(data: unknown): string {
    if (!(data && typeof data === 'object')) {
      return ''
    }

    const params = new URLSearchParams()
    const { arrayFormat, allowNull } = this.options

    const append = (key: string, value: unknown): void => {
      // 处理 null/undefined
      if (value === null || value === undefined) {
        if (allowNull) {
          params.append(key, '')
        }
        return
      }

      // 处理数组
      if (Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
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

          if (item !== null && item !== undefined) {
            params.append(arrayKey, String(item))
          }
          else if (allowNull) {
            params.append(arrayKey, '')
          }
        }
        return
      }

      // 处理对象（扁平化）
      if (typeof value === 'object') {
        for (const [subKey, subValue] of Object.entries(value)) {
          append(`${key}[${subKey}]`, subValue)
        }
        return
      }

      // 处理基本类型
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        params.append(key, String(value))
      }
    }

    for (const [key, value] of Object.entries(data)) {
      append(key, value)
    }

    return params.toString()
  }

  /**
   * 获取默认的 Content-Type
   *
   * @returns application/x-www-form-urlencoded
   */
  getDefaultContentType(): string {
    return 'application/x-www-form-urlencoded'
  }
}
