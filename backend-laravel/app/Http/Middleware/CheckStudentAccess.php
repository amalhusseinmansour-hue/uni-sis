<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckStudentAccess
{
    /**
     * Handle an incoming request.
     * This middleware ensures students can only access their own data.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Admin, Lecturer, and Finance can access all data
        // SECURITY: Use strict comparison
        if (in_array($user->role, ['ADMIN', 'LECTURER', 'FINANCE', 'STUDENT_AFFAIRS', 'REGISTRAR'], true)) {
            return $next($request);
        }

        // Students can only access their own data
        if ($user->role === 'STUDENT') {
            // Get the student_id from the route parameter
            $routeStudent = $request->route('student');

            // If there's a student_id in the route, check if it matches the user's student
            if ($routeStudent) {
                $student = $user->student;

                // Handle both route model binding (Student object) and raw ID
                $requestedStudentId = $routeStudent instanceof \App\Models\Student
                    ? $routeStudent->id
                    : (int)$routeStudent;

                // SECURITY: Use strict integer comparison to prevent type juggling
                if (!$student || (int)$student->id !== $requestedStudentId) {
                    return response()->json([
                        'message' => 'Unauthorized. You can only access your own data.'
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
