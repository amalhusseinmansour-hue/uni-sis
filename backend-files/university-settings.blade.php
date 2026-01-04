<x-filament-panels::page>
    <div class="space-y-6">
        {{-- University Settings --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-building-library class="w-5 h-5 text-primary-500" />
                    <span>University Information</span>
                </div>
            </x-slot>
            <x-slot name="description">
                Basic university details shown on documents, ID cards, and certificates
            </x-slot>

            <form wire:submit="saveUniversity">
                {{ $this->universityForm }}

                <div class="mt-4">
                    <x-filament::button type="submit" icon="heroicon-o-check">
                        Save University Settings
                    </x-filament::button>
                </div>
            </form>
        </x-filament::section>

        {{-- ID Card Settings --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-identification class="w-5 h-5 text-warning-500" />
                    <span>ID Card Configuration</span>
                </div>
            </x-slot>
            <x-slot name="description">
                Customize the appearance and validity of student ID cards
            </x-slot>

            <form wire:submit="saveIdCard">
                {{ $this->idCardForm }}

                <div class="mt-4">
                    <x-filament::button type="submit" icon="heroicon-o-check" color="warning">
                        Save ID Card Settings
                    </x-filament::button>
                </div>
            </form>
        </x-filament::section>

        {{-- Document Settings --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-document-text class="w-5 h-5 text-success-500" />
                    <span>Document Templates</span>
                </div>
            </x-slot>
            <x-slot name="description">
                Configure headers, footers, and signatures for official documents
            </x-slot>

            <form wire:submit="saveDocuments">
                {{ $this->documentsForm }}

                <div class="mt-4">
                    <x-filament::button type="submit" icon="heroicon-o-check" color="success">
                        Save Document Settings
                    </x-filament::button>
                </div>
            </form>
        </x-filament::section>

        {{-- Preview Section --}}
        <x-filament::section collapsible collapsed>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-eye class="w-5 h-5 text-info-500" />
                    <span>Preview</span>
                </div>
            </x-slot>
            <x-slot name="description">
                Preview how your settings will appear on documents
            </x-slot>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {{-- ID Card Preview --}}
                <div class="p-4 rounded-lg border" style="background-color: {{ $idCardData['id_card_background_color'] ?? '#1e293b' }}">
                    <div class="text-center text-white">
                        @if(isset($universityData['university_logo']) && $universityData['university_logo'])
                            <img src="{{ Storage::disk('public')->url($universityData['university_logo']) }}"
                                 alt="Logo"
                                 class="w-16 h-16 mx-auto mb-2 rounded-full bg-white p-1">
                        @else
                            <div class="w-16 h-16 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center">
                                <x-heroicon-o-academic-cap class="w-8 h-8 text-white" />
                            </div>
                        @endif
                        <h3 class="font-bold" style="color: {{ $idCardData['id_card_accent_color'] ?? '#eab308' }}">
                            {{ $universityData['university_name_ar'] ?? 'جامعة فيرتكس' }}
                        </h3>
                        <p class="text-sm opacity-80">
                            {{ $universityData['university_name_en'] ?? 'Vertex University' }}
                        </p>
                        <div class="mt-3 p-2 rounded" style="background-color: {{ $idCardData['id_card_accent_color'] ?? '#eab308' }}; color: #1e293b">
                            <span class="text-xs font-bold">Student ID Card Preview</span>
                        </div>
                    </div>
                </div>

                {{-- Document Header Preview --}}
                <div class="p-4 rounded-lg border bg-white">
                    <div class="text-center border-b pb-4">
                        @if(isset($documentsData['document_header_logo']) && $documentsData['document_header_logo'])
                            <img src="{{ Storage::disk('public')->url($documentsData['document_header_logo']) }}"
                                 alt="Header Logo"
                                 class="h-12 mx-auto mb-2">
                        @endif
                        <h3 class="font-bold text-gray-800">
                            {{ $universityData['university_name_en'] ?? 'Vertex University' }}
                        </h3>
                        <p class="text-sm text-gray-600">
                            {{ $universityData['university_name_ar'] ?? 'جامعة فيرتكس' }}
                        </p>
                    </div>
                    <div class="mt-4 text-center text-xs text-gray-500">
                        <p>{{ $documentsData['document_footer_text_en'] ?? 'Official Document' }}</p>
                    </div>
                </div>
            </div>
        </x-filament::section>
    </div>
</x-filament-panels::page>
