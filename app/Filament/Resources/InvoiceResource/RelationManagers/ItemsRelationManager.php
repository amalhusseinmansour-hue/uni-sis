<?php

namespace App\Filament\Resources\InvoiceResource\RelationManagers;

use App\Models\FeeStructure;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    protected static ?string $title = 'Invoice Items';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('fee_structure_id')
                    ->label('Fee Structure')
                    ->options(FeeStructure::active()->pluck('name_en', 'id'))
                    ->reactive()
                    ->afterStateUpdated(function ($state, callable $set) {
                        if ($state) {
                            $fee = FeeStructure::find($state);
                            if ($fee) {
                                $set('description', $fee->name_en);
                                $set('fee_type', $fee->fee_type);
                                $set('unit_price', $fee->amount);
                            }
                        }
                    }),

                Forms\Components\TextInput::make('description')
                    ->required()
                    ->maxLength(255),

                Forms\Components\Select::make('fee_type')
                    ->options(FeeStructure::getFeeTypes()),

                Forms\Components\TextInput::make('quantity')
                    ->numeric()
                    ->default(1)
                    ->required()
                    ->minValue(1),

                Forms\Components\TextInput::make('unit_price')
                    ->label('Unit Price')
                    ->numeric()
                    ->prefix('$')
                    ->required(),

                Forms\Components\TextInput::make('discount')
                    ->numeric()
                    ->prefix('$')
                    ->default(0),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('description')
                    ->searchable(),

                Tables\Columns\TextColumn::make('fee_type')
                    ->badge(),

                Tables\Columns\TextColumn::make('quantity')
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('unit_price')
                    ->money('USD'),

                Tables\Columns\TextColumn::make('discount')
                    ->money('USD'),

                Tables\Columns\TextColumn::make('total')
                    ->money('USD')
                    ->weight('bold'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->after(function () {
                        $this->getOwnerRecord()->calculateTotals();
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->after(function () {
                        $this->getOwnerRecord()->calculateTotals();
                    }),
                Tables\Actions\DeleteAction::make()
                    ->after(function () {
                        $this->getOwnerRecord()->calculateTotals();
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->after(function () {
                            $this->getOwnerRecord()->calculateTotals();
                        }),
                ]),
            ]);
    }
}
