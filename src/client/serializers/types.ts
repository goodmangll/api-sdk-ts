/**
 * 序列化器类型定义
 *
 * @author linden
 */

/**
 * 序列化器接口
 *
 * 用于将请求数据转换为 HTTP 请求体格式
 */
export interface Serializer {
  /**
   * 序列化数据
   *
   * @param data 原始数据
   * @returns 序列化后的数据
   */
  serialize: (data: unknown) => unknown

  /**
   * 获取默认的 Content-Type header 值
   *
   * @returns Content-Type 值，或 null 表示不设置（由 Axios 自动处理）
   */
  getDefaultContentType: () => string | null
}

/**
 * 序列化器抽象基类
 *
 * 提供默认实现，子类可以选择性覆盖
 */
export abstract class BaseSerializer implements Serializer {
  abstract serialize(data: unknown): unknown
  abstract getDefaultContentType(): string | null
}
