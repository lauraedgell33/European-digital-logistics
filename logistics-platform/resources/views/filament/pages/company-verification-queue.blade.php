<x-filament-panels::page>
    <div class="grid gap-6">
        {{-- Stats --}}
        <div class="grid grid-cols-3 gap-4">
            <div class="fi-section rounded-xl bg-yellow-50 dark:bg-yellow-900/20 p-4 text-center ring-1 ring-yellow-200 dark:ring-yellow-800">
                <div class="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{{ $stats['pending'] }}</div>
                <div class="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
            </div>
            <div class="fi-section rounded-xl bg-green-50 dark:bg-green-900/20 p-4 text-center ring-1 ring-green-200 dark:ring-green-800">
                <div class="text-2xl font-bold text-green-700 dark:text-green-300">{{ $stats['verified'] }}</div>
                <div class="text-sm text-green-600 dark:text-green-400">Verified</div>
            </div>
            <div class="fi-section rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-center ring-1 ring-red-200 dark:ring-red-800">
                <div class="text-2xl font-bold text-red-700 dark:text-red-300">{{ $stats['rejected'] }}</div>
                <div class="text-sm text-red-600 dark:text-red-400">Rejected</div>
            </div>
        </div>

        {{-- Pending Companies --}}
        <div class="fi-section rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Verifications</h3>
            @forelse($pendingCompanies as $company)
            <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg">
                <div class="flex-1">
                    <div class="font-semibold text-gray-900 dark:text-white">{{ $company->name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                        VAT: {{ $company->vat_number }} · {{ $company->type }} · {{ $company->country_code }} · {{ $company->city }}
                    </div>
                    <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {{ $company->users->count() }} users · Registered {{ $company->created_at->diffForHumans() }}
                    </div>
                </div>
                <div class="flex gap-2">
                    <button wire:click="approve({{ $company->id }})" class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">Approve</button>
                    <button wire:click="reject({{ $company->id }})" class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Reject</button>
                </div>
            </div>
            @empty
            <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                <x-heroicon-o-check-circle class="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>No pending verifications</p>
            </div>
            @endforelse
        </div>
    </div>
</x-filament-panels::page>
