<div class="flex items-center">
    <x-filament::dropdown>
        <x-slot name="trigger">
            <button
                type="button"
                class="flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
            >
                <x-heroicon-o-language class="h-5 w-5" />
                <span>{{ $currentLocale === 'ar' ? 'العربية' : 'English' }}</span>
                <x-heroicon-m-chevron-down class="h-4 w-4" />
            </button>
        </x-slot>

        <x-filament::dropdown.list>
            <x-filament::dropdown.list.item
                wire:click="switchLanguage('en')"
                :icon="$currentLocale === 'en' ? 'heroicon-o-check' : null"
            >
                <div class="flex items-center gap-2">
                    <span class="font-bold">EN</span>
                    <span>English</span>
                </div>
            </x-filament::dropdown.list.item>

            <x-filament::dropdown.list.item
                wire:click="switchLanguage('ar')"
                :icon="$currentLocale === 'ar' ? 'heroicon-o-check' : null"
            >
                <div class="flex items-center gap-2">
                    <span class="font-bold">ع</span>
                    <span>العربية</span>
                </div>
            </x-filament::dropdown.list.item>
        </x-filament::dropdown.list>
    </x-filament::dropdown>
</div>
