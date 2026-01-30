<?php

namespace App\Filament\Resources\DynamicTableResource\Pages;

use App\Filament\Resources\DynamicTableResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDynamicTable extends EditRecord
{
    protected static string $resource = DynamicTableResource::class;

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
