<?php

namespace App\Contract;

use App\Entity\Producto;

interface ProductoServiceInterface
{
    public function getAllProductos(): array;
    public function getProductoById(int $id): ?Producto;
    public function createProducto(array $data): Producto;
    public function updateProducto(Producto $producto, array $data): Producto;
    public function deleteProducto(Producto $producto): void;
}
