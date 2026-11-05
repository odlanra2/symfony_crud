<?php

namespace App\Service;

use App\Contract\CategoriaServiceInterface; // <-- IMPORTANTE
use App\Entity\Categoria;
use App\Repository\CategoriaRepository;
use Doctrine\ORM\EntityManagerInterface;

class CategoriaService implements CategoriaServiceInterface
{
    public function __construct(
        private CategoriaRepository $repository,
        private EntityManagerInterface $em
    ) {}

    public function getAllCategorias(): array
    {
        return $this->repository->findAll();
    }

    public function getCategoriaById(int $id): ?Categoria
    {
        return $this->repository->find($id);
    }

    public function createCategoria(Categoria $categoria): Categoria
    {
        $this->em->persist($categoria);
        $this->em->flush();
        return $categoria;
    }

    public function updateCategoria(Categoria $categoria, array $data): Categoria
    {
        if (isset($data['nombre'])) {
            $categoria->setNombre($data['nombre']);
        }
        $this->em->flush();
        return $categoria;
    }

    public function deleteCategoria(Categoria $categoria): void
    {
        $this->em->remove($categoria);
        $this->em->flush();
    }
   

    // ... (El resto del código se queda exactamente igual)
}
