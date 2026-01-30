<?php

namespace App\Filament\Resources\DynamicTableResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ColumnsRelationManager extends RelationManager
{
    protected static string $relationship = 'columns';

    protected static ?string $title = 'Table Columns';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('Column Configuration')
                    ->tabs([
                        Forms\Components\Tabs\Tab::make('Basic')
                            ->icon('heroicon-o-information-circle')
                            ->schema([
                                Forms\Components\Section::make('Column Identity')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('column_key')
                                            ->label('Column Key')
                                            ->required()
                                            ->alphaDash()
                                            ->maxLength(50),
                                        Forms\Components\TextInput::make('field_name')
                                            ->label('Database Field')
                                            ->required()
                                            ->maxLength(100),
                                        Forms\Components\Select::make('data_type')
                                            ->label('Data Type')
                                            ->required()
                                            ->options([
                                                'text' => 'Text',
                                                'number' => 'Number',
                                                'decimal' => 'Decimal',
                                                'currency' => 'Currency',
                                                'percentage' => 'Percentage',
                                                'date' => 'Date',
                                                'datetime' => 'Date & Time',
                                                'time' => 'Time',
                                                'boolean' => 'Boolean',
                                                'status' => 'Status Badge',
                                                'image' => 'Image',
                                                'link' => 'Link',
                                                'email' => 'Email',
                                                'phone' => 'Phone',
                                                'json' => 'JSON',
                                            ])
                                            ->searchable()
                                            ->live(),
                                    ]),
                                Forms\Components\Section::make('Headers')
                                    ->columns(2)
                                    ->schema([
                                        Forms\Components\TextInput::make('header_en')
                                            ->label('Header (English)')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('header_ar')
                                            ->label('Header (Arabic)')
                                            ->required()
                                            ->maxLength(255),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Format')
                            ->icon('heroicon-o-paint-brush')
                            ->schema([
                                Forms\Components\Section::make('Format Options')
                                    ->schema([
                                        Forms\Components\KeyValue::make('format_options')
                                            ->label('Format Options')
                                            ->keyLabel('Option')
                                            ->valueLabel('Value')
                                            ->helperText('E.g., format: Y-m-d, decimals: 2, currency: USD, symbol: $'),
                                    ]),
                                Forms\Components\Section::make('Status Colors')
                                    ->description('For status badge columns')
                                    ->schema([
                                        Forms\Components\KeyValue::make('status_colors')
                                            ->label('Status Colors')
                                            ->keyLabel('Status Value')
                                            ->valueLabel('Color')
                                            ->helperText('Colors: primary, success, warning, danger, info, gray'),
                                    ]),
                                Forms\Components\Section::make('Cell Template')
                                    ->collapsed()
                                    ->schema([
                                        Forms\Components\Textarea::make('cell_template')
                                            ->label('Custom Cell Template')
                                            ->rows(3)
                                            ->helperText('Use {value} as placeholder for the cell value'),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Display')
                            ->icon('heroicon-o-eye')
                            ->schema([
                                Forms\Components\Section::make('Column Size')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('width')
                                            ->label('Width')
                                            ->placeholder('auto'),
                                        Forms\Components\TextInput::make('min_width')
                                            ->label('Min Width')
                                            ->placeholder('100px'),
                                        Forms\Components\TextInput::make('max_width')
                                            ->label('Max Width')
                                            ->placeholder('300px'),
                                    ]),
                                Forms\Components\Section::make('Alignment & Visibility')
                                    ->columns(4)
                                    ->schema([
                                        Forms\Components\Select::make('align')
                                            ->label('Alignment')
                                            ->options([
                                                'left' => 'Left',
                                                'center' => 'Center',
                                                'right' => 'Right',
                                            ])
                                            ->default('left'),
                                        Forms\Components\Toggle::make('is_visible')
                                            ->label('Visible')
                                            ->default(true),
                                        Forms\Components\Toggle::make('is_frozen')
                                            ->label('Frozen')
                                            ->default(false),
                                        Forms\Components\Toggle::make('is_resizable')
                                            ->label('Resizable')
                                            ->default(true),
                                    ]),
                                Forms\Components\Section::make('Sort Order')
                                    ->schema([
                                        Forms\Components\TextInput::make('sort_order')
                                            ->label('Sort Order')
                                            ->numeric()
                                            ->default(0),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Features')
                            ->icon('heroicon-o-cog-6-tooth')
                            ->schema([
                                Forms\Components\Section::make('Column Features')
                                    ->columns(4)
                                    ->schema([
                                        Forms\Components\Toggle::make('is_sortable')
                                            ->label('Sortable')
                                            ->default(true),
                                        Forms\Components\Toggle::make('is_searchable')
                                            ->label('Searchable')
                                            ->default(false),
                                        Forms\Components\Toggle::make('is_filterable')
                                            ->label('Filterable')
                                            ->default(false),
                                        Forms\Components\Toggle::make('is_exportable')
                                            ->label('Exportable')
                                            ->default(true),
                                    ]),
                                Forms\Components\Section::make('Filter Configuration')
                                    ->description('When column is filterable')
                                    ->columns(2)
                                    ->schema([
                                        Forms\Components\Select::make('filter_type')
                                            ->label('Filter Type')
                                            ->options([
                                                'text' => 'Text Search',
                                                'select' => 'Select Dropdown',
                                                'multiselect' => 'Multi-Select',
                                                'date' => 'Date Picker',
                                                'date_range' => 'Date Range',
                                                'number' => 'Number',
                                                'number_range' => 'Number Range',
                                                'boolean' => 'Yes/No',
                                            ]),
                                        Forms\Components\TextInput::make('filter_source')
                                            ->label('Filter Options Source')
                                            ->placeholder('table:value_field,label_field'),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Styling')
                            ->icon('heroicon-o-swatch')
                            ->schema([
                                Forms\Components\Section::make('Conditional Styling')
                                    ->schema([
                                        Forms\Components\Repeater::make('conditional_styling')
                                            ->label('Style Rules')
                                            ->schema([
                                                Forms\Components\Select::make('condition')
                                                    ->label('Condition')
                                                    ->options([
                                                        'equals' => 'Equals',
                                                        'not_equals' => 'Not Equals',
                                                        'contains' => 'Contains',
                                                        'greater_than' => 'Greater Than',
                                                        'less_than' => 'Less Than',
                                                        'is_empty' => 'Is Empty',
                                                        'is_not_empty' => 'Is Not Empty',
                                                    ])
                                                    ->required(),
                                                Forms\Components\TextInput::make('value')
                                                    ->label('Value'),
                                                Forms\Components\Select::make('style')
                                                    ->label('Apply Style')
                                                    ->options([
                                                        'text-success' => 'Green Text',
                                                        'text-danger' => 'Red Text',
                                                        'text-warning' => 'Yellow Text',
                                                        'text-info' => 'Blue Text',
                                                        'bg-success' => 'Green Background',
                                                        'bg-danger' => 'Red Background',
                                                        'bg-warning' => 'Yellow Background',
                                                        'font-bold' => 'Bold',
                                                        'italic' => 'Italic',
                                                    ])
                                                    ->required(),
                                            ])
                                            ->columns(3)
                                            ->defaultItems(0)
                                            ->collapsible(),
                                    ]),
                                Forms\Components\Section::make('Tooltip')
                                    ->columns(2)
                                    ->schema([
                                        Forms\Components\TextInput::make('tooltip.en')
                                            ->label('Tooltip (EN)'),
                                        Forms\Components\TextInput::make('tooltip.ar')
                                            ->label('Tooltip (AR)'),
                                    ]),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('header_en')
            ->columns([
                Tables\Columns\TextColumn::make('column_key')
                    ->label('Key')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('field_name')
                    ->label('Field')
                    ->searchable(),
                Tables\Columns\TextColumn::make('header_en')
                    ->label('Header (EN)')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('data_type')
                    ->label('Type')
                    ->colors([
                        'primary' => fn ($state) => in_array($state, ['text', 'email', 'phone']),
                        'success' => fn ($state) => in_array($state, ['number', 'decimal', 'currency', 'percentage']),
                        'warning' => fn ($state) => in_array($state, ['date', 'datetime', 'time']),
                        'danger' => fn ($state) => in_array($state, ['status', 'boolean']),
                        'info' => fn ($state) => in_array($state, ['image', 'link', 'json']),
                    ]),
                Tables\Columns\TextColumn::make('align')
                    ->label('Align')
                    ->badge()
                    ->color('gray'),
                Tables\Columns\IconColumn::make('is_visible')
                    ->label('Visible')
                    ->boolean(),
                Tables\Columns\IconColumn::make('is_sortable')
                    ->label('Sort')
                    ->boolean(),
                Tables\Columns\IconColumn::make('is_searchable')
                    ->label('Search')
                    ->boolean(),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('data_type')
                    ->label('Type')
                    ->options([
                        'text' => 'Text',
                        'number' => 'Number',
                        'date' => 'Date',
                        'status' => 'Status',
                    ]),
                Tables\Filters\TernaryFilter::make('is_visible'),
                Tables\Filters\TernaryFilter::make('is_sortable'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\ReplicateAction::make()
                    ->beforeReplicaSaved(function ($replica) {
                        $replica->column_key = $replica->column_key . '_copy';
                    }),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order');
    }
}
