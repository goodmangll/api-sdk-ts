import { AxiosError } from 'axios';
import ApiSdkError from '../client/apiSdkError';
import Ctx from '../client/context';
import ConnStatus from './connStatus';
import FailureHandler from './failureHandler';
import { parseAxiosNetworkError } from '../utils/axiosUtils';
import ClientConfig from './clientConfig';
import Client from '../client';
import { sleep } from '../utils/threadUtil';

type RequiredClientConfig = {
  [K in keyof ClientConfig]-?: ClientConfig[K];
};

/**
 * 客户端模板基类
 * 提供客户端连接状态管理、错误处理和自动恢复等功能
 *
 * @template T - 客户端类型参数
 * @author linden
 */
export default abstract class ClientTemplate<T> implements FailureHandler {
  /** 服务端连接状态 */
  public readonly connStatus: ConnStatus;

  protected readonly clientConfig: RequiredClientConfig;

  private onConnStatusChange: () => void = () => {};

  private readonly defaultClientConfig: Readonly<ClientConfig> = Object.freeze({
    enableMonitor: false,
    heartbeatInterval: 5000,
  });

  private initialized: boolean = false;
  private waitPingPromise: Promise<void> | undefined;

  constructor(clientConfig?: ClientConfig) {
    this.connStatus = {
      available: false,
      message: 'not init',
    };
    this.clientConfig = {
      ...this.defaultClientConfig,
      ...clientConfig,
    } as RequiredClientConfig;
  }

  notifyError(error: ApiSdkError | Error): Promise<void> {
    return Promise.resolve();
  }

  tryRestore(ctx?: Ctx): Promise<void> {
    return Promise.resolve();
  }

  failMsg(error: ApiSdkError | Error): string | void {
    let axiosError;
    if (error instanceof AxiosError) {
      axiosError = error;
    } else if (error instanceof ApiSdkError) {
      if (error.error && error.error instanceof AxiosError) {
        axiosError = error.error;
      }
    }
    if (!axiosError) {
      return;
    }
    return parseAxiosNetworkError(axiosError);
  }

  /**
   * 初始化客户端
   */
  public async init(): Promise<void> {
    this.initClientProxy();
    await this.waitForConnectionReady();
    this.initialized = true;
  }

  private initClientProxy() {
    // 遍历当前对象的所有属性
    for (const key of Object.keys(this)) {
      const value = (this as any)[key];
      // 检查属性值是否是 Client 类型的实例
      if (value instanceof Client) {
        // 将 Client 类型的属性设置为 null
        (this as any)[key] = this.createClientProxy(value);
      }
    }
  }

  /**
   * 创建客户端代理对象
   * @template P - 目标对象类型
   * @param target - 需要代理的客户端对象
   * @returns 代理后的客户端对象
   */
  protected createClientProxy<P extends object>(target: P): Client<P> {
    return new Proxy(target as unknown as Client<P>, {
      get: (target: Client<P>, propKey: string | symbol, receiver: any): any => {
        const originalProp = Reflect.get(target, propKey, receiver);

        // 如果不是函数，直接返回原始值
        if (typeof originalProp !== 'function') {
          return originalProp;
        }

        // 返回代理函数
        return async (...args: unknown[]): Promise<unknown> => {
          try {
            const result = await Reflect.apply(originalProp, target, args);
            await this.doHandleResp(result);
            return result;
          } catch (error) {
            await this.doHandleError(error instanceof Error ? error : new Error(String(error)));
            throw error;
          }
        };
      },
    });
  }

  /**
   * 获取剩余检查间隔时间
   *
   * @returns 剩余检查间隔时间（毫秒）
   */
  private calculateRemainingCheckInterval(): number {
    const lastCheckEndTime = this.connStatus.lastCheckEndTime;
    if (!lastCheckEndTime) {
      // 还没检查过
      return 0;
    }
    return (
      this.clientConfig.heartbeatInterval - (new Date().getTime() - lastCheckEndTime.getTime())
    );
  }

  /**
   * 等待客户端正常
   *
   * @returns 无
   */
  private async waitForConnectionReady(): Promise<void> {

    this.waitPing().catch(() => {
      // nothing
    });
    await new Promise<void>((resolve) => {
      this.onConnStatusChange = () => {
        if (this.connStatus.available) {
          resolve();
        }
      };
    });
  }

  private async doHandleResp(resp: unknown) {
    this.parseConnStatus();
  }

  /**
   *
   * @param error
   */
  private async doHandleError(error: Error) {
    try {
      await this.notifyError(error);
      await this.tryRestore();
    } catch (error) {
      // nothing
    }
    this.parseConnStatus(error);
    const canPing =
      !this.connStatus.available && (this.clientConfig.enableMonitor || !this.initialized);
    if (canPing) {
      this.waitPing();
    }
  }

  /**
   * 解析连接状态
   * @param error - 可能的错误对象
   */
  private parseConnStatus(error?: Error): void {
    const now = new Date();
    this.connStatus.lastCheckEndTime = now;

    if (!error) {
      this.updateConnStatusSuccess();
      return;
    }

    const errorMessage = this.failMsg(error);
    if (!errorMessage) return;

    this.updateConnStatusFailure(errorMessage, now);
  }

  private updateConnStatusSuccess(): void {
    this.connStatus.available = true;
    this.connStatus.message = 'ok';
    this.onConnStatusChange();
  }

  private updateConnStatusFailure(message: string, timestamp: Date): void {
    this.connStatus.available = false;
    this.connStatus.message = message;
    this.connStatus.lastExceptionTime = timestamp;

    this.onConnStatusChange();
  }

  /**
   * 执行ping检查
   * @returns Promise<void>
   */
  private async waitPingPromiseFun(): Promise<void> {
    try {
      await this.ping();
    } catch (error) {
      // 忽略 ping 检查的错误
    } finally {
      this.waitPingPromise = undefined;
    }
  }

  private async waitPing(): Promise<void> {
    const interval = this.calculateRemainingCheckInterval();
    await sleep(interval);
    if (!this.waitPingPromise) {
      this.waitPingPromise = this.waitPingPromiseFun();
    }
    this.waitPingPromise.then(() => {
      this.waitPingPromise = undefined;
    });
  }

  /**
   * 检查服务端状态
   */
  public ping(): Promise<void> {
    return Promise.resolve();
  }
}
