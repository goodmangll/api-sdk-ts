/**
 * 请求装饰器，用于装饰类方法以便在调用时发送 HTTP 请求。
 *
 * @author linden
 */

import type Client from '.'
import type Ctx from './context'
import ApiSdkError from './apiSdkError'
import { BodyType } from './types'
import 'reflect-metadata'

/**
 * 装饰器属性键类型
 */
type DecoratorPropertyKey = string | symbol | undefined

/**
 * 请求配置选项
 *
 * 用于在装饰器级别配置请求参数
 */
export interface RequestOptions {
  /**
   * 请求体类型
   *
   * 指定如何序列化请求数据
   */
  bodyType?: BodyType

  /**
   * 自定义 HTTP headers
   *
   * 可以包括 Content-Type 在内的任意 header
   * 优先级：@Header 参数 > 装饰器 headers > 序列化器默认值
   *
   * @example
   * { 'Content-Type': 'application/vnd.api+json', 'X-Api-Version': '2.0' }
   */
  headers?: Record<string, string>
}

/**
 * 规范化 HTTP Header 名称
 *
 * 将 header 名称转换为标准格式（首字母大写，连字符分隔）
 * 特殊处理 Content-Type 确保大小写一致
 *
 * @param name 原始 header 名称
 * @returns 规范化后的 header 名称
 *
 * @example
 * normalizeHeaderName('content-type') // 'Content-Type'
 * normalizeHeaderName('x-api-version') // 'X-Api-Version'
 */
function normalizeHeaderName(name: string): string {
  // Content-Type 特殊处理（最常用，确保一致性）
  if (name.toLowerCase() === 'content-type') {
    return 'Content-Type'
  }

  // 其他 header 采用首字母大写格式
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-')
}

/**
 * 规范化 headers 对象
 *
 * @param headers 原始 headers 对象
 * @returns 规范化后的 headers 对象
 */
function normalizeHeaders(headers: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    normalized[normalizeHeaderName(key)] = value
  }
  return normalized
}

/**
 * 参数装饰器，用于在方法参数上定义元数据。
 *
 * @param name 参数的名称。
 */
export function Param(name: string): ParameterDecorator {
  return function (target: object, propertyKey: DecoratorPropertyKey, parameterIndex: number) {
    Reflect.defineMetadata(`paramName:${parameterIndex}`, name, target, propertyKey as string | symbol)
  }
}

/**
 * Body 装饰器用于将参数添加到请求正文中。
 *
 * @returns 一个装饰器函数，用于在目标方法上定义元数据。
 */
export function Body(): ParameterDecorator {
  return function (target: object, propertyKey: DecoratorPropertyKey, parameterIndex: number) {
    Reflect.defineMetadata(`bodyName:${parameterIndex}`, true, target, propertyKey as string | symbol)
  }
}

/**
 * Query 装饰器用于将参数拼接到查询字符串中。
 *
 * @param name - 查询参数的名称。如果为 `true`，则使用参数的名称。
 * @returns 一个装饰器函数，用于在目标方法上定义元数据。
 */
export function Query(name: string | true = true): ParameterDecorator {
  return function (target: object, propertyKey: DecoratorPropertyKey, parameterIndex: number) {
    Reflect.defineMetadata(`queryName:${parameterIndex}`, name, target, propertyKey as string | symbol)
  }
}

/**
 * Header 装饰器用于将参数添加到请求头中。
 *
 * @param name - 请求头的名称。
 * @returns 一个装饰器函数，用于在目标方法上定义元数据。
 */
export function Header(name: string): ParameterDecorator {
  return function (target: object, propertyKey: DecoratorPropertyKey, parameterIndex: number) {
    Reflect.defineMetadata(`headerName:${parameterIndex}`, name, target, propertyKey as string | symbol)
  }
}

/**
 * 路径参数装饰器
 *
 * 用于标记路径参数
 *
 * @param name 参数名称。如果设置为 `true`，则使用参数名称。
 * @returns 一个装饰器函数，用于定义目标方法参数的元数据。
 */
export function Path(name: string | true = true): ParameterDecorator {
  return function (target: object, propertyKey: DecoratorPropertyKey, parameterIndex: number) {
    Reflect.defineMetadata(`pathName:${parameterIndex}`, name, target, propertyKey as string | symbol)
  }
}

/**
 * HTTP POST请求的装饰器函数。
 *
 * @param path - POST请求的端点路径。
 * @param bodyTypeOrOptions - 请求体类型或配置选项。默认为 `BodyType.JSON`。
 * @returns 一个函数，用于修改目标方法以向指定路径发出POST请求。
 *
 * @example
 * // 简单用法
 * @Post('/users')
 * createUser(@Body() user: User) {}
 *
 * // 指定 bodyType
 * @Post('/users', BodyType.JSON)
 * createUser(@Body() user: User) {}
 *
 * // 自定义 headers
 * @Post('/users', { headers: { 'Content-Type': 'application/vnd.api+json' } })
 * createUser(@Body() user: User) {}
 */
export function Post(path: string, bodyTypeOrOptions?: BodyType | RequestOptions): MethodDecorator {
  return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    return request(path, 'post', target, propertyKey, descriptor, bodyTypeOrOptions ?? BodyType.JSON)
  }
}

/**
 * Get 装饰器，用于将方法标记为 HTTP GET 请求。
 *
 * @param path - 请求的路径。
 * @param bodyTypeOrOptions - 请求体类型或配置选项，默认为 FORM_DATA。
 * @returns 装饰器函数。
 *
 * @example
 * @Get('/users')
 * getUsers(@Query() filter: Filter) {}
 */
export function Get(path: string, bodyTypeOrOptions?: BodyType | RequestOptions): MethodDecorator {
  return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    return request(path, 'get', target, propertyKey, descriptor, bodyTypeOrOptions ?? BodyType.FORM_DATA)
  }
}

/**
 * Put 装饰器，用于将方法标记为 HTTP PUT 请求。
 *
 * @param path - 请求的路径。
 * @param bodyTypeOrOptions - 请求体类型或配置选项，默认为 JSON。
 * @returns 装饰器函数。
 */
export function Put(path: string, bodyTypeOrOptions?: BodyType | RequestOptions): MethodDecorator {
  return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    return request(path, 'put', target, propertyKey, descriptor, bodyTypeOrOptions ?? BodyType.JSON)
  }
}

/**
 * Delete 装饰器，用于将方法标记为 HTTP DELETE 请求。
 *
 * @param path - 请求的路径。
 * @param bodyTypeOrOptions - 请求体类型或配置选项，默认为 FORM_DATA。
 * @returns 装饰器函数。
 */
export function Delete(path: string, bodyTypeOrOptions?: BodyType | RequestOptions): MethodDecorator {
  return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    return request(path, 'delete', target, propertyKey, descriptor, bodyTypeOrOptions ?? BodyType.FORM_DATA)
  }
}

/**
 * Patch 装饰器，用于将方法标记为 HTTP PATCH 请求。
 *
 * @param path - 请求的路径。
 * @param bodyTypeOrOptions - 请求体类型或配置选项，默认为 JSON。
 * @returns 装饰器函数。
 */
export function Patch(path: string, bodyTypeOrOptions?: BodyType | RequestOptions): MethodDecorator {
  return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    return request(path, 'patch', target, propertyKey, descriptor, bodyTypeOrOptions ?? BodyType.JSON)
  }
}

/**
 * 请求装饰器，用于装饰类方法以便在调用时发送 HTTP 请求。
 *
 * @param path - 请求的路径。
 * @param method - HTTP 请求方法（例如 'GET', 'POST'）。
 * @param target - 目标对象。
 * @param propertyKey - 被装饰方法的名称。
 * @param descriptor - 方法的属性描述符。
 * @param bodyTypeOrOptions - 请求体类型或配置选项，默认为 BodyType.FORM_DATA。
 * @returns 修改后的属性描述符。
 */
function request(
  path: string,
  method: string,
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
  bodyTypeOrOptions: BodyType | RequestOptions = BodyType.FORM_DATA,
): PropertyDescriptor {
  // 解析参数
  let bodyType: BodyType
  let decoratorHeaders: Record<string, string> = {}

  if (typeof bodyTypeOrOptions === 'object' && bodyTypeOrOptions !== null) {
    // 配置对象方式
    bodyType = bodyTypeOrOptions.bodyType ?? BodyType.JSON
    if (bodyTypeOrOptions.headers) {
      decoratorHeaders = normalizeHeaders(bodyTypeOrOptions.headers)
    }
  }
  else {
    // 简单参数方式（BodyType 枚举）
    bodyType = bodyTypeOrOptions
  }

  descriptor.value = async function (...args: unknown[]) {
    return doRequest({
      client: this as Client<unknown>,
      path,
      method,
      bodyType,
      decoratorHeaders,
      target,
      propertyKey,
      args,
    })
  }
  return descriptor
}

/**
 * doRequest 参数配置
 */
interface DoRequestConfig {
  client: Client<unknown>
  path: string
  method: string
  bodyType: BodyType
  decoratorHeaders: Record<string, string>
  target: object
  propertyKey: string | symbol
  args: unknown[]
}

async function doRequest(config: DoRequestConfig): Promise<unknown> {
  const { client, path: initialPath, method, bodyType, decoratorHeaders, target, propertyKey, args } = config
  const body: Record<string, unknown> = {}
  const query: Record<string, unknown> = {}
  const pathParams: Record<string, unknown> = {}
  // 先将装饰器级别的 headers 放入（优先级：参数 > 装饰器）
  const headers: Record<string, unknown> = { ...decoratorHeaders }

  const ctx: Ctx = { path: initialPath, method, contentType: bodyType, headers, body, query, pathParams, attribute: {} }

  if (!args?.length) {
    // 如果没有参数，直接发送请求
    return run(client, ctx)
  }

  // processArgs 会处理 @Header 参数，覆盖同名的装饰器 headers
  processArgs(args, target, propertyKey, ctx)

  // 替换路径参数
  let path = initialPath
  for (const key in pathParams) {
    path = path.replace(`{${key}}`, String(pathParams[key]))
  }
  ctx.path = path // 更新ctx.path为替换后的路径

  return run(client, ctx)
}

function processArgs(args: unknown[], target: object, propertyKey: string | symbol, ctx: Ctx): void {
  const { body = {}, query = {}, pathParams = {}, headers = {} } = ctx
  for (let i = 0; i < args.length; i++) {
    const item = args[i]
    const type = typeof item
    let name = Reflect.getMetadata(`paramName:${i}`, target, propertyKey)
    if (name) {
      body[name] = item
      continue
    }
    name = Reflect.getMetadata(`bodyName:${i}`, target, propertyKey)
    if (name && type === 'object') {
      Object.assign(body, item)
      continue
    }
    name = Reflect.getMetadata(`queryName:${i}`, target, propertyKey)
    if (name) {
      process(name, item, type, query, false)
      continue
    }
    name = Reflect.getMetadata(`pathName:${i}`, target, propertyKey)
    if (name) {
      process(name, item, type, pathParams, false)
      continue
    }
    name = Reflect.getMetadata(`headerName:${i}`, target, propertyKey)
    if (name) {
      process(name, item, type, headers, true) // headers 需要规范化
    }
  }
}

function process(
  name: string | true,
  item: unknown,
  type: string,
  target: Record<string, unknown>,
  isHeader: boolean = false,
): void {
  if (name === true) {
    if (type === 'object') {
      // 如果是 headers 对象，需要规范化
      if (isHeader) {
        const normalized = normalizeHeaders(item as Record<string, string>)
        Object.assign(target, normalized)
      }
      else {
        Object.assign(target, item)
      }
    }
  }
  else {
    // 如果是单个 header，规范化名称
    const finalName = isHeader ? normalizeHeaderName(name) : name
    target[finalName] = item
  }
}

/**
 * 运行客户端请求处理程序并处理请求和响应。
 *
 * @param client - 客户端实例。
 * @param ctx - 请求上下文。
 * @returns 请求的响应。
 * @throws ApiSdkError 如果请求过程中发生错误。
 */
async function run(client: Client<unknown>, ctx: Ctx): Promise<unknown> {
  client.doReqHandler(ctx)
  try {
    ctx.res = await client.doRequest(ctx)
  }
  catch (error) {
    ctx.error = new ApiSdkError(ctx, error as Error)
  }
  client.doResHandler(ctx)
  return ctx.res
}
