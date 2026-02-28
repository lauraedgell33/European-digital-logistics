<x-filament-panels::page>
    <div class="grid gap-6">
        {{-- Stats --}}
        <div class="grid grid-cols-3 gap-4">
            <div class="fi-section rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10 text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['today'] }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Today</div>
            </div>
            <div class="fi-section rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10 text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['week'] }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">This Week</div>
            </div>
            <div class="fi-section rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10 text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ $stats['total'] }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Total</div>
            </div>
        </div>

        {{-- Activity Log --}}
        <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div class="space-y-3">
                @foreach($activities as $activity)
                <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div class="flex-shrink-0 mt-1">
                        @if($activity['event'] === 'created')
                            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                                <x-heroicon-o-plus class="w-4 h-4 text-green-600 dark:text-green-400" />
                            </span>
                        @elseif($activity['event'] === 'updated')
                            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                <x-heroicon-o-pencil class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </span>
                        @elseif($activity['event'] === 'deleted')
                            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30">
                                <x-heroicon-o-trash class="w-4 h-4 text-red-600 dark:text-red-400" />
                            </span>
                        @else
                            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900/30">
                                <x-heroicon-o-information-circle class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </span>
                        @endif
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="font-medium text-gray-900 dark:text-white">{{ $activity['causer'] }}</span>
                            <span class="text-xs px-2 py-0.5 rounded-full {{ $activity['event'] === 'created' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ($activity['event'] === 'deleted' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400') }}">{{ $activity['event'] }}</span>
                            @if($activity['subject_type'])
                            <span class="text-xs text-gray-500 dark:text-gray-400">{{ $activity['subject_type'] }} #{{ $activity['subject_id'] }}</span>
                            @endif
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ $activity['description'] }}</p>
                        @if(!empty($activity['properties']['attributes']))
                        <details class="mt-2">
                            <summary class="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600">View changes</summary>
                            <div class="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono overflow-x-auto">
                                @foreach($activity['properties']['attributes'] as $key => $value)
                                <div><span class="text-gray-500">{{ $key }}:</span> <span class="text-gray-900 dark:text-gray-200">{{ is_array($value) ? json_encode($value) : $value }}</span></div>
                                @endforeach
                            </div>
                        </details>
                        @endif
                    </div>
                    <div class="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500">
                        {{ $activity['created_at']->diffForHumans() }}
                    </div>
                </div>
                @endforeach
            </div>
        </div>
    </div>
</x-filament-panels::page>
