<?php

namespace App\Controller;

use App\Model\Article;
use App\Model\User;
use App\Model\Category;
use App\Service\Authentication;
use App\Utilities\Utils;
use App\Model\Comment;

class ArticleController
{
    private $model;
    private $user;
    private $category;
    private $authentication;
    private $comment;

    public function __construct(Article $model, User $user, Category $category, Comment $comment)
    {
        $this->model = $model;
        $this->user = $user;
        $this->category = $category;
        $this->comment = $comment;
        $this->authentication = Authentication::getInstance($this->user);
    }

    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        header('Content-Type: application/json');

        switch ($method) {
            case 'GET':
                $id = $_GET['id'] ?? null;
                $category = $_GET['category'] ?? null;
                if ($id) {
                    $article = $this->model->getOne($id);
                    $comments = $this->comment->getCommentsByArticleId($id);
                    $data = [
                        'article' => $article,
                        'comments'=> $comments,
                    ];
                } elseif ($category) {
                    $category = $this->category->getOne($category);
                    $data = $this->model->getByCategory($category["id"]);
                } else {
                    $data = $this->model->getAll();
                }
                echo json_encode($data);
                break;
            case 'POST':
                $token = $_POST['token'] ?? null;
                $authenticated_user = $this->authentication->authenticateUserByToken($token);
                if ($authenticated_user["role"] == "ADMIN") {
                    $title = Utils::sanitizeInput($_POST['title']) ?? null;
                    $shortContent = Utils::sanitizeInput($_POST['short_content']) ?? null;
                    $content = Utils::sanitizeInput($_POST['content']) ?? null;
                    $image_url = Utils::sanitizeInput($_POST['image_url']) ?? null;
                    $category = Utils::sanitizeInput($_POST['category']) ?? null;
                    $sources = Utils::sanitizeInput($_POST['sources']) ?? null;
                    if (!$title || !$shortContent || !$content || !$category || !$sources || !$image_url) {
                        header('HTTP/1.0 400 Bad Request');
                        echo json_encode(['message' => 'Bad Request', 'details' => ['title' => $title, 'short_content' => $shortContent, 'content' => $content, 'category' => $category, 'sources' => $sources, 'image_url' => $image_url]]);
                        return;
                    }
                    $category_id = $this->category->getOneByName($category)["id"];
                    $sources_json = json_encode($sources);
                    $result = $this->model->post($title, $shortContent, $content, $image_url, $sources_json, $category_id);
                    if ($result) {
                        header('HTTP/1.0 201 Created');
                        echo json_encode(['message' => 'Created']);
                    } else {
                        header('HTTP/1.0 500 Internal Server Error');
                        echo json_encode(['message' => 'Internal Server Error']);
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
