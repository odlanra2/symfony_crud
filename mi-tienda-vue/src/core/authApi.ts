import http from './api'
import type { Credentials, ResponseToken, RegistroPayload } from './sesion'

export const authApi = {
    async login(credenciales: Credentials): Promise<ResponseToken> {
        const response = await http.post('/auth/login', credenciales);
        return response.data;
    },

    async register(payload: RegistroPayload): Promise<any> {
        const response = await http.post('/auth/register', payload);
        return response.data;
    },

    async me(): Promise<any> {
        const response = await http.get('/auth/me');
        return response.data;
    }
}