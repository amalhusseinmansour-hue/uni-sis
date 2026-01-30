<x-filament-panels::page>
    {{-- Summary Stats --}}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {{-- Total Revenue --}}
        <x-filament::section>
            <div class="text-center">
                <div class="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${{ number_format($stats['payments']['total_amount'] ?? 0, 2) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Revenue Collected</div>
                <div class="text-xs text-gray-500 mt-2">
                    {{ $stats['payments']['completed'] ?? 0 }} payments
                </div>
            </div>
        </x-filament::section>

        {{-- Outstanding Balance --}}
        <x-filament::section>
            <div class="text-center">
                <div class="text-3xl font-bold text-red-600 dark:text-red-400">
                    ${{ number_format($stats['invoices']['outstanding'] ?? 0, 2) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Outstanding Balance</div>
                <div class="text-xs text-gray-500 mt-2">
                    {{ $stats['invoices']['overdue'] ?? 0 }} overdue invoices
                </div>
            </div>
        </x-filament::section>

        {{-- Scholarships --}}
        <x-filament::section>
            <div class="text-center">
                <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    ${{ number_format($stats['scholarships']['total_awarded'] ?? 0, 2) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Scholarships Awarded</div>
                <div class="text-xs text-gray-500 mt-2">
                    {{ $stats['scholarships']['active_recipients'] ?? 0 }} active recipients
                </div>
            </div>
        </x-filament::section>

        {{-- Pending Refunds --}}
        <x-filament::section>
            <div class="text-center">
                <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {{ $stats['refunds']['pending'] ?? 0 }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending Refunds</div>
                <div class="text-xs text-gray-500 mt-2">
                    ${{ number_format($stats['refunds']['total_amount'] ?? 0, 2) }} refunded
                </div>
            </div>
        </x-filament::section>
    </div>

    {{-- Detailed Stats --}}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {{-- Invoices Stats --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-document-text class="w-5 h-5" />
                    Invoices
                </div>
            </x-slot>

            <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Total Invoices:</dt>
                    <dd class="font-medium">{{ $stats['invoices']['total'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Draft:</dt>
                    <dd class="font-medium text-gray-500">{{ $stats['invoices']['draft'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Issued:</dt>
                    <dd class="font-medium text-blue-600">{{ $stats['invoices']['issued'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Paid:</dt>
                    <dd class="font-medium text-green-600">{{ $stats['invoices']['paid'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Overdue:</dt>
                    <dd class="font-medium text-red-600">{{ $stats['invoices']['overdue'] ?? 0 }}</dd>
                </div>
                <hr class="my-2">
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Total Amount:</dt>
                    <dd class="font-medium">${{ number_format($stats['invoices']['total_amount'] ?? 0, 2) }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Collected:</dt>
                    <dd class="font-medium text-green-600">${{ number_format($stats['invoices']['collected'] ?? 0, 2) }}</dd>
                </div>
            </dl>
        </x-filament::section>

        {{-- Payments Stats --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-banknotes class="w-5 h-5" />
                    Payments
                </div>
            </x-slot>

            <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Total Payments:</dt>
                    <dd class="font-medium">{{ $stats['payments']['total'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Completed:</dt>
                    <dd class="font-medium text-green-600">{{ $stats['payments']['completed'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Pending:</dt>
                    <dd class="font-medium text-yellow-600">{{ $stats['payments']['pending'] ?? 0 }}</dd>
                </div>
                <hr class="my-2">
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Total Collected:</dt>
                    <dd class="font-medium text-green-600">${{ number_format($stats['payments']['total_amount'] ?? 0, 2) }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">This Month:</dt>
                    <dd class="font-medium text-blue-600">${{ number_format($stats['payments']['period_amount'] ?? 0, 2) }}</dd>
                </div>
            </dl>
        </x-filament::section>

        {{-- Fines & Payment Plans --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-exclamation-triangle class="w-5 h-5" />
                    Fines & Plans
                </div>
            </x-slot>

            <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Pending Fines:</dt>
                    <dd class="font-medium text-red-600">${{ number_format($stats['fines']['pending'] ?? 0, 2) }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Fines Collected:</dt>
                    <dd class="font-medium text-green-600">${{ number_format($stats['fines']['collected'] ?? 0, 2) }}</dd>
                </div>
                <hr class="my-2">
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Active Payment Plans:</dt>
                    <dd class="font-medium">{{ $stats['payment_plans']['active'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Plan Total:</dt>
                    <dd class="font-medium">${{ number_format($stats['payment_plans']['total_amount'] ?? 0, 2) }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Plan Collected:</dt>
                    <dd class="font-medium text-green-600">${{ number_format($stats['payment_plans']['collected'] ?? 0, 2) }}</dd>
                </div>
            </dl>
        </x-filament::section>
    </div>

    {{-- Recent Payments & Overdue Invoices --}}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {{-- Recent Payments --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-clock class="w-5 h-5" />
                    Recent Payments
                </div>
            </x-slot>

            @if($recentPayments->isEmpty())
                <p class="text-sm text-gray-500 text-center py-4">No recent payments</p>
            @else
                <div class="space-y-2">
                    @foreach($recentPayments as $payment)
                        <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div>
                                <div class="text-sm font-medium">{{ $payment->student?->name_en ?? 'N/A' }}</div>
                                <div class="text-xs text-gray-500">{{ $payment->transaction_id }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-bold text-green-600">${{ number_format($payment->amount, 2) }}</div>
                                <div class="text-xs text-gray-500">{{ $payment->payment_date?->diffForHumans() }}</div>
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
        </x-filament::section>

        {{-- Overdue Invoices --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2 text-red-600">
                    <x-heroicon-o-exclamation-circle class="w-5 h-5" />
                    Overdue Invoices
                </div>
            </x-slot>

            @if($overdueInvoices->isEmpty())
                <p class="text-sm text-gray-500 text-center py-4">No overdue invoices</p>
            @else
                <div class="space-y-2">
                    @foreach($overdueInvoices as $invoice)
                        <div class="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                            <div>
                                <div class="text-sm font-medium">{{ $invoice->student?->name_en ?? 'N/A' }}</div>
                                <div class="text-xs text-gray-500">{{ $invoice->invoice_number }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-bold text-red-600">${{ number_format($invoice->balance_due, 2) }}</div>
                                <div class="text-xs text-red-500">Due: {{ $invoice->due_date?->format('M d, Y') }}</div>
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
        </x-filament::section>
    </div>

    {{-- Pending Refunds --}}
    @if($pendingRefunds->isNotEmpty())
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2 text-orange-600">
                    <x-heroicon-o-arrow-uturn-left class="w-5 h-5" />
                    Pending Refunds
                </div>
            </x-slot>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                @foreach($pendingRefunds as $refund)
                    <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="text-sm font-medium">{{ $refund->student?->name_en ?? 'N/A' }}</div>
                                <div class="text-xs text-gray-500">{{ $refund->refund_number }}</div>
                            </div>
                            <div class="text-right">
                                <div class="font-bold text-orange-600">${{ number_format($refund->amount, 2) }}</div>
                            </div>
                        </div>
                        <div class="mt-2 text-xs text-gray-500">
                            Reason: {{ str_replace('_', ' ', $refund->reason) }}
                        </div>
                    </div>
                @endforeach
            </div>
        </x-filament::section>
    @endif
</x-filament-panels::page>
