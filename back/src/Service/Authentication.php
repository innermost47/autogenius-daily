<?php

namespace App\Service;

use App\Model\User;
use Firebase\JWT\JWT;
use Dotenv\Dotenv;
use Firebase\JWT\Key;

class Authentication
{
    private static $instance = null;
    private $user;
    private $secretKey;

    private function __construct(User $user)
    {
        $this->user = $user;
        $dotenv = Dotenv::createImmutable(dirname(__DIR__, 2));
        $dotenv->load();
        $this->secretKey = $_ENV['SECRET_KEY'];
    }

    public static function getInstance(User $user)
    {
        if (self::$instance === null) {
            self::$instance = new Authentication($user);
        }
        return self::$instance;
    }

    public function authenticateUserByToken($token)
    {
        if (!$token) {
            return null;
        }

        try {
            $decoded_jwt = JWT::decode($token, new Key($this->secretKey, 'HS256'));
            $user_id = $decoded_jwt->sub;
        } catch (\Exception $e) {
            error_log($e->getMessage());
            return null;
        }

        return $this->user->getOne($user_id);
    }

    public function generateJWT($id, $username, $email, $role)
    {
        $issued_at = time();
        $expiration_time = $issued_at + (60 * 60);
        $payload = array(
            'iat' => $issued_at,
            'exp' => $expiration_time,
            'sub' => $id,
            'username' => $username,
            'email' => $email,
            'role' => $role
        );

        $header = array(
            'alg' => 'HS256',
            'typ' => 'JWT',
            'kid' =>  $this->secretKey
        );

        return JWT::encode($payload, $this->secretKey, 'HS256', null, $header);
    }
}
