<?php

namespace App\Filament\Resources\DynamicReportResource\Pages;

use App\Filament\Resources\DynamicReportResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewDynamicReport extends ViewRecord
{
    protected static string $resource = DynamicReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
