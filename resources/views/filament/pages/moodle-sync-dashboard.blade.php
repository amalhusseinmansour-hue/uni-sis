<x-filament-panels::page>
    {{-- Connection Status --}}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <x-filament::section>
            <x-slot name="heading">
                Connection Status
            </x-slot>

            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Configured:</span>
                    @if($isConfigured)
                        <x-filament::badge color="success">Yes</x-filament::badge>
                    @else
                        <x-filament::badge color="danger">No</x-filament::badge>
                    @endif
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Sync Enabled:</span>
                    @if($isSyncEnabled)
                        <x-filament::badge color="success">Enabled</x-filament::badge>
                    @else
                        <x-filament::badge color="warning">Disabled</x-filament::badge>
                    @endif
                </div>
                @if($connectionStatus['success'] ?? false)
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Site:</span>
                        <span class="text-sm text-gray-900 dark:text-gray-100">{{ $connectionStatus['site_name'] ?? 'N/A' }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Version:</span>
                        <span class="text-sm text-gray-900 dark:text-gray-100">{{ $connectionStatus['version'] ?? 'N/A' }}</span>
                    </div>
                @else
                    <div class="text-sm text-red-600 dark:text-red-400">
                        {{ $connectionStatus['error'] ?? 'Not connected' }}
                    </div>
                @endif
            </div>
        </x-filament::section>

        <x-filament::section>
            <x-slot name="heading">
                Quick Stats
            </x-slot>

            <div class="grid grid-cols-2 gap-3">
                <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ $stats['users']['total'] ?? 0 }}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">Users Tracked</div>
                </div>
                <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ $stats['courses']['synced'] ?? 0 }}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">Courses Synced</div>
                </div>
                <div class="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ $stats['enrollments']['synced'] ?? 0 }}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">Enrollments</div>
                </div>
                <div class="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ $stats['grades']['synced_to_sis'] ?? 0 }}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">Grades Imported</div>
                </div>
            </div>
        </x-filament::section>
    </div>

    {{-- Detailed Stats --}}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {{-- Users Stats --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-users class="w-5 h-5" />
                    Users
                </div>
            </x-slot>

            <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Students:</dt>
                    <dd class="font-medium">{{ $stats['users']['students'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Lecturers:</dt>
                    <dd class="font-medium">{{ $stats['users']['lecturers'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Synced:</dt>
                    <dd class="font-medium text-green-600">{{ $stats['users']['synced'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Pending:</dt>
                    <dd class="font-medium text-yellow-600">{{ $stats['users']['pending'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Failed:</dt>
                    <dd class="font-medium text-red-600">{{ $stats['users']['failed'] ?? 0 }}</dd>
                </div>
            </dl>
        </x-filament::section>

        {{-- Courses Stats --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-book-open class="w-5 h-5" />
                    Courses
                </div>
            </x-slot>

            <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Total:</dt>
                    <dd class="font-medium">{{ $stats['courses']['total'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Synced:</dt>
                    <dd class="font-medium text-green-600">{{ $stats['courses']['synced'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Pending:</dt>
                    <dd class="font-medium text-yellow-600">{{ $stats['courses']['pending'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Failed:</dt>
                    <dd class="font-medium text-red-600">{{ $stats['courses']['failed'] ?? 0 }}</dd>
                </div>
            </dl>
        </x-filament::section>

        {{-- Enrollments Stats --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-clipboard-document-list class="w-5 h-5" />
                    Enrollments
                </div>
            </x-slot>

            <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Total:</dt>
                    <dd class="font-medium">{{ $stats['enrollments']['total'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Synced:</dt>
                    <dd class="font-medium text-green-600">{{ $stats['enrollments']['synced'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Pending:</dt>
                    <dd class="font-medium text-yellow-600">{{ $stats['enrollments']['pending'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Unenrolled:</dt>
                    <dd class="font-medium text-gray-600">{{ $stats['enrollments']['unenrolled'] ?? 0 }}</dd>
                </div>
            </dl>
        </x-filament::section>

        {{-- Grades Stats --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-academic-cap class="w-5 h-5" />
                    Grades
                </div>
            </x-slot>

            <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Total:</dt>
                    <dd class="font-medium">{{ $stats['grades']['total'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Completed:</dt>
                    <dd class="font-medium text-green-600">{{ $stats['grades']['completed'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Failed:</dt>
                    <dd class="font-medium text-red-600">{{ $stats['grades']['failed'] ?? 0 }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Synced to SIS:</dt>
                    <dd class="font-medium text-blue-600">{{ $stats['grades']['synced_to_sis'] ?? 0 }}</dd>
                </div>
            </dl>
        </x-filament::section>
    </div>

    {{-- Sync Logs Table --}}
    <x-filament::section>
        <x-slot name="heading">
            Recent Sync Logs
        </x-slot>

        {{ $this->table }}
    </x-filament::section>

    {{-- Configuration Help --}}
    @if(!$isConfigured)
        <x-filament::section class="mt-6">
            <x-slot name="heading">
                <div class="flex items-center gap-2 text-yellow-600">
                    <x-heroicon-o-exclamation-triangle class="w-5 h-5" />
                    Configuration Required
                </div>
            </x-slot>

            <div class="prose dark:prose-invert max-w-none">
                <p>Add the following to your <code>.env</code> file:</p>
                <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
MOODLE_URL=https://your-moodle-site.com
MOODLE_TOKEN=your_webservice_token
MOODLE_WEBHOOK_SECRET=your_random_secret
MOODLE_SYNC_ENABLED=true</pre>
            </div>
        </x-filament::section>
    @endif
</x-filament-panels::page>
