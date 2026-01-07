<?php

namespace App\Filament\Resources\StudentRequestResource\Pages;

use App\Filament\Resources\StudentRequestResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;
use Filament\Notifications\Notification;

class ViewStudentRequest extends ViewRecord
{
    protected static string $resource = StudentRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),

            Actions\Action::make('approve')
                ->label('موافقة')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('موافقة على الطلب')
                ->modalDescription('هل أنت متأكد من الموافقة على هذا الطلب؟')
                ->form([
                    \Filament\Forms\Components\Textarea::make('approval_notes')
                        ->label('ملاحظات الموافقة')
                        ->rows(3),
                ])
                ->action(function (array $data): void {
                    $this->record->update([
                        'status' => 'APPROVED',
                        'final_decision_by' => auth()->id(),
                        'final_decision_at' => now(),
                        'final_notes' => $data['approval_notes'] ?? null,
                    ]);

                    $this->record->logAction(
                        auth()->id(),
                        'APPROVED',
                        $this->record->getOriginal('status'),
                        'APPROVED',
                        $data['approval_notes'] ?? 'تمت الموافقة على الطلب'
                    );

                    Notification::make()
                        ->title('تمت الموافقة على الطلب بنجاح')
                        ->success()
                        ->send();
                })
                ->visible(fn (): bool => $this->record->isPending()),

            Actions\Action::make('reject')
                ->label('رفض')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->requiresConfirmation()
                ->modalHeading('رفض الطلب')
                ->modalDescription('هل أنت متأكد من رفض هذا الطلب؟')
                ->form([
                    \Filament\Forms\Components\Textarea::make('rejection_reason')
                        ->label('سبب الرفض')
                        ->required()
                        ->rows(3),
                ])
                ->action(function (array $data): void {
                    $this->record->update([
                        'status' => 'REJECTED',
                        'final_decision_by' => auth()->id(),
                        'final_decision_at' => now(),
                        'rejection_reason' => $data['rejection_reason'],
                    ]);

                    $this->record->logAction(
                        auth()->id(),
                        'REJECTED',
                        $this->record->getOriginal('status'),
                        'REJECTED',
                        $data['rejection_reason']
                    );

                    Notification::make()
                        ->title('تم رفض الطلب')
                        ->warning()
                        ->send();
                })
                ->visible(fn (): bool => $this->record->isPending()),
        ];
    }
}
