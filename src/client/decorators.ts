/**
 * 请求装饰器，用于装饰类方法以便在调用时发送 HTTP 请求。
 * 
 * @author logan
 */


import "reflect-metadata"
import { ContentType } from "./type";
import Client from ".";
import Ctx from "./context";
import ApiSdkError from "./apiSdkError";



/**
 * 参数装饰器，用于在方法参数上定义元数据。
 * 
 * @param name - 参数的名称。
 * 
 * @remarks
 * 此装饰器用于在方法中标记参数，以便在 POST 提交中使用 JSON 格式或在 GET 提交中使用 form data。
 * 
 * @example
 * ```typescript
 * class MyClass {
 *     myMethod(@Param('id') id: string) {
 *         // 方法实现
 *     }
 * }
 * ```
 */
export function Param(name: string) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        Reflect.defineMetadata(`paramName:${parameterIndex}`, name, target, propertyKey);
    }
}


/**
 * Query 装饰器用于将参数拼接到查询字符串中。
 * 
 * @param name - 查询参数的名称。如果为 `true`，则使用参数的名称。
 * @returns 一个装饰器函数，用于在目标方法上定义元数据。
 */
export function Query(name: string | true = true) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        Reflect.defineMetadata(`queryName:${parameterIndex}`, name, target, propertyKey);
    }
}

/**
 * Header 装饰器用于将参数添加到请求头中。
 * 
 * @param name - 请求头的名称。
 * @returns 一个装饰器函数，用于在目标方法上定义元数据。
 */
export function Header(name: string) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        Reflect.defineMetadata(`headerName:${parameterIndex}`, name, target, propertyKey);
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
export function Path(name: string | true = true) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        Reflect.defineMetadata(`pathName:${parameterIndex}`, name, target, propertyKey);
    }
}


/**
 * HTTP POST请求的装饰器函数。
 *
 * @param path - POST请求的端点路径。
 * @param contentType - 请求的内容类型。默认为 `ContentType.JSON`。
 * @returns 一个函数，用于修改目标方法以向指定路径发出POST请求。
 */
export function Post(path: string, contentType: ContentType = ContentType.JSON) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        return request(path, 'post', target, propertyKey, descriptor, contentType)
    }
}


/**
 * Get 装饰器，用于将方法标记为 HTTP GET 请求。
 *
 * @param path - 请求的路径。
 * @param contentType - 请求的内容类型，默认为 FORM_DATA。
 * @returns 装饰器函数。
 */
export function Get(path: string, contentType: ContentType = ContentType.FORM_DATA) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        return request(path, 'get', target, propertyKey, descriptor, contentType)
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
 * @param contentType - 请求的内容类型，默认为 ContentType.FORM_DATA。
 * @returns 修改后的属性描述符。
 */
function request(path: string, method: string, target: any, propertyKey: string, descriptor: PropertyDescriptor, contentType: ContentType = ContentType.FORM_DATA) {
    descriptor.value = async function (...args: any[]) {
        return doRequest(this as Client<any>, path, method, contentType, target, propertyKey, args)
    }
    return descriptor
}

async function doRequest(client: Client<any>, path: string, method: string, contentType: ContentType, target: any, propertyKey: string, args: any[]) {
    let body: Record<string, unknown> = {}
    let query: Record<string, unknown> = {}
    let pathParams: Record<string, unknown> = {}
    let headers: Record<string, unknown> = {}

    if (!(args?.length)) {
        // 如果没有参数，直接发送请求
        const ctx: Ctx = { path, method, contentType, body, query, pathParams, attribute: {} }
        return run(client, ctx)
    }

    if (args?.length === 1 && typeof args[0] === 'object') {
        // 如果只有一个参数且为对象，则认为是body
        body = args[0]
    }

    // 多个参数的情况
    for (let i = 0; i < args.length; i++) {
        const item = args[i]
        const type = typeof item
        let name = Reflect.getMetadata(`paramName:${i}`, target, propertyKey)
        if (name) {
            body[name] = item
            continue
        }
        name = Reflect.getMetadata(`queryName:${i}`, target, propertyKey)
        if (name) {
            if (name === true) {
                if (type === 'object') {
                    query = { ...query, ...item }
                }
            } else {
                query[name] = item
            }

        }
        name = Reflect.getMetadata(`pathName:${i}`, target, propertyKey)
        if (name) {
            if (name === true) {
                if (type === 'object') {
                    pathParams = { ...query, ...item }
                }
            } else {
                pathParams[name] = item
            }
        }

        name = Reflect.getMetadata(`headerName:${i}`, target, propertyKey)
        if (name) {
            if (name === true) {
                if (type === 'object') {
                    headers = { ...headers, ...item }
                }
            } else {
                headers[name] = item
            }
        }
    }

    for (const key in pathParams) {
        path = path.replace(`{${key}}`, String(pathParams[key]));
    }
    const ctx: Ctx = { path, method, contentType, headers,  body, query, pathParams, attribute: {} }
    return run(client, ctx)
}



/**
 * 运行客户端请求处理程序并处理请求和响应。
 *
 * @param client - 客户端实例。
 * @param ctx - 请求上下文。
 * @returns 请求的响应。
 * @throws ApiSdkError 如果请求过程中发生错误。
 */
async function run(client: Client<any>, ctx: Ctx) {
    client.doReqHandler(ctx)
    try {
        ctx.res = await client.doRequest(ctx)
    } catch (error) {
        ctx.error = new ApiSdkError(ctx, error as Error)
    }
    client.doResHandler(ctx)
    return ctx.res
}