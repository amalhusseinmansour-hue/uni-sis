<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PageConfigurationResource\Pages;
use App\Models\PageConfiguration;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PageConfigurationResource extends Resource
{
    protected static ?string $model = PageConfiguration::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Frontend Control';

    protected static ?int $navigationSort = 5;

    public static function getNavigationLabel(): string
    {
        return __('Page Configurations');
    }

    public static function getModelLabel(): string
    {
        return __('Page Configuration');
    }

    public static function getPluralModelLabel(): string
    {
        return __('Page Configurations');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make(__('Page Information'))
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('page_key')
                                    ->label(__('Page Key'))
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->alphaDash()
                                    ->maxLength(50)
                                    ->placeholder('dashboard')
                                    ->helperText(__('Unique identifier matching frontend route')),

                                Forms\Components\TextInput::make('icon')
                                    ->label(__('Icon'))
                                    ->placeholder('heroicon-o-home'),
                            ]),

                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('title_en')
                                    ->label(__('Title (English)'))
                                    ->required()
                                    ->maxLength(100)
                                    ->placeholder('Dashboard'),

                                Forms\Components\TextInput::make('title_ar')
                                    ->label(__('Title (Arabic)'))
                                    ->required()
                                    ->maxLength(100)
                                    ->placeholder('لوحة التحكم'),
                            ]),

                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\Textarea::make('description_en')
                                    ->label(__('Description (English)'))
                                    ->rows(2)
                                    ->placeholder('Welcome to your dashboard'),

                                Forms\Components\Textarea::make('description_ar')
                                    ->label(__('Description (Arabic)'))
                                    ->rows(2)
                                    ->placeholder('مرحباً بك في لوحة التحكم'),
                            ]),
                    ]),

                Forms\Components\Section::make(__('Breadcrumbs'))
                    ->collapsible()
                    ->schema([
                        Forms\Components\Repeater::make('breadcrumbs')
                            ->label('')
                            ->schema([
                                Forms\Components\Grid::make(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('label_en')
                                            ->label(__('Label (EN)'))
                                            ->required(),

                                        Forms\Components\TextInput::make('label_ar')
                                            ->label(__('Label (AR)'))
                                            ->required(),

                                        Forms\Components\TextInput::make('route')
                                            ->label(__('Route'))
                                            ->placeholder('/dashboard'),
                                    ]),
                            ])
                            ->defaultItems(0)
                            ->addActionLabel(__('Add Breadcrumb')),
                    ]),

                Forms\Components\Section::make(__('Header Actions'))
                    ->collapsible()
                    ->schema([
                        Forms\Components\Repeater::make('header_actions')
                            ->label('')
                            ->schema([
                                Forms\Components\Grid::make(4)
                                    ->schema([
                                        Forms\Components\TextInput::make('label_en')
                                            ->label(__('Label (EN)'))
                                            ->required(),

                                        Forms\Components\TextInput::make('label_ar')
                                            ->label(__('Label (AR)'))
                                            ->required(),

                                        Forms\Components\TextInput::make('icon')
                                            ->label(__('Icon'))
                                            ->placeholder('heroicon-o-plus'),

                                        Forms\Components\Select::make('action')
                                            ->label(__('Action Type'))
                                            ->options([
                                                'link' => __('Navigate'),
                                                'modal' => __('Open Modal'),
                                                'api' => __('API Call'),
                                            ]),
                                    ]),

                                Forms\Components\Grid::make(2)
                                    ->schema([
                                        Forms\Components\TextInput::make('route')
                                            ->label(__('Route/Action')),

                                        Forms\Components\Select::make('style')
                                            ->label(__('Style'))
                                            ->options([
                                                'primary' => __('Primary'),
                                                'secondary' => __('Secondary'),
                                                'success' => __('Success'),
                                                'danger' => __('Danger'),
                                            ])
                                            ->default('primary'),
                                    ]),
                            ])
                            ->defaultItems(0)
                            ->collapsible()
                            ->addActionLabel(__('Add Action')),
                    ]),

                Forms\Components\Section::make(__('Tabs'))
                    ->collapsible()
                    ->collapsed()
                    ->schema([
                        Forms\Components\Repeater::make('tabs')
                            ->label('')
                            ->schema([
                                Forms\Components\Grid::make(4)
                                    ->schema([
                                        Forms\Components\TextInput::make('key')
                                            ->label(__('Key'))
                                            ->required(),

                                        Forms\Components\TextInput::make('label_en')
                                            ->label(__('Label (EN)'))
                                            ->required(),

                                        Forms\Components\TextInput::make('label_ar')
                                            ->label(__('Label (AR)'))
                                            ->required(),

                                        Forms\Components\TextInput::make('icon')
                                            ->label(__('Icon')),
                                    ]),

                                Forms\Components\TextInput::make('component')
                                    ->label(__('Component Name'))
                                    ->placeholder('CoursesTab'),
                            ])
                            ->defaultItems(0)
                            ->collapsible()
                            ->addActionLabel(__('Add Tab')),
                    ]),

                Forms\Components\Section::make(__('Components'))
                    ->collapsible()
                    ->collapsed()
                    ->schema([
                        Forms\Components\Repeater::make('components')
                            ->label('')
                            ->schema([
                                Forms\Components\Grid::make(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('name')
                                            ->label(__('Component Name'))
                                            ->required()
                                            ->placeholder('StatsCard'),

                                        Forms\Components\TextInput::make('order')
                                            ->label(__('Order'))
                                            ->numeric()
                                            ->default(0),

                                        Forms\Components\Toggle::make('visible')
                                            ->label(__('Visible'))
                                            ->default(true),
                                    ]),

                                Forms\Components\KeyValue::make('props')
                                    ->label(__('Props'))
                                    ->addActionLabel(__('Add Prop')),
                            ])
                            ->defaultItems(0)
                            ->collapsible()
                            ->addActionLabel(__('Add Component')),
                    ]),

                Forms\Components\Section::make(__('Access & Settings'))
                    ->schema([
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

                        Forms\Components\KeyValue::make('settings')
                            ->label(__('Additional Settings'))
                            ->addActionLabel(__('Add Setting')),

                        Forms\Components\Toggle::make('is_active')
                            ->label(__('Active'))
                            ->default(true),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('page_key')
                    ->label(__('Page Key'))
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('primary'),

                Tables\Columns\TextColumn::make('title_en')
                    ->label(__('Title (EN)'))
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('title_ar')
                    ->label(__('Title (AR)'))
                    ->searchable(),

                Tables\Columns\TextColumn::make('icon')
                    ->label(__('Icon'))
                    ->badge()
                    ->color('gray'),

                Tables\Columns\TextColumn::make('tabs')
                    ->label(__('Tabs'))
                    ->formatStateUsing(fn ($state) => is_array($state) ? count($state) : 0)
                    ->badge()
                    ->color('info'),

                Tables\Columns\TextColumn::make('roles')
                    ->label(__('Roles'))
                    ->badge()
                    ->separator(',')
                    ->formatStateUsing(fn ($state) => is_array($state) ? implode(', ', $state) : ($state ?: 'All')),

                Tables\Columns\IconColumn::make('is_active')
                    ->label(__('Active'))
                    ->boolean(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label(__('Active')),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\Action::make('duplicate')
                        ->label(__('Duplicate'))
                        ->icon('heroicon-o-document-duplicate')
                        ->action(function (PageConfiguration $record) {
                            $new = $record->replicate();
                            $new->page_key = $record->page_key . '_copy';
                            $new->save();
                        }),
                    Tables\Actions\DeleteAction::make(),
                ]),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('page_key');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPageConfigurations::route('/'),
            'create' => Pages\CreatePageConfiguration::route('/create'),
            'edit' => Pages\EditPageConfiguration::route('/{record}/edit'),
        ];
    }
}
