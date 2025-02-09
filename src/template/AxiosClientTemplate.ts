import { AxiosError } from 'axios';
import ClientTemplate from '.';
import ApiSdkError from '../client/apiSdkError';
import AxiosClient from '../client/axiosClient';
import { parseAxiosNetworkError } from '../utils/axiosUtils';

/**
 * Axios 客户端模板
 *
 * @author linden
 */
export default abstract class AxiosClientTemplate<T extends AxiosClient> extends ClientTemplate<T> {
  protected hungUpMsg(error: ApiSdkError | Error): string | void {
    let axiosError;
    if (error instanceof AxiosError) {
      axiosError = error;
    } else if (error instanceof ApiSdkError) {
      if (error.error && error.error instanceof AxiosError) {
        axiosError = error.error;
      }
    }
    if (!axiosError) {
      return;
    }
    return parseAxiosNetworkError(axiosError);
  }
}
