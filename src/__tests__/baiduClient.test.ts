import BaiduClient from '../test/baiduClient'

describe('baiduClient', () => {
  let client: BaiduClient

  beforeEach(() => {
    client = new BaiduClient()
  })

  describe('sugrec', () => {
    it('should make a successful request to sugrec endpoint', async () => {
      const response = await client.sugrec('test', 'pc')
      expect(response).toBeDefined()
    })

    it('should handle empty parameters gracefully', async () => {
      const response = await client.sugrec('', '')
      expect(response).toEqual({ q: '' })
    })
  })
})
