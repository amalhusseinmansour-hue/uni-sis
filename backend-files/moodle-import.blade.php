<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Connection Status --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-signal class="w-5 h-5" />
                    <span>Moodle Connection</span>
                </div>
            </x-slot>

            @if($connectionTested)
                @if($connectionResult['success'])
                    <div class="flex items-center gap-4 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                        <x-heroicon-o-check-circle class="w-8 h-8 text-success-500" />
                        <div>
                            <h4 class="font-medium text-success-700 dark:text-success-400">Connected Successfully</h4>
                            <p class="text-sm text-success-600 dark:text-success-500">
                                {{ $connectionResult['site_name'] ?? 'Moodle LMS' }} (v{{ $connectionResult['version'] ?? 'Unknown' }})
                            </p>
                        </div>
                    </div>
                @else
                    <div class="flex items-center gap-4 p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                        <x-heroicon-o-x-circle class="w-8 h-8 text-danger-500" />
                        <div>
                            <h4 class="font-medium text-danger-700 dark:text-danger-400">Connection Failed</h4>
                            <p class="text-sm text-danger-600 dark:text-danger-500">
                                {{ $connectionResult['error'] ?? 'Unknown error' }}
                            </p>
                        </div>
                    </div>
                @endif
            @endif

            <div class="mt-4">
                <x-filament::button wire:click="testConnection" icon="heroicon-o-arrow-path">
                    Test Connection
                </x-filament::button>
            </div>
        </x-filament::section>

        {{-- Statistics --}}
        @php $stats = $this->getStatistics(); @endphp
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <x-filament::card>
                <div class="text-center">
                    <div class="text-2xl font-bold text-primary-500">{{ $stats['total_students'] }}</div>
                    <div class="text-sm text-gray-500">Total Students in SIS</div>
                </div>
            </x-filament::card>
            <x-filament::card>
                <div class="text-center">
                    <div class="text-2xl font-bold text-info-500">{{ $stats['total_moodle_users'] }}</div>
                    <div class="text-sm text-gray-500">Linked to Moodle</div>
                </div>
            </x-filament::card>
            <x-filament::card>
                <div class="text-center">
                    <div class="text-2xl font-bold text-success-500">{{ $stats['synced'] }}</div>
                    <div class="text-sm text-gray-500">Synced</div>
                </div>
            </x-filament::card>
            <x-filament::card>
                <div class="text-center">
                    <div class="text-2xl font-bold text-warning-500">{{ $stats['pending'] }}</div>
                    <div class="text-sm text-gray-500">Pending</div>
                </div>
            </x-filament::card>
            <x-filament::card>
                <div class="text-center">
                    <div class="text-2xl font-bold text-danger-500">{{ $stats['failed'] }}</div>
                    <div class="text-sm text-gray-500">Failed</div>
                </div>
            </x-filament::card>
        </div>

        {{-- Import Section --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-cloud-arrow-down class="w-5 h-5 text-primary-500" />
                    <span>Import Students from Moodle</span>
                </div>
            </x-slot>
            <x-slot name="description">
                Fetch and import students from Moodle LMS to create SIS accounts
            </x-slot>

            {{-- Import Result --}}
            @if($importResult)
                <div class="mb-4 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                    <h4 class="font-medium text-success-700 dark:text-success-400 mb-2">Import Results</h4>
                    <div class="grid grid-cols-4 gap-4 text-sm">
                        <div>
                            <span class="text-success-600">Created:</span>
                            <strong>{{ $importResult['created'] }}</strong>
                        </div>
                        <div>
                            <span class="text-info-600">Updated:</span>
                            <strong>{{ $importResult['updated'] }}</strong>
                        </div>
                        <div>
                            <span class="text-warning-600">Skipped:</span>
                            <strong>{{ $importResult['skipped'] }}</strong>
                        </div>
                        <div>
                            <span class="text-danger-600">Failed:</span>
                            <strong>{{ $importResult['failed'] }}</strong>
                        </div>
                    </div>
                </div>
            @endif

            {{-- Action Buttons --}}
            <div class="flex flex-wrap gap-2 mb-4">
                <x-filament::button
                    wire:click="fetchStudents"
                    icon="heroicon-o-arrow-down-tray"
                    :disabled="$isLoading || !($connectionResult['success'] ?? false)"
                >
                    @if($isLoading)
                        <x-filament::loading-indicator class="w-4 h-4 mr-2" />
                    @endif
                    Fetch Students from Moodle
                </x-filament::button>

                @if(count($moodleStudents) > 0)
                    <x-filament::button
                        wire:click="importAll"
                        icon="heroicon-o-user-plus"
                        color="success"
                        :disabled="$isLoading"
                    >
                        Import All ({{ count($moodleStudents) }})
                    </x-filament::button>

                    @if(count($selectedStudents) > 0)
                        <x-filament::button
                            wire:click="importSelected"
                            icon="heroicon-o-check"
                            color="warning"
                            :disabled="$isLoading"
                        >
                            Import Selected ({{ count($selectedStudents) }})
                        </x-filament::button>
                    @endif

                    <x-filament::button wire:click="selectAll" color="gray" size="sm">
                        Select All
                    </x-filament::button>
                    <x-filament::button wire:click="deselectAll" color="gray" size="sm">
                        Deselect All
                    </x-filament::button>
                @endif
            </div>

            {{-- Students List --}}
            @if(count($moodleStudents) > 0)
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th class="p-3 text-left">
                                    <input type="checkbox"
                                           class="rounded"
                                           wire:click="selectAll"
                                           @checked(count($selectedStudents) === count($moodleStudents))>
                                </th>
                                <th class="p-3 text-left">Moodle ID</th>
                                <th class="p-3 text-left">Username</th>
                                <th class="p-3 text-left">Email</th>
                                <th class="p-3 text-left">Name</th>
                                <th class="p-3 text-left">Department</th>
                                <th class="p-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            @foreach($moodleStudents as $student)
                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td class="p-3">
                                        <input type="checkbox"
                                               class="rounded"
                                               wire:click="toggleStudent({{ $student['id'] }})"
                                               @checked(in_array($student['id'], $selectedStudents))>
                                    </td>
                                    <td class="p-3">{{ $student['id'] }}</td>
                                    <td class="p-3 font-medium">{{ $student['username'] }}</td>
                                    <td class="p-3">{{ $student['email'] ?? '-' }}</td>
                                    <td class="p-3">{{ ($student['firstname'] ?? '') . ' ' . ($student['lastname'] ?? '') }}</td>
                                    <td class="p-3">{{ $student['department'] ?? '-' }}</td>
                                    <td class="p-3">
                                        @if(isset($student['suspended']) && $student['suspended'])
                                            <span class="px-2 py-1 text-xs bg-danger-100 text-danger-700 rounded">Suspended</span>
                                        @else
                                            <span class="px-2 py-1 text-xs bg-success-100 text-success-700 rounded">Active</span>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @elseif($connectionResult['success'] ?? false)
                <div class="text-center py-8 text-gray-500">
                    <x-heroicon-o-users class="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Click "Fetch Students from Moodle" to load students</p>
                </div>
            @endif
        </x-filament::section>

        {{-- Imported Students Table --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-users class="w-5 h-5 text-success-500" />
                    <span>Imported Students</span>
                </div>
            </x-slot>
            <x-slot name="description">
                Students that have been imported and linked to Moodle
            </x-slot>

            {{ $this->table }}
        </x-filament::section>
    </div>
</x-filament-panels::page>
