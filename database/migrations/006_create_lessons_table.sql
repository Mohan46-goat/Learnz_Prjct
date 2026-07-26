CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    instructor_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    attendance_start_time TIME NOT NULL,
    attendance_end_time TIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;