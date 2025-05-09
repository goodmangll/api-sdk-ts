import BaiduClient from './baiduClient'
import BaiduClientTemplate from './baiduClientTemplate'

async function main() {
  const baiduClient = new BaiduClient()
  const clientTemplate = new BaiduClientTemplate(baiduClient)
  await clientTemplate.init()
  console.warn('init')
  console.warn(clientTemplate.connStatus)

  setInterval(async () => {
    try {
      const a = await clientTemplate.client.sugrec('test', 'pc')
      console.warn(a)
    }
    catch (error) {
      console.warn(error)
    }
  }, 5000)

  setInterval(async () => {
    try {
      console.warn(clientTemplate.connStatus)
    }
    catch (error) {
      console.warn(error)
    }
  }, 1000)
}

main()
