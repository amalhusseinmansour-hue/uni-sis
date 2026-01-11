<?php
// Create UserController
$controllerContent = <<<'PHP'
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:ADMIN,STUDENT,LECTURER,FINANCE,REGISTRAR',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        if ($user->role === 'STUDENT') {
            $user->load('student.program');
        }

        return response()->json($user);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|string|in:ADMIN,STUDENT,LECTURER,FINANCE,REGISTRAR',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        // Don't allow deleting yourself
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function getRoles(): JsonResponse
    {
        $roles = [
            ['id' => 'ADMIN', 'name' => 'Administrator', 'name_ar' => 'مدير النظام'],
            ['id' => 'STUDENT', 'name' => 'Student', 'name_ar' => 'طالب'],
            ['id' => 'LECTURER', 'name' => 'Lecturer', 'name_ar' => 'محاضر'],
            ['id' => 'FINANCE', 'name' => 'Finance', 'name_ar' => 'مالية'],
            ['id' => 'REGISTRAR', 'name' => 'Registrar', 'name_ar' => 'التسجيل'],
        ];

        return response()->json($roles);
    }
}
PHP;

file_put_contents('/home/vertexun/sis-backend/app/Http/Controllers/Api/UserController.php', $controllerContent);
echo "Created UserController\n";

// Add routes to api.php
$routesFile = '/home/vertexun/sis-backend/routes/api.php';
$routes = file_get_contents($routesFile);

// Check if routes already exist
if (strpos($routes, "Route::apiResource('users'") === false) {
    // Find the last closing of middleware group or end of file
    $newRoutes = <<<'PHP'

// User Management Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/roles', [\App\Http\Controllers\Api\UserController::class, 'getRoles']);
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
});
PHP;

    $routes .= $newRoutes;
    file_put_contents($routesFile, $routes);
    echo "Added routes to api.php\n";
} else {
    echo "Routes already exist\n";
}

echo "Done!\n";
