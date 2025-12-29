<?php

namespace App\Filament\Resources\DynamicReportResource\Pages;

use App\Filament\Resources\DynamicReportResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDynamicReports extends ListRecords
{
    protected static string $resource = DynamicReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
