import BaiduClient from './baiduClient'

async function main() {
  const client = new BaiduClient()
  const _resp = await client.sugrec('test', 'pc')
  // console.log(resp)
}

main()
