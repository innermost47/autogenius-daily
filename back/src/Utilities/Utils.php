<?php

namespace App\Utilities;

use Dotenv\Dotenv;
use stdClass;

class Utils
{

    public static function sanitizeInput($input)
    {
        return trim(stripslashes(htmlspecialchars($input, ENT_QUOTES, 'UTF-8')));
    }

    public static function isSecurePassword($password)
    {
        $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/';
        return preg_match($pattern, $password);
    }

    public static function sendEmail($to, $subject, $message, $fromEmail, $fromName)
    {
        if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
            header('HTTP/1.0 400 Bad Request');
            echo json_encode(['message' => 'Bad Request']);
            return;
        }

        if (empty(trim($subject)) || empty(trim($message))) {
            header('HTTP/1.0 400 Bad Request');
            echo json_encode(['message' => 'Bad Request']);
            return;
        }

        $headers = 'MIME-Version: 1.0' . "\r\n";
        $headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
        $headers .= 'From: ' . $fromName . ' <' . $fromEmail . '>' . "\r\n";

        return mail($to, Utils::sanitizeInput($subject), Utils::sanitizeInput($message), $headers);
    }

    public static function getPerspectiveScore($content)
    {
        $dotenv = Dotenv::createImmutable(dirname(__DIR__, 2));
        $dotenv->load();
        $api_key = $_ENV['PERSPECTIVE_API_KEY'];
        $url = "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key={$api_key}";
        $data = [
            "comment" => ["text" => $content],
            "requestedAttributes" => ["TOXICITY" => new stdClass()]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $decoded_response = json_decode($response, true);
        $score = $decoded_response["attributeScores"]["TOXICITY"]["summaryScore"]["value"];

        return $score;
    }
}
