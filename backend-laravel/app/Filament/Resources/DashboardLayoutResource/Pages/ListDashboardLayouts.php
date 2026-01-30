<?php

namespace App\Filament\Resources\DashboardLayoutResource\Pages;

use App\Filament\Resources\DashboardLayoutResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDashboardLayouts extends ListRecords
{
    protected static string $resource = DashboardLayoutResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
