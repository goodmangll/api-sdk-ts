/**
 * JSON 序列化器
 *
 * @author linden
 */

import { BaseSerializer } from './types'

/**
 * JSON 序列化器
 *
 * 将数据保持为 JavaScript 对象，由 Axios 自动序列化为 JSON 字符串
 */
export class JsonSerializer extends BaseSerializer {
  /**
   * 序列化数据
   *
   * JSON 序列化不需要特殊处理，直接返回原始数据
   * Axios 会自动将对象序列化为 JSON 字符串
   *
   * @param data 原始数据
   * @returns 原始数据（不做转换）
   */
  serialize(data: unknown): unknown {
    return data
  }

  /**
   * 获取默认的 Content-Type
   *
   * 返回 null，让 Axios 自动设置为 application/json
   *
   * @returns null
   */
  getDefaultContentType(): string | null {
    return null
  }
}
