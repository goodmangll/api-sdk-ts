/**
 * 序列化器工厂
 *
 * @author linden
 */

import type { Serializer } from './types'

/**
 * 序列化器工厂类
 *
 * 负责管理和获取序列化器实例
 */
export class SerializerFactory {
  private static readonly serializers = new Map<string, Serializer>()

  /**
   * 注册序列化器
   *
   * @param type 类型标识符
   * @param serializer 序列化器实例
   */
  static register(type: string, serializer: Serializer): void {
    this.serializers.set(type, serializer)
  }

  /**
   * 获取序列化器
   *
   * @param type 类型标识符
   * @returns 序列化器实例
   * @throws Error 如果未找到对应的序列化器
   */
  static get(type: string): Serializer {
    const serializer = this.serializers.get(type)
    if (!serializer) {
      throw new Error(`未找到类型为 "${type}" 的序列化器`)
    }
    return serializer
  }

  /**
   * 检查是否已注册指定类型的序列化器
   *
   * @param type 类型标识符
   * @returns 是否已注册
   */
  static has(type: string): boolean {
    return this.serializers.has(type)
  }

  /**
   * 清空所有已注册的序列化器
   *
   * 主要用于测试场景
   */
  static clear(): void {
    this.serializers.clear()
  }
}
