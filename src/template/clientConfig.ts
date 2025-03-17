export default interface ClientConfig {
  /** 心跳间隔 */
  heartbeatInterval?: number;
  /** 是否开启监控，当开启监控时，会自动监听服务端状态，自动恢复 */
  enableMonitor?: boolean;
}