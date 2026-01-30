<?php

namespace App\Filament\Resources\DynamicTableResource\Pages;

use App\Filament\Resources\DynamicTableResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewDynamicTable extends ViewRecord
{
    protected static string $resource = DynamicTableResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
