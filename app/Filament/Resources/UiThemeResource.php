<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UiThemeResource\Pages;
use App\Models\UiTheme;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UiThemeResource extends Resource
{
    protected static ?string $model = UiTheme::class;

    protected static ?string $navigationIcon = 'heroicon-o-swatch';

    protected static ?string $navigationGroup = 'Frontend Control';

    protected static ?int $navigationSort = 4;

    public static function getNavigationLabel(): string
    {
        return __('UI Themes');
    }

    public static function getModelLabel(): string
    {
        return __('Theme');
    }

    public static function getPluralModelLabel(): string
    {
        return __('Themes');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make(__('Theme Information'))
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('code')
                                    ->label(__('Code'))
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->alphaDash()
                                    ->maxLength(50)
                                    ->placeholder('default_light'),

                                Forms\Components\Toggle::make('is_dark')
                                    ->label(__('Dark Theme'))
                                    ->default(false),
                            ]),

                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('name_en')
                                    ->label(__('Name (English)'))
                                    ->required()
                                    ->maxLength(100)
                                    ->placeholder('Default Light'),

                                Forms\Components\TextInput::make('name_ar')
                                    ->label(__('Name (Arabic)'))
                                    ->required()
                                    ->maxLength(100)
                                    ->placeholder('الفاتح الافتراضي'),
                            ]),
                    ]),

                Forms\Components\Section::make(__('Colors'))
                    ->description(__('Define the color palette for this theme'))
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\ColorPicker::make('colors.primary')
                                    ->label(__('Primary'))
                                    ->default('#3B82F6'),

                                Forms\Components\ColorPicker::make('colors.secondary')
                                    ->label(__('Secondary'))
                                    ->default('#6B7280'),

                                Forms\Components\ColorPicker::make('colors.accent')
                                    ->label(__('Accent'))
                                    ->default('#8B5CF6'),
                            ]),

                        Forms\Components\Grid::make(4)
                            ->schema([
                                Forms\Components\ColorPicker::make('colors.success')
                                    ->label(__('Success'))
                                    ->default('#10B981'),

                                Forms\Components\ColorPicker::make('colors.warning')
                                    ->label(__('Warning'))
                                    ->default('#F59E0B'),

                                Forms\Components\ColorPicker::make('colors.danger')
                                    ->label(__('Danger'))
                                    ->default('#EF4444'),

                                Forms\Components\ColorPicker::make('colors.info')
                                    ->label(__('Info'))
                                    ->default('#3B82F6'),
                            ]),

                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\ColorPicker::make('colors.background')
                                    ->label(__('Background'))
                                    ->default('#FFFFFF'),

                                Forms\Components\ColorPicker::make('colors.surface')
                                    ->label(__('Surface'))
                                    ->default('#F9FAFB'),

                                Forms\Components\ColorPicker::make('colors.text')
                                    ->label(__('Text'))
                                    ->default('#1F2937'),
                            ]),
                    ]),

                Forms\Components\Section::make(__('Typography'))
                    ->collapsible()
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('typography.family')
                                    ->label(__('Font Family'))
                                    ->default('Inter, sans-serif'),

                                Forms\Components\TextInput::make('typography.family_ar')
                                    ->label(__('Font Family (Arabic)'))
                                    ->default('Tajawal, sans-serif'),
                            ]),

                        Forms\Components\Grid::make(4)
                            ->schema([
                                Forms\Components\TextInput::make('typography.size_xs')
                                    ->label(__('XS'))
                                    ->default('0.75rem'),

                                Forms\Components\TextInput::make('typography.size_sm')
                                    ->label(__('SM'))
                                    ->default('0.875rem'),

                                Forms\Components\TextInput::make('typography.size_base')
                                    ->label(__('Base'))
                                    ->default('1rem'),

                                Forms\Components\TextInput::make('typography.size_lg')
                                    ->label(__('LG'))
                                    ->default('1.125rem'),
                            ]),
                    ]),

                Forms\Components\Section::make(__('Spacing & Borders'))
                    ->collapsible()
                    ->collapsed()
                    ->schema([
                        Forms\Components\Grid::make(4)
                            ->schema([
                                Forms\Components\TextInput::make('spacing.xs')
                                    ->label(__('XS'))
                                    ->default('0.25rem'),

                                Forms\Components\TextInput::make('spacing.sm')
                                    ->label(__('SM'))
                                    ->default('0.5rem'),

                                Forms\Components\TextInput::make('spacing.md')
                                    ->label(__('MD'))
                                    ->default('1rem'),

                                Forms\Components\TextInput::make('spacing.lg')
                                    ->label(__('LG'))
                                    ->default('1.5rem'),
                            ]),

                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\TextInput::make('borders.radius_sm')
                                    ->label(__('Radius SM'))
                                    ->default('0.25rem'),

                                Forms\Components\TextInput::make('borders.radius_md')
                                    ->label(__('Radius MD'))
                                    ->default('0.5rem'),

                                Forms\Components\TextInput::make('borders.radius_lg')
                                    ->label(__('Radius LG'))
                                    ->default('1rem'),
                            ]),
                    ]),

                Forms\Components\Section::make(__('Shadows'))
                    ->collapsible()
                    ->collapsed()
                    ->schema([
                        Forms\Components\TextInput::make('shadows.sm')
                            ->label(__('Small Shadow'))
                            ->default('0 1px 2px rgba(0,0,0,0.05)'),

                        Forms\Components\TextInput::make('shadows.md')
                            ->label(__('Medium Shadow'))
                            ->default('0 4px 6px rgba(0,0,0,0.1)'),

                        Forms\Components\TextInput::make('shadows.lg')
                            ->label(__('Large Shadow'))
                            ->default('0 10px 15px rgba(0,0,0,0.1)'),
                    ]),

                Forms\Components\Section::make(__('Settings'))
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\Toggle::make('is_default')
                                    ->label(__('Default Theme'))
                                    ->helperText(__('Use this theme as the default')),

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

                Tables\Columns\ColorColumn::make('colors.primary')
                    ->label(__('Primary')),

                Tables\Columns\ColorColumn::make('colors.secondary')
                    ->label(__('Secondary')),

                Tables\Columns\ColorColumn::make('colors.accent')
                    ->label(__('Accent')),

                Tables\Columns\IconColumn::make('is_dark')
                    ->label(__('Dark'))
                    ->boolean()
                    ->trueIcon('heroicon-o-moon')
                    ->falseIcon('heroicon-o-sun'),

                Tables\Columns\IconColumn::make('is_default')
                    ->label(__('Default'))
                    ->boolean(),

                Tables\Columns\IconColumn::make('is_active')
                    ->label(__('Active'))
                    ->boolean(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_dark')
                    ->label(__('Dark Theme')),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label(__('Active')),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\Action::make('set_default')
                        ->label(__('Set as Default'))
                        ->icon('heroicon-o-star')
                        ->color('warning')
                        ->action(function (UiTheme $record) {
                            UiTheme::where('is_default', true)->update(['is_default' => false]);
                            $record->update(['is_default' => true]);
                        })
                        ->visible(fn (UiTheme $record) => !$record->is_default),
                    Tables\Actions\Action::make('duplicate')
                        ->label(__('Duplicate'))
                        ->icon('heroicon-o-document-duplicate')
                        ->action(function (UiTheme $record) {
                            $new = $record->replicate();
                            $new->code = $record->code . '_copy';
                            $new->is_default = false;
                            $new->save();
                        }),
                    Tables\Actions\DeleteAction::make()
                        ->visible(fn (UiTheme $record) => !$record->is_default),
                ]),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('code');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUiThemes::route('/'),
            'create' => Pages\CreateUiTheme::route('/create'),
            'edit' => Pages\EditUiTheme::route('/{record}/edit'),
        ];
    }
}
