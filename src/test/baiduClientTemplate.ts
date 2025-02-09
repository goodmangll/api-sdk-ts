import Ctx from '../client/context';
import AxiosClientTemplate from '../template/AxiosClientTemplate';
import BaiduClient from './baiduClient';

export default class BaiduClientTemplate extends AxiosClientTemplate<BaiduClient> {
  public ping(): Promise<void> {
    return this.client.sugrec('test', 'pc');
  }

  protected restore(ctx?: Ctx): Promise<void> {
    return Promise.resolve();
  }
}
