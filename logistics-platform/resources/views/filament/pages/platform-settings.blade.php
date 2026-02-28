<x-filament-panels::page>
    <x-filament-panels::form wire:model="data">
        {{ $this->form }}
    </x-filament-panels::form>

    <div class="mt-6 flex gap-4">
        <x-filament::button
            wire:click="clearCache"
            color="warning"
            icon="heroicon-o-trash"
        >
            Clear All Caches
        </x-filament::button>

        <x-filament::button
            wire:click="optimizePlatform"
            color="success"
            icon="heroicon-o-bolt"
        >
            Optimize Platform
        </x-filament::button>
    </div>
</x-filament-panels::page>
