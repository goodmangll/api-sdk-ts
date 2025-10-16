/**
 * 暴露的接口
 *
 * @author linden
 */

export { default as Client } from './client'
export { ApiErrorType, default as ApiSdkError } from './client/apiSdkError'
export { default as AxiosClient } from './client/axiosClient'
export type { SerializerOptions } from './client/axiosClient'
export type { default as Ctx } from './client/context'
export type { RequestOptions } from './client/decorators'
export type {
  BaseSerializer,
  FormDataOptions,
  Serializer,
  UrlEncodedOptions,
} from './client/serializers'
export {
  CustomSerializer,
  FormDataSerializer,
  JsonSerializer,
  SerializerFactory,
  TextSerializer,
  UrlEncodedSerializer,
} from './client/serializers'
export { BodyType, ContentType } from './client/types'
export { default as ClientTemplate } from './template'
export type { default as ClientConfig } from './template/clientConfig'
export { default as SingleClientTemplate } from './template/singleClientTemplate'
