/**
 * 客户端配置
 */
export default interface ClientConfig {
  /** 是否启用监控 */
  enableMonitor?: boolean
  /** 心跳检测间隔（毫秒） */
  heartbeatInterval?: number
}
