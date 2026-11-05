<?php

namespace App\Contract;

use App\Entity\Categoria;

interface CategoriaServiceInterface
{
    public function getAllCategorias(): array;
    public function getCategoriaById(int $id): ?Categoria;
    public function createCategoria(Categoria $categoria): Categoria;
    public function updateCategoria(Categoria $categoria, array $data): Categoria;
    public function deleteCategoria(Categoria $categoria): void;
}