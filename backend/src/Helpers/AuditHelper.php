<?php

namespace App\Helpers;

class AuditHelper
{
    public static function log(\PDO $db, int $userId, string $action, string $entityType, ?int $entityId = null): void
    {
        $stmt = $db->prepare(
            'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent)
             VALUES (:user_id, :action, :entity_type, :entity_id, :ip_address, :user_agent)'
        );
        $stmt->execute([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'cli',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'cli',
        ]);
    }
}