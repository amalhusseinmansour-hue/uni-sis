<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * SECURITY: Get safe per_page value to prevent DoS attacks
     * Limits pagination to reasonable values (1-100)
     */
    protected function getPerPage(Request $request, int $default = 15, int $max = 100): int
    {
        $perPage = (int) ($request->per_page ?? $request->get('per_page', $default));
        return min(max($perPage, 1), $max);
    }

    /**
     * SECURITY: Validate sort parameters
     * Returns validated sort field and direction
     */
    protected function getSortParams(Request $request, array $allowedFields, string $defaultField = 'created_at', string $defaultDir = 'desc'): array
    {
        $sortBy = $request->get('sort_by', $defaultField);
        $sortDir = strtolower($request->get('sort_dir', $defaultDir));

        // Validate sort field
        if (!in_array($sortBy, $allowedFields, true)) {
            $sortBy = $defaultField;
        }

        // Validate sort direction
        if (!in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = $defaultDir;
        }

        return ['field' => $sortBy, 'direction' => $sortDir];
    }
}
