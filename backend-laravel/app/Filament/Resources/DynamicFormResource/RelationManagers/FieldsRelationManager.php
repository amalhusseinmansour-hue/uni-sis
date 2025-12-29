<?php

namespace App\Filament\Resources\DynamicFormResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class FieldsRelationManager extends RelationManager
{
    protected static string $relationship = 'fields';

    protected static ?string $title = 'Form Fields';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('Field Configuration')
                    ->tabs([
                        Forms\Components\Tabs\Tab::make('Basic')
                            ->icon('heroicon-o-information-circle')
                            ->schema([
                                Forms\Components\Section::make('Field Identity')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('field_key')
                                            ->label('Field Key')
                                            ->required()
                                            ->alphaDash()
                                            ->maxLength(50)
                                            ->helperText('Unique identifier for this field'),
                                        Forms\Components\TextInput::make('field_name')
                                            ->label('Database Field')
                                            ->maxLength(50)
                                            ->helperText('Column name in database'),
                                        Forms\Components\Select::make('field_type')
                                            ->label('Field Type')
                                            ->required()
                                            ->options([
                                                'text' => 'Text Input',
                                                'textarea' => 'Textarea',
                                                'number' => 'Number',
                                                'email' => 'Email',
                                                'tel' => 'Phone',
                                                'url' => 'URL',
                                                'password' => 'Password',
                                                'date' => 'Date',
                                                'datetime' => 'Date & Time',
                                                'time' => 'Time',
                                                'select' => 'Select Dropdown',
                                                'multiselect' => 'Multi-Select',
                                                'radio' => 'Radio Buttons',
                                                'checkbox' => 'Checkbox',
                                                'toggle' => 'Toggle Switch',
                                                'file' => 'File Upload',
                                                'image' => 'Image Upload',
                                                'rich_text' => 'Rich Text Editor',
                                                'color' => 'Color Picker',
                                                'hidden' => 'Hidden Field',
                                            ])
                                            ->searchable()
                                            ->live(),
                                    ]),
                                Forms\Components\Section::make('Labels')
                                    ->columns(2)
                                    ->schema([
                                        Forms\Components\TextInput::make('label_en')
                                            ->label('Label (English)')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('label_ar')
                                            ->label('Label (Arabic)')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('placeholder_en')
                                            ->label('Placeholder (English)')
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('placeholder_ar')
                                            ->label('Placeholder (Arabic)')
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('help_text_en')
                                            ->label('Help Text (English)')
                                            ->maxLength(500),
                                        Forms\Components\TextInput::make('help_text_ar')
                                            ->label('Help Text (Arabic)')
                                            ->maxLength(500),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Options')
                            ->icon('heroicon-o-list-bullet')
                            ->schema([
                                Forms\Components\Section::make('Field Options')
                                    ->description('For Select, Multi-Select, Radio, Checkbox fields')
                                    ->schema([
                                        Forms\Components\Repeater::make('options')
                                            ->label('Static Options')
                                            ->schema([
                                                Forms\Components\TextInput::make('value')
                                                    ->label('Value')
                                                    ->required(),
                                                Forms\Components\TextInput::make('label_en')
                                                    ->label('Label (EN)')
                                                    ->required(),
                                                Forms\Components\TextInput::make('label_ar')
                                                    ->label('Label (AR)')
                                                    ->required(),
                                            ])
                                            ->columns(3)
                                            ->defaultItems(0)
                                            ->reorderable()
                                            ->collapsible(),
                                        Forms\Components\TextInput::make('options_source')
                                            ->label('Dynamic Options Source')
                                            ->placeholder('table_name:value_field,label_field')
                                            ->helperText('Example: colleges:id,name_en,name_ar'),
                                        Forms\Components\KeyValue::make('options_filter')
                                            ->label('Options Filter')
                                            ->keyLabel('Field')
                                            ->valueLabel('Value'),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Validation')
                            ->icon('heroicon-o-shield-check')
                            ->schema([
                                Forms\Components\Section::make('Validation Rules')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\Toggle::make('is_required')
                                            ->label('Required')
                                            ->default(false),
                                        Forms\Components\Toggle::make('is_unique')
                                            ->label('Unique')
                                            ->default(false),
                                        Forms\Components\TextInput::make('default_value')
                                            ->label('Default Value'),
                                    ]),
                                Forms\Components\Section::make('Custom Validation')
                                    ->schema([
                                        Forms\Components\TagsInput::make('validation')
                                            ->label('Validation Rules')
                                            ->placeholder('Add rule...')
                                            ->helperText('Laravel validation rules: min:3, max:100, email, etc.'),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Display')
                            ->icon('heroicon-o-eye')
                            ->schema([
                                Forms\Components\Section::make('Visibility')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\Toggle::make('show_in_form')
                                            ->label('Show in Form')
                                            ->default(true),
                                        Forms\Components\Toggle::make('show_in_list')
                                            ->label('Show in List')
                                            ->default(true),
                                        Forms\Components\Toggle::make('show_in_detail')
                                            ->label('Show in Detail')
                                            ->default(true),
                                        Forms\Components\Toggle::make('is_readonly')
                                            ->label('Read Only')
                                            ->default(false),
                                        Forms\Components\Toggle::make('is_hidden')
                                            ->label('Hidden')
                                            ->default(false),
                                    ]),
                                Forms\Components\Section::make('Layout')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\Select::make('section')
                                            ->label('Section')
                                            ->options(function (RelationManager $livewire) {
                                                return $livewire->getOwnerRecord()
                                                    ->sections()
                                                    ->pluck('title_en', 'section_key');
                                            })
                                            ->searchable(),
                                        Forms\Components\Select::make('grid_column')
                                            ->label('Column Span')
                                            ->options([
                                                1 => '1 Column',
                                                2 => '2 Columns',
                                                3 => '3 Columns',
                                                4 => 'Full Width',
                                            ])
                                            ->default(1),
                                        Forms\Components\TextInput::make('sort_order')
                                            ->label('Sort Order')
                                            ->numeric()
                                            ->default(0),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Conditional')
                            ->icon('heroicon-o-adjustments-horizontal')
                            ->schema([
                                Forms\Components\Section::make('Conditional Logic')
                                    ->description('Show/hide field based on other field values')
                                    ->schema([
                                        Forms\Components\Repeater::make('conditional_logic.conditions')
                                            ->label('Conditions')
                                            ->schema([
                                                Forms\Components\TextInput::make('field')
                                                    ->label('Field Key')
                                                    ->required(),
                                                Forms\Components\Select::make('operator')
                                                    ->label('Operator')
                                                    ->options([
                                                        'equals' => 'Equals',
                                                        'not_equals' => 'Not Equals',
                                                        'contains' => 'Contains',
                                                        'is_empty' => 'Is Empty',
                                                        'is_not_empty' => 'Is Not Empty',
                                                        'greater_than' => 'Greater Than',
                                                        'less_than' => 'Less Than',
                                                        'in' => 'In Array',
                                                    ])
                                                    ->required(),
                                                Forms\Components\TextInput::make('value')
                                                    ->label('Value'),
                                            ])
                                            ->columns(3)
                                            ->defaultItems(0),
                                        Forms\Components\Select::make('conditional_logic.operator')
                                            ->label('Match')
                                            ->options([
                                                'and' => 'All conditions (AND)',
                                                'or' => 'Any condition (OR)',
                                            ])
                                            ->default('and'),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Advanced')
                            ->icon('heroicon-o-cog-6-tooth')
                            ->schema([
                                Forms\Components\Section::make('Search & Filter')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\Toggle::make('is_searchable')
                                            ->label('Searchable')
                                            ->default(false),
                                        Forms\Components\Toggle::make('is_filterable')
                                            ->label('Filterable')
                                            ->default(false),
                                        Forms\Components\Toggle::make('is_sortable')
                                            ->label('Sortable')
                                            ->default(false),
                                    ]),
                                Forms\Components\Section::make('Permissions')
                                    ->schema([
                                        Forms\Components\CheckboxList::make('permissions')
                                            ->label('Visible to Roles')
                                            ->options([
                                                'ADMIN' => 'Admin',
                                                'FINANCE' => 'Finance',
                                                'LECTURER' => 'Lecturer',
                                                'STUDENT' => 'Student',
                                            ])
                                            ->columns(4),
                                    ]),
                                Forms\Components\Section::make('Styling')
                                    ->schema([
                                        Forms\Components\KeyValue::make('styling')
                                            ->label('Custom CSS')
                                            ->keyLabel('Property')
                                            ->valueLabel('Value'),
                                    ]),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('label_en')
            ->columns([
                Tables\Columns\TextColumn::make('field_key')
                    ->label('Key')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('label_en')
                    ->label('Label (EN)')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('field_type')
                    ->label('Type')
                    ->colors([
                        'primary' => fn ($state) => in_array($state, ['text', 'textarea', 'rich_text']),
                        'success' => fn ($state) => in_array($state, ['select', 'multiselect', 'radio', 'checkbox']),
                        'warning' => fn ($state) => in_array($state, ['date', 'datetime', 'time']),
                        'danger' => fn ($state) => in_array($state, ['file', 'image']),
                        'info' => fn ($state) => in_array($state, ['number', 'email', 'tel', 'url']),
                    ]),
                Tables\Columns\TextColumn::make('section')
                    ->label('Section')
                    ->badge()
                    ->color('gray'),
                Tables\Columns\IconColumn::make('is_required')
                    ->label('Required')
                    ->boolean(),
                Tables\Columns\IconColumn::make('show_in_form')
                    ->label('In Form')
                    ->boolean(),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('field_type')
                    ->label('Type')
                    ->options([
                        'text' => 'Text',
                        'select' => 'Select',
                        'date' => 'Date',
                        'file' => 'File',
                    ]),
                Tables\Filters\SelectFilter::make('section')
                    ->label('Section')
                    ->options(function (RelationManager $livewire) {
                        return $livewire->getOwnerRecord()
                            ->sections()
                            ->pluck('title_en', 'section_key');
                    }),
                Tables\Filters\TernaryFilter::make('is_required'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\ReplicateAction::make()
                    ->beforeReplicaSaved(function ($replica) {
                        $replica->field_key = $replica->field_key . '_copy';
                        $replica->label_en = $replica->label_en . ' (Copy)';
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
