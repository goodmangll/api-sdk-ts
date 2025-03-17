import ClientTemplate from ".";
import ClientConfig from "./clientConfig";

export default abstract class SingleClietTemplate<T> extends ClientTemplate<T> {

  public readonly client: T;

  constructor(client: T, clientConfig?: ClientConfig) {
    super(clientConfig);
    this.client = client;
  }

}