import { AxiosError } from 'axios';

// 错误代码对应的中文信息
const networkErrorMessages: Record<string, string> = {
  ERR_NETWORK: '一般网络错误',
  ECONNABORTED: '请求被中止',
  ETIMEDOUT: '请求超时',
  EAI_AGAIN: 'DNS查找临时失败',
};

export function parseAxiosNetworkError(error: AxiosError): string | void {
  if (!error.code) {
    return;
  }
  return networkErrorMessages[error.code];
}
