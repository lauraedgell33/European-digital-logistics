<div class="flex items-center justify-center gap-4 py-4 text-xs text-gray-400 dark:text-gray-500">
    <span>LogiMarket v2.0</span>
    <span>·</span>
    <span>Laravel {{ app()->version() }}</span>
    <span>·</span>
    <span>PHP {{ PHP_VERSION }}</span>
    <span>·</span>
    <span class="inline-flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full {{ app()->environment('production') ? 'bg-green-500' : 'bg-yellow-500' }}"></span>
        {{ ucfirst(app()->environment()) }}
    </span>
</div>
