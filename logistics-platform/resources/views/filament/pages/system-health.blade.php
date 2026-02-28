<x-filament-panels::page>
    {{-- Health Checks --}}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        @foreach($checks as $name => $check)
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4">
                <div class="flex items-center gap-3">
                    @if($check['status'] === 'ok')
                        <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    @elseif($check['status'] === 'warning')
                        <div class="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                    @else
                        <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    @endif
                    <div>
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-white capitalize">{{ str_replace('_', ' ', $name) }}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ $check['message'] }}</p>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {{-- System Info --}}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Server Information</h2>
            <dl class="space-y-2">
                @foreach($systemInfo as $key => $value)
                    <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <dt class="text-sm text-gray-500 dark:text-gray-400">{{ $key }}</dt>
                        <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ $value }}</dd>
                    </div>
                @endforeach
            </dl>
        </div>

        {{-- Model Counts --}}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Database Records</h2>
            <dl class="space-y-2">
                @foreach($modelCounts as $model => $count)
                    <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <dt class="text-sm text-gray-500 dark:text-gray-400">{{ $model }}</dt>
                        <dd class="text-sm font-bold text-gray-900 dark:text-white">{{ number_format($count) }}</dd>
                    </div>
                @endforeach
            </dl>
        </div>
    </div>
</x-filament-panels::page>
