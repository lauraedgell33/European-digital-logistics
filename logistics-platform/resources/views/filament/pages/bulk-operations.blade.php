<x-filament-panels::page>
    <div class="grid gap-6 max-w-4xl">
        {{-- System Info --}}
        <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Information</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span class="text-gray-500 dark:text-gray-400">PHP:</span> <span class="font-medium text-gray-900 dark:text-white">{{ $phpVersion }}</span></div>
                <div><span class="text-gray-500 dark:text-gray-400">Laravel:</span> <span class="font-medium text-gray-900 dark:text-white">{{ $laravelVersion }}</span></div>
                <div><span class="text-gray-500 dark:text-gray-400">Cache:</span> <span class="font-medium text-gray-900 dark:text-white">{{ $cacheDriver }}</span></div>
                <div><span class="text-gray-500 dark:text-gray-400">Queue:</span> <span class="font-medium text-gray-900 dark:text-white">{{ $queueDriver }}</span></div>
            </div>
        </div>

        {{-- Cache Operations --}}
        <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cache Operations</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button wire:click="clearAllCache" class="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                    <x-heroicon-o-trash class="w-5 h-5" />
                    Clear All Caches
                </button>
                <button wire:click="optimizeApplication" class="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    <x-heroicon-o-bolt class="w-5 h-5" />
                    Optimize Application
                </button>
                <button wire:click="clearWidgetCache" class="flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors">
                    <x-heroicon-o-chart-bar class="w-5 h-5" />
                    Clear Widget Caches
                </button>
            </div>
        </div>
    </div>
</x-filament-panels::page>
