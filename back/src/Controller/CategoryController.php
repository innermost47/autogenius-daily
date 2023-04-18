<?php

namespace App\Controller;

use App\Model\Category;

class CategoryController
{
    private $model;

    public function __construct(Category $model)
    {
        $this->model = $model;
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
                    $data = $this->model->getOne($id);
                } elseif ($category) {
                    $category = $this->model->getOne($category);
                } else {
                    $data = $this->model->getAll();
                }
                echo json_encode($data);
                break;
        }
    }
}
