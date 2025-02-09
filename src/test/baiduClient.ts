import Axios from 'axios';
import AxiosClient from '../client/axiosClient';
import { Get, Query } from '../client/decorators';

export default class BaiduClient extends AxiosClient {
  
  constructor() {
    const axios = Axios.create({
      baseURL: 'https://www.baidu.com',
      timeout: 10000,
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      },
    });
    super(axios);
  }

  @Get('/sugrec')
  public async sugrec(@Query('wd') wd: string, @Query('prod') prod: string): Promise<any> {
    return this.any();
  }
}