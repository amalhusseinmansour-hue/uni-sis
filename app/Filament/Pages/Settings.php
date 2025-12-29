<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Tabs;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class Settings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static string $view = 'filament.pages.settings';

    protected static ?int $navigationSort = 100;

    public ?array $data = [];

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.system_management');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.settings.title');
    }

    public function getTitle(): string
    {
        return __('filament.settings.title');
    }

    public function mount(): void
    {
        $this->form->fill([
            // General Settings
            'site_name_en' => Setting::get('site_name_en', 'VERTIX UNIVERSITY'),
            'site_name_ar' => Setting::get('site_name_ar', 'جامعة فيرتكس'),
            'site_description_en' => Setting::get('site_description_en', ''),
            'site_description_ar' => Setting::get('site_description_ar', ''),
            'site_logo' => Setting::get('site_logo', ''),
            'site_favicon' => Setting::get('site_favicon', ''),

            // Contact Settings
            'contact_email' => Setting::get('contact_email', ''),
            'contact_phone' => Setting::get('contact_phone', ''),
            'contact_address_en' => Setting::get('contact_address_en', ''),
            'contact_address_ar' => Setting::get('contact_address_ar', ''),

            // Academic Settings
            'current_academic_year' => Setting::get('current_academic_year', date('Y') . '-' . (date('Y') + 1)),
            'max_credits_per_semester' => Setting::get('max_credits_per_semester', '21'),
            'min_credits_per_semester' => Setting::get('min_credits_per_semester', '12'),
            'passing_grade' => Setting::get('passing_grade', '60'),
            'gpa_scale' => Setting::get('gpa_scale', '4.0'),

            // Registration Settings
            'registration_open' => Setting::get('registration_open', '1') === '1',
            'late_registration_allowed' => Setting::get('late_registration_allowed', '0') === '1',
            'drop_deadline_days' => Setting::get('drop_deadline_days', '14'),
            'withdrawal_deadline_days' => Setting::get('withdrawal_deadline_days', '30'),

            // Financial Settings
            'currency' => Setting::get('currency', 'USD'),
            'currency_symbol' => Setting::get('currency_symbol', '$'),
            'payment_due_days' => Setting::get('payment_due_days', '30'),
            'late_payment_fee' => Setting::get('late_payment_fee', '50'),

            // Email Settings
            'smtp_enabled' => Setting::get('smtp_enabled', '0') === '1',
            'mail_from_name' => Setting::get('mail_from_name', ''),
            'mail_from_address' => Setting::get('mail_from_address', ''),

            // System Settings
            'maintenance_mode' => Setting::get('maintenance_mode', '0') === '1',
            'default_language' => Setting::get('default_language', 'en'),
            'timezone' => Setting::get('timezone', 'UTC'),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Tabs::make('Settings')
                    ->tabs([
                        Tabs\Tab::make(__('filament.settings.general'))
                            ->icon('heroicon-o-building-office')
                            ->schema([
                                Section::make(__('filament.settings.site_information'))
                                    ->columns(2)
                                    ->schema([
                                        TextInput::make('site_name_en')
                                            ->label(__('filament.settings.site_name_en'))
                                            ->required(),
                                        TextInput::make('site_name_ar')
                                            ->label(__('filament.settings.site_name_ar'))
                                            ->required(),
                                        Textarea::make('site_description_en')
                                            ->label(__('filament.settings.site_description_en'))
                                            ->rows(3),
                                        Textarea::make('site_description_ar')
                                            ->label(__('filament.settings.site_description_ar'))
                                            ->rows(3),
                                        FileUpload::make('site_logo')
                                            ->label(__('filament.settings.site_logo'))
                                            ->image()
                                            ->directory('settings'),
                                        FileUpload::make('site_favicon')
                                            ->label(__('filament.settings.site_favicon'))
                                            ->image()
                                            ->directory('settings'),
                                    ]),
                                Section::make(__('filament.settings.contact_information'))
                                    ->columns(2)
                                    ->schema([
                                        TextInput::make('contact_email')
                                            ->label(__('filament.settings.contact_email'))
                                            ->email(),
                                        TextInput::make('contact_phone')
                                            ->label(__('filament.settings.contact_phone'))
                                            ->tel(),
                                        Textarea::make('contact_address_en')
                                            ->label(__('filament.settings.contact_address_en'))
                                            ->rows(2),
                                        Textarea::make('contact_address_ar')
                                            ->label(__('filament.settings.contact_address_ar'))
                                            ->rows(2),
                                    ]),
                            ]),

                        Tabs\Tab::make(__('filament.settings.academic'))
                            ->icon('heroicon-o-academic-cap')
                            ->schema([
                                Section::make(__('filament.settings.academic_settings'))
                                    ->columns(2)
                                    ->schema([
                                        TextInput::make('current_academic_year')
                                            ->label(__('filament.settings.current_academic_year'))
                                            ->required(),
                                        Select::make('gpa_scale')
                                            ->label(__('filament.settings.gpa_scale'))
                                            ->options([
                                                '4.0' => '4.0',
                                                '5.0' => '5.0',
                                            ])
                                            ->required(),
                                        TextInput::make('max_credits_per_semester')
                                            ->label(__('filament.settings.max_credits'))
                                            ->numeric()
                                            ->required(),
                                        TextInput::make('min_credits_per_semester')
                                            ->label(__('filament.settings.min_credits'))
                                            ->numeric()
                                            ->required(),
                                        TextInput::make('passing_grade')
                                            ->label(__('filament.settings.passing_grade'))
                                            ->numeric()
                                            ->suffix('%')
                                            ->required(),
                                    ]),
                            ]),

                        Tabs\Tab::make(__('filament.settings.registration'))
                            ->icon('heroicon-o-clipboard-document-list')
                            ->schema([
                                Section::make(__('filament.settings.registration_settings'))
                                    ->columns(2)
                                    ->schema([
                                        Toggle::make('registration_open')
                                            ->label(__('filament.settings.registration_open'))
                                            ->helperText(__('filament.settings.registration_open_help')),
                                        Toggle::make('late_registration_allowed')
                                            ->label(__('filament.settings.late_registration')),
                                        TextInput::make('drop_deadline_days')
                                            ->label(__('filament.settings.drop_deadline'))
                                            ->numeric()
                                            ->suffix(__('filament.settings.days')),
                                        TextInput::make('withdrawal_deadline_days')
                                            ->label(__('filament.settings.withdrawal_deadline'))
                                            ->numeric()
                                            ->suffix(__('filament.settings.days')),
                                    ]),
                            ]),

                        Tabs\Tab::make(__('filament.settings.financial'))
                            ->icon('heroicon-o-banknotes')
                            ->schema([
                                Section::make(__('filament.settings.financial_settings'))
                                    ->columns(2)
                                    ->schema([
                                        Select::make('currency')
                                            ->label(__('filament.settings.currency'))
                                            ->options([
                                                'USD' => 'USD - US Dollar',
                                                'EUR' => 'EUR - Euro',
                                                'GBP' => 'GBP - British Pound',
                                                'SAR' => 'SAR - Saudi Riyal',
                                                'AED' => 'AED - UAE Dirham',
                                                'EGP' => 'EGP - Egyptian Pound',
                                                'JOD' => 'JOD - Jordanian Dinar',
                                            ])
                                            ->required(),
                                        TextInput::make('currency_symbol')
                                            ->label(__('filament.settings.currency_symbol'))
                                            ->required(),
                                        TextInput::make('payment_due_days')
                                            ->label(__('filament.settings.payment_due_days'))
                                            ->numeric()
                                            ->suffix(__('filament.settings.days')),
                                        TextInput::make('late_payment_fee')
                                            ->label(__('filament.settings.late_payment_fee'))
                                            ->numeric()
                                            ->prefix('$'),
                                    ]),
                            ]),

                        Tabs\Tab::make(__('filament.settings.system'))
                            ->icon('heroicon-o-cog-6-tooth')
                            ->schema([
                                Section::make(__('filament.settings.system_settings'))
                                    ->columns(2)
                                    ->schema([
                                        Select::make('default_language')
                                            ->label(__('filament.settings.default_language'))
                                            ->options([
                                                'en' => 'English',
                                                'ar' => 'العربية',
                                            ])
                                            ->required(),
                                        Select::make('timezone')
                                            ->label(__('filament.settings.timezone'))
                                            ->options([
                                                'UTC' => 'UTC',
                                                'Asia/Riyadh' => 'Asia/Riyadh (GMT+3)',
                                                'Asia/Dubai' => 'Asia/Dubai (GMT+4)',
                                                'Africa/Cairo' => 'Africa/Cairo (GMT+2)',
                                                'Asia/Amman' => 'Asia/Amman (GMT+3)',
                                                'Europe/London' => 'Europe/London (GMT+0)',
                                                'America/New_York' => 'America/New_York (GMT-5)',
                                            ])
                                            ->searchable()
                                            ->required(),
                                        Toggle::make('maintenance_mode')
                                            ->label(__('filament.settings.maintenance_mode'))
                                            ->helperText(__('filament.settings.maintenance_mode_help')),
                                        Toggle::make('smtp_enabled')
                                            ->label(__('filament.settings.smtp_enabled')),
                                        TextInput::make('mail_from_name')
                                            ->label(__('filament.settings.mail_from_name')),
                                        TextInput::make('mail_from_address')
                                            ->label(__('filament.settings.mail_from_address'))
                                            ->email(),
                                    ]),
                            ]),
                    ])
                    ->columnSpanFull(),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach ($data as $key => $value) {
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }
            Setting::set($key, $value);
        }

        Notification::make()
            ->title(__('filament.settings.saved'))
            ->success()
            ->send();
    }
}
