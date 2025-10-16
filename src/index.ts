import type Ctx from './client/context'
import type ClientConfig from './template/clientConfig'
import Client from './client'
import ApiSdkError, { ApiErrorType } from './client/apiSdkError'
import AxiosClient from './client/axiosClient'
import { ContentType } from './client/type'
import ClientTemplate from './template'
import SingleClientTemplate from './template/singleClientTemplate'

/**
 * 暴露的接口
 *
 * @author linden
 */

export {
  ApiErrorType,
  ApiSdkError,
  AxiosClient,
  Client,
  ClientConfig,
  ClientTemplate,
  ContentType,
  Ctx,
  SingleClientTemplate,
}
