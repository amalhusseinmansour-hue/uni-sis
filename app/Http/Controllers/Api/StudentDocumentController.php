<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentDocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $documents = StudentDocument::with('student')
            ->when($request->student_id, fn($q) => $q->where('student_id', $request->student_id))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('upload_date', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($documents);
    }

    public function show(StudentDocument $studentDocument): JsonResponse
    {
        return response()->json($studentDocument->load('student'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'type' => 'required|in:PASSPORT,NATIONAL_ID,CERTIFICATE,TRANSCRIPT,PHOTO,OTHER',
            'name' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // 10MB max
            'notes' => 'nullable|string',
        ]);

        // Handle file upload
        $file = $request->file('file');
        $path = $file->store('student-documents/' . $validated['student_id'], 'public');

        $document = StudentDocument::create([
            'student_id' => $validated['student_id'],
            'type' => $validated['type'],
            'name' => $validated['name'],
            'file_path' => $path,
            'upload_date' => now(),
            'status' => 'UNDER_REVIEW',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($document->load('student'), 201);
    }

    public function update(Request $request, StudentDocument $studentDocument): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'sometimes|in:PASSPORT,NATIONAL_ID,CERTIFICATE,TRANSCRIPT,PHOTO,OTHER',
            'name' => 'sometimes|string|max:255',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:UNDER_REVIEW,ACCEPTED,REJECTED',
        ]);

        // Handle file replacement if new file uploaded
        if ($request->hasFile('file')) {
            // Delete old file
            if ($studentDocument->file_path) {
                Storage::disk('public')->delete($studentDocument->file_path);
            }

            // Upload new file
            $file = $request->file('file');
            $validated['file_path'] = $file->store('student-documents/' . $studentDocument->student_id, 'public');
            $validated['upload_date'] = now();
            unset($validated['file']);
        }

        $studentDocument->update($validated);

        return response()->json($studentDocument->load('student'));
    }

    public function destroy(StudentDocument $studentDocument): JsonResponse
    {
        // Delete file from storage
        if ($studentDocument->file_path) {
            Storage::disk('public')->delete($studentDocument->file_path);
        }

        $studentDocument->delete();

        return response()->json(null, 204);
    }

    public function studentDocuments(Student $student): JsonResponse
    {
        $documents = $student->documents()
            ->orderBy('upload_date', 'desc')
            ->get();

        return response()->json($documents);
    }

    public function verify(Request $request, StudentDocument $studentDocument): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $studentDocument->update([
            'status' => 'ACCEPTED',
            'notes' => $validated['notes'] ?? $studentDocument->notes,
        ]);

        return response()->json($studentDocument);
    }

    public function reject(Request $request, StudentDocument $studentDocument): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'required|string', // Rejection reason is required
        ]);

        $studentDocument->update([
            'status' => 'REJECTED',
            'notes' => $validated['notes'],
        ]);

        return response()->json($studentDocument);
    }

    public function download(StudentDocument $studentDocument): mixed
    {
        if (!$studentDocument->file_path || !Storage::disk('public')->exists($studentDocument->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk('public')->download($studentDocument->file_path, $studentDocument->name);
    }
}
