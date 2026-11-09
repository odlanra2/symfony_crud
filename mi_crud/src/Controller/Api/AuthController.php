<?php

namespace App\Controller\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class AuthController extends AbstractController
{
    
    #[Route('/login_check', name: 'api_login_check', methods: ['POST'])]
    public function loginCheck(): void
    {
        // Dejar el método completamente vacío.
        // Symfony interceptará la petición aquí y ejecutará el validador del JWT automáticamente.
        throw new \LogicException('Este código nunca debería ejecutarse si el firewall está bien configurado.');
    }


    
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request, 
        EntityManagerInterface $em, 
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        // Validamos que vengan los datos obligatorios
        if (!isset($data['email']) || !isset($data['password'])) {
            return new JsonResponse(['message' => 'Credenciales incompletas'], Response::HTTP_BAD_REQUEST);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setRoles(['ROLE_USER']);
        
        // 1. Encriptamos la contraseña de forma segura (Argon2id/Bcrypt automático)
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // 2. Guardamos en PostgreSQL
        $em->persist($user);
        $em->flush();

        return new JsonResponse(['message' => 'Usuario registrado con éxito'], Response::HTTP_CREATED);
    }
}