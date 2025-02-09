import ApiSdkError from "../client/apiSdkError";
import Ctx from "../client/context";
import ClientTemplate from "../template";
import BaiduClient from "./baiduClient";


export default class BaiduClientTemplate extends ClientTemplate<BaiduClient> {

  public ping(): Promise<void> {
    return this.client.sugrec('test', 'pc');
  }
  protected restore(ctx?: Ctx): Promise<void> {
    return Promise.resolve();
  }
  protected hungUpMsg(error: ApiSdkError | Error): string | void {
    return error.message;
  }

}