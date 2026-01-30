<?php

namespace App\Filament\Resources\PageConfigurationResource\Pages;

use App\Filament\Resources\PageConfigurationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPageConfiguration extends EditRecord
{
    protected static string $resource = PageConfigurationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
