import http from './api'
import type { Credentials, ResponseToken, RegistroPayload } from './sesion'

export const authApi = {
    async login(credenciales: Credentials): Promise<ResponseToken> {
        const response = await http.post('/login_check', credenciales);
        return response.data;
    },

    async register(payload: RegistroPayload): Promise<any> {
        const response = await http.post('/register', payload);
        return response.data;
    },

    async me(): Promise<any> {
        const response = await http.get('/me');
        return response.data;
    }
}