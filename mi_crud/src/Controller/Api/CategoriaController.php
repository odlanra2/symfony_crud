<?php

namespace App\Controller\Api;

use App\Contract\CategoriaServiceInterface;
use App\Entity\Categoria;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface; // <-- Verifica este use

#[Route('/api/categorias', name:'api_categorias')]
class CategoriaController extends AbstractController
{
    public function __construct(
        private CategoriaServiceInterface $categoriaService, // <-- Tipado con la Interfaz
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: '/get_all_categorias', methods: ['GET'])]
    public function getAllCategorias(): JsonResponse
    {
        $categorias = $this->categoriaService->getAllCategorias();
        $data = $this->serializer->serialize($categorias, 'json',['groups'=> ['categoria:read']]);
        return new JsonResponse($data, Response::HTTP_OK,['Content-type'=>'application/json'],true);

    }
    
    #[Route('/{id}', name:'/get_categoria_by_id', methods:['GET'])]
    public function getCategoriaById(int $id): JsonResponse
    {
         $categoria = $this->categoriaService->getCategoriaById($id);
         if(!$categoria){
            return new JsonResponse(['message'=>'Categoria no encontrada'],Response::HTTP_NOT_FOUND);
         }
         $data = $this->serializer->serialize($categoria,'json',['groups'=>['categoria']]);
         return new JsonResponse($data,Response::HTTP_OK,['Content-type'=> 'application/json'],true);
    }
    
    #[Route('', name:'/create_categoria', methods:['POST'])]
    public function createCategoria(Request $request): JsonResponse
    {
      // 1. Convertimos el JSON crudo directamente en un Objeto de tipo Categoria
        /** @var Categoria $categoria */
        $categoria = $this->serializer->deserialize($request->getContent(), Categoria::class, 'json');
        
        // 2. Enviamos el objeto al servicio (cumpliendo con el tipado estricto)
        $nuevaCategoria = $this->categoriaService->createCategoria($categoria);
        
        // 3. Serializamos la respuesta para enviarla de vuelta a Vue
        $data = $this->serializer->serialize($nuevaCategoria, 'json', ['groups' => ['categoria:read']]);
        
        return new JsonResponse($data, Response::HTTP_CREATED, ['Content-Type' => 'application/json'], true);
    }
    #[Route('/{id}', name: 'api_categorias_update', methods: ['PUT', 'PATCH'])]
    public function updateCategoria(int $id, Request $request): JsonResponse
    {
        // 1. Buscamos la categoría real existente en PostgreSQL
        $categoria = $this->categoriaService->getCategoriaById($id);
        if (!$categoria) {
            return new JsonResponse(['message' => 'Categoria no encontrada'], Response::HTTP_NOT_FOUND);
        }

        // 2. Decodificamos el JSON que viene de Vue a un array asociativo PHP
        $data = json_decode($request->getContent(), true);
        if ($data === null) {
            return new JsonResponse(['message' => 'JSON inválido'], Response::HTTP_BAD_REQUEST);
        }

        // 3. Le pasamos el objeto original de la BD y los nuevos datos al Servicio
        // Tu CategoriaService ya está preparado para leer ['nombre'] y guardarlo
        $categoriaActualizada = $this->categoriaService->updateCategoria($categoria, $data);

        // 4. Serializamos el objeto modificado para responderle a Vue
        $responseData = $this->serializer->serialize($categoriaActualizada, 'json', ['groups' => ['categoria:read']]);
        
        return new JsonResponse($responseData, Response::HTTP_OK, ['Content-Type' => 'application/json'], true);
    }
    
    #[Route('/{id}', name: 'api_categorias_delete', methods: ['DELETE'])]
    public function deleteCategoria(int $id): JsonResponse
    {
        $categoria = $this->categoriaService->getCategoriaById($id);
        if (!$categoria) {
            return new JsonResponse(['message' => 'Categoria no encontrada'], Response::HTTP_NOT_FOUND);
        }

        $this->categoriaService->deleteCategoria($categoria);
        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

}