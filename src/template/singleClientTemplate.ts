import type ClientConfig from './clientConfig'
import ClientTemplate from '.'

export default abstract class SingleClientTemplate<T> extends ClientTemplate<T> {
  public readonly client: T

  constructor(client: T, clientConfig?: ClientConfig) {
    super(clientConfig)
    this.client = client
  }
}
