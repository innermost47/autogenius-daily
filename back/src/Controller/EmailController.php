<?php

namespace App\Controller;

use App\Model\Email;
use App\Model\User;
use App\Service\Authentication;
use App\Utilities\Utils;
use Dotenv\Dotenv;

class EmailController
{
    private $model;
    private $authentication;
    private $autoDailyEmail;

    public function __construct(Email $model, User $user)
    {
        $this->model = $model;
        $this->authentication = Authentication::getInstance($user);
        $dotenv = Dotenv::createImmutable(dirname(__DIR__, 2));
        $dotenv->load();
        $this->autoDailyEmail = $_ENV['AUTOGENIUS_DAILY_EMAIL'];
    }

    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        header('Content-Type: application/json');

        switch ($method) {
            case 'GET':
                $id = $_GET['id'] ?? null;
                $email = $_GET['email'] ?? null;
                $token = $_GET['token'] ?? null;
                if($token) {
                    $authenticated_user = $this->authentication->authenticateUserByToken($token);
                    if ($authenticated_user) {
                        if ($authenticated_user["role"] == "ADMIN") {
                            if ($id) {
                                $data = $this->model->setAsAnswered($id);
                            } elseif ($email) {
                                $email = $this->model->getOne($email);
                            } else {           
                                $data = $this->model->getAllNotReplied();
                            }
                            echo json_encode($data);
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
                } else {
                      header('HTTP/1.0 401 Unauthorized');
                      echo json_encode(['message' => 'Unauthorized']);
                      return;
                }
                break;
            case 'POST':
                $email = Utils::sanitizeInput($_POST['email']) ?? null;
                $sender = Utils::sanitizeInput($_POST['sender']) ?? null;
                $message = Utils::sanitizeInput($_POST['message']) ?? null;
                $token = $_POST["token"] ?? null;
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    header('HTTP/1.0 400 Bad Request');
                    echo json_encode(['message' => 'Bad Request']);
                    return;
                }
                if (empty(trim($message))) {
                    header('HTTP/1.0 400 Bad Request');
                    echo json_encode(['message' => 'Bad Request']);
                    return;
                }
                if ($token) {
                    $authenticated_user = $this->authentication->authenticateUserByToken($token);
                    if ($authenticated_user) {
                        if ($authenticated_user["role"] == "USER") {
                            $this->model->post($sender, $email, $message);
                            header('HTTP/1.0 200 OK');
                            echo json_encode(['message' => 'Email sent']);
                        } else {
                            Utils::sendEmail($email, "A message from AutoGenius Daily", $message, $this->autoDailyEmail, "AutoGenius Daily");
                            header('HTTP/1.0 200 OK');
                            echo json_encode(['message' => 'Email sent']);
                        }
                    } else {
                        header('HTTP/1.0 401 Unauthorized');
                        echo json_encode(['message' => 'Unauthorized']);
                        return;
                    }
                } else {
                    $this->model->post($sender, $email, $message);
                    header('HTTP/1.0 200 OK');
                    echo json_encode(['message' => 'Email sent']);
                }
                break;
        }
    }
}
