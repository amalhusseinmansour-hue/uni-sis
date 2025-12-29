<?php

namespace App\Filament\Resources\DashboardLayoutResource\Pages;

use App\Filament\Resources\DashboardLayoutResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDashboardLayout extends EditRecord
{
    protected static string $resource = DashboardLayoutResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
