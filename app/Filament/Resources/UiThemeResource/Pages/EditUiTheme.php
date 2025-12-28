<?php

namespace App\Filament\Resources\UiThemeResource\Pages;

use App\Filament\Resources\UiThemeResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditUiTheme extends EditRecord
{
    protected static string $resource = UiThemeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
