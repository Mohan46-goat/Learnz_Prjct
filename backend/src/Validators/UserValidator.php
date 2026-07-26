<?php

namespace App\Validators;

class UserValidator
{
    public function validateCreate(array $data): array
    {
        $errors = [];

        if (empty($data['name']) || strlen($data['name']) > 255) {
            $errors['name'] = 'Name is required and must be 255 characters or less';
        }

        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email is required';
        }

        if (empty($data['password']) || strlen($data['password']) < 8) {
            $errors['password'] = 'Password must be at least 8 characters';
        }

        if (empty($data['role']) || !in_array($data['role'], ['admin', 'instructor', 'student'], true)) {
            $errors['role'] = 'Role must be one of: admin, instructor, student';
        }

        if (empty($data['status']) || !in_array($data['status'], ['active', 'inactive'], true)) {
            $errors['status'] = 'Status must be one of: active, inactive';
        }

        return $errors;
    }

    public function validateUpdate(array $data): array
    {
        $errors = [];

        if (isset($data['name']) && (empty($data['name']) || strlen($data['name']) > 255)) {
            $errors['name'] = 'Name must be 255 characters or less';
        }

        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email is required';
        }

        if (isset($data['password']) && strlen($data['password']) < 8) {
            $errors['password'] = 'Password must be at least 8 characters';
        }

        if (isset($data['role']) && !in_array($data['role'], ['admin', 'instructor', 'student'], true)) {
            $errors['role'] = 'Role must be one of: admin, instructor, student';
        }

        if (isset($data['status']) && !in_array($data['status'], ['active', 'inactive'], true)) {
            $errors['status'] = 'Status must be one of: active, inactive';
        }

        return $errors;
    }
}