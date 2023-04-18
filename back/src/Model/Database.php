<?php

namespace App\Model;

use Dotenv\Dotenv;
use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $pdo;
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $dsn;

    public function __construct()
    {
        $dotenv = Dotenv::createImmutable(dirname(__DIR__, 2));
        $dotenv->load();
        $this->host = $_ENV['DB_HOST'];
        $this->db_name = $_ENV['DB_NAME'];
        $this->username = $_ENV['DB_USER'];
        $this->password = $_ENV['DB_PASS'];
        $this->dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->db_name . ';';

        try {
            $this->pdo = new PDO($this->dsn, $this->username, $this->password);
        } catch (PDOException $e) {
            echo 'Erreur de connexion: ' . $e->getMessage();
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance->pdo;
    }
}
