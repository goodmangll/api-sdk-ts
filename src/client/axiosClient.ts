import { AxiosInstance } from "axios";
import Client from ".";
import { ContentType } from "./type";
import Ctx from "./context";

/**
 * axios客户端模板
 * 
 * @author logan
 */
export default class AxiosClient extends Client<AxiosInstance> {

    /**
     * 将对象转换为formData
     * 
     * @param data 对象
     * @returns formData
     */
    private toFormData(data: Record<string, unknown>) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value instanceof Blob || value instanceof File) {
                formData.append(key, value);
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    formData.append(`${key}[${index}]`, String(item));
                });
            } else {
                formData.append(key, String(value));
            }
        });
        return formData;
    }

    public async doRequest(ctx: Ctx): Promise<any> {
        const { path, method, contentType, body: data, query: params, headers } = ctx
        if (method === 'get' && contentType === ContentType.JSON) {
            throw new Error('get 提交不能使用 json 格式')
        }

        let body: Record<string, unknown> | FormData = data ?? {}

        if (contentType === ContentType.FORM_DATA) {
            body = this.toFormData(body)
        }

        const res = await this.connector.request({
            url: path,
            params,
            method,
            data: body,
            headers: headers as never
        })
        return res.data
    }
}