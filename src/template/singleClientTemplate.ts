import type ClientConfig from './clientConfig'
import ClientTemplate from '.'

/**
 * 单客户端模板类
 *
 * @template T - 客户端类型
 * @author linden
 */
export default abstract class SingleClientTemplate<T> extends ClientTemplate<T> {
  /** 客户端 */
  public readonly client: T

  /**
   * 构造函数
   *
   * @param client 客户端
   * @param clientConfig 客户端配置
   */
  constructor(client: T, clientConfig?: ClientConfig) {
    super(clientConfig)
    this.client = client
  }
}
