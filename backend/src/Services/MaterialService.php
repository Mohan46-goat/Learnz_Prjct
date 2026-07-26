<?php

namespace App\Services;

class MaterialService
{
    private \PDO $db;
    private string $uploadDir;

    private const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'png'];
    private const MAX_FILE_SIZE = 10 * 1024 * 1024;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
        $this->uploadDir = BASE_PATH . '/storage/uploads/';

        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function uploadMaterial(array $file, int $lessonId, int $uploadedBy): array
    {
        $lessonModel = new \App\Models\Lesson($this->db);
        $lesson = $lessonModel->findById($lessonId);

        if (!$lesson) {
            throw new \InvalidArgumentException('Lesson not found');
        }

        $originalName = basename($file['name']);
        $tmpPath = $file['tmp_name'];
        $fileSize = $file['size'];
        $error = $file['error'];

        if ($error !== UPLOAD_ERR_OK) {
            throw new \InvalidArgumentException('File upload error');
        }

        if ($fileSize > self::MAX_FILE_SIZE) {
            throw new \InvalidArgumentException('File size exceeds 10MB limit');
        }

        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        if (!in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            throw new \InvalidArgumentException('File type not allowed. Allowed types: ' . implode(', ', self::ALLOWED_EXTENSIONS));
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $tmpPath);
        finfo_close($finfo);

        $allowedMimeTypes = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'jpg' => 'image/jpeg',
            'png' => 'image/png',
        ];

        $expectedMime = $allowedMimeTypes[$extension] ?? null;
        if ($expectedMime && $mimeType !== $expectedMime) {
            throw new \InvalidArgumentException('File MIME type does not match the extension');
        }

        $storedName = uniqid('material_', true) . '.' . $extension;
        $destination = $this->uploadDir . $storedName;

        if (!move_uploaded_file($tmpPath, $destination)) {
            throw new \InvalidArgumentException('Failed to save uploaded file');
        }

        $materialModel = new \App\Models\Material($this->db);
        $materialId = $materialModel->create([
            'lesson_id' => $lessonId,
            'uploaded_by' => $uploadedBy,
            'original_file_name' => $originalName,
            'stored_file_name' => $storedName,
            'file_path' => $destination,
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
        ]);

        return $materialModel->findById($materialId);
    }

    public function getMaterialById(int $id): ?array
    {
        $materialModel = new \App\Models\Material($this->db);
        return $materialModel->findById($id);
    }
}
