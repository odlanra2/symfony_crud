<?php

namespace App\Controller\Api;

use App\Contract\ProductoServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface; // <-- Verifica este use
#[Route('/api/productos')]
class ProductoController extends AbstractController
{
  public function __construct(
        private ProductoServiceInterface $productoService, // <-- Tipado con la Interfaz
        private SerializerInterface $serializer
    ){}

    #[Route('', methods:['GET'])]
    public function getAllProductos(): JsonResponse
    {
        $productos = $this->productoService->getAllProductos();
        $data = $this->serializer->serialize($productos, 'json', ['groups'=>['producto:read']]);
        return new JsonResponse($data, Response::HTTP_OK, ['Content-type'=>'application/json'], true);
    }

    #[Route('/{id}', methods:['GET'])]
    public function getProductoById(int $id): JsonResponse
    {
        $producto = $this->productoService->getProductoById($id);
        if(!$producto){
            return new JsonResponse(['message'=> 'Producto no encontrado'], Response::HTTP_NOT_FOUND);
        }
        $data = $this->serializer->serialize($producto, 'json', ['groups'=>['producto:read']]);
        return new JsonResponse($data, Response::HTTP_OK, ['Content-type'=>'application/json'], true);
    }
    #[Route('', methods:['POST'])]
    public function createProducto(Request $request): JsonResponse
    {
         $data = json_decode($request->getContent(), true);
         $producto = $this->productoService->createProducto($data);
         $responseData = $this->serializer->serialize($producto, 'json', ['groups'=>['producto:read']]);
         return new JsonResponse($responseData, Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods:['PUT', 'PATCH'])]
    public function updateProducto(int $id, Request $request): JsonResponse
    {
        $producto = $this->productoService->getProductoById($id);
        if(!$producto){
            return new JsonResponse(['message'=> 'Producto no encontrado'], Response::HTTP_NOT_FOUND);
        }
        $data = json_decode($request->getContent(), true);
        $updatedProducto = $this->productoService->updateProducto($producto, $data);
        $responseData = $this->serializer->serialize($updatedProducto, 'json', ['groups'=>['producto:read']]);
        return new JsonResponse($responseData, Response::HTTP_OK);
    }
    
    #[Route('/{id}', methods:['DELETE'])]
    public function deleteProducto(int $id): JsonResponse
    {
        $producto = $this->productoService->getProductoById($id);
        if(!$producto){
            return new JsonResponse(['message'=> 'Producto no encontrado'], Response::HTTP_NOT_FOUND);
        }
        $this->productoService->deleteProducto($producto);
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
