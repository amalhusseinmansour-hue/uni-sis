<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MenuResource\Pages;
use App\Filament\Resources\MenuResource\RelationManagers;
use App\Models\Menu;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MenuResource extends Resource
{
    protected static ?string $model = Menu::class;

    protected static ?string $navigationIcon = 'heroicon-o-bars-3';

    protected static ?string $navigationGroup = 'Frontend Control';

    protected static ?int $navigationSort = 1;

    public static function getNavigationLabel(): string
    {
        return __('Menus');
    }

    public static function getModelLabel(): string
    {
        return __('Menu');
    }

    public static function getPluralModelLabel(): string
    {
        return __('Menus');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make(__('Menu Information'))
                    ->description(__('Configure the menu settings'))
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('code')
                                    ->label(__('Code'))
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->alphaDash()
                                    ->maxLength(50)
                                    ->placeholder('student_menu')
                                    ->helperText(__('Unique identifier for this menu')),

                                Forms\Components\Select::make('location')
                                    ->label(__('Location'))
                                    ->options([
                                        'sidebar' => __('Sidebar'),
                                        'header' => __('Header'),
                                        'footer' => __('Footer'),
                                        'mobile' => __('Mobile Menu'),
                                    ])
                                    ->default('sidebar')
                                    ->required(),
                            ]),

                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('name_en')
                                    ->label(__('Name (English)'))
                                    ->required()
                                    ->maxLength(100)
                                    ->placeholder('Student Menu'),

                                Forms\Components\TextInput::make('name_ar')
                                    ->label(__('Name (Arabic)'))
                                    ->required()
                                    ->maxLength(100)
                                    ->placeholder('قائمة الطالب'),
                            ]),

                        Forms\Components\CheckboxList::make('roles')
                            ->label(__('Visible to Roles'))
                            ->options([
                                'STUDENT' => __('Student'),
                                'LECTURER' => __('Lecturer'),
                                'ADMIN' => __('Admin'),
                                'FINANCE' => __('Finance'),
                            ])
                            ->columns(4)
                            ->helperText(__('Leave empty to show for all roles')),

                        Forms\Components\Toggle::make('is_active')
                            ->label(__('Active'))
                            ->default(true)
                            ->helperText(__('Inactive menus will not be displayed')),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')
                    ->label(__('Code'))
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->badge()
                    ->color('primary'),

                Tables\Columns\TextColumn::make('name_en')
                    ->label(__('Name (EN)'))
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('name_ar')
                    ->label(__('Name (AR)'))
                    ->searchable(),

                Tables\Columns\TextColumn::make('location')
                    ->label(__('Location'))
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'sidebar' => 'info',
                        'header' => 'success',
                        'footer' => 'warning',
                        'mobile' => 'gray',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('allItems_count')
                    ->label(__('Items'))
                    ->counts('allItems')
                    ->badge()
                    ->color('success'),

                Tables\Columns\TextColumn::make('roles')
                    ->label(__('Roles'))
                    ->badge()
                    ->separator(',')
                    ->formatStateUsing(fn ($state) => is_array($state) ? implode(', ', $state) : $state),

                Tables\Columns\IconColumn::make('is_active')
                    ->label(__('Active'))
                    ->boolean(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label(__('Updated'))
                    ->dateTime('M j, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('location')
                    ->label(__('Location'))
                    ->options([
                        'sidebar' => __('Sidebar'),
                        'header' => __('Header'),
                        'footer' => __('Footer'),
                        'mobile' => __('Mobile'),
                    ]),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label(__('Active')),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\Action::make('manage_items')
                        ->label(__('Manage Items'))
                        ->icon('heroicon-o-list-bullet')
                        ->color('info')
                        ->url(fn (Menu $record): string => static::getUrl('edit', ['record' => $record]) . '#items'),
                    Tables\Actions\DeleteAction::make(),
                ]),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('activate')
                        ->label(__('Activate'))
                        ->icon('heroicon-o-check')
                        ->action(fn ($records) => $records->each->update(['is_active' => true]))
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('deactivate')
                        ->label(__('Deactivate'))
                        ->icon('heroicon-o-x-mark')
                        ->action(fn ($records) => $records->each->update(['is_active' => false]))
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->defaultSort('code');
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ItemsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMenus::route('/'),
            'create' => Pages\CreateMenu::route('/create'),
            'edit' => Pages\EditMenu::route('/{record}/edit'),
        ];
    }
}
