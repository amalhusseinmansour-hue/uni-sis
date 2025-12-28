<?php

namespace App\Filament\Resources\UiThemeResource\Pages;

use App\Filament\Resources\UiThemeResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListUiThemes extends ListRecords
{
    protected static string $resource = UiThemeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
