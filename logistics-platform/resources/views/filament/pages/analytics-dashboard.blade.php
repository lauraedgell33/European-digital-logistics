<x-filament-panels::page>
    <div class="grid gap-6">
        {{-- KPI Cards --}}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Gross Merchandise Volume</div>
                <div class="mt-2 text-3xl font-bold text-gray-900 dark:text-white" style="font-variant-numeric: tabular-nums">€{{ number_format($kpis['gmv'], 2) }}</div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">All time revenue</div>
            </div>
            <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Orders This Month</div>
                <div class="mt-2 text-3xl font-bold text-gray-900 dark:text-white" style="font-variant-numeric: tabular-nums">{{ $kpis['monthlyOrders'] }}</div>
                @php $change = $kpis['lastMonthOrders'] > 0 ? round(($kpis['monthlyOrders'] - $kpis['lastMonthOrders']) / $kpis['lastMonthOrders'] * 100, 1) : 0; @endphp
                <div class="mt-1 text-xs {{ $change >= 0 ? 'text-green-600' : 'text-red-600' }}">{{ $change >= 0 ? '↑' : '↓' }} {{ abs($change) }}% vs last month</div>
            </div>
            <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Delivery Time</div>
                <div class="mt-2 text-3xl font-bold text-gray-900 dark:text-white" style="font-variant-numeric: tabular-nums">{{ $kpis['avgDeliveryDays'] ?? 'N/A' }} days</div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">Pickup to delivery</div>
            </div>
            <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</div>
                <div class="mt-2 text-3xl font-bold text-gray-900 dark:text-white" style="font-variant-numeric: tabular-nums">{{ $kpis['completionRate'] }}%</div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ $kpis['activeShipments'] }} active shipments</div>
            </div>
        </div>

        {{-- Top Routes Table --}}
        <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Routes</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                            <th class="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 uppercase text-xs">Route</th>
                            <th class="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400 uppercase text-xs">Orders</th>
                            <th class="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400 uppercase text-xs">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($topRoutes as $route)
                        <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td class="py-3 px-4 text-gray-900 dark:text-white font-medium">{{ $route->pickup_country }} → {{ $route->delivery_country }}</td>
                            <td class="py-3 px-4 text-right text-gray-600 dark:text-gray-300" style="font-variant-numeric: tabular-nums">{{ $route->total }}</td>
                            <td class="py-3 px-4 text-right text-gray-600 dark:text-gray-300" style="font-variant-numeric: tabular-nums">€{{ number_format($route->revenue, 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        {{-- Monthly Trend --}}
        <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Trend</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                @foreach($monthlyTrend as $month)
                <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ $month['month'] }}</div>
                    <div class="mt-1 text-lg font-bold text-gray-900 dark:text-white" style="font-variant-numeric: tabular-nums">{{ $month['orders'] }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400" style="font-variant-numeric: tabular-nums">€{{ number_format($month['revenue'], 0) }}</div>
                </div>
                @endforeach
            </div>
        </div>
    </div>
</x-filament-panels::page>
