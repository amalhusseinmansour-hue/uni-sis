<?php

namespace App\Filament\Resources\CoursePrerequisiteResource\Pages;

use App\Filament\Resources\CoursePrerequisiteResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCoursePrerequisite extends EditRecord
{
    protected static string $resource = CoursePrerequisiteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
