<?php

namespace App\Traits;

use App\Models\AuditLog;

trait Auditable
{
    protected static function bootAuditable(): void
    {
        static::created(function ($model) {
            if (auth()->check()) {
                AuditLog::logCreate($model);
            }
        });

        static::updating(function ($model) {
            $model->auditOldValues = $model->getOriginal();
        });

        static::updated(function ($model) {
            if (auth()->check() && !empty($model->getDirty())) {
                AuditLog::logUpdate($model, $model->auditOldValues ?? []);
            }
        });

        static::deleted(function ($model) {
            if (auth()->check()) {
                AuditLog::logDelete($model);
            }
        });
    }

    public function auditLogs()
    {
        return AuditLog::where('model_type', get_class($this))
            ->where('model_id', $this->id)
            ->orderBy('created_at', 'desc');
    }
}
