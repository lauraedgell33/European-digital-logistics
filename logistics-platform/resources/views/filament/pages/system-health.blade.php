<x-filament-panels::page>
    {{-- Health Checks --}}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        @foreach($checks as $name => $check)
            <div class="rounded-[6px] p-4 transition-all" style="background: var(--ds-background-100); box-shadow: var(--ds-shadow-border-small);">
                <div class="flex items-center gap-3">
                    @if($check['status'] === 'ok')
                        <div class="w-2.5 h-2.5 rounded-full animate-pulse" style="background: hsl(131, 41%, 46%);"></div>
                    @elseif($check['status'] === 'warning')
                        <div class="w-2.5 h-2.5 rounded-full animate-pulse" style="background: hsl(39, 100%, 57%);"></div>
                    @else
                        <div class="w-2.5 h-2.5 rounded-full animate-pulse" style="background: hsl(358, 75%, 59%);"></div>
                    @endif
                    <div>
                        <h3 class="text-[13px] font-semibold capitalize" style="color: var(--ds-gray-1000);">{{ str_replace('_', ' ', $name) }}</h3>
                        <p class="text-[12px]" style="color: var(--ds-gray-700);">{{ $check['message'] }}</p>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {{-- System Info --}}
        <div class="rounded-[6px] p-6" style="background: var(--ds-background-100); box-shadow: var(--ds-shadow-border-small);">
            <h2 class="text-[15px] font-semibold mb-4" style="color: var(--ds-gray-1000); letter-spacing: -0.01em;">Server Information</h2>
            <dl class="space-y-0">
                @foreach($systemInfo as $key => $value)
                    <div class="flex justify-between py-2.5" style="border-bottom: 1px solid var(--ds-gray-200);">
                        <dt class="text-[13px]" style="color: var(--ds-gray-700);">{{ $key }}</dt>
                        <dd class="text-[13px] font-medium tabular-nums" style="color: var(--ds-gray-1000);">{{ $value }}</dd>
                    </div>
                @endforeach
            </dl>
        </div>

        {{-- Model Counts --}}
        <div class="rounded-[6px] p-6" style="background: var(--ds-background-100); box-shadow: var(--ds-shadow-border-small);">
            <h2 class="text-[15px] font-semibold mb-4" style="color: var(--ds-gray-1000); letter-spacing: -0.01em;">Database Records</h2>
            <dl class="space-y-0">
                @foreach($modelCounts as $model => $count)
                    <div class="flex justify-between py-2.5" style="border-bottom: 1px solid var(--ds-gray-200);">
                        <dt class="text-[13px]" style="color: var(--ds-gray-700);">{{ $model }}</dt>
                        <dd class="text-[13px] font-bold tabular-nums" style="color: var(--ds-gray-1000);">{{ number_format($count) }}</dd>
                    </div>
                @endforeach
            </dl>
        </div>
    </div>
</x-filament-panels::page>
