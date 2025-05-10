import type Ctx from './context'

/**
 * 客户端基类
 *
 * @template T - 连接器类型
 * @template R - 响应数据类型
 * @author linden
 */
export default abstract class Client<T, R = unknown> {
  /** 连接器 */
  public connector: T

  public constructor(connector: T) {
    this.connector = connector
  }

  /**
   * 发送请求
   * @param _ctx 上下文
   * @returns 请求响应
   */
  public abstract doRequest(_ctx: Ctx): Promise<R>

  /**
   * 拦截请求，可以对请求做处理
   *
   * @param _ctx 上下文
   */
  public doReqHandler(_ctx: Ctx): void {
    // 默认不做任何处理
  }

  /**
   * 拦截结果，可以对结果做处理
   *
   * @param _ctx 上下文
   * @throws 如果有错误，抛出错误
   */
  public doResHandler(_ctx: Ctx): void {
    if (_ctx.error) {
      throw _ctx.error
    }
  }

  /**
   * 工具方法，返回空值
   * @returns 空值
   */
  protected any(): unknown {
    return null
  }
}
