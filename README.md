# api-sdk-ts

一个用于构建 TypeScript API SDK 的轻量级框架，提供了便捷的请求装饰器和服务状态管理功能。

## 特性

- 支持 HTTP GET/POST 请求装饰器
- 内置服务端状态监控和自动恢复机制
- 支持 JSON 和 Form-data 格式请求
- 基于 Axios 的 HTTP 客户端实现
- 完整的 TypeScript 类型支持

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
import { ApiClient, Get, Post } from 'api-sdk-ts';

class MyApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: 'https://api.example.com',
    });
  }

  @Get('/users')
  async getUsers(): Promise<User[]> {
    return this.request();
  }

  @Post('/users')
  async createUser(data: CreateUserDto): Promise<User> {
    return this.request(data);
  }
}
```

2. 使用客户端：

```typescript
const client = new MyApiClient();

// 获取用户列表
const users = await client.getUsers();

// 创建新用户
const newUser = await client.createUser({
  name: 'John Doe',
  email: 'john@example.com'
});
```

## API 文档

### ApiClient

基础客户端类，提供以下配置选项：

- `baseURL`: API 基础 URL
- `timeout`: 请求超时时间（毫秒）
- `headers`: 自定义请求头

### 装饰器

#### @Get(path: string)

用于 GET 请求的装饰器。

#### @Post(path: string)

用于 POST 请求的装饰器。

### 状态管理

框架内置了服务状态管理机制，可以自动检测服务健康状态并进行恢复：

```typescript
client.checkHealth(); // 检查服务健康状态
client.setHealthy(true); // 手动设置服务状态
```

## 开发

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 运行测试
pnpm test

# 格式化代码
pnpm format
```

## 许可证

ISC

## 作者

linden
