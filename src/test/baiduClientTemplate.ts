import type BaiduClient from './baiduClient'
import SingleClientTemplate from '../template/singleClientTemplate'

export default class BaiduClientTemplate extends SingleClientTemplate<BaiduClient> {
  public ping(): Promise<void> {
    return this.client.sugrec('test', 'pc')
  }
}
