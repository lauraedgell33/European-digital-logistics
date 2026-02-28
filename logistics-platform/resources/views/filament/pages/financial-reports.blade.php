<x-filament-panels::page>
    <div class="grid gap-6">
        {{-- Monthly Summary --}}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</div>
                <div class="mt-2 text-2xl font-bold text-green-600 dark:text-green-400" style="font-variant-numeric: tabular-nums">€{{ number_format($monthly['revenue'], 2) }}</div>
            </div>
            <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Invoiced</div>
                <div class="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400" style="font-variant-numeric: tabular-nums">€{{ number_format($monthly['invoiced'], 2) }}</div>
            </div>
            <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Collected</div>
                <div class="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400" style="font-variant-numeric: tabular-nums">€{{ number_format($monthly['collected'], 2) }}</div>
            </div>
            <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding</div>
                <div class="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400" style="font-variant-numeric: tabular-nums">€{{ number_format($monthly['outstanding'], 2) }}</div>
            </div>
        </div>

        {{-- Payment Aging --}}
        <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Aging Report</h3>
            <div class="grid grid-cols-4 gap-4">
                <div class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div class="text-sm text-green-700 dark:text-green-300">Current</div>
                    <div class="text-xl font-bold text-green-800 dark:text-green-200" style="font-variant-numeric: tabular-nums">€{{ number_format($aging['current'], 2) }}</div>
                </div>
                <div class="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <div class="text-sm text-yellow-700 dark:text-yellow-300">1-30 Days</div>
                    <div class="text-xl font-bold text-yellow-800 dark:text-yellow-200" style="font-variant-numeric: tabular-nums">€{{ number_format($aging['overdue_30'], 2) }}</div>
                </div>
                <div class="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <div class="text-sm text-orange-700 dark:text-orange-300">31-60 Days</div>
                    <div class="text-xl font-bold text-orange-800 dark:text-orange-200" style="font-variant-numeric: tabular-nums">€{{ number_format($aging['overdue_60'], 2) }}</div>
                </div>
                <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div class="text-sm text-red-700 dark:text-red-300">60+ Days</div>
                    <div class="text-xl font-bold text-red-800 dark:text-red-200" style="font-variant-numeric: tabular-nums">€{{ number_format($aging['overdue_90'], 2) }}</div>
                </div>
            </div>
        </div>

        {{-- Yearly Revenue by Month --}}
        <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Year-to-Date Revenue</h3>
            <div class="flex items-center gap-4 mb-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">Total: <span class="font-bold text-gray-900 dark:text-white">€{{ number_format($yearly['revenue'], 2) }}</span></span>
                <span class="text-sm text-gray-500 dark:text-gray-400">Tax: <span class="font-bold text-gray-900 dark:text-white">€{{ number_format($yearly['taxCollected'], 2) }}</span></span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                            <th class="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400 uppercase text-xs">Month</th>
                            <th class="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400 uppercase text-xs">Revenue</th>
                            <th class="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400 uppercase text-xs">Tax</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($byMonth as $row)
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 px-3 text-gray-900 dark:text-white">{{ \Carbon\Carbon::create(null, $row->month)->format('F') }}</td>
                            <td class="py-2 px-3 text-right text-gray-600 dark:text-gray-300" style="font-variant-numeric: tabular-nums">€{{ number_format($row->revenue, 2) }}</td>
                            <td class="py-2 px-3 text-right text-gray-600 dark:text-gray-300" style="font-variant-numeric: tabular-nums">€{{ number_format($row->tax, 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</x-filament-panels::page>
