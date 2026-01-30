<?php

namespace App\Filament\Resources;

use App\Filament\Resources\NotificationResource\Pages;
use App\Models\Notification;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class NotificationResource extends Resource
{
    protected static ?string $model = Notification::class;

    protected static ?string $navigationIcon = 'heroicon-o-bell';

    protected static ?int $navigationSort = 1;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.content_management');
    }

    public static function getModelLabel(): string
    {
        return __('filament.notification.singular');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.notification.plural');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.navigation.notifications');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Notification Details')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),

                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\Textarea::make('message')
                            ->required()
                            ->rows(4),

                        Forms\Components\Select::make('type')
                            ->options([
                                'INFO' => 'Information',
                                'WARNING' => 'Warning',
                                'SUCCESS' => 'Success',
                                'ERROR' => 'Error',
                                'ANNOUNCEMENT' => 'Announcement',
                            ])
                            ->default('INFO')
                            ->required(),

                        Forms\Components\KeyValue::make('data')
                            ->label('Additional Data')
                            ->nullable(),

                        Forms\Components\DateTimePicker::make('read_at')
                            ->label('Read At')
                            ->nullable(),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->limit(40),

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'INFO' => 'info',
                        'WARNING' => 'warning',
                        'SUCCESS' => 'success',
                        'ERROR' => 'danger',
                        'ANNOUNCEMENT' => 'primary',
                        default => 'gray',
                    }),

                Tables\Columns\IconColumn::make('read_at')
                    ->label('Read')
                    ->boolean()
                    ->getStateUsing(fn ($record) => $record->read_at !== null),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'INFO' => 'Information',
                        'WARNING' => 'Warning',
                        'SUCCESS' => 'Success',
                        'ERROR' => 'Error',
                        'ANNOUNCEMENT' => 'Announcement',
                    ]),

                Tables\Filters\TernaryFilter::make('is_read')
                    ->label('Read Status')
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('read_at'),
                        false: fn ($query) => $query->whereNull('read_at'),
                    ),
            ])
            ->actions([
                Tables\Actions\Action::make('markAsRead')
                    ->label('Mark Read')
                    ->icon('heroicon-o-check')
                    ->action(fn (Notification $record) => $record->update(['read_at' => now()]))
                    ->visible(fn (Notification $record) => $record->read_at === null),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('markAllAsRead')
                        ->label('Mark All as Read')
                        ->icon('heroicon-o-check')
                        ->action(fn ($records) => $records->each->update(['read_at' => now()])),
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListNotifications::route('/'),
            'create' => Pages\CreateNotification::route('/create'),
            'edit' => Pages\EditNotification::route('/{record}/edit'),
        ];
    }
}
