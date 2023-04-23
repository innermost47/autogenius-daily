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

    public function getAll($offset, $limit)
    {
        $query = "SELECT articles.*, categories.name as category_name FROM articles INNER JOIN categories ON articles.category_id = categories.id ORDER BY articles.created_at DESC LIMIT :offset, :limit";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
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

    public function getOneBySlug($slug)
    {
        $query = "SELECT articles.*, categories.name as category_name FROM articles INNER JOIN categories ON articles.category_id = categories.id WHERE articles.slug = :slug";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function getByCategory($category_id, $offset, $limit)
    {
        $query = "SELECT articles.*, categories.name as category_name FROM articles INNER JOIN categories ON articles.category_id = categories.id WHERE categories.id = :category_id ORDER BY articles.created_at DESC LIMIT :offset, :limit";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function post($title, $shortContent, $content, $image_url, $sources, $category_id, $slug)
    {
        $query = "INSERT INTO articles (title, short_content, content, image_url, sources, category_id, slug) VALUES (:title, :short_content, :content, :image_url, :sources, :category_id, :slug)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':short_content', $shortContent);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':sources', $sources);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->bindParam(':slug', $slug);
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

    public function getTotalArticles()
    {
        $query = "SELECT COUNT(*) as total FROM articles";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getTotalArticlesByCategory($category_id)
    {
        $query = "SELECT COUNT(*) as total FROM articles WHERE category_id = :category_id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
