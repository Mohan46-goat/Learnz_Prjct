<?php

namespace App\Controllers;

use App\Services\NotificationService;
use App\Helpers\ResponseHelper;

class NotificationController
{
    private NotificationService $notificationService;

    public function __construct()
    {
        $pdo = $this->getDB();
        $this->notificationService = new NotificationService($pdo);
    }

    private function getDB(): \PDO
    {
        $config = require __DIR__ . '/../../config/database.php';
        return new \PDO(
            "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}",
            $config['username'],
            $config['password'],
            [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
        );
    }

    public function index(): void
    {
        $userId = $_SESSION['user_id'] ?? null;

        try {
            $notifications = $this->notificationService->getNotifications($userId);
            ResponseHelper::json(['notifications' => $notifications]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve notifications', 'errors' => []], 500);
        }
    }

    public function markRead(int $id): void
    {
        $userId = $_SESSION['user_id'] ?? null;

        try {
            $this->notificationService->markAsRead($id, $userId);
            ResponseHelper::json(['success' => true, 'message' => 'Notification marked as read', 'data' => []]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to mark notification as read', 'errors' => []], 500);
        }
    }

    public function markAllRead(): void
    {
        $userId = $_SESSION['user_id'] ?? null;

        try {
            $this->notificationService->markAllAsRead($userId);
            ResponseHelper::json(['success' => true, 'message' => 'All notifications marked as read', 'data' => []]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to mark all notifications as read', 'errors' => []], 500);
        }
    }
}