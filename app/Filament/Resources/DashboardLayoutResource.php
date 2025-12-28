<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DashboardLayoutResource\Pages;
use App\Models\DashboardLayout;
use App\Models\DashboardWidget;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DashboardLayoutResource extends Resource
{
    protected static ?string $model = DashboardLayout::class;

    protected static ?string $navigationIcon = 'heroicon-o-view-columns';

    protected static ?string $navigationGroup = 'Frontend Control';

    protected static ?int $navigationSort = 3;

    public static function getNavigationLabel(): string
    {
        return __('Dashboard Layouts');
    }

    public static function getModelLabel(): string
    {
        return __('Dashboard Layout');
    }

    public static function getPluralModelLabel(): string
    {
        return __('Dashboard Layouts');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make(__('Layout Information'))
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('code')
                                    ->label(__('Code'))
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->alphaDash()
                                    ->maxLength(50)
                                    ->placeholder('student_dashboard'),

                                Forms\Components\Select::make('role')
                                    ->label(__('For Role'))
                                    ->options([
                                        'STUDENT' => __('Student'),
                                        'LECTURER' => __('Lecturer'),
                                        'ADMIN' => __('Admin'),
                                        'FINANCE' => __('Finance'),
                                    ])
                                    ->required()
                                    ->helperText(__('Select the role this dashboard is for')),
                            ]),

                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('name_en')
                                    ->label(__('Name (English)'))
                                    ->required()
                                    ->maxLength(100)
                                    ->placeholder('Student Dashboard'),

                                Forms\Components\TextInput::make('name_ar')
                                    ->label(__('Name (Arabic)'))
                                    ->required()
                                    ->maxLength(100)
                                    ->placeholder('لوحة تحكم الطالب'),
                            ]),
                    ]),

                Forms\Components\Section::make(__('Grid Settings'))
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\TextInput::make('grid_settings.columns')
                                    ->label(__('Columns'))
                                    ->numeric()
                                    ->default(4)
                                    ->minValue(1)
                                    ->maxValue(12),

                                Forms\Components\TextInput::make('grid_settings.gap')
                                    ->label(__('Gap'))
                                    ->default('1rem'),

                                Forms\Components\TextInput::make('grid_settings.row_height')
                                    ->label(__('Row Height'))
                                    ->default('auto'),
                            ]),
                    ])
                    ->collapsible(),

                Forms\Components\Section::make(__('Widgets'))
                    ->description(__('Select and arrange widgets for this dashboard'))
                    ->schema([
                        Forms\Components\Repeater::make('widgets')
                            ->label('')
                            ->schema([
                                Forms\Components\Grid::make(4)
                                    ->schema([
                                        Forms\Components\Select::make('code')
                                            ->label(__('Widget'))
                                            ->options(DashboardWidget::where('is_active', true)->pluck('name_en', 'code'))
                                            ->required()
                                            ->searchable(),

                                        Forms\Components\TextInput::make('position.x')
                                            ->label(__('Column'))
                                            ->numeric()
                                            ->default(0)
                                            ->minValue(0),

                                        Forms\Components\TextInput::make('position.y')
                                            ->label(__('Row'))
                                            ->numeric()
                                            ->default(0)
                                            ->minValue(0),

                                        Forms\Components\Select::make('position.width')
                                            ->label(__('Width'))
                                            ->options([
                                                1 => __('1 column'),
                                                2 => __('2 columns'),
                                                3 => __('3 columns'),
                                                4 => __('4 columns (Full)'),
                                            ])
                                            ->default(1),
                                    ]),
                            ])
                            ->reorderable()
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['code'] ?? null)
                            ->addActionLabel(__('Add Widget'))
                            ->defaultItems(0),
                    ]),

                Forms\Components\Section::make(__('Settings'))
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\Toggle::make('is_default')
                                    ->label(__('Default Layout'))
                                    ->helperText(__('Use this layout as default when role-specific layout is not found')),

                                Forms\Components\Toggle::make('is_active')
                                    ->label(__('Active'))
                                    ->default(true),
                            ]),
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
                    ->badge()
                    ->color('primary'),

                Tables\Columns\TextColumn::make('name_en')
                    ->label(__('Name (EN)'))
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('role')
                    ->label(__('Role'))
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'STUDENT' => 'info',
                        'LECTURER' => 'success',
                        'ADMIN' => 'danger',
                        'FINANCE' => 'warning',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('widgets')
                    ->label(__('Widgets'))
                    ->formatStateUsing(fn ($state) => is_array($state) ? count($state) . ' widgets' : '0 widgets')
                    ->badge()
                    ->color('success'),

                Tables\Columns\IconColumn::make('is_default')
                    ->label(__('Default'))
                    ->boolean(),

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
                Tables\Filters\SelectFilter::make('role')
                    ->label(__('Role'))
                    ->options([
                        'STUDENT' => __('Student'),
                        'LECTURER' => __('Lecturer'),
                        'ADMIN' => __('Admin'),
                        'FINANCE' => __('Finance'),
                    ]),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label(__('Active')),

                Tables\Filters\TernaryFilter::make('is_default')
                    ->label(__('Default')),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\Action::make('duplicate')
                        ->label(__('Duplicate'))
                        ->icon('heroicon-o-document-duplicate')
                        ->action(function (DashboardLayout $record) {
                            $new = $record->replicate();
                            $new->code = $record->code . '_copy';
                            $new->is_default = false;
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
            ->defaultSort('role');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDashboardLayouts::route('/'),
            'create' => Pages\CreateDashboardLayout::route('/create'),
            'edit' => Pages\EditDashboardLayout::route('/{record}/edit'),
        ];
    }
}
