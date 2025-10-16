/**
 * 自定义序列化器
 *
 * @author linden
 */

import { BaseSerializer } from './types'

/**
 * 自定义序列化器
 *
 * 不对数据进行任何处理，完全由用户控制
 * 适用于：
 * - 用户已经准备好的数据格式
 * - 需要完全自定义的场景
 * - Blob、ArrayBuffer 等特殊类型
 */
export class CustomSerializer extends BaseSerializer {
  /**
   * 序列化数据
   *
   * 原样返回，不做任何转换
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
   * 返回 null，不设置 Content-Type
   * 完全由用户通过 @Header('Content-Type', '...') 控制
   *
   * @returns null
   */
  getDefaultContentType(): string | null {
    return null
  }
}
