import axios from 'axios';
import type { Producto } from '../models/tienda.interface';

const API_URL = 'http://127.0.0.1:9000/api/productos';

export const ProductoDataService = {
  async findAll(): Promise<Producto[]> {
    const response = await axios.get<Producto[]>(API_URL);
    return response.data;
  },
  async create(payload: any): Promise<any> {
    const response = await axios.post(API_URL, payload);
    return response.data;
  },
  async update(id: number, payload: any): Promise<any> {
    const response = await axios.put(`${API_URL}/${id}`, payload);
    return response.data;
  },
  async delete(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  }
};
