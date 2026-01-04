<?php

namespace App\Filament\Pages;

use App\Models\MoodleUser;
use App\Models\Student;
use App\Services\MoodleImportService;
use Filament\Actions\Action;
use Filament\Forms\Components\Checkbox;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Contracts\View\View;

class MoodleImport extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-cloud-arrow-down';
    protected static ?string $navigationLabel = 'Import from Moodle';
    protected static ?string $navigationGroup = 'Moodle Integration';
    protected static ?int $navigationSort = 1;
    protected static string $view = 'filament.pages.moodle-import';

    public bool $connectionTested = false;
    public ?array $connectionResult = null;
    public array $moodleStudents = [];
    public array $selectedStudents = [];
    public bool $isLoading = false;
    public ?array $importResult = null;

    protected MoodleImportService $importService;

    public function boot(MoodleImportService $importService): void
    {
        $this->importService = $importService;
    }

    public function mount(): void
    {
        $this->testConnection();
    }

    public function testConnection(): void
    {
        $service = app(MoodleImportService::class);
        $this->connectionResult = $service->testConnection();
        $this->connectionTested = true;
    }

    public function fetchStudents(): void
    {
        $this->isLoading = true;

        try {
            $service = app(MoodleImportService::class);
            $this->moodleStudents = $service->fetchMoodleStudents();

            Notification::make()
                ->title('Students Fetched')
                ->body('Found ' . count($this->moodleStudents) . ' students in Moodle')
                ->success()
                ->send();
        } catch (\Exception $e) {
            Notification::make()
                ->title('Error')
                ->body('Failed to fetch students: ' . $e->getMessage())
                ->danger()
                ->send();
        }

        $this->isLoading = false;
    }

    public function importSelected(): void
    {
        if (empty($this->selectedStudents)) {
            Notification::make()
                ->title('No Selection')
                ->body('Please select students to import')
                ->warning()
                ->send();
            return;
        }

        $this->isLoading = true;

        try {
            $service = app(MoodleImportService::class);

            $studentsToImport = array_filter(
                $this->moodleStudents,
                fn($s) => in_array($s['id'], $this->selectedStudents)
            );

            $this->importResult = $service->importStudents(array_values($studentsToImport));

            Notification::make()
                ->title('Import Completed')
                ->body("Created: {$this->importResult['created']}, Updated: {$this->importResult['updated']}, Failed: {$this->importResult['failed']}")
                ->success()
                ->send();

            // Refresh the list
            $this->fetchStudents();
        } catch (\Exception $e) {
            Notification::make()
                ->title('Import Failed')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }

        $this->isLoading = false;
    }

    public function importAll(): void
    {
        if (empty($this->moodleStudents)) {
            Notification::make()
                ->title('No Students')
                ->body('Please fetch students first')
                ->warning()
                ->send();
            return;
        }

        $this->isLoading = true;

        try {
            $service = app(MoodleImportService::class);
            $this->importResult = $service->importStudents($this->moodleStudents);

            Notification::make()
                ->title('Import Completed')
                ->body("Created: {$this->importResult['created']}, Updated: {$this->importResult['updated']}, Failed: {$this->importResult['failed']}")
                ->success()
                ->send();

            // Clear the list after successful import
            $this->moodleStudents = [];
            $this->selectedStudents = [];
        } catch (\Exception $e) {
            Notification::make()
                ->title('Import Failed')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }

        $this->isLoading = false;
    }

    public function toggleStudent(int $moodleId): void
    {
        if (in_array($moodleId, $this->selectedStudents)) {
            $this->selectedStudents = array_diff($this->selectedStudents, [$moodleId]);
        } else {
            $this->selectedStudents[] = $moodleId;
        }
    }

    public function selectAll(): void
    {
        $this->selectedStudents = array_column($this->moodleStudents, 'id');
    }

    public function deselectAll(): void
    {
        $this->selectedStudents = [];
    }

    public function table(Table $table): Table
    {
        return $table
            ->query(
                MoodleUser::query()
                    ->where('user_type', 'STUDENT')
                    ->with('student')
            )
            ->columns([
                TextColumn::make('moodle_user_id')
                    ->label('Moodle ID')
                    ->sortable(),
                TextColumn::make('username')
                    ->label('Username')
                    ->searchable(),
                TextColumn::make('student.name_en')
                    ->label('Student Name')
                    ->searchable(),
                TextColumn::make('student.student_id')
                    ->label('Student ID'),
                IconColumn::make('sync_status')
                    ->label('Status')
                    ->icon(fn (string $state): string => match ($state) {
                        'SYNCED' => 'heroicon-o-check-circle',
                        'PENDING' => 'heroicon-o-clock',
                        'FAILED' => 'heroicon-o-x-circle',
                        default => 'heroicon-o-question-mark-circle',
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'SYNCED' => 'success',
                        'PENDING' => 'warning',
                        'FAILED' => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('last_synced_at')
                    ->label('Last Sync')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('sync_status')
                    ->options([
                        'SYNCED' => 'Synced',
                        'PENDING' => 'Pending',
                        'FAILED' => 'Failed',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('sync')
                    ->label('Sync Data')
                    ->icon('heroicon-o-arrow-path')
                    ->action(function (MoodleUser $record) {
                        if ($record->student) {
                            $service = app(MoodleImportService::class);
                            $result = $service->syncStudentData($record->student);

                            if ($result['success']) {
                                Notification::make()
                                    ->title('Sync Completed')
                                    ->success()
                                    ->send();
                            } else {
                                Notification::make()
                                    ->title('Sync Failed')
                                    ->body($result['error'] ?? 'Unknown error')
                                    ->danger()
                                    ->send();
                            }
                        }
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkAction::make('syncSelected')
                    ->label('Sync Selected')
                    ->icon('heroicon-o-arrow-path')
                    ->action(function ($records) {
                        $service = app(MoodleImportService::class);
                        $success = 0;
                        $failed = 0;

                        foreach ($records as $record) {
                            if ($record->student) {
                                $result = $service->syncStudentData($record->student);
                                if ($result['success']) {
                                    $success++;
                                } else {
                                    $failed++;
                                }
                            }
                        }

                        Notification::make()
                            ->title('Sync Completed')
                            ->body("Success: {$success}, Failed: {$failed}")
                            ->success()
                            ->send();
                    }),
            ])
            ->defaultSort('last_synced_at', 'desc');
    }

    public function getStatistics(): array
    {
        return [
            'total_moodle_users' => MoodleUser::students()->count(),
            'synced' => MoodleUser::students()->where('sync_status', 'SYNCED')->count(),
            'pending' => MoodleUser::students()->where('sync_status', 'PENDING')->count(),
            'failed' => MoodleUser::students()->where('sync_status', 'FAILED')->count(),
            'total_students' => Student::count(),
        ];
    }
}
