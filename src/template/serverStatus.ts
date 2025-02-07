
/**
 * 服务端状态
 * 
 * @author linden
 */
export default interface ServerStatus {

    /** 是否可用（只要启动了服务端并且核心功能可以用，就算可用） */
    available: boolean

    /** 状态描述 */
    message: string

    /** 上一次检查服务开始时间 */
    lastCheckBeginTime?: Date

    /** 上一次检查服务结束时间 */
    lastCheckEndTime?: Date

    /** 上一次异常时的时间 */
    lastExceptionTime?: Date

    /** 上一次恢复服务开始时间 */
    lastRestoreBeginTime?: Date

    /** 上一次恢复服务结束时间 */
    lastRestoreEndTime?: Date
    
}