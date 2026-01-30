<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        // SECURITY: Check if user has any of the required roles (strict comparison)
        if (!in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => 'Unauthorized. Required role(s): ' . implode(', ', $roles),
                // SECURITY: Don't expose user's actual role in production
            ], 403);
        }

        return $next($request);
    }
}
