<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DynamicForm;
use App\Models\DynamicFormSection;
use App\Models\DynamicFormField;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FormBuilderController extends Controller
{
    // Get all forms
    public function index(): JsonResponse
    {
        $forms = DynamicForm::withCount(['sections', 'fields'])
            ->orderBy('name_en')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $forms,
        ]);
    }

    // Get single form with all relations
    public function show(string $code): JsonResponse
    {
        $form = DynamicForm::where('code', $code)
            ->with([
                'sections' => fn($q) => $q->orderBy('order'),
                'fields' => fn($q) => $q->orderBy('order'),
            ])
            ->first();

        if (!$form) {
            return response()->json(['success' => false, 'message' => 'Form not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $form,
        ]);
    }

    // Create or update form
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:100',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'settings' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $form = DynamicForm::updateOrCreate(
            ['code' => $request->code],
            [
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'description_en' => $request->description_en,
                'description_ar' => $request->description_ar,
                'model_class' => $request->model_class,
                'submit_endpoint' => $request->submit_endpoint,
                'success_message_en' => $request->success_message_en,
                'success_message_ar' => $request->success_message_ar,
                'redirect_after' => $request->redirect_after,
                'settings' => $request->settings,
                'roles' => $request->roles,
                'is_active' => $request->is_active ?? true,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $form,
        ], $request->has('id') ? 200 : 201);
    }

    // Delete form
    public function destroy(string $code): JsonResponse
    {
        $form = DynamicForm::where('code', $code)->first();

        if (!$form) {
            return response()->json(['success' => false, 'message' => 'Form not found'], 404);
        }

        $form->delete();

        return response()->json(['success' => true, 'message' => 'Form deleted']);
    }

    // Duplicate form
    public function duplicate(string $code): JsonResponse
    {
        $form = DynamicForm::where('code', $code)
            ->with(['sections', 'fields'])
            ->first();

        if (!$form) {
            return response()->json(['success' => false, 'message' => 'Form not found'], 404);
        }

        $newCode = $code . '_copy_' . Str::random(4);

        DB::beginTransaction();
        try {
            $newForm = $form->replicate();
            $newForm->code = $newCode;
            $newForm->name_en = $form->name_en . ' (Copy)';
            $newForm->name_ar = $form->name_ar . ' (نسخة)';
            $newForm->save();

            $sectionMap = [];
            foreach ($form->sections as $section) {
                $newSection = $section->replicate();
                $newSection->dynamic_form_id = $newForm->id;
                $newSection->save();
                $sectionMap[$section->id] = $newSection->id;
            }

            foreach ($form->fields as $field) {
                $newField = $field->replicate();
                $newField->dynamic_form_id = $newForm->id;
                $newField->section_id = $field->section_id ? ($sectionMap[$field->section_id] ?? null) : null;
                $newField->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $newForm->load(['sections', 'fields']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // SECTIONS
    // =========================================================================

    public function getSections(string $formCode): JsonResponse
    {
        $form = DynamicForm::where('code', $formCode)->first();

        if (!$form) {
            return response()->json(['success' => false, 'message' => 'Form not found'], 404);
        }

        $sections = $form->sections()->orderBy('order')->get();

        return response()->json([
            'success' => true,
            'data' => $sections,
        ]);
    }

    public function saveSections(Request $request, string $formCode): JsonResponse
    {
        $form = DynamicForm::where('code', $formCode)->first();

        if (!$form) {
            return response()->json(['success' => false, 'message' => 'Form not found'], 404);
        }

        $sections = $request->input('sections', []);

        $existingIds = collect($sections)->pluck('id')->filter()->toArray();

        DynamicFormSection::where('dynamic_form_id', $form->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

        foreach ($sections as $index => $sectionData) {
            $sectionData['dynamic_form_id'] = $form->id;
            $sectionData['order'] = $index;

            if (!empty($sectionData['id'])) {
                DynamicFormSection::where('id', $sectionData['id'])->update($sectionData);
            } else {
                unset($sectionData['id']);
                DynamicFormSection::create($sectionData);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $form->sections()->orderBy('order')->get(),
        ]);
    }

    // =========================================================================
    // FIELDS
    // =========================================================================

    public function getFields(string $formCode): JsonResponse
    {
        $form = DynamicForm::where('code', $formCode)->first();

        if (!$form) {
            return response()->json(['success' => false, 'message' => 'Form not found'], 404);
        }

        $fields = $form->fields()->orderBy('order')->get();

        return response()->json([
            'success' => true,
            'data' => $fields,
        ]);
    }

    public function saveFields(Request $request, string $formCode): JsonResponse
    {
        $form = DynamicForm::where('code', $formCode)->first();

        if (!$form) {
            return response()->json(['success' => false, 'message' => 'Form not found'], 404);
        }

        $fields = $request->input('fields', []);

        $existingIds = collect($fields)->pluck('id')->filter()->toArray();

        DynamicFormField::where('dynamic_form_id', $form->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

        foreach ($fields as $index => $fieldData) {
            $fieldData['dynamic_form_id'] = $form->id;
            $fieldData['order'] = $index;

            if (!empty($fieldData['id'])) {
                DynamicFormField::where('id', $fieldData['id'])->update($fieldData);
            } else {
                unset($fieldData['id']);
                DynamicFormField::create($fieldData);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $form->fields()->orderBy('order')->get(),
        ]);
    }

    public function deleteField(int $id): JsonResponse
    {
        $field = DynamicFormField::find($id);

        if (!$field) {
            return response()->json(['success' => false, 'message' => 'Field not found'], 404);
        }

        $field->delete();

        return response()->json(['success' => true, 'message' => 'Field deleted']);
    }

    // =========================================================================
    // FIELD TYPES
    // =========================================================================

    public function getFieldTypes(): JsonResponse
    {
        $types = [
            [
                'type' => 'text',
                'label' => 'Text Input',
                'icon' => 'type',
                'category' => 'basic',
            ],
            [
                'type' => 'number',
                'label' => 'Number',
                'icon' => 'hash',
                'category' => 'basic',
            ],
            [
                'type' => 'email',
                'label' => 'Email',
                'icon' => 'mail',
                'category' => 'basic',
            ],
            [
                'type' => 'tel',
                'label' => 'Phone',
                'icon' => 'phone',
                'category' => 'basic',
            ],
            [
                'type' => 'textarea',
                'label' => 'Text Area',
                'icon' => 'align-left',
                'category' => 'basic',
            ],
            [
                'type' => 'select',
                'label' => 'Dropdown',
                'icon' => 'chevron-down',
                'category' => 'choice',
            ],
            [
                'type' => 'multiselect',
                'label' => 'Multi Select',
                'icon' => 'check-square',
                'category' => 'choice',
            ],
            [
                'type' => 'radio',
                'label' => 'Radio Buttons',
                'icon' => 'circle',
                'category' => 'choice',
            ],
            [
                'type' => 'checkbox',
                'label' => 'Checkbox',
                'icon' => 'check-square',
                'category' => 'choice',
            ],
            [
                'type' => 'date',
                'label' => 'Date',
                'icon' => 'calendar',
                'category' => 'datetime',
            ],
            [
                'type' => 'datetime',
                'label' => 'Date & Time',
                'icon' => 'clock',
                'category' => 'datetime',
            ],
            [
                'type' => 'time',
                'label' => 'Time',
                'icon' => 'clock',
                'category' => 'datetime',
            ],
            [
                'type' => 'file',
                'label' => 'File Upload',
                'icon' => 'upload',
                'category' => 'media',
            ],
            [
                'type' => 'image',
                'label' => 'Image Upload',
                'icon' => 'image',
                'category' => 'media',
            ],
            [
                'type' => 'rich_text',
                'label' => 'Rich Text Editor',
                'icon' => 'bold',
                'category' => 'advanced',
            ],
            [
                'type' => 'color',
                'label' => 'Color Picker',
                'icon' => 'palette',
                'category' => 'advanced',
            ],
            [
                'type' => 'password',
                'label' => 'Password',
                'icon' => 'lock',
                'category' => 'basic',
            ],
            [
                'type' => 'hidden',
                'label' => 'Hidden Field',
                'icon' => 'eye-off',
                'category' => 'advanced',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }
}
