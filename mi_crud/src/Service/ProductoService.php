<?php

namespace App\Service;

use App\Contract\ProductoServiceInterface; // <-- IMPORTANTE
use App\Entity\Producto;
use App\Repository\CategoriaRepository;
use App\Repository\ProductoRepository;
use Doctrine\ORM\EntityManagerInterface;

class ProductoService implements ProductoServiceInterface
{
    public function __construct(
        private ProductoRepository $productoRepository,
        private CategoriaRepository $categoriaRepository,
        private EntityManagerInterface $em
    ) {}

    public function getAllProductos(): array
    {
       //this->productoRepository->findAll(); // Lazy Loading • Deja la categoría en espera y no la busca en PostgreSQL hasta que el Serializer intenta leerla de forma individual, causando el problema de rendimiento N+1.
       //Eager Loading manual (carga proactiva)
       return $this->productoRepository->findAllWithCategoria();
    }

    public function getProductoById(int $id): ?Producto
    {
        return $this->productoRepository->find($id);
    }

    public function createProducto(array $data): Producto
    {
        $producto = new Producto();
        $producto->setNombre($data['nombre']);
        $producto->setPrecio($data['precio']);
        $producto->setDescripcion($data['descripcion'] ?? null);

        if (isset($data['categoria_id'])) {
            $categoria = $this->categoriaRepository->find($data['categoria_id']);
            if ($categoria) {
                $producto->setCategoria($categoria);
            }
        }

        $this->em->persist($producto);
        $this->em->flush();

        return $producto;
    }

    public function updateProducto(Producto $producto, array $data): Producto
    {
        if (isset($data['nombre'])) {
            $producto->setNombre($data['nombre']);
        }
        if (isset($data['precio'])) {
            $producto->setPrecio($data['precio']);
        }

        if(isset($data['descripcion'])) {
            $producto->setDescripcion($data['descripcion']);
        }
        if (isset($data['categoria_id'])) {
            $categoria = $this->categoriaRepository->find($data['categoria_id']);
            if ($categoria) {
                $producto->setCategoria($categoria);
            }
        }

        $this->em->flush();
        return $producto;
    }


    public function deleteProducto(Producto $producto): void
    {
        $this->em->remove($producto);
        $this->em->flush();
    }


    // ... (El resto del código se queda exactamente igual)
}
