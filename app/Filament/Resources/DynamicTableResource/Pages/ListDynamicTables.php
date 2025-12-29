<?php

namespace App\Filament\Resources\DynamicTableResource\Pages;

use App\Filament\Resources\DynamicTableResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDynamicTables extends ListRecords
{
    protected static string $resource = DynamicTableResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
