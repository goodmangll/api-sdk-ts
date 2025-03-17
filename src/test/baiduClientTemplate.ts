import SingleClietTemplate from '../template/singleClientTemplate';
import BaiduClient from './baiduClient';

export default class BaiduClientTemplate extends SingleClietTemplate<BaiduClient> {


  public ping(): Promise<void> {
    return this.client.sugrec('test', 'pc');
  }

}
