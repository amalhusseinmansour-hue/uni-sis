<?php

namespace App\Filament\Pages;

use App\Jobs\BulkSyncToMoodle;
use App\Jobs\ImportMoodleGrades;
use App\Models\MoodleCourse;
use App\Models\MoodleEnrollment;
use App\Models\MoodleGrade;
use App\Models\MoodleSyncLog;
use App\Models\MoodleUser;
use App\Services\MoodleIntegrationService;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Enums\IconPosition;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Contracts\View\View;

class MoodleSyncDashboard extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-path';

    protected static string $view = 'filament.pages.moodle-sync-dashboard';

    protected static ?int $navigationSort = 90;

    public array $stats = [];
    public array $connectionStatus = [];

    public static function getNavigationGroup(): ?string
    {
        return 'Integrations / التكاملات';
    }

    public static function getNavigationLabel(): string
    {
        return 'Moodle LMS';
    }

    public function getTitle(): string
    {
        return 'Moodle LMS Integration';
    }

    public function mount(): void
    {
        $this->refreshStats();
    }

    public function refreshStats(): void
    {
        $service = app(MoodleIntegrationService::class);

        $this->connectionStatus = $service->testConnection();
        $this->stats = $service->getSyncStatistics();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('testConnection')
                ->label('Test Connection')
                ->icon('heroicon-o-signal')
                ->color('info')
                ->action(function () {
                    $service = app(MoodleIntegrationService::class);
                    $result = $service->testConnection();

                    if ($result['success']) {
                        Notification::make()
                            ->title('Connection Successful')
                            ->body("Connected to: {$result['site_name']}")
                            ->success()
                            ->send();
                    } else {
                        Notification::make()
                            ->title('Connection Failed')
                            ->body($result['error'] ?? 'Unknown error')
                            ->danger()
                            ->send();
                    }

                    $this->refreshStats();
                }),

            Action::make('syncStudents')
                ->label('Sync Students')
                ->icon('heroicon-o-users')
                ->color('primary')
                ->requiresConfirmation()
                ->modalHeading('Sync Students to Moodle')
                ->modalDescription('This will sync all active students to Moodle. Continue?')
                ->action(function () {
                    BulkSyncToMoodle::dispatch('students', [], ['only_pending' => false]);

                    Notification::make()
                        ->title('Sync Started')
                        ->body('Student sync job has been queued.')
                        ->success()
                        ->send();

                    $this->refreshStats();
                }),

            Action::make('syncCourses')
                ->label('Sync Courses')
                ->icon('heroicon-o-book-open')
                ->color('primary')
                ->requiresConfirmation()
                ->modalHeading('Sync Courses to Moodle')
                ->modalDescription('This will sync all active courses to Moodle. Continue?')
                ->action(function () {
                    BulkSyncToMoodle::dispatch('courses', [], ['only_pending' => false]);

                    Notification::make()
                        ->title('Sync Started')
                        ->body('Course sync job has been queued.')
                        ->success()
                        ->send();

                    $this->refreshStats();
                }),

            Action::make('syncEnrollments')
                ->label('Sync Enrollments')
                ->icon('heroicon-o-clipboard-document-list')
                ->color('primary')
                ->requiresConfirmation()
                ->modalHeading('Sync Enrollments to Moodle')
                ->modalDescription('This will sync all current enrollments to Moodle. Continue?')
                ->action(function () {
                    BulkSyncToMoodle::dispatch('enrollments', [], ['only_pending' => false]);

                    Notification::make()
                        ->title('Sync Started')
                        ->body('Enrollment sync job has been queued.')
                        ->success()
                        ->send();

                    $this->refreshStats();
                }),

            Action::make('importGrades')
                ->label('Import Grades')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Import Grades from Moodle')
                ->modalDescription('This will import grades from all synced courses. Continue?')
                ->action(function () {
                    ImportMoodleGrades::dispatch(null, true);

                    Notification::make()
                        ->title('Import Started')
                        ->body('Grade import job has been queued.')
                        ->success()
                        ->send();

                    $this->refreshStats();
                }),
        ];
    }

    public function table(Table $table): Table
    {
        return $table
            ->query(MoodleSyncLog::query()->orderBy('synced_at', 'desc'))
            ->columns([
                TextColumn::make('sync_type')
                    ->label('Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'USER' => 'info',
                        'COURSE' => 'primary',
                        'ENROLLMENT' => 'warning',
                        'GRADE' => 'success',
                        default => 'gray',
                    }),

                TextColumn::make('direction')
                    ->label('Direction')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'TO_MOODLE' => 'primary',
                        'FROM_MOODLE' => 'success',
                        default => 'gray',
                    }),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'SUCCESS' => 'success',
                        'FAILED' => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('error_message')
                    ->label('Error')
                    ->limit(50)
                    ->tooltip(fn ($record) => $record->error_message),

                TextColumn::make('synced_at')
                    ->label('Synced At')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('synced_at', 'desc')
            ->paginated([10, 25, 50]);
    }

    public function getViewData(): array
    {
        return [
            'stats' => $this->stats,
            'connectionStatus' => $this->connectionStatus,
            'isConfigured' => app(MoodleIntegrationService::class)->isConfigured(),
            'isSyncEnabled' => app(MoodleIntegrationService::class)->isSyncEnabled(),
        ];
    }
}
