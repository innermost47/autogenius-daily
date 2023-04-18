<?php

namespace App\Model;

use App\Model\Database;
use PDO;

class Article
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance();
    }

    public function getAll()
    {
        $query = "SELECT articles.*, categories.name as category_name FROM articles INNER JOIN categories ON articles.category_id = categories.id ORDER BY articles.created_at DESC";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOne($id)
    {
        $query = "SELECT articles.*, categories.name as category_name FROM articles INNER JOIN categories ON articles.category_id = categories.id WHERE articles.id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByCategory($category_id)
    {
        $query = "SELECT articles.*, categories.name as category_name FROM articles INNER JOIN categories ON articles.category_id = categories.id WHERE categories.id = :category_id ORDER BY articles.created_at DESC";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function post($title, $shortContent, $content, $image_url, $sources, $category_id)
    {
        $query = "INSERT INTO articles (title, short_content, content, image_url, sources, category_id) VALUES (:title, :short_content, :content, :image_url, :sources, :category_id)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':short_content', $shortContent);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':sources', $sources);
        $stmt->bindParam(':category_id', $category_id);
        return $stmt->execute();
    }

    public function getComments($article_id)
    {
        $query = "SELECT * FROM comments WHERE article_id = :article_id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':article_id', $article_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
