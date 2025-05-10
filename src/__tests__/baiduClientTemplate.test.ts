import BaiduClient from '../test/baiduClient'
import BaiduClientTemplate from '../test/baiduClientTemplate'

describe('baiduClientTemplate', () => {
  let client: BaiduClient
  let template: BaiduClientTemplate

  beforeEach(() => {
    client = new BaiduClient()
    template = new BaiduClientTemplate(client)
  })

  describe('init', () => {
    it('should initialize successfully', async () => {
      await template.init()
      expect(template.connStatus).toBeDefined()
    })
  })

  describe('ping', () => {
    it('should make a successful ping request', async () => {
      await expect(template.ping()).resolves.not.toThrow()
    })
  })
})
