import http from '../api'
import type { Producto } from '../models/tienda.interface';

//const API_URL = 'http://127.0.0.1:9000/api/productos';

export const ProductoDataService = {
  async findAll(): Promise<Producto[]> {
    const response = await http.get<Producto[]>('/productos');
    return response.data;
  },
  async create(payload: any): Promise<any> {
    const response = await http.post('/productos', payload);
    return response.data;
  },
  async update(id: number, payload: any): Promise<any> {
    const response = await http.put(`productos/${id}`, payload);
    return response.data;
  },
  async delete(id: number): Promise<void> {
    await http.delete(`productos/${id}`);
  }
};
