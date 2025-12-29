<?php

namespace App\Filament\Resources\PageConfigurationResource\Pages;

use App\Filament\Resources\PageConfigurationResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListPageConfigurations extends ListRecords
{
    protected static string $resource = PageConfigurationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
