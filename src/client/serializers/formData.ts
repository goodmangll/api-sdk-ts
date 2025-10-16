/**
 * FormData 序列化器
 *
 * @author linden
 */

import { BaseSerializer } from './types'

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
 * FormData 序列化器
 *
 * 将对象转换为 FormData 格式，支持文件上传和复杂数据结构
 */
export class FormDataSerializer extends BaseSerializer {
  private readonly options: Required<FormDataOptions>

  constructor(options?: FormDataOptions) {
    super()
    this.options = {
      arrayFormat: 'indices',
      allowNull: false,
      nested: true,
      ...options,
    }
  }

  /**
   * 将对象转换为 FormData
   *
   * @param data 需要转换的对象
   * @returns 转换后的 FormData 对象
   */
  serialize(data: unknown): FormData {
    if (!(data && typeof data === 'object')) {
      throw new Error('FormData 序列化器要求数据为对象类型')
    }

    const formData = new FormData()
    const { arrayFormat, allowNull, nested } = this.options

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
   * 获取默认的 Content-Type
   *
   * 返回 null，让浏览器/Axios 自动设置（会包含 boundary）
   *
   * @returns null
   */
  getDefaultContentType(): string | null {
    return null
  }
}
