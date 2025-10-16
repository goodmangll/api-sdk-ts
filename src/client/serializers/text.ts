/**
 * 文本序列化器
 *
 * @author linden
 */

import { BaseSerializer } from './types'

/**
 * 文本序列化器
 *
 * 将数据转换为纯文本格式
 */
export class TextSerializer extends BaseSerializer {
  /**
   * 将数据转换为文本
   *
   * @param data 原始数据
   * @returns 文本字符串
   */
  serialize(data: unknown): string {
    if (typeof data === 'string') {
      return data
    }

    if (data === null || data === undefined) {
      return ''
    }

    // 对象转为 JSON 字符串
    if (typeof data === 'object') {
      try {
        return JSON.stringify(data)
      }
      catch {
        // 无法 JSON 序列化时返回空字符串
        return ''
      }
    }

    // 其他类型转为字符串（number, boolean, bigint, symbol）
    return String(data as string | number | boolean | bigint | symbol)
  }

  /**
   * 获取默认的 Content-Type
   *
   * @returns text/plain
   */
  getDefaultContentType(): string {
    return 'text/plain'
  }
}
