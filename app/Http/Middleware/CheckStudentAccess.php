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
        if (in_array($user->role, ['ADMIN', 'LECTURER', 'FINANCE'])) {
            return $next($request);
        }

        // Students can only access their own data
        if ($user->role === 'STUDENT') {
            // Get the student_id from the route parameter
            $studentId = $request->route('student');

            // If there's a student_id in the route, check if it matches the user's student
            if ($studentId) {
                $student = $user->student;

                if (!$student || $student->id != $studentId) {
                    return response()->json([
                        'message' => 'Unauthorized. You can only access your own data.'
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
