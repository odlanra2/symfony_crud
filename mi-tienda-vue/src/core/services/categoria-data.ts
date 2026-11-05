import axios from 'axios';
import type { Categoria } from '../models/tienda.interface';

const API_URL = 'http://127.0.0.1:9000/api/categorias';

export const CategoriaDataService = {
  async findAll(): Promise<Categoria[]> {
    const response = await axios.get<Categoria[]>(API_URL);
    return response.data;
  }
};