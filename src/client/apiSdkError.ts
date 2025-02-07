import Ctx from "./context"

export default class ApiSdkError extends Error {
    
    /** 原始的错误 */
    public error?: Error

    /** 请求上下文  */
    public ctx: Ctx

    constructor(ctx: Ctx, error?: Error, message?: string) {
        if (!message && error) {
            message = error.message
        }
        super(message)
        this.ctx = ctx
        this.error = error
        this.name = 'ApiSdkError'
        Object.setPrototypeOf(this, ApiSdkError.prototype);
    }
}