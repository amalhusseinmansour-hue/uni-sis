<?php

namespace App\Filament\Resources\DynamicTableResource\Pages;

use App\Filament\Resources\DynamicTableResource;
use Filament\Resources\Pages\CreateRecord;

class CreateDynamicTable extends CreateRecord
{
    protected static string $resource = DynamicTableResource::class;

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
