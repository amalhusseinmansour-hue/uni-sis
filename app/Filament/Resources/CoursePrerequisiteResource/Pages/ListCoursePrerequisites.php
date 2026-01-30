<?php

namespace App\Filament\Resources\CoursePrerequisiteResource\Pages;

use App\Filament\Resources\CoursePrerequisiteResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCoursePrerequisites extends ListRecords
{
    protected static string $resource = CoursePrerequisiteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
