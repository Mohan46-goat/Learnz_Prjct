<?php

namespace App\Services;

class NotificationService
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function getNotifications(int $userId, bool $onlyUnread = false, int $limit = 50): array
    {
        $notificationModel = new \App\Models\Notification($this->db);
        return $notificationModel->findByUser($userId, $onlyUnread, $limit);
    }

    public function getUnreadCount(int $userId): int
    {
        $notificationModel = new \App\Models\Notification($this->db);
        return $notificationModel->getUnreadCount($userId);
    }

    public function markAsRead(int $id, int $userId): void
    {
        $notificationModel = new \App\Models\Notification($this->db);
        $notificationModel->markAsRead($id, $userId);
    }

    public function markAllAsRead(int $userId): void
    {
        $notificationModel = new \App\Models\Notification($this->db);
        $notificationModel->markAllAsRead($userId);
    }
}