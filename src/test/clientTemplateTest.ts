import BaiduClient from './baiduClient';
import BaiduClientTemplate from './baiduClientTemplate';

async function main() {
  const baiduClient = new BaiduClient();
  const clientTemplate = new BaiduClientTemplate(baiduClient, true);
  await clientTemplate.initialize();

  setInterval(async () => {
    try {
      const a = await clientTemplate.client.sugrec('test', 'pc');
      console.log(a);
    } catch (error) {
      console.log(1111);
    }
  }, 5000);

  setInterval(async () => {
    try {
      console.log(clientTemplate.serverStatus);
    } catch (error) {}
  }, 1000);
}

main();
