<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Student::with(['user', 'program.college', 'program.department', 'advisor']);

        // Include archived students if requested
        if ($request->boolean('include_archived')) {
            $query->withTrashed();
        }

        // Only archived students
        if ($request->boolean('only_archived')) {
            $query->onlyTrashed();
        }

        $students = $query
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->admission_type, fn($q) => $q->where('admission_type', $request->admission_type))
            ->when($request->program_id, fn($q) => $q->where('program_id', $request->program_id))
            ->when($request->search, fn($q) => $q->where(function($query) use ($request) {
                $query->where('name_en', 'like', "%{$request->search}%")
                    ->orWhere('name_ar', 'like', "%{$request->search}%")
                    ->orWhere('student_id', 'like', "%{$request->search}%")
                    ->orWhere('national_id', 'like', "%{$request->search}%");
            }))
            ->paginate($request->per_page ?? 15);

        return response()->json($students);
    }

    public function show(Student $student): JsonResponse
    {
        $student->load([
            'user',
            'program.college',
            'program.department',
            'advisor',
            'enrollments.course',
            'enrollments.semesterRecord',
            'grades.course',
            'financialRecords',
            'documents'
        ]);

        return response()->json($student);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'nullable|unique:students',
            'name_ar' => 'nullable',
            'name_en' => 'required',
            'national_id' => 'required|unique:students',
            'date_of_birth' => 'nullable|date',
            'gender' => 'required|in:MALE,FEMALE',
            'nationality' => 'nullable',
            'admission_type' => 'nullable|in:DIRECT,TRANSFER,POSTGRADUATE,SCHOLARSHIP,BRIDGE,READMISSION,VISITING',
            'admission_date' => 'nullable|date',
            'phone' => 'nullable',
            'personal_email' => 'required|email',
            'college_id' => 'nullable|exists:colleges,id',
            'program_id' => 'nullable|exists:programs,id',
            'degree' => 'nullable|in:BACHELOR,MASTER,PHD,DIPLOMA',
            'password' => 'required|min:6',
        ]);

        // Generate student ID if not provided
        if (empty($validated['student_id'])) {
            $year = date('Y');
            $lastStudent = Student::whereYear('created_at', $year)->orderBy('id', 'desc')->first();
            $sequence = $lastStudent ? ((int)substr($lastStudent->student_id, -4) + 1) : 1;
            $validated['student_id'] = $year . str_pad($sequence, 4, '0', STR_PAD_LEFT);
        }

        // Generate university email
        $emailBase = strtolower(str_replace(' ', '.', $validated['name_en']));
        $universityEmail = $emailBase . '@student.university.edu';
        $counter = 1;
        while (\App\Models\User::where('email', $universityEmail)->exists() || Student::where('university_email', $universityEmail)->exists()) {
            $universityEmail = $emailBase . $counter . '@student.university.edu';
            $counter++;
        }

        // Create user account for the student
        $user = \App\Models\User::create([
            'name' => $validated['name_en'],
            'email' => $universityEmail,
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => 'STUDENT',
        ]);

        // Create student record
        $student = Student::create([
            'user_id' => $user->id,
            'student_id' => $validated['student_id'],
            'name_en' => $validated['name_en'],
            'name_ar' => $validated['name_ar'] ?? $validated['name_en'],
            'national_id' => $validated['national_id'],
            'date_of_birth' => $validated['date_of_birth'],
            'gender' => $validated['gender'],
            'nationality' => $validated['nationality'] ?? 'Unknown',
            'admission_type' => $validated['admission_type'] ?? 'DIRECT',
            'admission_date' => $validated['admission_date'] ?? now(),
            'phone' => $validated['phone'],
            'personal_email' => $validated['personal_email'],
            'university_email' => $universityEmail,
            'program_id' => $validated['program_id'],
            'degree' => $validated['degree'] ?? 'BACHELOR',
            'status' => 'ACTIVE',
        ]);

        return response()->json([
            'message' => 'تم إنشاء الطالب بنجاح',
            'student' => $student->load(['user', 'program']),
            'credentials' => [
                'email' => $universityEmail,
                'student_id' => $validated['student_id'],
            ]
        ], 201);
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            // Names
            'name_ar' => 'sometimes|required',
            'name_en' => 'sometimes|required',
            'first_name_ar' => 'sometimes|nullable|string',
            'middle_name_ar' => 'sometimes|nullable|string',
            'last_name_ar' => 'sometimes|nullable|string',
            'fourth_name_ar' => 'sometimes|nullable|string',
            'first_name_en' => 'sometimes|nullable|string',
            'middle_name_en' => 'sometimes|nullable|string',
            'last_name_en' => 'sometimes|nullable|string',
            'fourth_name_en' => 'sometimes|nullable|string',

            // Personal Data
            'national_id' => 'sometimes|nullable|string',
            'passport_number' => 'sometimes|nullable|string',
            'id_type' => 'sometimes|nullable|in:NATIONAL_ID,PASSPORT,OTHER',
            'date_of_birth' => 'sometimes|nullable|date',
            'birth_city' => 'sometimes|nullable|string',
            'birth_country' => 'sometimes|nullable|string',
            'gender' => 'sometimes|in:MALE,FEMALE',
            'nationality' => 'sometimes|nullable|string',
            'secondary_nationality' => 'sometimes|nullable|string',
            'marital_status' => 'sometimes|nullable|in:SINGLE,MARRIED,DIVORCED,WIDOWED',
            'religion' => 'sometimes|nullable|string',
            'primary_language' => 'sometimes|nullable|string',

            // Residency
            'residency_type' => 'sometimes|nullable|in:RESIDENT,REFUGEE,FOREIGNER,CITIZEN',
            'residency_number' => 'sometimes|nullable|string',
            'refugee_card_number' => 'sometimes|nullable|string',
            'current_residence_country' => 'sometimes|nullable|string',
            'residency_expiry_date' => 'sometimes|nullable|date',

            // Contact
            'phone' => 'sometimes|nullable|string',
            'alternative_phone' => 'sometimes|nullable|string',
            'landline_phone' => 'sometimes|nullable|string',
            'personal_email' => 'sometimes|nullable|email',
            'linkedin_profile' => 'sometimes|nullable|string',
            'telegram_username' => 'sometimes|nullable|string',

            // Address - Permanent
            'address_country' => 'sometimes|nullable|string',
            'address_region' => 'sometimes|nullable|string',
            'address_city' => 'sometimes|nullable|string',
            'address_street' => 'sometimes|nullable|string',
            'address_neighborhood' => 'sometimes|nullable|string',
            'address_description' => 'sometimes|nullable|string',
            'postal_code' => 'sometimes|nullable|string',

            // Address - Current
            'current_address_country' => 'sometimes|nullable|string',
            'current_address_region' => 'sometimes|nullable|string',
            'current_address_city' => 'sometimes|nullable|string',
            'current_address_street' => 'sometimes|nullable|string',
            'current_address_neighborhood' => 'sometimes|nullable|string',
            'current_address_description' => 'sometimes|nullable|string',
            'current_postal_code' => 'sometimes|nullable|string',

            // Guardian
            'guardian_name' => 'sometimes|nullable|string',
            'guardian_relationship' => 'sometimes|nullable|in:FATHER,MOTHER,BROTHER,SISTER,SPOUSE,GUARDIAN,OTHER',
            'guardian_phone' => 'sometimes|nullable|string',
            'guardian_alternative_phone' => 'sometimes|nullable|string',
            'guardian_email' => 'sometimes|nullable|email',
            'guardian_address' => 'sometimes|nullable|string',
            'guardian_occupation' => 'sometimes|nullable|string',
            'guardian_workplace' => 'sometimes|nullable|string',
            'mother_name' => 'sometimes|nullable|string',
            'mother_phone' => 'sometimes|nullable|string',
            'family_members_count' => 'sometimes|nullable|integer',
            'siblings_in_university' => 'sometimes|nullable|integer',

            // Emergency Contacts
            'emergency_name' => 'sometimes|nullable|string',
            'emergency_phone' => 'sometimes|nullable|string',
            'emergency_relationship' => 'sometimes|nullable|string',
            'emergency_notes' => 'sometimes|nullable|string',
            'emergency2_name' => 'sometimes|nullable|string',
            'emergency2_phone' => 'sometimes|nullable|string',
            'emergency2_relationship' => 'sometimes|nullable|string',
            'emergency2_notes' => 'sometimes|nullable|string',

            // Previous Education
            'high_school_certificate_type' => 'sometimes|nullable|in:TAWJIHI,EQUIVALENT,OTHER',
            'high_school_track' => 'sometimes|nullable|string',
            'high_school_country' => 'sometimes|nullable|string',
            'high_school_name' => 'sometimes|nullable|string',
            'high_school_graduation_year' => 'sometimes|nullable|integer',
            'high_school_gpa' => 'sometimes|nullable|numeric',
            'high_school_seat_number' => 'sometimes|nullable|string',

            // Academic
            'status' => 'sometimes|in:ACTIVE,SUSPENDED,GRADUATED,WITHDRAWN',
            'admission_type' => 'sometimes|in:DIRECT,TRANSFER,POSTGRADUATE,SCHOLARSHIP,BRIDGE,READMISSION,VISITING',
            'admission_date' => 'sometimes|nullable|date',
            'program_id' => 'sometimes|nullable|exists:programs,id',
            'college' => 'sometimes|nullable|string',
            'department' => 'sometimes|nullable|string',
            'major' => 'sometimes|nullable|string',
            'degree' => 'sometimes|nullable|in:BACHELOR,MASTER,PHD,DIPLOMA',
            'level' => 'sometimes|nullable|integer|min:1|max:10',
            'current_semester' => 'sometimes|nullable|integer|min:1|max:3',
            'cohort' => 'sometimes|nullable|string',

            // Notes
            'admission_notes' => 'sometimes|nullable|string',
            'student_affairs_notes' => 'sometimes|nullable|string',
            'advisor_notes' => 'sometimes|nullable|string',
        ]);

        $student->update($validated);

        // Return student with program relationship loaded
        return response()->json($student->load('program'));
    }

    public function destroy(Request $request, Student $student): JsonResponse
    {
        $reason = $request->input('archive_reason', 'Archived by administrator');

        // Use soft delete (archive) instead of hard delete
        $student->archive($reason, auth()->id());

        return response()->json([
            'message' => 'تم أرشفة الطالب بنجاح',
            'message_en' => 'Student archived successfully',
        ]);
    }

    public function restore(Request $request, $studentId): JsonResponse
    {
        $student = Student::withTrashed()->findOrFail($studentId);
        $student->unarchive();

        return response()->json([
            'message' => 'تم استعادة الطالب بنجاح',
            'message_en' => 'Student restored successfully',
            'student' => $student->fresh(['user', 'program']),
        ]);
    }

    public function forceDelete($studentId): JsonResponse
    {
        $student = Student::withTrashed()->findOrFail($studentId);

        // Also delete the user account
        if ($student->user) {
            $student->user->delete();
        }

        $student->forceDelete();

        return response()->json([
            'message' => 'تم حذف الطالب نهائياً',
            'message_en' => 'Student permanently deleted',
        ]);
    }

    public function grades(Student $student): JsonResponse
    {
        $grades = $student->grades()->with('course')->get();

        return response()->json($grades);
    }

    public function financialRecords(Student $student): JsonResponse
    {
        $records = $student->financialRecords()->orderBy('date', 'desc')->get();

        return response()->json($records);
    }

    public function enrollments(Student $student): JsonResponse
    {
        $enrollments = $student->enrollments()->with(['course', 'semesterRecord'])->get();

        // Add semester info to each enrollment for frontend compatibility
        $enrollments = $enrollments->map(function ($enrollment) {
            $data = $enrollment->toArray();
            // Add semester_record for frontend (Laravel returns snake_case)
            if ($enrollment->semesterRecord) {
                $data['semester_record'] = $enrollment->semesterRecord->toArray();
                $data['semester_name'] = $enrollment->semesterRecord->name;
            }
            return $data;
        });

        return response()->json($enrollments);
    }

    /**
     * Get student's study plan and progress
     */
    public function studyPlan(Student $student): JsonResponse
    {
        $student->load(['program.courses', 'enrollments.course', 'grades']);

        $completedCredits = $student->grades()
            ->where('grade', '>=', 60)
            ->with('course')
            ->get()
            ->sum(fn($g) => $g->course->credits ?? 3);

        $totalCredits = $student->program->total_credits ?? 132;
        $progressPercentage = $totalCredits > 0 ? round(($completedCredits / $totalCredits) * 100, 2) : 0;

        return response()->json([
            'student' => $student,
            'program' => $student->program,
            'completed_credits' => $completedCredits,
            'total_credits' => $totalCredits,
            'progress_percentage' => $progressPercentage,
            'remaining_credits' => $totalCredits - $completedCredits,
        ]);
    }

    /**
     * Assign or update student's study plan
     */
    public function assignStudyPlan(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'notes' => 'nullable|string',
        ]);

        $oldProgramId = $student->program_id;
        $student->update(['program_id' => $validated['program_id']]);

        return response()->json([
            'message' => 'تم ربط الخطة الدراسية بنجاح',
            'student' => $student->fresh(['program']),
            'old_program_id' => $oldProgramId,
            'new_program_id' => $validated['program_id'],
        ]);
    }

    /**
     * Transfer student to a different major/program
     */
    public function transferMajor(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'new_program_id' => 'required|exists:programs,id',
            'reason' => 'nullable|string',
            'effective_date' => 'nullable|date',
        ]);

        $oldProgram = $student->program;
        $student->update([
            'program_id' => $validated['new_program_id'],
        ]);

        return response()->json([
            'message' => 'تم تحويل التخصص بنجاح',
            'student' => $student->fresh(['program']),
            'old_program' => $oldProgram,
            'new_program' => $student->program,
            'transfer_date' => $validated['effective_date'] ?? now()->toDateString(),
        ]);
    }

    /**
     * Open registration for a specific student
     */
    public function openRegistration(Request $request, Student $student): JsonResponse
    {
        $student->update(['registration_hold' => false]);

        return response()->json([
            'message' => 'تم فتح التسجيل للطالب',
            'student' => $student,
        ]);
    }

    /**
     * Close registration for a specific student
     */
    public function closeRegistration(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $student->update([
            'registration_hold' => true,
            'registration_hold_reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'message' => 'تم إغلاق التسجيل للطالب',
            'student' => $student,
        ]);
    }

    /**
     * Upload profile picture for a student
     */
    public function uploadProfilePicture(Request $request, Student $student): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = 'profile_pictures/' . $student->student_id . '_' . time() . '.' . $file->getClientOriginalExtension();

            // Delete old profile picture if exists
            if ($student->profile_picture && \Illuminate\Support\Facades\Storage::disk('public')->exists($student->profile_picture)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($student->profile_picture);
            }

            // Store new picture using public disk
            \Illuminate\Support\Facades\Storage::disk('public')->putFileAs(dirname($filename), $file, basename($filename));

            // Update student record
            $student->update(['profile_picture' => $filename]);

            return response()->json([
                'message' => 'تم رفع الصورة الشخصية بنجاح',
                'message_en' => 'Profile picture uploaded successfully',
                'profile_picture_url' => asset('storage/' . $filename),
                'student' => $student->fresh(),
            ]);
        }

        return response()->json([
            'message' => 'لم يتم تحديد صورة',
            'message_en' => 'No photo provided',
        ], 400);
    }

    /**
     * Upload document for a student
     * SECURITY: Documents are stored in private storage - not publicly accessible
     */
    public function uploadDocument(Request $request, Student $student): JsonResponse
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // 10MB max
            'document_type' => 'required|in:HIGH_SCHOOL_CERTIFICATE,ID_PASSPORT,PHOTO,OTHER',
            'title' => 'required|string|max:255',
        ]);

        // SECURITY: Only admin/staff or the student themselves can upload documents
        $user = $request->user();
        if ($user->role === 'STUDENT') {
            $userStudent = $user->student;
            if (!$userStudent || $userStudent->id != $student->id) {
                return response()->json([
                    'message' => 'غير مصرح لك برفع مستندات لهذا الطالب',
                    'message_en' => 'Unauthorized. You can only upload documents for yourself.',
                ], 403);
            }
        }

        if ($request->hasFile('document')) {
            $file = $request->file('document');
            // SECURITY: Use UUID for filename to prevent guessing
            $secureFilename = \Illuminate\Support\Str::uuid() . '.' . $file->getClientOriginalExtension();
            $filename = 'student-documents/' . $student->id . '/' . $secureFilename;

            // SECURITY: Store document in PRIVATE disk - not publicly accessible
            \Illuminate\Support\Facades\Storage::disk('local')->putFileAs(dirname($filename), $file, basename($filename));

            // Create document record using StudentDocument model
            $document = \App\Models\StudentDocument::create([
                'student_id' => $student->id,
                'name' => $request->title,
                'type' => $request->document_type,
                'file_path' => $filename,
                'upload_date' => now()->toDateString(),
                'status' => 'UNDER_REVIEW',
            ]);

            return response()->json([
                'message' => 'تم رفع المستند بنجاح',
                'message_en' => 'Document uploaded successfully',
                'document' => $document,
                // No public URL - documents must be downloaded via secure API endpoint
            ]);
        }

        return response()->json([
            'message' => 'لم يتم تحديد مستند',
            'message_en' => 'No document provided',
        ], 400);
    }

    /**
     * Get student documents
     * SECURITY: Only returns document metadata - actual files require secure download
     */
    public function documents(Request $request, Student $student): JsonResponse
    {
        // SECURITY: Only admin/staff or the student themselves can view documents
        $user = $request->user();
        if ($user->role === 'STUDENT') {
            $userStudent = $user->student;
            if (!$userStudent || $userStudent->id != $student->id) {
                return response()->json([
                    'message' => 'غير مصرح لك بعرض مستندات هذا الطالب',
                    'message_en' => 'Unauthorized. You can only view your own documents.',
                ], 403);
            }
        }

        $documents = $student->documents()->orderBy('created_at', 'desc')->get();

        // SECURITY: Don't expose file paths - only document IDs for secure download
        $documents->each(function ($doc) {
            $doc->download_url = url('/api/student-documents/' . $doc->id . '/download');
            // Hide actual file path from response
            unset($doc->file_path);
        });

        return response()->json($documents);
    }

    /**
     * Update student's own profile (personal data only)
     * Students can only update their own personal information
     * Academic/financial/system fields are protected
     */
    public function updateMyProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'STUDENT') {
            return response()->json([
                'message' => 'هذه الخدمة متاحة للطلاب فقط',
                'message_en' => 'This service is only available for students',
            ], 403);
        }

        $student = $user->student;

        if (!$student) {
            return response()->json([
                'message' => 'لم يتم العثور على ملف الطالب',
                'message_en' => 'Student profile not found',
            ], 404);
        }

        // Only allow personal data fields - NOT academic/financial/system fields
        $validated = $request->validate([
            // Contact Information
            'phone' => 'sometimes|nullable|string|max:20',
            'alternative_phone' => 'sometimes|nullable|string|max:20',
            'landline_phone' => 'sometimes|nullable|string|max:20',
            'personal_email' => 'sometimes|nullable|email|max:255',
            'linkedin_profile' => 'sometimes|nullable|string|max:255',
            'telegram_username' => 'sometimes|nullable|string|max:100',

            // Personal Details
            'marital_status' => 'sometimes|nullable|in:SINGLE,MARRIED,DIVORCED,WIDOWED',
            'religion' => 'sometimes|nullable|string|max:50',
            'primary_language' => 'sometimes|nullable|string|max:50',

            // Current Address
            'current_address_country' => 'sometimes|nullable|string|max:100',
            'current_address_region' => 'sometimes|nullable|string|max:100',
            'current_address_city' => 'sometimes|nullable|string|max:100',
            'current_address_street' => 'sometimes|nullable|string|max:255',
            'current_address_neighborhood' => 'sometimes|nullable|string|max:100',
            'current_address_description' => 'sometimes|nullable|string|max:500',
            'current_postal_code' => 'sometimes|nullable|string|max:20',

            // Permanent Address
            'address_country' => 'sometimes|nullable|string|max:100',
            'address_region' => 'sometimes|nullable|string|max:100',
            'address_city' => 'sometimes|nullable|string|max:100',
            'address_street' => 'sometimes|nullable|string|max:255',
            'address_neighborhood' => 'sometimes|nullable|string|max:100',
            'address_description' => 'sometimes|nullable|string|max:500',
            'postal_code' => 'sometimes|nullable|string|max:20',

            // Guardian Information
            'guardian_name' => 'sometimes|nullable|string|max:255',
            'guardian_relationship' => 'sometimes|nullable|in:FATHER,MOTHER,BROTHER,SISTER,SPOUSE,GUARDIAN,OTHER',
            'guardian_phone' => 'sometimes|nullable|string|max:20',
            'guardian_alternative_phone' => 'sometimes|nullable|string|max:20',
            'guardian_email' => 'sometimes|nullable|email|max:255',
            'guardian_address' => 'sometimes|nullable|string|max:500',
            'guardian_occupation' => 'sometimes|nullable|string|max:100',
            'guardian_workplace' => 'sometimes|nullable|string|max:255',
            'mother_name' => 'sometimes|nullable|string|max:255',
            'mother_phone' => 'sometimes|nullable|string|max:20',

            // Emergency Contacts
            'emergency_name' => 'sometimes|nullable|string|max:255',
            'emergency_phone' => 'sometimes|nullable|string|max:20',
            'emergency_relationship' => 'sometimes|nullable|string|max:100',
            'emergency_notes' => 'sometimes|nullable|string|max:500',
            'emergency2_name' => 'sometimes|nullable|string|max:255',
            'emergency2_phone' => 'sometimes|nullable|string|max:20',
            'emergency2_relationship' => 'sometimes|nullable|string|max:100',
            'emergency2_notes' => 'sometimes|nullable|string|max:500',
        ]);

        // Update only the validated personal data fields
        $student->update($validated);

        return response()->json([
            'message' => 'تم تحديث البيانات الشخصية بنجاح',
            'message_en' => 'Personal information updated successfully',
            'student' => $student->fresh(['user', 'program']),
        ]);
    }

    /**
     * Get student's own profile data
     */
    public function getMyProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'STUDENT') {
            return response()->json([
                'message' => 'هذه الخدمة متاحة للطلاب فقط',
                'message_en' => 'This service is only available for students',
            ], 403);
        }

        $student = $user->student;

        if (!$student) {
            return response()->json([
                'message' => 'لم يتم العثور على ملف الطالب',
                'message_en' => 'Student profile not found',
            ], 404);
        }

        $student->load(['user', 'program.college', 'program.department', 'advisor']);

        return response()->json($student);
    }

    /**
     * Delete student document
     * SECURITY: Only admin can delete documents
     */
    public function deleteDocument(Request $request, Student $student, $documentId): JsonResponse
    {
        // SECURITY: Only admin/staff can delete documents
        $user = $request->user();
        if (!in_array($user->role, ['ADMIN', 'STUDENT_AFFAIRS', 'REGISTRAR'])) {
            return response()->json([
                'message' => 'غير مصرح لك بحذف المستندات',
                'message_en' => 'Unauthorized. Only administrators can delete documents.',
            ], 403);
        }

        $document = $student->documents()->findOrFail($documentId);

        // Delete file from PRIVATE storage
        if (\Illuminate\Support\Facades\Storage::disk('local')->exists($document->file_path)) {
            \Illuminate\Support\Facades\Storage::disk('local')->delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'message' => 'تم حذف المستند بنجاح',
            'message_en' => 'Document deleted successfully',
        ]);
    }
}
