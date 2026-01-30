<?php

namespace App\Filament\Resources\InvoiceResource\Pages;

use App\Filament\Resources\InvoiceResource;
use App\Models\Semester;
use App\Services\FinanceService;
use Filament\Actions;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListInvoices extends ListRecords
{
    protected static string $resource = InvoiceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),

            Actions\Action::make('generate_bulk')
                ->label('Generate Bulk Invoices')
                ->icon('heroicon-o-document-duplicate')
                ->color('success')
                ->form([
                    Select::make('semester_id')
                        ->label('Semester')
                        ->options(Semester::pluck('name', 'id'))
                        ->required(),
                ])
                ->requiresConfirmation()
                ->modalHeading('Generate Invoices for All Active Students')
                ->modalDescription('This will generate invoices for all active students for the selected semester.')
                ->action(function (array $data) {
                    $semester = Semester::find($data['semester_id']);
                    $service = app(FinanceService::class);
                    $results = $service->generateBulkInvoices($semester, auth()->user());

                    Notification::make()
                        ->title('Bulk Invoice Generation Complete')
                        ->body("Generated: {$results['success']}, Skipped: {$results['skipped']}, Errors: " . count($results['errors']))
                        ->success()
                        ->send();
                }),

            Actions\Action::make('process_overdue')
                ->label('Mark Overdue')
                ->icon('heroicon-o-clock')
                ->color('warning')
                ->requiresConfirmation()
                ->action(function () {
                    $service = app(FinanceService::class);
                    $count = $service->processOverdueInvoices();

                    Notification::make()
                        ->title("{$count} invoices marked as overdue")
                        ->success()
                        ->send();
                }),
        ];
    }
}
