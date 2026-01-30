<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DynamicForm;
use App\Models\DynamicFormField;
use App\Models\DynamicFormSection;
use App\Models\DynamicFormSubmission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DynamicFormController extends Controller
{
    /**
     * Get all forms accessible by the user
     */
    public function index(Request $request): JsonResponse
    {
        $forms = DynamicForm::active()
            ->accessibleBy($request->user())
            ->when($request->category, fn($q, $cat) => $q->byCategory($cat))
            ->orderBy('sort_order')
            ->get(['id', 'code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'category']);

        return response()->json([
            'success' => true,
            'data' => $forms,
        ]);
    }

    /**
     * Get form configuration by code
     */
    public function show(string $code): JsonResponse
    {
        $form = DynamicForm::where('code', $code)
            ->with(['fields', 'sections'])
            ->firstOrFail();

        // Get dynamic options for fields
        $fieldsWithOptions = $form->fields->map(function ($field) {
            $fieldData = $field->toArray();
            if ($field->options_source) {
                $fieldData['options'] = $field->getOptionsFromSource();
            }
            return $fieldData;
        });

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $form->id,
                'code' => $form->code,
                'name' => $form->name,
                'name_en' => $form->name_en,
                'name_ar' => $form->name_ar,
                'description' => $form->description,
                'category' => $form->category,
                'fields' => $fieldsWithOptions,
                'sections' => $form->sections,
                'settings' => $form->settings,
                'validation_rules' => $form->generateValidationRules(),
            ],
        ]);
    }

    /**
     * Store a new form configuration
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:dynamic_forms,code',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'target_table' => 'nullable|string|max:100',
            'target_model' => 'nullable|string|max:255',
            'fields' => 'required|array|min:1',
            'fields.*.field_key' => 'required|string',
            'fields.*.field_name' => 'required|string',
            'fields.*.label_en' => 'required|string',
            'fields.*.label_ar' => 'required|string',
            'fields.*.field_type' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $form = DynamicForm::create([
                'code' => $request->code,
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'description_en' => $request->description_en,
                'description_ar' => $request->description_ar,
                'category' => $request->category,
                'target_table' => $request->target_table,
                'target_model' => $request->target_model,
                'settings' => $request->settings ?? [],
                'validation_rules' => $request->validation_rules ?? [],
                'workflow' => $request->workflow,
                'is_active' => $request->is_active ?? true,
                'requires_auth' => $request->requires_auth ?? true,
                'allowed_roles' => $request->allowed_roles,
                'created_by' => auth()->id(),
            ]);

            // Create sections
            if ($request->sections) {
                foreach ($request->sections as $index => $section) {
                    DynamicFormSection::create([
                        'form_id' => $form->id,
                        'section_key' => $section['section_key'],
                        'title_en' => $section['title_en'],
                        'title_ar' => $section['title_ar'],
                        'description_en' => $section['description_en'] ?? null,
                        'description_ar' => $section['description_ar'] ?? null,
                        'icon' => $section['icon'] ?? null,
                        'is_collapsible' => $section['is_collapsible'] ?? false,
                        'conditional_logic' => $section['conditional_logic'] ?? null,
                        'grid_columns' => $section['grid_columns'] ?? 2,
                        'sort_order' => $index,
                    ]);
                }
            }

            // Create fields
            foreach ($request->fields as $index => $field) {
                DynamicFormField::create([
                    'form_id' => $form->id,
                    'field_name' => $field['field_name'],
                    'field_key' => $field['field_key'],
                    'label_en' => $field['label_en'],
                    'label_ar' => $field['label_ar'],
                    'placeholder_en' => $field['placeholder_en'] ?? null,
                    'placeholder_ar' => $field['placeholder_ar'] ?? null,
                    'help_text_en' => $field['help_text_en'] ?? null,
                    'help_text_ar' => $field['help_text_ar'] ?? null,
                    'field_type' => $field['field_type'],
                    'options' => $field['options'] ?? null,
                    'options_source' => $field['options_source'] ?? null,
                    'options_filter' => $field['options_filter'] ?? null,
                    'default_value' => $field['default_value'] ?? null,
                    'validation' => $field['validation'] ?? null,
                    'is_required' => $field['is_required'] ?? false,
                    'is_unique' => $field['is_unique'] ?? false,
                    'show_in_list' => $field['show_in_list'] ?? true,
                    'show_in_detail' => $field['show_in_detail'] ?? true,
                    'show_in_form' => $field['show_in_form'] ?? true,
                    'is_readonly' => $field['is_readonly'] ?? false,
                    'is_hidden' => $field['is_hidden'] ?? false,
                    'conditional_logic' => $field['conditional_logic'] ?? null,
                    'grid_column' => $field['grid_column'] ?? 1,
                    'section' => $field['section'] ?? null,
                    'sort_order' => $index,
                    'styling' => $field['styling'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Form created successfully',
                'data' => $form->load(['fields', 'sections']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create form',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update form configuration
     */
    public function update(Request $request, string $code): JsonResponse
    {
        $form = DynamicForm::where('code', $code)->firstOrFail();

        try {
            DB::beginTransaction();

            $form->update([
                'name_en' => $request->name_en ?? $form->name_en,
                'name_ar' => $request->name_ar ?? $form->name_ar,
                'description_en' => $request->description_en ?? $form->description_en,
                'description_ar' => $request->description_ar ?? $form->description_ar,
                'category' => $request->category ?? $form->category,
                'target_table' => $request->target_table ?? $form->target_table,
                'target_model' => $request->target_model ?? $form->target_model,
                'settings' => $request->settings ?? $form->settings,
                'workflow' => $request->workflow ?? $form->workflow,
                'is_active' => $request->is_active ?? $form->is_active,
                'allowed_roles' => $request->allowed_roles ?? $form->allowed_roles,
                'updated_by' => auth()->id(),
            ]);

            // Update fields if provided
            if ($request->has('fields')) {
                $form->fields()->delete();
                foreach ($request->fields as $index => $field) {
                    DynamicFormField::create([
                        'form_id' => $form->id,
                        'field_name' => $field['field_name'],
                        'field_key' => $field['field_key'],
                        'label_en' => $field['label_en'],
                        'label_ar' => $field['label_ar'],
                        'field_type' => $field['field_type'],
                        'options' => $field['options'] ?? null,
                        'options_source' => $field['options_source'] ?? null,
                        'validation' => $field['validation'] ?? null,
                        'is_required' => $field['is_required'] ?? false,
                        'section' => $field['section'] ?? null,
                        'sort_order' => $index,
                    ]);
                }
            }

            // Update sections if provided
            if ($request->has('sections')) {
                $form->sections()->delete();
                foreach ($request->sections as $index => $section) {
                    DynamicFormSection::create([
                        'form_id' => $form->id,
                        'section_key' => $section['section_key'],
                        'title_en' => $section['title_en'],
                        'title_ar' => $section['title_ar'],
                        'sort_order' => $index,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Form updated successfully',
                'data' => $form->fresh(['fields', 'sections']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update form',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete form
     */
    public function destroy(string $code): JsonResponse
    {
        $form = DynamicForm::where('code', $code)->firstOrFail();
        $form->delete();

        return response()->json([
            'success' => true,
            'message' => 'Form deleted successfully',
        ]);
    }

    /**
     * Submit form data
     */
    public function submit(Request $request, string $code): JsonResponse
    {
        $form = DynamicForm::where('code', $code)
            ->with('fields')
            ->firstOrFail();

        // Generate and apply validation rules
        $rules = $form->generateValidationRules();
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create submission record
            $submission = DynamicFormSubmission::create([
                'form_id' => $form->id,
                'user_id' => auth()->id(),
                'data' => $request->except(['_token', '_method']),
                'status' => 'pending',
                'workflow_state' => $form->workflow['initial_state'] ?? 'submitted',
                'submitted_at' => now(),
            ]);

            // If target table is specified, also insert into that table
            if ($form->target_table) {
                $insertData = [];
                foreach ($form->fields as $field) {
                    if ($request->has($field->field_key)) {
                        $insertData[$field->field_name] = $request->get($field->field_key);
                    }
                }
                $insertData['created_at'] = now();
                $insertData['updated_at'] = now();

                $recordId = DB::table($form->target_table)->insertGetId($insertData);
                $submission->update([
                    'reference_id' => $recordId,
                    'reference_type' => $form->target_model ?? $form->target_table,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Form submitted successfully',
                'data' => [
                    'submission_id' => $submission->id,
                    'reference_id' => $submission->reference_id,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit form',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get form submissions
     */
    public function submissions(Request $request, string $code): JsonResponse
    {
        $form = DynamicForm::where('code', $code)->firstOrFail();

        $submissions = DynamicFormSubmission::where('form_id', $form->id)
            ->with('user:id,name,email')
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $submissions,
        ]);
    }

    /**
     * Get single submission
     */
    public function getSubmission(string $code, int $submissionId): JsonResponse
    {
        $form = DynamicForm::where('code', $code)->firstOrFail();

        $submission = DynamicFormSubmission::where('form_id', $form->id)
            ->where('id', $submissionId)
            ->with(['user:id,name,email', 'processedBy:id,name,email'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $submission,
        ]);
    }

    /**
     * Approve submission
     */
    public function approveSubmission(Request $request, string $code, int $submissionId): JsonResponse
    {
        $form = DynamicForm::where('code', $code)->firstOrFail();
        $submission = DynamicFormSubmission::where('form_id', $form->id)
            ->where('id', $submissionId)
            ->firstOrFail();

        $submission->approve(auth()->id(), $request->notes);

        return response()->json([
            'success' => true,
            'message' => 'Submission approved successfully',
        ]);
    }

    /**
     * Reject submission
     */
    public function rejectSubmission(Request $request, string $code, int $submissionId): JsonResponse
    {
        $form = DynamicForm::where('code', $code)->firstOrFail();
        $submission = DynamicFormSubmission::where('form_id', $form->id)
            ->where('id', $submissionId)
            ->firstOrFail();

        $submission->reject(auth()->id(), $request->notes);

        return response()->json([
            'success' => true,
            'message' => 'Submission rejected',
        ]);
    }
}
