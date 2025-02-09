import BaiduClient from "./baiduClient";
import BaiduClientTemplate from "./baiduClientTemplate";

async function main() {
  const baiduClient = new BaiduClient();
  const clientTemplate = new BaiduClientTemplate(baiduClient, true);
  await clientTemplate.initialize();

  setInterval(async () => {
    try {
      await clientTemplate.client.sugrec('test', 'pc');
    } catch (error) {
      console.error(error);
    }
  }, 1000);

  setInterval(async () => {
    try {
      console.log(clientTemplate.serverStatus)
    } catch (error) {
      console.error(error);
    }
  }, 2000);
}

main();