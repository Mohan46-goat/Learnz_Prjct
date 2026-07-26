<?php

namespace App\Models;

class Notification
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function findByUser(int $userId, bool $onlyUnread = false, int $limit = 50): array
    {
        $sql = 'SELECT * FROM notifications WHERE user_id = :user_id';
        $params = ['user_id' => $userId];

        if ($onlyUnread) {
            $sql .= ' AND is_read = FALSE';
        }

        $sql .= ' ORDER BY created_at DESC LIMIT :limit';
        $params['limit'] = $limit;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getUnreadCount(int $userId): int
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM notifications WHERE user_id = :user_id AND is_read = FALSE');
        $stmt->execute(['user_id' => $userId]);
        return (int) $stmt->fetchColumn();
    }

    public function create(int $userId, string $title, string $message, string $type, ?string $entityType = null, ?int $entityId = null): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
             VALUES (:user_id, :title, :message, :type, :entity_type, :entity_id)'
        );
        $stmt->execute([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function markAsRead(int $id, int $userId): bool
    {
        $stmt = $this->db->prepare('UPDATE notifications SET is_read = TRUE WHERE id = :id AND user_id = :user_id');
        return $stmt->execute(['id' => $id, 'user_id' => $userId]);
    }

    public function markAllAsRead(int $userId): bool
    {
        $stmt = $this->db->prepare('UPDATE notifications SET is_read = TRUE WHERE user_id = :user_id');
        return $stmt->execute(['user_id' => $userId]);
    }
}