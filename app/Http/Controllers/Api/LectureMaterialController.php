<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lecture;
use App\Models\LectureMaterial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class LectureMaterialController extends Controller
{
    /**
     * عرض مواد محاضرة
     */
    public function index(Lecture $lecture, Request $request): JsonResponse
    {
        $query = $lecture->materials();

        // للطلاب، عرض المواد المرئية فقط
        $user = Auth::user();
        if ($user->role === 'STUDENT') {
            $query->visibleToStudents();
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        $materials = $query->ordered()->get();

        return response()->json($materials);
    }

    /**
     * عرض مادة واحدة
     */
    public function show(Lecture $lecture, LectureMaterial $material): JsonResponse
    {
        // التحقق من أن المادة تنتمي للمحاضرة
        if ($material->lecture_id !== $lecture->id) {
            return response()->json(['message' => 'Material not found in this lecture'], 404);
        }

        // للطلاب، التحقق من الرؤية
        $user = Auth::user();
        if ($user->role === 'STUDENT' && !$material->is_visible_to_students) {
            return response()->json(['message' => 'You do not have access to this material'], 403);
        }

        // تسجيل المشاهدة
        $material->recordView();

        return response()->json($material->load('uploader'));
    }

    /**
     * رفع مادة جديدة
     */
    public function store(Request $request, Lecture $lecture): JsonResponse
    {
        $validated = $request->validate([
            'title_en' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:SLIDES,PDF,VIDEO,AUDIO,DOCUMENT,LINK,IMAGE,CODE,OTHER',
            'file' => 'required_without:external_url|file|max:102400', // 100MB max
            'external_url' => 'required_without:file|nullable|url',
            'is_downloadable' => 'nullable|boolean',
            'is_visible_to_students' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
        ]);

        $data = [
            'lecture_id' => $lecture->id,
            'uploaded_by' => Auth::id(),
            'title_en' => $validated['title_en'],
            'title_ar' => $validated['title_ar'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'is_downloadable' => $validated['is_downloadable'] ?? true,
            'is_visible_to_students' => $validated['is_visible_to_students'] ?? true,
            'order' => $validated['order'] ?? $lecture->materials()->max('order') + 1,
        ];

        // رفع الملف
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('lecture-materials/' . $lecture->id, 'public');

            $data['file_path'] = $path;
            $data['file_name'] = $file->getClientOriginalName();
            $data['file_size'] = $file->getSize();
            $data['mime_type'] = $file->getMimeType();

            // تحديد النوع من الـ MIME إذا كان OTHER
            if ($validated['type'] === 'OTHER') {
                $data['type'] = LectureMaterial::getTypeFromMime($file->getMimeType());
            }
        } else {
            $data['external_url'] = $validated['external_url'];
        }

        $material = LectureMaterial::create($data);

        return response()->json($material, 201);
    }

    /**
     * تعديل مادة
     */
    public function update(Request $request, Lecture $lecture, LectureMaterial $material): JsonResponse
    {
        if ($material->lecture_id !== $lecture->id) {
            return response()->json(['message' => 'Material not found in this lecture'], 404);
        }

        $validated = $request->validate([
            'title_en' => 'sometimes|string|max:255',
            'title_ar' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:SLIDES,PDF,VIDEO,AUDIO,DOCUMENT,LINK,IMAGE,CODE,OTHER',
            'external_url' => 'nullable|url',
            'is_downloadable' => 'nullable|boolean',
            'is_visible_to_students' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
        ]);

        $material->update($validated);

        return response()->json($material);
    }

    /**
     * حذف مادة
     */
    public function destroy(Lecture $lecture, LectureMaterial $material): JsonResponse
    {
        if ($material->lecture_id !== $lecture->id) {
            return response()->json(['message' => 'Material not found in this lecture'], 404);
        }

        // حذف الملف من التخزين
        $material->deleteFile();
        $material->delete();

        return response()->json(null, 204);
    }

    /**
     * تحميل ملف
     */
    public function download(Lecture $lecture, LectureMaterial $material): JsonResponse
    {
        if ($material->lecture_id !== $lecture->id) {
            return response()->json(['message' => 'Material not found in this lecture'], 404);
        }

        // للطلاب، التحقق من الصلاحيات
        $user = Auth::user();
        if ($user->role === 'STUDENT') {
            if (!$material->is_visible_to_students) {
                return response()->json(['message' => 'You do not have access to this material'], 403);
            }
            if (!$material->is_downloadable) {
                return response()->json(['message' => 'This material is not downloadable'], 403);
            }
        }

        if (!$material->file_path) {
            return response()->json(['message' => 'No file available for download'], 404);
        }

        // تسجيل التحميل
        $material->recordDownload();

        // إرجاع رابط التحميل
        $url = Storage::disk('public')->url($material->file_path);

        return response()->json([
            'download_url' => $url,
            'file_name' => $material->file_name,
            'mime_type' => $material->mime_type,
        ]);
    }

    /**
     * إعادة ترتيب المواد
     */
    public function reorder(Request $request, Lecture $lecture): JsonResponse
    {
        $validated = $request->validate([
            'materials' => 'required|array',
            'materials.*.id' => 'required|exists:lecture_materials,id',
            'materials.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['materials'] as $item) {
            LectureMaterial::where('id', $item['id'])
                ->where('lecture_id', $lecture->id)
                ->update(['order' => $item['order']]);
        }

        return response()->json([
            'message' => 'Materials reordered successfully',
            'materials' => $lecture->materials()->ordered()->get(),
        ]);
    }

    /**
     * نسخ مواد من محاضرة أخرى
     */
    public function copyFrom(Request $request, Lecture $lecture): JsonResponse
    {
        $validated = $request->validate([
            'source_lecture_id' => 'required|exists:lectures,id',
            'material_ids' => 'nullable|array',
            'material_ids.*' => 'exists:lecture_materials,id',
        ]);

        $sourceLecture = Lecture::findOrFail($validated['source_lecture_id']);
        $query = $sourceLecture->materials();

        if (!empty($validated['material_ids'])) {
            $query->whereIn('id', $validated['material_ids']);
        }

        $materials = $query->get();
        $copied = [];

        foreach ($materials as $material) {
            $newMaterial = $material->replicate();
            $newMaterial->lecture_id = $lecture->id;
            $newMaterial->uploaded_by = Auth::id();
            $newMaterial->download_count = 0;
            $newMaterial->view_count = 0;
            $newMaterial->save();

            $copied[] = $newMaterial;
        }

        return response()->json([
            'message' => count($copied) . ' materials copied successfully',
            'materials' => $copied,
        ]);
    }
}
