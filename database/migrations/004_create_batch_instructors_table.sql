CREATE TABLE IF NOT EXISTS batch_instructors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    instructor_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_batch_instructor (batch_id, instructor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;