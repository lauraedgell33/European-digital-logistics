<x-filament-panels::page>
    {{-- Today's Stats --}}
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        @foreach($todayStats as $label => $count)
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($count) }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ $label }} Today</div>
            </div>
        @endforeach
    </div>

    {{-- Activity Timeline --}}
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>

        <div class="space-y-4">
            @forelse($recentActivities as $activity)
                <div class="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <div class="mt-1">
                        @switch($activity['color'])
                            @case('blue')
                                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                                @break
                            @case('amber')
                                <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                                @break
                            @case('green')
                                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                @break
                            @case('purple')
                                <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                                @break
                            @case('teal')
                                <div class="w-2 h-2 rounded-full bg-teal-500"></div>
                                @break
                            @default
                                <div class="w-2 h-2 rounded-full bg-gray-500"></div>
                        @endswitch
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-900 dark:text-white truncate">{{ $activity['message'] }}</p>
                        <p class="text-xs text-gray-400 mt-0.5">{{ $activity['time']?->diffForHumans() ?? 'Unknown' }}</p>
                    </div>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                        {{ $activity['type'] }}
                    </span>
                </div>
            @empty
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No recent activity found.</p>
            @endforelse
        </div>
    </div>
</x-filament-panels::page>
