<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Storage;

class UniversitySettings extends Page implements Forms\Contracts\HasForms
{
    use Forms\Concerns\InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static ?string $navigationLabel = 'University Settings';
    protected static ?string $navigationGroup = 'Settings';
    protected static ?int $navigationSort = 1;
    protected static string $view = 'filament.pages.university-settings';

    public ?array $universityData = [];
    public ?array $idCardData = [];
    public ?array $documentsData = [];

    public function mount(): void
    {
        $this->loadSettings();
    }

    protected function loadSettings(): void
    {
        // Load university settings
        $universitySettings = Setting::where('group', 'university')->get();
        foreach ($universitySettings as $setting) {
            $this->universityData[$setting->key] = $setting->value;
        }

        // Load ID card settings
        $idCardSettings = Setting::where('group', 'id_card')->get();
        foreach ($idCardSettings as $setting) {
            $this->idCardData[$setting->key] = $setting->value;
        }

        // Load document settings
        $documentSettings = Setting::where('group', 'documents')->get();
        foreach ($documentSettings as $setting) {
            $this->documentsData[$setting->key] = $setting->value;
        }
    }

    public function universityForm(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('University Information')
                    ->description('Basic university details shown on documents and ID cards')
                    ->icon('heroicon-o-building-library')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('university_name_en')
                                    ->label('University Name (English)')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('university_name_ar')
                                    ->label('University Name (Arabic)')
                                    ->required()
                                    ->maxLength(255),
                            ]),
                        Forms\Components\FileUpload::make('university_logo')
                            ->label('University Logo')
                            ->image()
                            ->disk('public')
                            ->directory('settings/logos')
                            ->imageEditor()
                            ->helperText('Recommended: PNG with transparent background, 500x500px'),
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('university_email')
                                    ->label('Email')
                                    ->email()
                                    ->required(),
                                Forms\Components\TextInput::make('university_phone')
                                    ->label('Phone')
                                    ->tel(),
                            ]),
                        Forms\Components\TextInput::make('university_website')
                            ->label('Website')
                            ->url()
                            ->prefixIcon('heroicon-o-globe-alt'),
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\Textarea::make('university_address_en')
                                    ->label('Address (English)')
                                    ->rows(2),
                                Forms\Components\Textarea::make('university_address_ar')
                                    ->label('Address (Arabic)')
                                    ->rows(2),
                            ]),
                    ]),
            ])
            ->statePath('universityData');
    }

    public function idCardForm(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('ID Card Settings')
                    ->description('Customize the student ID card appearance')
                    ->icon('heroicon-o-identification')
                    ->schema([
                        Forms\Components\TextInput::make('id_card_validity_months')
                            ->label('Card Validity (Months)')
                            ->numeric()
                            ->default(6)
                            ->helperText('How long the ID card is valid for'),
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\ColorPicker::make('id_card_background_color')
                                    ->label('Background Color')
                                    ->default('#1e293b'),
                                Forms\Components\ColorPicker::make('id_card_accent_color')
                                    ->label('Accent Color')
                                    ->default('#eab308'),
                            ]),
                    ]),
            ])
            ->statePath('idCardData');
    }

    public function documentsForm(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Document Templates')
                    ->description('Configure headers, footers, and signatures for official documents')
                    ->icon('heroicon-o-document-text')
                    ->schema([
                        Forms\Components\FileUpload::make('document_header_logo')
                            ->label('Document Header Logo')
                            ->image()
                            ->disk('public')
                            ->directory('settings/documents')
                            ->helperText('Logo to appear on document headers'),
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\Textarea::make('document_footer_text_en')
                                    ->label('Footer Text (English)')
                                    ->rows(2),
                                Forms\Components\Textarea::make('document_footer_text_ar')
                                    ->label('Footer Text (Arabic)')
                                    ->rows(2),
                            ]),
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\FileUpload::make('registrar_signature')
                                    ->label('Registrar Signature')
                                    ->image()
                                    ->disk('public')
                                    ->directory('settings/signatures'),
                                Forms\Components\FileUpload::make('dean_signature')
                                    ->label('Dean Signature')
                                    ->image()
                                    ->disk('public')
                                    ->directory('settings/signatures'),
                            ]),
                    ]),
            ])
            ->statePath('documentsData');
    }

    protected function getForms(): array
    {
        return [
            'universityForm',
            'idCardForm',
            'documentsForm',
        ];
    }

    public function saveUniversity(): void
    {
        $data = $this->universityForm->getState();
        $this->saveSettings($data, 'university');

        Notification::make()
            ->title('University settings saved')
            ->success()
            ->send();
    }

    public function saveIdCard(): void
    {
        $data = $this->idCardForm->getState();
        $this->saveSettings($data, 'id_card');

        Notification::make()
            ->title('ID Card settings saved')
            ->success()
            ->send();
    }

    public function saveDocuments(): void
    {
        $data = $this->documentsForm->getState();
        $this->saveSettings($data, 'documents');

        Notification::make()
            ->title('Document settings saved')
            ->success()
            ->send();
    }

    protected function saveSettings(array $data, string $group): void
    {
        foreach ($data as $key => $value) {
            $setting = Setting::where('key', $key)->first();

            if ($setting) {
                $setting->update(['value' => $value]);
            }
        }

        // Clear cache
        Setting::clearCache();
    }

    public static function getNavigationBadge(): ?string
    {
        return null;
    }
}
