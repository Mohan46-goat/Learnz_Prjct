<?php

use App\Controllers\UserController;
use App\Controllers\AuthController;
use App\Controllers\CourseController;
use App\Controllers\BatchController;
use App\Controllers\LessonController;
use App\Controllers\AttendanceController;
use App\Controllers\NotificationController;
use App\Controllers\MaterialController;
use App\Controllers\ReportController;
use App\Middleware\AuthMiddleware;
use App\Middleware\CorsMiddleware;
use App\Middleware\RoleMiddleware;

$method = $_SERVER['REQUEST_METHOD'];
$route = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = '/api';
$route = substr($route, strlen($basePath)) ?: '/';

$auth = new AuthMiddleware();

switch ($route) {
    case '/auth/login':
        if ($method === 'POST') {
            (new AuthController())->login();
        }
        break;

    case '/auth/logout':
        if ($method === 'POST') {
            $auth->handle(function () { (new AuthController())->logout(); });
        }
        break;

    case '/auth/me':
        if ($method === 'GET') {
            $auth->handle(function () { (new AuthController())->me(); });
        }
        break;

    case '/users':
        if ($method === 'GET') {
            $auth->handle(function () { (new RoleMiddleware(['admin']))->handle(function () { (new UserController())->index(); }); });
        } elseif ($method === 'POST') {
            $auth->handle(function () { (new RoleMiddleware(['admin']))->handle(function () { (new UserController())->create(); }); });
        }
        break;

    case (preg_match('#^/users/(\d+)$#', $route, $matches) ? true : false):
        $id = (int) $matches[1];
        if ($method === 'GET') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['admin']))->handle(function () use ($id) { (new UserController())->show($id); }); });
        } elseif ($method === 'PUT') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['admin']))->handle(function () use ($id) { (new UserController())->update($id); }); });
        } elseif ($method === 'PATCH') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['admin']))->handle(function () use ($id) { (new UserController())->updateStatus($id); }); });
        }
        break;

    case '/courses':
        if ($method === 'GET') {
            $auth->handle(function () { (new RoleMiddleware(['admin']))->handle(function () { (new CourseController())->index(); }); });
        } elseif ($method === 'POST') {
            $auth->handle(function () { (new RoleMiddleware(['admin']))->handle(function () { (new CourseController())->create(); }); });
        }
        break;

    case (preg_match('#^/courses/(\d+)$#', $route, $matches) ? true : false):
        $id = (int) $matches[1];
        if ($method === 'GET') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['admin']))->handle(function () use ($id) { (new CourseController())->show($id); }); });
        } elseif ($method === 'PUT') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['admin']))->handle(function () use ($id) { (new CourseController())->update($id); }); });
        } elseif ($method === 'DELETE') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['admin']))->handle(function () use ($id) { (new CourseController())->delete($id); }); });
        }
        break;

    case '/batches':
        if ($method === 'GET') {
            $auth->handle(function () { (new RoleMiddleware(['admin', 'instructor']))->handle(function () { (new BatchController())->index(); }); });
        } elseif ($method === 'POST') {
            $auth->handle(function () { (new RoleMiddleware(['admin']))->handle(function () { (new BatchController())->create(); }); });
        }
        break;

    case '/batches/my':
        if ($method === 'GET') {
            $auth->handle(function () { (new RoleMiddleware(['instructor', 'student']))->handle(function () { (new BatchController())->myBatches(); }); });
        }
        break;

    case (preg_match('#^/batches/(\d+)$#', $route, $matches) ? true : false):
        $id = (int) $matches[1];
        if ($method === 'GET') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['admin', 'instructor']))->handle(function () use ($id) { (new BatchController())->show($id); }); });
        } elseif ($method === 'PUT') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['admin']))->handle(function () use ($id) { (new BatchController())->update($id); }); });
        }
        break;

    case (preg_match('#^/batches/(\d+)/students$#', $route, $matches) ? true : false):
        $id = (int) $matches[1];
        if ($method === 'GET') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['admin', 'instructor']))->handle(function () use ($id) { (new BatchController())->getStudents($id); }); });
        }
        break;

    case (preg_match('#^/batches/(\d+)/assign-instructor$#', $route, $matches) ? true : false):
        $batchId = (int) $matches[1];
        if ($method === 'POST') {
            $auth->handle(function () use ($batchId) { (new RoleMiddleware(['admin']))->handle(function () use ($batchId) { (new BatchController())->assignInstructor($batchId); }); });
        }
        break;

    case (preg_match('#^/batches/(\d+)/add-student$#', $route, $matches) ? true : false):
        $batchId = (int) $matches[1];
        if ($method === 'POST') {
            $auth->handle(function () use ($batchId) { (new RoleMiddleware(['admin']))->handle(function () use ($batchId) { (new BatchController())->addStudent($batchId); }); });
        }
        break;

    case (preg_match('#^/batches/(\d+)/remove-student/(\d+)$#', $route, $matches) ? true : false):
        $batchId = (int) $matches[1];
        $studentId = (int) $matches[2];
        if ($method === 'DELETE') {
            $auth->handle(function () use ($batchId, $studentId) { (new RoleMiddleware(['admin']))->handle(function () use ($batchId, $studentId) { (new BatchController())->removeStudent($batchId, $studentId); }); });
        }
        break;

    case '/lessons':
        if ($method === 'GET') {
            $auth->handle(function () { (new RoleMiddleware(['admin', 'instructor', 'student']))->handle(function () { (new LessonController())->index(); }); });
        } elseif ($method === 'POST') {
            $auth->handle(function () { (new RoleMiddleware(['instructor']))->handle(function () { (new LessonController())->create(); }); });
        }
        break;

    case (preg_match('#^/lessons/(\d+)$#', $route, $matches) ? true : false):
        $id = (int) $matches[1];
        if ($method === 'GET') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['admin', 'instructor', 'student']))->handle(function () use ($id) { (new LessonController())->show($id); }); });
        } elseif ($method === 'PUT') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['instructor']))->handle(function () use ($id) { (new LessonController())->update($id); }); });
        } elseif ($method === 'DELETE') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['instructor']))->handle(function () use ($id) { (new LessonController())->delete($id); }); });
        }
        break;

    case '/attendance':
        if ($method === 'POST') {
            $auth->handle(function () { (new RoleMiddleware(['student', 'instructor']))->handle(function () { (new AttendanceController())->mark(); }); });
        } elseif ($method === 'GET') {
            $auth->handle(function () { (new RoleMiddleware(['admin', 'instructor']))->handle(function () { (new AttendanceController())->index(); }); });
        }
        break;

    case '/attendance/my':
        if ($method === 'GET') {
            $auth->handle(function () { (new RoleMiddleware(['student']))->handle(function () { (new AttendanceController())->myAttendance(); }); });
        }
        break;

    case '/notifications':
        if ($method === 'GET') {
            $auth->handle(function () { (new NotificationController())->index(); });
        } elseif ($method === 'PATCH') {
            $auth->handle(function () { (new NotificationController())->markAllRead(); });
        }
        break;

    case (preg_match('#^/notifications/(\d+)/read$#', $route, $matches) ? true : false):
        $id = (int) $matches[1];
        if ($method === 'PATCH') {
            $auth->handle(function () use ($id) { (new NotificationController())->markRead($id); });
        }
        break;

    case '/materials':
        if ($method === 'POST') {
            $auth->handle(function () { (new RoleMiddleware(['instructor']))->handle(function () { (new MaterialController())->upload(); }); });
        }
        break;

    case (preg_match('#^/materials/(\d+)/download$#', $route, $matches) ? true : false):
        $id = (int) $matches[1];
        if ($method === 'GET') {
            $auth->handle(function () use ($id) { (new RoleMiddleware(['admin', 'instructor', 'student']))->handle(function () use ($id) { (new MaterialController())->download($id); }); });
        }
        break;

    case '/reports/daily':
        if ($method === 'GET') {
            $auth->handle(function () { (new RoleMiddleware(['admin', 'instructor']))->handle(function () { (new ReportController())->daily(); }); });
        }
        break;

    case (preg_match('#^/reports/student/(\d+)$#', $route, $matches) ? true : false):
        $studentId = (int) $matches[1];
        if ($method === 'GET') {
            $auth->handle(function () use ($studentId) { (new RoleMiddleware(['admin', 'student']))->handle(function () use ($studentId) { (new ReportController())->student($studentId); }); });
        }
        break;

    case (preg_match('#^/reports/batch/(\d+)$#', $route, $matches) ? true : false):
        $batchId = (int) $matches[1];
        if ($method === 'GET') {
            $auth->handle(function () use ($batchId) { (new RoleMiddleware(['admin', 'instructor']))->handle(function () use ($batchId) { (new ReportController())->batch($batchId); }); });
        }
        break;

    case '/reports/percentage':
        if ($method === 'GET') {
            $auth->handle(function () { (new RoleMiddleware(['admin', 'student']))->handle(function () { (new ReportController())->percentage(); }); });
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Route not found', 'errors' => []]);
        break;
}