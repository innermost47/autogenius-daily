<?php

namespace App\Model;

use App\Model\Database;
use PDO;

class Comment
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance();
    }

    public function getAll($article_id)
    {
        $query = "SELECT * FROM comments WHERE article_id = :article_id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':article_id', $article_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOne($id)
    {
        $query = "SELECT * FROM comments WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function postByHuman($user_id, $article_id, $content)
    {
        $query = "INSERT INTO comments (content, user_id, article_id, is_bot) VALUES (:content, :user_id, :article_id, 0)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':article_id', $article_id);
        return $stmt->execute();
    }

    public function postByBot($user_id, $article_id, $content)
    {
        $query = "INSERT INTO comments (content, user_id, article_id, is_bot) VALUES (:content, :user_id, :article_id, 1)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':article_id', $article_id);
        return $stmt->execute();
    }

    public function delete($id)
    {
        $query = "DELETE FROM comments WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function update($id, $content)
    {
        $query = "UPDATE comments SET content = :content WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function getCommentsByArticleId($article_id)
    {
        $query = "SELECT comments.*, users.username FROM comments INNER JOIN users ON comments.user_id = users.id WHERE comments.article_id = :article_id ORDER BY comments.created_at DESC";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':article_id', $article_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllArticlesWithAllCommentsWithLastCommentIsNotBot()
    {
        $query = "SELECT articles.*, categories.name as category_name FROM articles INNER JOIN categories ON articles.category_id = categories.id ORDER BY articles.created_at DESC LIMIT 10";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute();
        $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($articles as &$article) {
            $query = "SELECT comments.*, users.username FROM comments INNER JOIN users ON comments.user_id = users.id WHERE comments.article_id = :article_id ORDER BY comments.created_at ASC";
            $stmt = $this->pdo->prepare($query);
            $stmt->bindParam(':article_id', $article['id']);
            $stmt->execute();
            $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (count($comments) > 0 && !$comments[count($comments) - 1]['is_bot']) {
                $article['comments'] = $comments;
            } else {
                $article['comments'] = null;
            }
        }

        return $articles;
    }

    public function isCommentOwner($commentId, $ownerId)
    {
        $query = "SELECT * FROM comments WHERE id = :id AND user_id = :user_id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':id', $commentId);
        $stmt->bindParam(':user_id', $ownerId);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
