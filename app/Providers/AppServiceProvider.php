<?php

namespace App\Providers;

use App\Models\Announcement;
use App\Models\Enrollment;
use App\Models\FinancialRecord;
use App\Models\Grade;
use App\Models\ServiceRequest;
use App\Observers\AnnouncementObserver;
use App\Observers\EnrollmentObserver;
use App\Observers\FinancialRecordObserver;
use App\Observers\GradeObserver;
use App\Observers\ServiceRequestObserver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Model Observers for Notifications
        Grade::observe(GradeObserver::class);
        Enrollment::observe(EnrollmentObserver::class);
        FinancialRecord::observe(FinancialRecordObserver::class);
        ServiceRequest::observe(ServiceRequestObserver::class);
        Announcement::observe(AnnouncementObserver::class);

        // Enforce strict mode for models in non-production
        Model::shouldBeStrict(!app()->isProduction());

        // Prevent lazy loading in development
        Model::preventLazyLoading(!app()->isProduction());

        // Prevent silently discarding attributes
        Model::preventSilentlyDiscardingAttributes(!app()->isProduction());

        // Set default password validation rules
        Password::defaults(function () {
            $rule = Password::min(8);

            return app()->isProduction()
                ? $rule->mixedCase()->numbers()->symbols()->uncompromised()
                : $rule;
        });

        // Log slow queries in development
        if (!app()->isProduction()) {
            DB::listen(function ($query) {
                if ($query->time > 100) { // Log queries taking more than 100ms
                    Log::warning('Slow query detected', [
                        'sql' => $query->sql,
                        'bindings' => $query->bindings,
                        'time' => $query->time . 'ms',
                    ]);
                }
            });
        }
    }
}
