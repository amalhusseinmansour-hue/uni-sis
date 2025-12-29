<?php

namespace App\Filament\Resources\DynamicReportResource\Pages;

use App\Filament\Resources\DynamicReportResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDynamicReport extends EditRecord
{
    protected static string $resource = DynamicReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['updated_by'] = auth()->id();

        return $data;
    }
}
