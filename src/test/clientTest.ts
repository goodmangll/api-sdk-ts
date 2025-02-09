import BaiduClient from "./baiduClient";


async function main() {
  const client = new BaiduClient();
  const resp = await client.sugrec('test', 'pc');
  console.log(resp);
}

main();
