<x-filament-panels::page>
    {{-- Today's Stats --}}
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        @foreach($todayStats as $label => $count)
            <div class="rounded-[6px] p-4 text-center transition-all" style="background: var(--ds-background-100); box-shadow: var(--ds-shadow-border-small);">
                <div class="text-2xl font-bold tabular-nums" style="color: var(--ds-gray-1000);">{{ number_format($count) }}</div>
                <div class="text-[11px] mt-1" style="color: var(--ds-gray-700);">{{ $label }} Today</div>
            </div>
        @endforeach
    </div>

    {{-- Activity Timeline --}}
    <div class="rounded-[6px] p-6" style="background: var(--ds-background-100); box-shadow: var(--ds-shadow-border-small);">
        <h2 class="text-[15px] font-semibold mb-4" style="color: var(--ds-gray-1000); letter-spacing: -0.01em;">Recent Activity</h2>

        <div class="space-y-0">
            @forelse($recentActivities as $activity)
                <div class="flex items-start gap-3 py-3 last:border-0" style="border-bottom: 1px solid var(--ds-gray-200);">
                    <div class="mt-1.5">
                        @switch($activity['color'])
                            @case('blue')
                                <div class="w-2 h-2 rounded-full" style="background: hsl(212, 100%, 48%);"></div>
                                @break
                            @case('amber')
                                <div class="w-2 h-2 rounded-full" style="background: hsl(39, 100%, 57%);"></div>
                                @break
                            @case('green')
                                <div class="w-2 h-2 rounded-full" style="background: hsl(131, 41%, 46%);"></div>
                                @break
                            @case('purple')
                                <div class="w-2 h-2 rounded-full" style="background: hsl(272, 51%, 54%);"></div>
                                @break
                            @case('teal')
                                <div class="w-2 h-2 rounded-full" style="background: hsl(173, 80%, 36%);"></div>
                                @break
                            @default
                                <div class="w-2 h-2 rounded-full" style="background: var(--ds-gray-600);"></div>
                        @endswitch
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-[13px] truncate" style="color: var(--ds-gray-1000);">{{ $activity['message'] }}</p>
                        <p class="text-[11px] mt-0.5" style="color: var(--ds-gray-600);">{{ $activity['time']?->diffForHumans() ?? 'Unknown' }}</p>
                    </div>
                    <span class="text-[11px] px-2 py-0.5 rounded-full capitalize" style="background: var(--ds-gray-200); color: var(--ds-gray-800);">
                        {{ $activity['type'] }}
                    </span>
                </div>
            @empty
                <p class="text-[13px] text-center py-8" style="color: var(--ds-gray-600);">No recent activity found.</p>
            @endforelse
        </div>
    </div>
</x-filament-panels::page>
