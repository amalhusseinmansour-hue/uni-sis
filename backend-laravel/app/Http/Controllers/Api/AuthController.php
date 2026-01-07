<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\PasswordReset;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required_without:email|string',
            'email' => 'required_without:username|email',
            'password' => 'required',
        ]);

        // Support login with email, username, or student_id
        $loginField = $request->username ?? $request->email;

        // First try to find user by email
        $user = User::where('email', $loginField)->first();

        // If not found and input doesn't look like email, search by student_id
        if (!$user && !filter_var($loginField, FILTER_VALIDATE_EMAIL)) {
            // Search by student_id in students table
            $student = \App\Models\Student::where('student_id', $loginField)->first();
            if ($student && $student->user_id) {
                $user = User::find($student->user_id);
            }
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        // Build clean user data without circular references
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'phone' => $user->phone,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
        ];

        // Load student data if user is a student (without circular refs)
        if ($user->role === 'STUDENT') {
            $student = $user->student;
            if ($student) {
                $userData['student'] = [
                    'id' => $student->id,
                    'student_id' => $student->student_id,
                    'name_en' => $student->name_en,
                    'name_ar' => $student->name_ar,
                    'gpa' => $student->gpa,
                    'level' => $student->level,
                    'status' => $student->status,
                    'program_id' => $student->program_id,
                ];

                // Add program data
                if ($student->program) {
                    $userData['student']['program'] = [
                        'id' => $student->program->id,
                        'name_en' => $student->program->name_en,
                        'name_ar' => $student->program->name_ar,
                        'code' => $student->program->code,
                    ];
                }
            }
        }

        return response()->json([
            'user' => $userData,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out from all devices successfully']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'STUDENT') {
            $user->load('student.program.department');
        }

        return response()->json($user);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Generate a random token
        $token = Str::random(64);

        // Delete any existing tokens for this email
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Store the new token
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // In production, you would send an email here
        // For now, we'll return the token (remove this in production!)
        return response()->json([
            'message' => 'Password reset link has been sent to your email',
            'token' => config('app.debug') ? $token : null, // Only show token in debug mode
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Find the token record
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Invalid or expired reset token'
            ], 422);
        }

        // Check if token is valid
        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'Invalid or expired reset token'
            ], 422);
        }

        // Check if token is expired (1 hour)
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Reset token has expired'
            ], 422);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Revoke all existing tokens
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password has been reset successfully'
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/[a-z]/',      // at least one lowercase
                'regex:/[A-Z]/',      // at least one uppercase
                'regex:/[0-9]/',      // at least one number
            ],
        ], [
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Optionally revoke other tokens (keep current session)
        // $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    public function refreshToken(Request $request): JsonResponse
    {
        $user = $request->user();

        // Delete current token
        $request->user()->currentAccessToken()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
        ]);
    }
}
