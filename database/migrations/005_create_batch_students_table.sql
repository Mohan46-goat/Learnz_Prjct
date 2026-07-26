CREATE TABLE IF NOT EXISTS batch_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    student_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_batch_student (batch_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;