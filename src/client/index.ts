import Ctx from "./context"

/**
 * 客户端
 * 
 * @author linden
 */
export default abstract class Client<T> {


    /** 连接器 */
    public connector: T

    public constructor(connector: T) {
        this.connector = connector
    }

    /**
     * 发送请求
     * @param ctx 上下文
     */
    public abstract doRequest(ctx: Ctx): Promise<any>

    
    /**
     * 拦截请求，可以对请求做处理
     * 
     * @param ctx 上下文
     */
    public doReqHandler(ctx: Ctx): void {
        // do nothing
    }


    /**
     * 拦截结果，可以对结果做处理
     * 
     * @param res 结果
     * @param error 异常
     * @returns 结果
     */
    public doResHandler(ctx: Ctx): void {
        if (ctx.error) {
            throw ctx.error
        }
    }

    /**
     * 工具方法，返回任何类型
     */
    protected any(): any {
        return null
    }


}