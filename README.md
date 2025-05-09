# api-sdk-ts

一个用于构建 TypeScript API SDK 的轻量级框架，提供了便捷的请求装饰器、服务状态管理和自动重试功能。

## 特性

- 支持 HTTP GET/POST/PUT/DELETE/PATCH 请求装饰器
- 内置服务端状态监控和自动恢复机制
- 支持 JSON 和 Form-data 格式请求
- 基于 Axios 的 HTTP 客户端实现
- 完整的 TypeScript 类型支持
- 智能错误处理机制
- 灵活的请求参数装饰器

## 安装

使用 npm：
```bash
npm install api-sdk-ts
```

使用 pnpm：
```bash
pnpm add api-sdk-ts
```

## 快速开始

1. 创建 API 客户端类：

```typescript
import { AxiosClient, Body, Get, Post, Query } from 'api-sdk-ts'
import axios from 'axios'

// 定义响应类型
interface User {
  id: number
  name: string
  email: string
}

interface CreateUserDto {
  name: string
  email: string
}

// 创建客户端类
class MyApiClient extends AxiosClient<User> {
  constructor() {
    // 创建 Axios 实例
    const axiosInstance = axios.create({
      baseURL: 'https://api.example.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    super(axiosInstance)
  }

  @Get('/users')
  async getUsers(@Query('page') page: number = 1): Promise<User[]> {
    return this.any()
  }

  @Post('/users')
  async createUser(@Body() data: CreateUserDto): Promise<User> {
    return this.any()
  }
}
```

2. 创建客户端模板，添加状态管理和重试功能：

```typescript
import { ClientConfig, SingleClientTemplate } from 'api-sdk-ts'
import { MyApiClient } from './myApiClient'

class MyApiTemplate extends SingleClientTemplate<MyApiClient> {
  constructor(client: MyApiClient, config?: ClientConfig) {
    super(client, {
      enableMonitor: true,
      heartbeatInterval: 10000,
      ...config
    })
  }

  // 实现健康检查方法
  public ping(): Promise<void> {
    return this.client.getUsers(1).then(() => {})
  }
}
```

3. 使用客户端：

```typescript
async function main() {
  // 创建客户端
  const apiClient = new MyApiClient()
  const apiTemplate = new MyApiTemplate(apiClient)

  // 初始化客户端（会进行连接检查）
  await apiTemplate.init()
  console.log('客户端已初始化')

  try {
    // 获取用户列表
    const users = await apiTemplate.client.getUsers()
    console.log('用户列表:', users)

    // 创建新用户
    const newUser = await apiTemplate.client.createUser({
      name: '张三',
      email: 'zhangsan@example.com'
    })
    console.log('新用户:', newUser)
  }
  catch (error) {
    console.error('请求失败:', error)
  }

  // 查看连接状态
  console.log('连接状态:', apiTemplate.connStatus)
}

main()
```

## API 文档

### 客户端类

#### `Client<T, R>`

基础客户端抽象类，定义了客户端的基本接口。

- `T`: 连接器类型
- `R`: 响应数据类型

#### `AxiosClient<R>`

基于 Axios 的客户端实现，继承自 `Client<AxiosInstance, R>`。

- `R`: 响应数据类型

### 装饰器

#### `@Get(path: string, contentType?: ContentType)`

用于 GET 请求的装饰器。

- `path`: 请求路径
- `contentType`: 内容类型，默认为 `ContentType.FORM_DATA`

#### `@Post(path: string, contentType?: ContentType)`

用于 POST 请求的装饰器。

- `path`: 请求路径
- `contentType`: 内容类型，默认为 `ContentType.JSON`

#### `@Put(path: string, contentType?: ContentType)`

用于 PUT 请求的装饰器。

- `path`: 请求路径
- `contentType`: 内容类型，默认为 `ContentType.JSON`

#### `@Delete(path: string, contentType?: ContentType)`

用于 DELETE 请求的装饰器。

- `path`: 请求路径
- `contentType`: 内容类型，默认为 `ContentType.FORM_DATA`

#### `@Patch(path: string, contentType?: ContentType)`

用于 PATCH 请求的装饰器。

- `path`: 请求路径
- `contentType`: 内容类型，默认为 `ContentType.JSON`

#### `@Query(name?: string | true)`

查询参数装饰器，用于添加 URL 查询参数。

- `name`: 参数名称，如果为 `true` 则使用参数名称

#### `@Body()`

请求体装饰器，用于添加请求体数据。

#### `@Param(name: string)`

路径参数装饰器，用于替换路径中的参数。

#### `@Header(name: string)`

请求头装饰器，用于添加请求头。

### 模板类

#### `ClientTemplate<T>`

客户端模板基类，提供连接状态管理和错误处理功能。

- `T`: 客户端类型

#### `SingleClientTemplate<T>`

单客户端模板类，继承自 `ClientTemplate<T>`，简化了单客户端的使用。

- `T`: 客户端类型

### 错误处理

#### `ApiSdkError`

API SDK 错误类，封装了请求过程中的错误信息。

属性：
- `error`: 原始错误对象
- `ctx`: 请求上下文
- `errorType`: 错误类型
- `retryable`: 是否可重试
- `retryDelay`: 建议的重试延迟（毫秒）
- `statusCode`: HTTP 状态码

#### 错误类型 `ApiErrorType`

- `NETWORK`: 网络错误
- `TIMEOUT`: 请求超时
- `SERVER`: 服务端错误
- `CLIENT`: 客户端错误
- `UNKNOWN`: 未知错误

### 配置选项

#### `ClientConfig`

客户端配置接口。

- `enableMonitor`: 是否启用监控
- `heartbeatInterval`: 心跳检测间隔（毫秒）

## 高级用法

### 自定义错误处理

```typescript
class MyApiTemplate extends SingleClientTemplate<MyApiClient> {
  // 重写错误通知方法
  async notifyError(error: ApiSdkError | Error): Promise<void> {
    console.error('API 错误:', error instanceof ApiSdkError ? error.getFormattedMessage() : error.message)
    // 可以在这里添加日志记录或监控报警
  }

  // 重写恢复尝试方法
  async tryRestore(ctx?: Ctx): Promise<void> {
    console.log('尝试恢复连接...')
    // 可以在这里添加自定义恢复逻辑
  }
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 运行测试
pnpm test

# 查看测试覆盖率
pnpm test:coverage

# 格式化代码
pnpm format

# 代码检查
pnpm lint
```

## 许可证

ISC

## 作者

linden
