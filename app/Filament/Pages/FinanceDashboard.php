<?php

namespace App\Filament\Pages;

use App\Models\Fine;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentPlan;
use App\Models\Refund;
use App\Models\StudentScholarship;
use App\Services\FinanceService;
use Filament\Pages\Page;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;

class FinanceDashboard extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';

    protected static string $view = 'filament.pages.finance-dashboard';

    protected static ?string $navigationGroup = 'Finance / المالية';

    protected static ?int $navigationSort = 0;

    protected static ?string $title = 'Finance Dashboard';

    public array $stats = [];

    public function mount(): void
    {
        $this->refreshStats();
    }

    public function refreshStats(): void
    {
        $service = app(FinanceService::class);
        $this->stats = $service->getStatistics();
    }

    public function table(Table $table): Table
    {
        return $table
            ->query(Payment::query()->completed()->orderBy('payment_date', 'desc')->limit(10))
            ->columns([
                TextColumn::make('transaction_id')
                    ->label('Transaction'),

                TextColumn::make('student.name_en')
                    ->label('Student'),

                TextColumn::make('amount')
                    ->money('USD'),

                BadgeColumn::make('payment_method')
                    ->colors([
                        'success' => 'CASH',
                        'info' => 'BANK_TRANSFER',
                        'primary' => 'CREDIT_CARD',
                    ]),

                TextColumn::make('payment_date')
                    ->dateTime(),
            ])
            ->paginated(false);
    }

    public function getViewData(): array
    {
        return [
            'stats' => $this->stats,
            'recentPayments' => Payment::completed()
                ->with('student')
                ->orderBy('payment_date', 'desc')
                ->limit(10)
                ->get(),
            'overdueInvoices' => Invoice::overdue()
                ->with('student')
                ->orderBy('due_date', 'asc')
                ->limit(10)
                ->get(),
            'pendingRefunds' => Refund::pending()
                ->with('student')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];
    }
}
