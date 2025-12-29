<?php

namespace App\Filament\Resources\InvoiceResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class PaymentsRelationManager extends RelationManager
{
    protected static string $relationship = 'payments';

    protected static ?string $title = 'Payments';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('transaction_id')
                    ->label('Transaction ID')
                    ->searchable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('amount')
                    ->money('USD')
                    ->sortable(),

                Tables\Columns\TextColumn::make('payment_method')
                    ->badge(),

                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'PENDING',
                        'info' => 'PROCESSING',
                        'success' => 'COMPLETED',
                        'danger' => 'FAILED',
                        'gray' => 'CANCELLED',
                    ]),

                Tables\Columns\TextColumn::make('payment_date')
                    ->dateTime()
                    ->sortable(),

                Tables\Columns\TextColumn::make('receipt_number')
                    ->searchable(),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
