<?php

namespace App\Controller;

use App\Model\Comment;
use App\Model\User;
use App\Service\Authentication;
use App\Utilities\Utils;

class CommentController
{
    private $model;
    private $user;
    private $authentication;

    public function __construct(Comment $model, User $user)
    {
        $this->model = $model;
        $this->user = $user;
        $this->authentication = Authentication::getInstance($this->user);
    }

    public function handleRequest()
    {
        parse_str(file_get_contents("php://input"), $input_data);
        $method = $_SERVER['REQUEST_METHOD'];
        header('Content-Type: application/json');

        switch ($method) {
            case 'GET':
                $id = $_GET['id'] ?? null;
                $article_id = $_GET['article_id'] ?? null;
                if ($id) {
                    $data = $this->model->getOne($id);
                } else if ($article_id) {
                    $data = $this->model->getAll($article_id);
                } else {
                    $token = $_GET['token'] ?? null;
                    $authenticated_user = $this->authentication->authenticateUserByToken($token);
                    if ($authenticated_user["role"] == "ADMIN") {
                        $data = $this->model->getAllArticlesWithAllCommentsWithLastCommentIsNotBot();
                    } else {
                        header('HTTP/1.0 403 Forbidden');
                        echo json_encode(['message' => 'Forbidden']);
                        return;
                    }
                }
                echo json_encode(Utils::convertHtmlEntities($data));
                break;
            case 'POST':
                $token = $_POST['token'] ?? null;
                $content = Utils::sanitizeInput($_POST['content']) ?? null;
                $article_id = Utils::sanitizeInput($_POST['article_id']) ?? null;
                $result = null;
                if ($token) {
                    $authenticated_user = $this->authentication->authenticateUserByToken($token);
                    if ($authenticated_user) {
                        $authenticated_user_id = $authenticated_user['id'];
                        if (!$content || !$article_id) {
                            header('HTTP/1.0 400 Bad Request');
                            echo json_encode(['message' => 'Bad Request']);
                            return;
                        }
                        if ($authenticated_user["role"] == "USER") {
                            $toxicity_threshold = 0.75;
                            $score = Utils::getPerspectiveScore($content);
                            if ($score < $toxicity_threshold) {
                                $result = $this->model->postByHuman($authenticated_user_id, $article_id, $content);
                            } else {
                                header('HTTP/1.0 400 Bad Request');
                                $result = [
                                    "status" => "error",
                                    "message" => "moderation"
                                ];
                                echo json_encode($result);
                                return;
                            }
                        } else {
                            $result = $this->model->postByBot($authenticated_user_id, $article_id, $content);
                        }
                        if ($result) {
                            header('HTTP/1.0 201 Created');
                            echo json_encode(['message' => 'Created']);
                        } else {
                            header('HTTP/1.0 500 Internal Server Error');
                            echo json_encode(['message' => 'Internal Server Error']);
                        }
                    } else {
                        header('HTTP/1.0 403 Forbidden');
                        echo json_encode(['message' => 'Forbidden']);
                        return;
                    }
                }
                break;
            case 'PUT':
                $token = $input_data['token'] ?? null;
                $id = Utils::sanitizeInput($input_data['id']) ?? null;
                $content = Utils::sanitizeInput($input_data['content']) ?? null;
                if ($token) {
                    $authenticated_user = $this->authentication->authenticateUserByToken($token);
                    if ($authenticated_user) {
                        $authenticated_user_id = $authenticated_user['id'];
                        if (!$content) {
                            header('HTTP/1.0 400 Bad Request');
                            echo json_encode(['message' => 'Bad Request']);
                            return;
                        }
                        if ($authenticated_user["role"] == "USER") {
                            $result = $this->model->update($id, $content);
                        }
                        if ($result) {
                            echo json_encode(['message' => 'Updated']);
                        } else {
                            header('HTTP/1.0 500 Internal Server Error');
                            echo json_encode(['message' => 'Internal Server Error']);
                        }
                    } else {
                        header('HTTP/1.0 403 Forbidden');
                        echo json_encode(['message' => 'Forbidden']);
                        return;
                    }
                }
                break;
            case 'DELETE':
                $token = $input_data['token'] ?? null;
                $id = Utils::sanitizeInput($input_data['id']) ?? null;
                if (!$id) {
                    header('HTTP/1.0 400 Bad Request');
                    echo json_encode(['message' => 'Bad Request']);
                    return;
                }
                if ($token) {
                    $authenticated_user = $this->authentication->authenticateUserByToken($token);
                    $comment = $this->model->getOne($id);
                    $result = $this->model->delete($id);
                    if ($result) {
                        echo json_encode(['message' => 'Deleted']);
                    } else {
                        header('HTTP/1.0 500 Internal Server Error');
                        echo json_encode(['message' => 'Internal Server Error']);
                    }
                    if (!$comment) {
                        header('HTTP/1.0 404 Not Found');
                        echo json_encode(['message' => 'Not Found']);
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
