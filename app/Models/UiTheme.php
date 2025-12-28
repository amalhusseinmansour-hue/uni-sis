<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UiTheme extends Model
{
    protected $fillable = [
        'code',
        'name_en',
        'name_ar',
        'colors',
        'typography',
        'spacing',
        'borders',
        'shadows',
        'is_dark',
        'is_default',
        'is_active',
    ];

    protected $casts = [
        'colors' => 'array',
        'typography' => 'array',
        'spacing' => 'array',
        'borders' => 'array',
        'shadows' => 'array',
        'is_dark' => 'boolean',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    public static function getDefault(): ?self
    {
        return static::where('is_default', true)
            ->where('is_active', true)
            ->first();
    }

    public function toCssVariables(): array
    {
        $vars = [];

        // Colors
        foreach ($this->colors ?? [] as $name => $value) {
            $vars["--color-{$name}"] = $value;
        }

        // Typography
        foreach ($this->typography ?? [] as $name => $value) {
            $vars["--font-{$name}"] = $value;
        }

        // Spacing
        foreach ($this->spacing ?? [] as $name => $value) {
            $vars["--spacing-{$name}"] = $value;
        }

        // Borders
        foreach ($this->borders ?? [] as $name => $value) {
            $vars["--border-{$name}"] = $value;
        }

        // Shadows
        foreach ($this->shadows ?? [] as $name => $value) {
            $vars["--shadow-{$name}"] = $value;
        }

        return $vars;
    }
}
