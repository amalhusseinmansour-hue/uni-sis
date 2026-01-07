<?php

namespace App\Filament\Resources\StudentRequestResource\Pages;

use App\Filament\Resources\StudentRequestResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Filament\Resources\Components\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListStudentRequests extends ListRecords
{
    protected static string $resource = StudentRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('الكل')
                ->badge(fn () => static::getResource()::getModel()::count()),

            'pending' => Tab::make('المعلقة')
                ->badge(fn () => static::getResource()::getModel()::pending()->count())
                ->badgeColor('warning')
                ->modifyQueryUsing(fn (Builder $query) => $query->pending()),

            'urgent' => Tab::make('العاجلة')
                ->badge(fn () => static::getResource()::getModel()::urgent()->count())
                ->badgeColor('danger')
                ->modifyQueryUsing(fn (Builder $query) => $query->urgent()),

            'approved' => Tab::make('الموافق عليها')
                ->badge(fn () => static::getResource()::getModel()::approved()->count())
                ->badgeColor('success')
                ->modifyQueryUsing(fn (Builder $query) => $query->approved()),

            'rejected' => Tab::make('المرفوضة')
                ->badge(fn () => static::getResource()::getModel()::rejected()->count())
                ->badgeColor('danger')
                ->modifyQueryUsing(fn (Builder $query) => $query->rejected()),
        ];
    }
}
