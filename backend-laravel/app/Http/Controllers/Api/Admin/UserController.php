<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use App\Models\Lecturer;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get all users with filters
     */
    public function index(Request $request)
    {
        $query = User::query()->with(['student', 'student.program']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($sq) use ($search) {
                      $sq->where('student_id', 'like', "%{$search}%")
                         ->orWhere('name_en', 'like', "%{$search}%")
                         ->orWhere('name_ar', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', strtoupper($request->role));
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $perPage = $request->input('per_page', 10);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Transform users to include firstName and lastName + student info
        $transformedUsers = collect($users->items())->map(function ($user) {
            $nameParts = explode(' ', $user->name, 2);
            $student = $user->student;

            return [
                'id' => $user->id,
                'email' => $user->email,
                'firstName' => $student?->first_name_en ?? ($nameParts[0] ?? ''),
                'lastName' => $student?->last_name_en ?? ($nameParts[1] ?? ''),
                'firstNameAr' => $student?->first_name_ar ?? null,
                'lastNameAr' => $student?->last_name_ar ?? null,
                'role' => $user->role,
                'studentId' => $student?->student_id ?? null,
                'department' => $student?->department ?? null,
                'program' => $student?->program?->name_en ?? null,
                'programAr' => $student?->program?->name_ar ?? null,
                'phone' => $user->phone ?? $student?->phone ?? null,
                'status' => $user->status ?? 'active',
                'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : ($student?->profile_picture ? asset('storage/' . $student->profile_picture) : null),
                'createdAt' => $user->created_at,
                'lastLogin' => $user->updated_at,
            ];
        });

        return response()->json([
            'data' => $transformedUsers,
            'total' => $users->total(),
            'page' => $users->currentPage(),
            'perPage' => $users->perPage(),
        ]);
    }

    /**
     * Get a single user
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Create a new user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'first_name_ar' => 'nullable|string|max:255',
            'last_name_ar' => 'nullable|string|max:255',
            'role' => 'required|string|max:50',
            'student_id' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:255',
            'program' => 'nullable|string|max:255',
            'program_id' => 'nullable|integer|exists:programs,id',
            'phone' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive,suspended',
            'avatar' => 'nullable|string', // Base64 encoded image
        ]);

        // Handle base64 avatar
        $avatarPath = null;
        if (!empty($validated['avatar'])) {
            $avatarPath = $this->saveBase64Image($validated['avatar'], 'avatars');
        }

        // Use database transaction to ensure data integrity
        return DB::transaction(function () use ($validated, $avatarPath) {
            // Create the user
            $user = User::create([
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => strtoupper($validated['role']),
                'phone' => $validated['phone'] ?? null,
                'avatar' => $avatarPath,
                'status' => $validated['status'] ?? 'active',
            ]);

            $studentIdGenerated = null;
            $programName = $validated['program'] ?? null;

            // Auto-create Student record for STUDENT role
            if (strtoupper($validated['role']) === 'STUDENT') {
                // Find program by name if not provided by ID
                $programId = $validated['program_id'] ?? null;
                if (!$programId && !empty($validated['program'])) {
                    $program = Program::where('name_en', 'like', '%' . $validated['program'] . '%')
                        ->orWhere('name_ar', 'like', '%' . $validated['program'] . '%')
                        ->first();
                    $programId = $program?->id;
                    $programName = $program?->name_en ?? $validated['program'];
                }

                // Generate student ID if not provided
                $studentIdGenerated = $validated['student_id'] ?? Student::generateStudentId($programId);

                // Create student record
                $student = Student::create([
                    'user_id' => $user->id,
                    'student_id' => $studentIdGenerated,
                    'program_id' => $programId,
                    'name_en' => $validated['first_name'] . ' ' . $validated['last_name'],
                    'name_ar' => !empty($validated['first_name_ar'])
                        ? ($validated['first_name_ar'] . ' ' . ($validated['last_name_ar'] ?? ''))
                        : null,
                    'first_name_en' => $validated['first_name'],
                    'last_name_en' => $validated['last_name'],
                    'first_name_ar' => $validated['first_name_ar'] ?? null,
                    'last_name_ar' => $validated['last_name_ar'] ?? null,
                    'phone' => $validated['phone'] ?? null,
                    'personal_email' => $validated['email'],
                    'university_email' => $validated['email'],
                    'profile_picture' => $avatarPath,
                    'status' => 'ACTIVE',
                    'level' => 1,
                    'current_semester' => 1,
                    'gpa' => 0,
                    'completed_credits' => 0,
                    'registered_credits' => 0,
                    'admission_date' => now(),
                ]);
            }

            // Auto-create Lecturer record for LECTURER role
            if (strtoupper($validated['role']) === 'LECTURER') {
                // Check if Lecturer model exists
                if (class_exists(Lecturer::class)) {
                    Lecturer::create([
                        'user_id' => $user->id,
                        'name_en' => $validated['first_name'] . ' ' . $validated['last_name'],
                        'name_ar' => !empty($validated['first_name_ar'])
                            ? ($validated['first_name_ar'] . ' ' . ($validated['last_name_ar'] ?? ''))
                            : null,
                        'email' => $validated['email'],
                        'phone' => $validated['phone'] ?? null,
                        'department' => $validated['department'] ?? null,
                        'status' => 'ACTIVE',
                    ]);
                }
            }

            return response()->json([
                'id' => $user->id,
                'email' => $user->email,
                'firstName' => $validated['first_name'],
                'lastName' => $validated['last_name'],
                'firstNameAr' => $validated['first_name_ar'] ?? null,
                'lastNameAr' => $validated['last_name_ar'] ?? null,
                'role' => $user->role,
                'studentId' => $studentIdGenerated ?? $validated['student_id'] ?? null,
                'department' => $validated['department'] ?? null,
                'program' => $programName,
                'phone' => $validated['phone'] ?? null,
                'status' => $user->status ?? 'active',
                'avatar' => $avatarPath ? asset('storage/' . $avatarPath) : null,
                'createdAt' => $user->created_at,
                'message' => 'User created successfully',
                'message_ar' => 'تم إنشاء المستخدم بنجاح',
            ], 201);
        });
    }

    /**
     * Update a user
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'email' => ['nullable', 'email', Rule::unique('users', 'email')->ignore($id)],
            'password' => 'nullable|min:6',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'first_name_ar' => 'nullable|string|max:255',
            'last_name_ar' => 'nullable|string|max:255',
            'role' => 'nullable|string|max:50',
            'student_id' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:255',
            'program' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive,suspended',
            'avatar' => 'nullable|string', // Base64 encoded image
        ]);

        // Handle base64 avatar
        if (!empty($validated['avatar'])) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = $this->saveBase64Image($validated['avatar'], 'avatars');
        }

        // Update name if first/last name provided
        if (!empty($validated['first_name']) || !empty($validated['last_name'])) {
            $firstName = $validated['first_name'] ?? explode(' ', $user->name)[0] ?? '';
            $lastName = $validated['last_name'] ?? (explode(' ', $user->name)[1] ?? '');
            $user->name = trim($firstName . ' ' . $lastName);
        }

        if (!empty($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        if (!empty($validated['role'])) {
            $user->role = $validated['role'];
        }

        if (isset($validated['avatar'])) {
            $user->avatar = $validated['avatar'];
        }

        if (!empty($validated['status'])) {
            $user->status = $validated['status'];
        }

        $user->save();

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'firstName' => $validated['first_name'] ?? explode(' ', $user->name)[0],
            'lastName' => $validated['last_name'] ?? (explode(' ', $user->name)[1] ?? ''),
            'firstNameAr' => $validated['first_name_ar'] ?? null,
            'lastNameAr' => $validated['last_name_ar'] ?? null,
            'role' => $user->role,
            'studentId' => $validated['student_id'] ?? null,
            'department' => $validated['department'] ?? null,
            'program' => $validated['program'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'status' => $user->status ?? 'active',
            'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            'createdAt' => $user->created_at,
        ]);
    }

    /**
     * Delete a user
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Delete avatar if exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Save base64 image to storage
     */
    private function saveBase64Image($base64Image, $folder = 'avatars')
    {
        // Check if it's a base64 string
        if (strpos($base64Image, 'data:image') === 0) {
            // Extract the image data
            $imageData = explode(',', $base64Image);
            $imageBase64 = $imageData[1] ?? $imageData[0];

            // Get the mime type
            preg_match('/data:image\/(\w+);/', $base64Image, $matches);
            $extension = $matches[1] ?? 'png';

            // Generate unique filename
            $filename = $folder . '/' . uniqid() . '_' . time() . '.' . $extension;

            // Decode and save
            $imageContent = base64_decode($imageBase64);
            Storage::disk('public')->put($filename, $imageContent);

            return $filename;
        }

        // If it's already a path, return as is
        return $base64Image;
    }

    /**
     * Get user statistics
     */
    public function stats()
    {
        $total = User::count();
        $byRole = User::selectRaw('role, count(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();
        $byStatus = User::selectRaw('COALESCE(status, "active") as status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
        $recentlyActive = User::where('updated_at', '>=', now()->subDays(7))->count();

        return response()->json([
            'total' => $total,
            'byRole' => $byRole,
            'byStatus' => $byStatus,
            'recentlyActive' => $recentlyActive,
        ]);
    }
}
