<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PaymentResource\Pages;
use App\Models\Payment;
use App\Services\FinanceService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;
use Illuminate\Database\Eloquent\Builder;

class PaymentResource extends Resource
{
    protected static ?string $model = Payment::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationGroup = 'Finance / المالية';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Payment Details')
                    ->schema([
                        Forms\Components\Select::make('student_id')
                            ->label('Student')
                            ->relationship('student', 'name_en')
                            ->searchable()
                            ->preload()
                            ->required(),

                        Forms\Components\Select::make('invoice_id')
                            ->label('Invoice')
                            ->relationship('invoice', 'invoice_number')
                            ->searchable()
                            ->preload(),

                        Forms\Components\TextInput::make('transaction_id')
                            ->label('Transaction ID')
                            ->disabled()
                            ->dehydrated(false),

                        Forms\Components\TextInput::make('amount')
                            ->numeric()
                            ->prefix('$')
                            ->required(),

                        Forms\Components\Select::make('payment_method')
                            ->options(Payment::getPaymentMethods())
                            ->required(),

                        Forms\Components\Select::make('status')
                            ->options(Payment::getStatuses())
                            ->default('PENDING')
                            ->required(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Bank/Cheque Details')
                    ->schema([
                        Forms\Components\TextInput::make('bank_name'),
                        Forms\Components\TextInput::make('cheque_number'),
                        Forms\Components\DatePicker::make('cheque_date'),
                        Forms\Components\TextInput::make('reference_number'),
                    ])
                    ->columns(2)
                    ->collapsed(),

                Forms\Components\Section::make('Additional Info')
                    ->schema([
                        Forms\Components\DateTimePicker::make('payment_date'),
                        Forms\Components\TextInput::make('receipt_number')
                            ->disabled()
                            ->dehydrated(false),
                        Forms\Components\Textarea::make('notes')
                            ->rows(3),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('transaction_id')
                    ->label('Transaction ID')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('student.name_en')
                    ->label('Student')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('student.student_id')
                    ->label('Student ID')
                    ->searchable(),

                Tables\Columns\TextColumn::make('invoice.invoice_number')
                    ->label('Invoice')
                    ->searchable(),

                Tables\Columns\TextColumn::make('amount')
                    ->money('USD')
                    ->sortable(),

                Tables\Columns\BadgeColumn::make('payment_method')
                    ->colors([
                        'success' => 'CASH',
                        'info' => 'BANK_TRANSFER',
                        'primary' => 'CREDIT_CARD',
                        'warning' => 'CHEQUE',
                    ]),

                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'PENDING',
                        'info' => 'PROCESSING',
                        'success' => 'COMPLETED',
                        'danger' => 'FAILED',
                        'gray' => 'CANCELLED',
                        'purple' => 'REFUNDED',
                    ]),

                Tables\Columns\TextColumn::make('receipt_number')
                    ->searchable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('payment_date')
                    ->dateTime()
                    ->sortable(),

                Tables\Columns\TextColumn::make('verifiedBy.name')
                    ->label('Verified By')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(Payment::getStatuses()),

                Tables\Filters\SelectFilter::make('payment_method')
                    ->options(Payment::getPaymentMethods()),

                Tables\Filters\Filter::make('payment_date')
                    ->form([
                        Forms\Components\DatePicker::make('from'),
                        Forms\Components\DatePicker::make('until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['from'], fn (Builder $query, $date) => $query->whereDate('payment_date', '>=', $date))
                            ->when($data['until'], fn (Builder $query, $date) => $query->whereDate('payment_date', '<=', $date));
                    }),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),

                Tables\Actions\Action::make('complete')
                    ->label('Complete')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn ($record) => $record->isPending())
                    ->action(function ($record) {
                        $service = app(FinanceService::class);
                        $service->completePayment($record, auth()->user());
                        Notification::make()
                            ->title('Payment Completed')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\Action::make('fail')
                    ->label('Mark Failed')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn ($record) => $record->isPending())
                    ->form([
                        Forms\Components\Textarea::make('reason')
                            ->label('Failure Reason')
                            ->required(),
                    ])
                    ->action(function ($record, array $data) {
                        $record->markAsFailed($data['reason']);
                        Notification::make()
                            ->title('Payment Marked as Failed')
                            ->warning()
                            ->send();
                    }),

                Tables\Actions\Action::make('print_receipt')
                    ->label('Receipt')
                    ->icon('heroicon-o-printer')
                    ->color('gray')
                    ->visible(fn ($record) => $record->isCompleted())
                    ->url(fn ($record) => route('payments.receipt', $record))
                    ->openUrlInNewTab(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPayments::route('/'),
            'create' => Pages\CreatePayment::route('/create'),
            'view' => Pages\ViewPayment::route('/{record}'),
            'edit' => Pages\EditPayment::route('/{record}/edit'),
        ];
    }
}
