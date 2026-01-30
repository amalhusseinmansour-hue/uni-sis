<?php

namespace App\Filament\Resources\MenuResource\RelationManagers;

use App\Models\MenuItem;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'allItems';

    protected static ?string $title = 'Menu Items';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
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
                        Forms\Components\Select::make('parent_id')
                            ->label(__('Parent Item'))
                            ->options(function (RelationManager $livewire) {
                                return MenuItem::where('menu_id', $livewire->ownerRecord->id)
                                    ->whereNull('parent_id')
                                    ->pluck('title_en', 'id');
                            })
                            ->searchable()
                            ->placeholder(__('None (Top Level)')),

                        Forms\Components\TextInput::make('icon')
                            ->label(__('Icon'))
                            ->placeholder('heroicon-o-home')
                            ->helperText(__('Use Heroicon name (e.g., heroicon-o-home)')),
                    ]),

                Forms\Components\Grid::make(2)
                    ->schema([
                        Forms\Components\TextInput::make('route')
                            ->label(__('Route'))
                            ->placeholder('/dashboard')
                            ->helperText(__('Internal route path')),

                        Forms\Components\TextInput::make('url')
                            ->label(__('External URL'))
                            ->url()
                            ->placeholder('https://example.com')
                            ->helperText(__('For external links')),
                    ]),

                Forms\Components\Grid::make(2)
                    ->schema([
                        Forms\Components\Select::make('target')
                            ->label(__('Open In'))
                            ->options([
                                '_self' => __('Same Window'),
                                '_blank' => __('New Tab'),
                            ])
                            ->default('_self'),

                        Forms\Components\TextInput::make('order')
                            ->label(__('Order'))
                            ->numeric()
                            ->default(0)
                            ->minValue(0),
                    ]),

                Forms\Components\Section::make(__('Access Control'))
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

                        Forms\Components\CheckboxList::make('permissions')
                            ->label(__('Required Permissions'))
                            ->options([
                                'view_students' => __('View Students'),
                                'manage_students' => __('Manage Students'),
                                'view_courses' => __('View Courses'),
                                'manage_courses' => __('Manage Courses'),
                                'view_grades' => __('View Grades'),
                                'manage_grades' => __('Manage Grades'),
                                'view_finance' => __('View Finance'),
                                'manage_finance' => __('Manage Finance'),
                            ])
                            ->columns(4),
                    ])
                    ->collapsible(),

                Forms\Components\Section::make(__('Badge'))
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\Select::make('badge_type')
                                    ->label(__('Badge Type'))
                                    ->options([
                                        'count' => __('Count'),
                                        'text' => __('Text'),
                                        'dot' => __('Dot'),
                                    ])
                                    ->placeholder(__('No Badge')),

                                Forms\Components\TextInput::make('badge_source')
                                    ->label(__('Badge Source'))
                                    ->placeholder('notifications_count')
                                    ->helperText(__('Data source for badge value')),

                                Forms\Components\Select::make('badge_color')
                                    ->label(__('Badge Color'))
                                    ->options([
                                        'primary' => __('Primary'),
                                        'success' => __('Success'),
                                        'warning' => __('Warning'),
                                        'danger' => __('Danger'),
                                        'info' => __('Info'),
                                    ])
                                    ->default('primary'),
                            ]),
                    ])
                    ->collapsible()
                    ->collapsed(),

                Forms\Components\Grid::make(2)
                    ->schema([
                        Forms\Components\Toggle::make('is_visible')
                            ->label(__('Visible'))
                            ->default(true),

                        Forms\Components\Toggle::make('is_active')
                            ->label(__('Active'))
                            ->default(true),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title_en')
            ->reorderable('order')
            ->defaultSort('order')
            ->columns([
                Tables\Columns\TextColumn::make('order')
                    ->label(__('#'))
                    ->sortable()
                    ->width(50),

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

                Tables\Columns\TextColumn::make('route')
                    ->label(__('Route'))
                    ->badge()
                    ->color('info'),

                Tables\Columns\TextColumn::make('parent.title_en')
                    ->label(__('Parent'))
                    ->badge()
                    ->color('warning')
                    ->placeholder(__('Top Level')),

                Tables\Columns\TextColumn::make('roles')
                    ->label(__('Roles'))
                    ->badge()
                    ->separator(',')
                    ->formatStateUsing(fn ($state) => is_array($state) ? implode(', ', $state) : ($state ?: 'All')),

                Tables\Columns\IconColumn::make('is_visible')
                    ->label(__('Visible'))
                    ->boolean(),

                Tables\Columns\IconColumn::make('is_active')
                    ->label(__('Active'))
                    ->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('parent_id')
                    ->label(__('Level'))
                    ->options([
                        'top' => __('Top Level Only'),
                    ])
                    ->query(function ($query, array $data) {
                        if ($data['value'] === 'top') {
                            return $query->whereNull('parent_id');
                        }
                        return $query;
                    }),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label(__('Active')),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
