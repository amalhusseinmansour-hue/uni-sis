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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\PasswordReset;

class AuthController extends Controller
{
    // SECURITY: Account lockout settings
    private const MAX_LOGIN_ATTEMPTS = 5;
    private const LOCKOUT_DURATION_MINUTES = 15;

    /**
     * SECURITY: Check if account is locked due to too many failed attempts
     */
    private function isAccountLocked(string $identifier): bool
    {
        $key = 'login_lockout_' . md5($identifier);
        return Cache::has($key);
    }

    /**
     * SECURITY: Get remaining lockout time in minutes
     */
    private function getLockoutRemainingMinutes(string $identifier): int
    {
        $key = 'login_lockout_' . md5($identifier);
        $lockedUntil = Cache::get($key);
        if ($lockedUntil) {
            return max(0, ceil(($lockedUntil - time()) / 60));
        }
        return 0;
    }

    /**
     * SECURITY: Record failed login attempt
     */
    private function recordFailedAttempt(string $identifier): int
    {
        $key = 'login_attempts_' . md5($identifier);
        $attempts = Cache::get($key, 0) + 1;
        Cache::put($key, $attempts, now()->addMinutes(self::LOCKOUT_DURATION_MINUTES));

        // Lock account if max attempts reached
        if ($attempts >= self::MAX_LOGIN_ATTEMPTS) {
            $lockKey = 'login_lockout_' . md5($identifier);
            Cache::put($lockKey, time() + (self::LOCKOUT_DURATION_MINUTES * 60), now()->addMinutes(self::LOCKOUT_DURATION_MINUTES));
        }

        return $attempts;
    }

    /**
     * SECURITY: Clear failed attempts after successful login
     */
    private function clearFailedAttempts(string $identifier): void
    {
        Cache::forget('login_attempts_' . md5($identifier));
        Cache::forget('login_lockout_' . md5($identifier));
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required_without:email|string',
            'email' => 'required_without:username|email',
            'password' => 'required',
        ]);

        // Support login with email, username, or student_id
        $loginField = $request->username ?? $request->email;

        // SECURITY: Check if account is locked
        if ($this->isAccountLocked($loginField)) {
            $remainingMinutes = $this->getLockoutRemainingMinutes($loginField);
            throw ValidationException::withMessages([
                'email' => ["تم قفل الحساب بسبب محاولات تسجيل دخول فاشلة متعددة. حاول مرة أخرى بعد {$remainingMinutes} دقيقة. / Account locked due to multiple failed login attempts. Try again in {$remainingMinutes} minutes."],
            ]);
        }

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
            // SECURITY: Record failed attempt
            $attempts = $this->recordFailedAttempt($loginField);
            $remainingAttempts = self::MAX_LOGIN_ATTEMPTS - $attempts;

            if ($remainingAttempts > 0) {
                throw ValidationException::withMessages([
                    'email' => ["بيانات الدخول غير صحيحة. محاولات متبقية: {$remainingAttempts} / Invalid credentials. Remaining attempts: {$remainingAttempts}"],
                ]);
            } else {
                throw ValidationException::withMessages([
                    'email' => ["تم قفل الحساب لمدة " . self::LOCKOUT_DURATION_MINUTES . " دقيقة بسبب محاولات فاشلة متعددة. / Account locked for " . self::LOCKOUT_DURATION_MINUTES . " minutes due to multiple failed attempts."],
                ]);
            }
        }

        // SECURITY: Clear failed attempts on successful login
        $this->clearFailedAttempts($loginField);

        // Check if user account is active
        if ($user->status === 'suspended') {
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended. Please contact administration.'],
            ]);
        }

        if ($user->status === 'inactive') {
            throw ValidationException::withMessages([
                'email' => ['Your account is inactive. Please contact administration.'],
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
            $user->load([
                'student.program.department.college',
                'student.enrollments.course',
                'student.grades.course',
            ]);

            // Return comprehensive student profile data
            if ($user->student) {
                $student = $user->student;
                return response()->json([
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                    'student' => [
                        'id' => $student->id,
                        'student_id' => $student->student_id,
                        'name_ar' => $student->name_ar,
                        'name_en' => $student->name_en,
                        'nameAr' => $student->name_ar,
                        'nameEn' => $student->name_en,

                        // Arabic Name Parts
                        'firstNameAr' => $student->first_name_ar,
                        'middleNameAr' => $student->middle_name_ar,
                        'lastNameAr' => $student->last_name_ar,

                        // English Name Parts
                        'firstNameEn' => $student->first_name_en,
                        'middleNameEn' => $student->middle_name_en,
                        'lastNameEn' => $student->last_name_en,

                        // Personal Data
                        'nationalId' => $student->national_id,
                        'idType' => $student->id_type,
                        'dateOfBirth' => $student->date_of_birth?->format('Y-m-d'),
                        'birthCity' => $student->birth_city,
                        'birthCountry' => $student->birth_country,
                        'gender' => $student->gender,
                        'nationality' => $student->nationality,
                        'secondaryNationality' => $student->secondary_nationality,
                        'maritalStatus' => $student->marital_status,
                        'religion' => $student->religion,
                        'primaryLanguage' => $student->primary_language,

                        // Contact Information
                        'phone' => $student->phone,
                        'alternativePhone' => $student->alternative_phone,
                        'personalEmail' => $student->personal_email,
                        'universityEmail' => $student->university_email,

                        // Address
                        'country' => $student->address_country,
                        'region' => $student->address_region,
                        'city' => $student->address_city,
                        'street' => $student->address_street,
                        'postalCode' => $student->postal_code,

                        // Guardian Info
                        'guardianName' => $student->guardian_name,
                        'guardianRelationship' => $student->guardian_relationship,
                        'guardianPhone' => $student->guardian_phone,
                        'guardianEmail' => $student->guardian_email,

                        // Academic Data
                        'program_id' => $student->program_id,
                        'status' => $student->status,
                        'level' => $student->level,
                        'currentSemester' => $student->current_semester,
                        'gpa' => (float) $student->gpa,
                        'termGpa' => (float) $student->term_gpa,
                        'totalRequiredCredits' => $student->total_required_credits,
                        'completedCredits' => $student->completed_credits,
                        'registeredCredits' => $student->registered_credits,
                        'remainingCredits' => $student->remaining_credits,
                        'academicStatus' => $student->academic_status,
                        'admissionDate' => $student->admission_date?->format('Y-m-d'),

                        // Financial Summary
                        'totalFees' => (float) $student->total_fees,
                        'paidAmount' => (float) $student->paid_amount,
                        'currentBalance' => (float) $student->current_balance,
                        'financialStatus' => $student->financial_status,

                        // Program Info
                        'program' => $student->program ? [
                            'id' => $student->program->id,
                            'code' => $student->program->code,
                            'nameEn' => $student->program->name_en,
                            'nameAr' => $student->program->name_ar,
                            'degree' => $student->program->degree,
                            'department' => $student->program->department ? [
                                'id' => $student->program->department->id,
                                'nameEn' => $student->program->department->name_en,
                                'nameAr' => $student->program->department->name_ar,
                                'college' => $student->program->department->college ? [
                                    'id' => $student->program->department->college->id,
                                    'nameEn' => $student->program->department->college->name_en,
                                    'nameAr' => $student->program->department->college->name_ar,
                                ] : null,
                            ] : null,
                        ] : null,

                        // Profile Picture
                        'avatar' => $student->profile_picture ? asset('storage/' . $student->profile_picture) : null,
                        'profilePicture' => $student->profile_picture ? asset('storage/' . $student->profile_picture) : null,

                        // System accounts
                        'sisUsername' => $student->sis_username,
                        'lmsUsername' => $student->lms_username,
                        'lastLogin' => $student->last_login,
                    ],
                ]);
            }
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
