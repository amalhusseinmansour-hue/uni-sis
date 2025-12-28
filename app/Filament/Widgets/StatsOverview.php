<?php

namespace App\Filament\Widgets;

use App\Models\AdmissionApplication;
use App\Models\Course;
use App\Models\FinancialRecord;
use App\Models\Student;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $totalStudents = Student::count();
        $activeStudents = Student::where('status', 'ACTIVE')->count();
        $totalCourses = Course::where('is_active', true)->count();
        $pendingApplications = AdmissionApplication::where('status', 'PENDING')->count();

        $pendingPayments = FinancialRecord::where('status', 'PENDING')->sum('amount');
        $overduePayments = FinancialRecord::where('status', 'OVERDUE')->sum('amount');

        return [
            Stat::make('Total Students', $totalStudents)
                ->description('Active: ' . $activeStudents)
                ->descriptionIcon('heroicon-m-academic-cap')
                ->color('success')
                ->chart([7, 3, 4, 5, 6, 3, 5, 8]),

            Stat::make('Active Courses', $totalCourses)
                ->description('Available for enrollment')
                ->descriptionIcon('heroicon-m-book-open')
                ->color('primary'),

            Stat::make('Pending Applications', $pendingApplications)
                ->description('Awaiting review')
                ->descriptionIcon('heroicon-m-document-text')
                ->color($pendingApplications > 10 ? 'warning' : 'success'),

            Stat::make('Pending Payments', '$' . number_format($pendingPayments, 2))
                ->description('Overdue: $' . number_format($overduePayments, 2))
                ->descriptionIcon('heroicon-m-banknotes')
                ->color($overduePayments > 0 ? 'danger' : 'warning'),
        ];
    }
}
