<?php

require_once __DIR__ . '/vendor/autoload.php';

parse_str(file_get_contents("php://input"), $input_data);

$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
    case 'GET':
        $page = $_GET['page'] ?? null;
        $id = $_GET['id'] ?? null;
        break;
    case 'POST':
        $page = $_POST['page'] ?? null;
        $id = $_POST['id'] ?? null;
        break;
    case 'PUT':
        $page = $_POST['page'] ?? null;
        $id = $_POST['id'] ?? null;
        break;
    case 'DELETE':
        $page = $input_data['page'] ?? null;
        $id = $input_data['id'] ?? null;
        break;
    default:
        $page = null;
        $id = null;
}

switch ($page) {
    case 'articles':
        require_once 'src/Controller/ArticleController.php';
        $model = new App\Model\Article();
        $user_model = new App\Model\User();
        $category_model = new App\Model\Category();
        $comment_model = new App\Model\Comment();
        $controller = new App\Controller\ArticleController($model, $user_model, $category_model, $comment_model);
        $controller->handleRequest();
        break;
    case 'users':
        require_once 'src/Controller/UserController.php';
        $model = new App\Model\User();
        $controller = new App\Controller\UserController($model);
        $controller->handleRequest();
        break;
    case 'categories':
        require_once 'src/Controller/CategoryController.php';
        $model = new App\Model\Category();
        $controller = new App\Controller\CategoryController($model);
        $controller->handleRequest();
        break;
    case 'comments':
        require_once 'src/Controller/CommentController.php';
        $model = new App\Model\Comment();
        $user_model = new App\Model\User();
        $controller = new App\Controller\CommentController($model, $user_model);
        $controller->handleRequest();
        break;
    case 'email':
        require_once 'src/Controller/EmailController.php';
        $model = new App\Model\Email();
        $user_model = new App\Model\User();
        $controller = new App\Controller\EmailController($model, $user_model);
        $controller->handleRequest();
        break;
    default:
        header('HTTP/1.0 404 Not Found');
        echo json_encode(['message' => 'Not Found']);
        exit();
}
