import Client from './client'
import ApiSdkError, { ApiErrorType } from './client/apiSdkError'
import AxiosClient from './client/axiosClient'
import Ctx from './client/context'
import { Body, Delete, Get, Header, Param, Patch, Post, Put, Query } from './client/decorators'
import { ContentType } from './client/type'
import ClientTemplate from './template'
import ClientConfig from './template/clientConfig'
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
  Body,
  Client,
  ClientConfig,
  ClientTemplate,
  ContentType,
  Ctx,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Put,
  Query,
  SingleClientTemplate,
}
