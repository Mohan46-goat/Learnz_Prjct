-- ============================================================
-- LearnHub Development Seed
-- ============================================================
-- Passwords:
--   Admin    -> Admin@123
--   Teachers -> Teacher@123
--   Students -> Student@123
-- ============================================================

USE learnhub;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
INSERT IGNORE INTO users (id, name, email, password_hash, role, status) VALUES
(1, 'Admin User',       'admin@learnhub.com',      '$2y$10$0sNp.0eoupvF.v3eMk48o.dTeR.yEqiIgLVGomvVO4s/ZSp6tpo4C', 'admin',      'active'),
(2, 'John Smith',       'john@learnhub.com',        '$2y$10$igE.kCe8I.EnU1MY09ghG.RkshkwCjJ4GJOwU1JlVg.HhQwWCt7RW', 'instructor', 'active'),
(3, 'Sarah Connor',     'sarah@learnhub.com',       '$2y$10$igE.kCe8I.EnU1MY09ghG.RkshkwCjJ4GJOwU1JlVg.HhQwWCt7RW', 'instructor', 'active'),
(4, 'Alice Johnson',    'alice@learnhub.com',       '$2y$10$3tLbELx6jqzmU9taA92qW.7PVal/IvmMqmRi6ofmXJj7ioTYe9qOy', 'student',    'active'),
(5, 'Bob Williams',     'bob@learnhub.com',         '$2y$10$3tLbELx6jqzmU9taA92qW.7PVal/IvmMqmRi6ofmXJj7ioTYe9qOy', 'student',    'active'),
(6, 'Carol Davis',      'carol@learnhub.com',       '$2y$10$3tLbELx6jqzmU9taA92qW.7PVal/IvmMqmRi6ofmXJj7ioTYe9qOy', 'student',    'active'),
(7, 'David Brown',      'david@learnhub.com',       '$2y$10$3tLbELx6jqzmU9taA92qW.7PVal/IvmMqmRi6ofmXJj7ioTYe9qOy', 'student',    'active');

-- ------------------------------------------------------------
-- COURSES
-- ------------------------------------------------------------
INSERT IGNORE INTO courses (id, name, description, status) VALUES
(1, 'Web Development',  'Full-stack web development covering HTML, CSS, JavaScript, PHP and MySQL.', 'active'),
(2, 'Data Science',     'Introduction to data analysis, Python, statistics and machine learning basics.', 'active');

-- ------------------------------------------------------------
-- BATCHES  (each course has 1 batch)
-- ------------------------------------------------------------
INSERT IGNORE INTO batches (id, course_id, name, start_date, end_date, status) VALUES
(1, 1, 'WebDev Batch A', '2025-01-01', '2025-06-30', 'active'),
(2, 2, 'DataSci Batch A', '2025-02-01', '2025-07-31', 'active');

-- ------------------------------------------------------------
-- ASSIGN INSTRUCTORS TO BATCHES
-- ------------------------------------------------------------
INSERT IGNORE INTO batch_instructors (batch_id, instructor_id) VALUES
(1, 2),   -- John teaches WebDev Batch A
(2, 3);   -- Sarah teaches DataSci Batch A

-- ------------------------------------------------------------
-- ENROLL STUDENTS IN BATCHES
-- ------------------------------------------------------------
INSERT IGNORE INTO batch_students (batch_id, student_id, status) VALUES
(1, 4, 'active'),   -- Alice  -> WebDev
(1, 5, 'active'),   -- Bob    -> WebDev
(2, 6, 'active'),   -- Carol  -> DataSci
(2, 7, 'active');   -- David  -> DataSci
