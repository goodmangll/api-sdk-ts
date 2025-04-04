import Client from './client';
import AxiosClient from './client/axiosClient';
import { ContentType } from './client/type';
import ClientTemplate from './template';
import { Param, Get, Post, Query, Header, Body } from './client/decorators';
import Ctx from './client/context';
import ApiSdkError from './client/apiSdkError';
import ClientConfig from './template/clientConfig';

/**
 * 暴露的接口
 *
 * @author linden
 */

export {
  Client,
  AxiosClient,
  ContentType,
  ClientTemplate,
  ClientConfig,
  Ctx,
  ApiSdkError,
  Body,
  Param,
  Get,
  Post,
  Query,
  Header,
};
