<?php

namespace App\Filament\Resources\DynamicFormResource\Pages;

use App\Filament\Resources\DynamicFormResource;
use Filament\Resources\Pages\CreateRecord;

class CreateDynamicForm extends CreateRecord
{
    protected static string $resource = DynamicFormResource::class;

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
