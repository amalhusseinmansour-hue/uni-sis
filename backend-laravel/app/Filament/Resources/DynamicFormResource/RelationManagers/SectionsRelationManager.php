<?php

namespace App\Filament\Resources\DynamicFormResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class SectionsRelationManager extends RelationManager
{
    protected static string $relationship = 'sections';

    protected static ?string $title = 'Form Sections';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Section Details')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('section_key')
                            ->label('Section Key')
                            ->required()
                            ->alphaDash()
                            ->maxLength(50),
                        Forms\Components\TextInput::make('sort_order')
                            ->label('Sort Order')
                            ->numeric()
                            ->default(0),
                        Forms\Components\TextInput::make('title_en')
                            ->label('Title (English)')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('title_ar')
                            ->label('Title (Arabic)')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Textarea::make('description_en')
                            ->label('Description (English)')
                            ->rows(2),
                        Forms\Components\Textarea::make('description_ar')
                            ->label('Description (Arabic)')
                            ->rows(2),
                    ]),
                Forms\Components\Section::make('Display Settings')
                    ->columns(3)
                    ->schema([
                        Forms\Components\TextInput::make('icon')
                            ->label('Icon')
                            ->placeholder('heroicon-o-user')
                            ->helperText('Heroicon name'),
                        Forms\Components\Select::make('grid_columns')
                            ->label('Grid Columns')
                            ->options([
                                1 => '1 Column',
                                2 => '2 Columns',
                                3 => '3 Columns',
                                4 => '4 Columns',
                            ])
                            ->default(2),
                        Forms\Components\Toggle::make('is_collapsible')
                            ->label('Collapsible')
                            ->default(false),
                        Forms\Components\Toggle::make('is_collapsed_default')
                            ->label('Collapsed by Default')
                            ->default(false),
                    ]),
                Forms\Components\Section::make('Conditional Logic')
                    ->collapsed()
                    ->schema([
                        Forms\Components\KeyValue::make('conditional_logic')
                            ->label('Show section when...')
                            ->keyLabel('Field')
                            ->valueLabel('Value'),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title_en')
            ->columns([
                Tables\Columns\TextColumn::make('section_key')
                    ->label('Key')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('title_en')
                    ->label('Title (EN)')
                    ->searchable(),
                Tables\Columns\TextColumn::make('title_ar')
                    ->label('Title (AR)')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('icon')
                    ->label('Icon'),
                Tables\Columns\TextColumn::make('grid_columns')
                    ->label('Columns')
                    ->badge(),
                Tables\Columns\IconColumn::make('is_collapsible')
                    ->label('Collapsible')
                    ->boolean(),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable(),
            ])
            ->filters([
                //
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
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order');
    }
}
