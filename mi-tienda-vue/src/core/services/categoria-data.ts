import http from '../api'
import type { Categoria } from '../models/tienda.interface';

const API_URL = '/categorias';

export const CategoriaDataService = {
  async findAll(): Promise<Categoria[]> {
    const response = await http.get<Categoria[]>(API_URL);
    return response.data;
  }
};