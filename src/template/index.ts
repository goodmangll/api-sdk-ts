import ApiSdkError from '../client/apiSdkError';
import Ctx from '../client/context';
import ServerStatus from './serverStatus';
import { sleep } from '../utils/threadUtil';

/**
 * 客户端模板
 *
 * @author linden
 */
export default abstract class ClientTemplate<T> {
  /** 检查间隔时间 （单位：毫秒） */
  protected checkIntervalTime = 2000;

  /** 服务端状态 */
  public readonly serverStatus: ServerStatus;

  /** 是否管理服务端状态 */
  protected manageServerStatus: boolean;

  /** 客户端 */
  public client: T;

  /** 等待服务端可用的Promise */
  private awaitAvailablePromise: Promise<void> | undefined;

  /**
   *
   * @param client 客户端
   * @param manageServerStatus 是否管理服务端状态（监听状态、自动恢复）
   */
  constructor(client: T, manageServerStatus: boolean = false) {
    this.client = this.createProxy(client);
    this.serverStatus = {
      available: true,
      message: 'ok',
    };
    this.manageServerStatus = manageServerStatus;
  }

  /**
   * 初始化客户端
   *
   * @returns 无
   */
  public async initialize(): Promise<void> {
    if (this.manageServerStatus) {
      this.doManageServerStatus();
    }
  }

  /**
   * 创建代理对象，拦截方法调用
   *
   * @param target 目标对象
   * @returns 代理对象
   */
  private createProxy<T>(target: T): T {
    const that = this;
    return new Proxy(target as Object, {
      get(target: any, propKey: string, receiver: any) {
        if (typeof target[propKey] !== 'function') {
          // 对于非方法属性，直接返回属性值
          return Reflect.get(target, propKey, receiver);
        }
        return function (...args: any[]) {
          const fun = () => {
            return target[propKey](...args);
          };
          // 在方法调用后检查服务端状态
          return that.checkAndGet(fun, false, true);
        };
      },
    }) as T;
  }

  /**
   * 获取剩余检查间隔时间
   *
   * @returns 剩余检查间隔时间（毫秒）
   */
  private remainingCheckIntervalTime(): number {
    const lastCheckEndTime = this.serverStatus.lastCheckEndTime;
    if (!lastCheckEndTime) {
      // 还没检查过
      return 0;
    } else return this.checkIntervalTime - (Date.now() - lastCheckEndTime.getTime());
  }

  /**
   * 等待客户端正常
   *
   * @returns 无
   */
  public async awaitAvailable(): Promise<void> {
    if (this.serverStatus.available) {
      return;
    }
    await this.awaitAvailablePromise;
  }

  /**
   * 检查请状态并，获取结果的异步方法，如果服务端不可用，会自动监听服务端状态并恢复
   *
   * @param checkFun - 一个返回 Promise 的函数，用于执行检查操作。
   * @param listen - 一个布尔值，指示是否在异常情况下监听服务器状态变化，默认为 false。
   * @param throwErr - 一个布尔值，指示是否在捕获到异常时抛出异常，默认为 false。
   * @returns 返回一个 Promise，解析为检查操作的结果。
   * @throws 如果 throwErr 为 true 且捕获到异常，则抛出该异常。
   */
  private async checkAndGet(
    checkFun: () => Promise<any>,
    listen = false,
    throwErr = false,
  ): Promise<any> {
    this.serverStatus.lastCheckBeginTime = new Date();
    let res;
    let err: Error | undefined = undefined;
    try {
      res = await checkFun();
    } catch (error) {
      err = error as Error;
    }
    const now = new Date();
    this.serverStatus.lastCheckEndTime = now;

    if (!err) {
      this.serverStatus.available = true;
      this.serverStatus.message = 'ok';
      return res;
    }

    const msg = this.hungUpMsg(err);
    if (msg) {
      this.serverStatus.available = false;
      this.serverStatus.message = msg;
      this.serverStatus.lastExceptionTime = now;
      this.serverStatus.lastRestoreBeginTime = now;
      let ctx;
      if (err instanceof ApiSdkError) {
        ctx = err.ctx;
      }
      try {
        await this.restore(ctx);
      } catch {
        // nothing
      }
      this.serverStatus.lastRestoreEndTime = new Date();

      if (listen) {
        this.doManageServerStatus();
      }
    }

    // 出现异常，但是未解析出异常信息，处于模糊状态（可能是用户传参有问题），不对serverStaus做处理
    if (throwErr) {
      throw err;
    }
  }

  private async doManageServerStatus(): Promise<void> {
    if (this.awaitAvailablePromise) {
      // 正在监听中，无需再监听
      return;
    }

    this.awaitAvailablePromise = new Promise<void>((resolve, reject) => {
      const check = async () => {
        try {
          while (true) {
            await sleep(this.remainingCheckIntervalTime());
            await this.checkAndGet(() => this.ping());
            if (this.serverStatus.available) {
              resolve();
              return;
            }
          }
        } catch (error) {
          // no nothing
        }
      };
      check();
    }).finally(() => {
      this.awaitAvailablePromise = undefined;
    });
  }

  /**
   * 检查服务端状态
   *
   * - 首次创建对象后会持续调用该方法监听服务端状态，直到服务恢复。
   *
   * - 当服务端不可用时，会继续持续监听，直到服务恢复
   *
   * @returns 服务端状态
   */
  public abstract ping(): Promise<void>;

  /**
   * 服务异常处理，恢复服务
   *
   * @param ctx 请求上下文
   */
  protected abstract restore(ctx?: Ctx): Promise<void>;

  /**
   * 解析服务端不可用异常信息
   *
   *
   * 服务端未启动或者服务端核心功能不可用视为服务不可用
   *
   * @param error 异常信息，如果非服务端不可用，无需返回
   */
  protected abstract hungUpMsg(error: ApiSdkError | Error): string | void;
}
