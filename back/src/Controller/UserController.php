<?php

namespace App\Controller;

use App\Model\User;
use App\Service\Authentication;
use App\Utilities\Utils;

class UserController
{
    private $model;
    private $authentication;

    public function __construct(User $model)
    {
        $this->model = $model;
        $this->authentication = Authentication::getInstance($this->model);
    }

    public function handleRequest()
    {
        parse_str(file_get_contents("php://input"), $input_data);
        $method = $_SERVER['REQUEST_METHOD'];
        header('Content-Type: application/json');

        switch ($method) {
            case 'POST':
                $action = $_POST['action'] ?? null;

                switch ($action) {
                    case 'register':
                        $username = Utils::sanitizeInput($_POST['username']) ?? null;
                        $password = Utils::sanitizeInput($_POST['password']) ?? null;
                        $email = Utils::sanitizeInput($_POST['email']) ?? null;
                        $isInBdd = $this->model->checkIfExistInBdd($username, $email);
                        if ($isInBdd["count"] != 0) {
                            header('HTTP/1.0 409 Conflict');
                            echo json_encode(['message' => 'Email or username already taken']);
                            return;
                        }
                        if (!$username || !$password || !$email) {
                            header('HTTP/1.0 400 Bad Request');
                            echo json_encode(['message' => 'Bad Request']);
                            return;
                        }
                        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                            header('HTTP/1.0 400 Bad Request');
                            echo json_encode(['message' => 'Bad Request']);
                            return;
                        }
                        if (!Utils::isSecurePassword($password)) {
                            header('HTTP/1.0 400 Bad Request');
                            echo json_encode(['message' => 'Bad Request']);
                            return;
                        }
                        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                        $result = $this->model->create($username, $hashed_password, $email);
                        if ($result) {
                            header('HTTP/1.0 201 Created');
                            echo json_encode(['message' => 'User Created']);
                        } else {
                            header('HTTP/1.0 500 Internal Server Error');
                            echo json_encode(['message' => 'Internal Server Error']);
                        }
                        break;

                    case 'login':
                        $email = Utils::sanitizeInput($_POST['email']) ?? null;
                        $password = Utils::sanitizeInput($_POST['password']) ?? null;
                        if (!$email || !$password) {
                            header('HTTP/1.0 400 Bad Request');
                            echo json_encode(['message' => 'Bad Request']);
                            return;
                        }
                        $user = $this->model->getUserByEmail($email);
                        if ($user && password_verify($password, $user['password'])) {
                            $jwt = $this->authentication->generateJWT($user['id'], $user['username'], $user['email'], $user["role"]);
                            header('HTTP/1.0 200 OK');
                            echo json_encode(['token' => $jwt]);
                        } else {
                            header('HTTP/1.0 401 Unauthorized');
                            echo json_encode(['message' => 'credentials']);
                        }
                        break;

                    default:
                        header('HTTP/1.0 400 Bad Request');
                        echo json_encode(['message' => 'Bad Request']);
                        break;
                }
                break;

            case 'PUT':
                $token = $input_data['token'] ?? null;
                $username = Utils::sanitizeInput($input_data['username']) ?? null;
                $password = Utils::sanitizeInput($input_data['password']) ?? null;
                $email = Utils::sanitizeInput($input_data['email']) ?? null;
                if ($token) {
                    $authenticated_user = $this->authentication->authenticateUserByToken($token);
                    if ($authenticated_user) {
                        if (!$username && !$password && !$email) {
                            header('HTTP/1.0 400 Bad Request');
                            echo json_encode(['message' => 'Bad Request']);
                            return;
                        }
                        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                            header('HTTP/1.0 400 Bad Request');
                            echo json_encode(['message' => 'Bad Request']);
                            return;
                        }
                        if ($password) {
                            if (!Utils::isSecurePassword($password)) {
                                header('HTTP/1.0 400 Bad Request');
                                echo json_encode(['message' => 'Bad Request']);
                                return;
                            }
                            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                        } else {
                            $hashed_password = null;
                        }
                        $authenticated_user_id = $authenticated_user["id"];
                        $result = $this->model->update($authenticated_user_id, $username, $hashed_password, $email);
                        if ($result) {
                            header('HTTP/1.0 200 OK');
                            echo json_encode(['message' => 'User Updated']);
                        } else {
                            header('HTTP/1.0 500 Internal Server Error');
                            echo json_encode(['message' => 'Internal Server Error']);
                        }
                    } else {
                        header('HTTP/1.0 401 Unauthorized');
                        echo json_encode(['message' => 'Unauthorized']);
                        return;
                    }
                } else {
                    header('HTTP/1.0 401 Unauthorized');
                    echo json_encode(['message' => 'Unauthorized']);
                    return;
                }
                break;

            case 'DELETE':
                $token = $input_data['token'] ?? null;
                if ($token) {
                    $authenticated_user = $this->authentication->authenticateUserByToken($token);
                    if ($authenticated_user) {
                        $authenticated_user_id = $authenticated_user["id"];
                        $result = $this->model->delete($authenticated_user_id);
                        if ($result) {
                            header('HTTP/1.0 200 OK');
                            echo json_encode(['message' => 'User Deleted']);
                        } else {
                            header('HTTP/1.0 500 Internal Server Error');
                            echo json_encode(['message' => 'Internal Server Error']);
                        }
                    } else {
                        header('HTTP/1.0 401 Unauthorized');
                        echo json_encode(['message' => 'Unauthorized']);
                        return;
                    }
                } else {
                    header('HTTP/1.0 401 Unauthorized');
                    echo json_encode(['message' => 'Unauthorized']);
                    return;
                }
                break;

            default:
                header('HTTP/1.0 405 Method Not Allowed');
                echo json_encode(['message' => 'Method Not Allowed']);
                break;
        }
    }
}
