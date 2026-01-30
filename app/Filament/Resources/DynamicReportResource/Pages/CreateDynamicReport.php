<?php

namespace App\Filament\Resources\DynamicReportResource\Pages;

use App\Filament\Resources\DynamicReportResource;
use Filament\Resources\Pages\CreateRecord;

class CreateDynamicReport extends CreateRecord
{
    protected static string $resource = DynamicReportResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['created_by'] = auth()->id();
        $data['updated_by'] = auth()->id();

        return $data;
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('edit', ['record' => $this->record]);
    }
}
