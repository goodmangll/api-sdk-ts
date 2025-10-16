/**
 * 客户端类型
 *
 * @author linden
 */

/**
 * 请求体类型（Body Type）
 *
 * 这是一个数据处理策略标识符，用于指示如何序列化请求数据。
 *
 * 注意：这不是 HTTP Content-Type header！
 * - 框架会根据 BodyType 自动设置合适的 Content-Type
 * - 您可以通过装饰器的 headers 选项或 @Header 参数覆盖默认行为
 *
 * @example
 * // 1. 最简单：使用默认配置
 * @Post('/users')
 * createUser(@Body() user: User) {}
 *
 * // 2. 指定 bodyType
 * @Post('/users', BodyType.JSON)
 * createUser(@Body() user: User) {}
 *
 * // 3. 装饰器级别自定义 Content-Type（推荐）
 * @Post('/users', { headers: { 'Content-Type': 'application/vnd.api+json' } })
 * createUser(@Body() user: User) {}
 *
 * // 4. 参数级别覆盖（优先级最高，但不常用）
 * @Post('/users', BodyType.JSON)
 * createUser(
 *   @Body() user: User,
 *   @Header('Content-Type') ct: string = 'application/hal+json'
 * ) {}
 */
export enum BodyType {
  /** JSON 格式 - 默认 Content-Type: application/json */
  JSON = 'json',

  /** FormData 格式 - 默认 Content-Type: multipart/form-data */
  FORM_DATA = 'form-data',

  /** URL 编码表单 - 默认 Content-Type: application/x-www-form-urlencoded */
  FORM_URLENCODED = 'form-urlencoded',

  /** 纯文本 - 默认 Content-Type: text/plain */
  TEXT = 'text',

  /**
   * 自定义格式 - 不设置 Content-Type，由用户自行指定
   * 数据原样传递，不做序列化处理
   */
  CUSTOM = 'custom',
}

/**
 * @deprecated 请使用 BodyType
 * 为保持向后兼容性而保留
 */
export const ContentType = BodyType
