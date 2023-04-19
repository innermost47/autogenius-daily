<?php

namespace App\Model;

use App\Model\Database;
use PDO;

class Email
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance();
    }

    public function getAllNotReplied()
    {
        $query = "SELECT * FROM emails WHERE is_replied = 0";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOne($id)
    {
        $query = "SELECT * FROM email WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function post($sender, $emailSender, $message)
    {
        $query = "INSERT INTO email (sender, email_sender, message) VALUES (:sender, :email_sender, :message)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':sender', $sender);
        $stmt->bindParam(':email_sender', $emailSender);
        $stmt->bindParam(':message', $message);
        return $stmt->execute();
    }

    public function delete($id)
    {
        $query = "DELETE FROM email WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function setAsAnswered($id)
    {
        $query = "UPDATE email SET is_replied = 1 WHERE id = :id";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
