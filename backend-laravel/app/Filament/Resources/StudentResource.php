<?php

namespace App\Filament\Resources;

use App\Filament\Resources\StudentResource\Pages;
use App\Filament\Resources\StudentResource\RelationManagers;
use App\Models\Student;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class StudentResource extends Resource
{
    protected static ?string $model = Student::class;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?int $navigationSort = 1;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.academic_management');
    }

    public static function getModelLabel(): string
    {
        return __('filament.student.singular');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.student.plural');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.navigation.students');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Wizard::make([
                    // ========================================
                    // Step 1: Personal Information (Required)
                    // ========================================
                    Forms\Components\Wizard\Step::make('Personal Information')
                        ->icon('heroicon-o-user')
                        ->description('Basic student information')
                        ->completedIcon('heroicon-o-check-circle')
                        ->schema([
                            Forms\Components\Section::make('Basic Information')
                                ->description('Enter the student\'s basic personal details')
                                ->icon('heroicon-o-identification')
                                ->columns(2)
                                ->schema([
                                    Forms\Components\TextInput::make('name_ar')
                                        ->label('Full Name (Arabic)')
                                        ->placeholder('الاسم الكامل بالعربية')
                                        ->required()
                                        ->maxLength(255)
                                        ->validationMessages([
                                            'required' => 'Arabic name is required',
                                        ]),
                                    Forms\Components\TextInput::make('name_en')
                                        ->label('Full Name (English)')
                                        ->placeholder('Full name in English')
                                        ->required()
                                        ->maxLength(255)
                                        ->validationMessages([
                                            'required' => 'English name is required',
                                        ]),
                                    Forms\Components\TextInput::make('national_id')
                                        ->label('National ID / Passport')
                                        ->placeholder('Enter ID or Passport number')
                                        ->required()
                                        ->unique(ignoreRecord: true)
                                        ->validationMessages([
                                            'required' => 'National ID is required',
                                            'unique' => 'This ID is already registered',
                                        ]),
                                    Forms\Components\DatePicker::make('date_of_birth')
                                        ->label('Date of Birth')
                                        ->required()
                                        ->maxDate(now()->subYears(15))
                                        ->displayFormat('d/m/Y')
                                        ->validationMessages([
                                            'required' => 'Date of birth is required',
                                        ]),
                                    Forms\Components\Select::make('gender')
                                        ->label('Gender')
                                        ->options([
                                            'MALE' => 'Male',
                                            'FEMALE' => 'Female',
                                        ])
                                        ->required()
                                        ->native(false)
                                        ->validationMessages([
                                            'required' => 'Gender is required',
                                        ]),
                                    Forms\Components\TextInput::make('nationality')
                                        ->label('Nationality')
                                        ->placeholder('e.g., Saudi, Egyptian, etc.')
                                        ->required()
                                        ->validationMessages([
                                            'required' => 'Nationality is required',
                                        ]),
                                    Forms\Components\Select::make('marital_status')
                                        ->label('Marital Status')
                                        ->options([
                                            'SINGLE' => 'Single',
                                            'MARRIED' => 'Married',
                                            'DIVORCED' => 'Divorced',
                                            'WIDOWED' => 'Widowed',
                                        ])
                                        ->default('SINGLE')
                                        ->native(false),
                                    Forms\Components\TextInput::make('birth_country')
                                        ->label('Country of Birth')
                                        ->placeholder('Country'),
                                ]),
                        ]),

                    // ========================================
                    // Step 2: Contact Information (Required)
                    // ========================================
                    Forms\Components\Wizard\Step::make('Contact Information')
                        ->icon('heroicon-o-phone')
                        ->description('Contact details and address')
                        ->completedIcon('heroicon-o-check-circle')
                        ->schema([
                            Forms\Components\Section::make('Contact Details')
                                ->description('How can we reach the student?')
                                ->icon('heroicon-o-envelope')
                                ->columns(2)
                                ->schema([
                                    Forms\Components\TextInput::make('phone')
                                        ->label('Mobile Phone')
                                        ->placeholder('+966 5XX XXX XXXX')
                                        ->tel()
                                        ->required()
                                        ->validationMessages([
                                            'required' => 'Phone number is required',
                                        ]),
                                    Forms\Components\TextInput::make('alternative_phone')
                                        ->label('Alternative Phone')
                                        ->placeholder('Optional')
                                        ->tel(),
                                    Forms\Components\TextInput::make('personal_email')
                                        ->label('Personal Email')
                                        ->placeholder('personal@email.com')
                                        ->email()
                                        ->required()
                                        ->validationMessages([
                                            'required' => 'Personal email is required',
                                            'email' => 'Please enter a valid email',
                                        ]),
                                    Forms\Components\TextInput::make('university_email')
                                        ->label('University Email')
                                        ->placeholder('Will be used for login')
                                        ->email()
                                        ->required()
                                        ->unique(ignoreRecord: true)
                                        ->helperText('This email will be used for system login')
                                        ->validationMessages([
                                            'required' => 'University email is required',
                                            'unique' => 'This email is already in use',
                                        ]),
                                    Forms\Components\TextInput::make('password')
                                        ->label('Login Password')
                                        ->placeholder('Enter password for student login')
                                        ->password()
                                        ->required()
                                        ->minLength(6)
                                        ->helperText('Student will use this password with Student ID or Email to login')
                                        ->validationMessages([
                                            'required' => 'Password is required',
                                            'min' => 'Password must be at least 6 characters',
                                        ])
                                        ->visibleOn('create'),
                                ]),
                            Forms\Components\Section::make('Address')
                                ->description('Current residence address')
                                ->icon('heroicon-o-map-pin')
                                ->columns(2)
                                ->collapsible()
                                ->schema([
                                    Forms\Components\TextInput::make('address_country')
                                        ->label('Country'),
                                    Forms\Components\TextInput::make('address_city')
                                        ->label('City'),
                                    Forms\Components\TextInput::make('address_street')
                                        ->label('Street Address')
                                        ->columnSpanFull(),
                                    Forms\Components\TextInput::make('postal_code')
                                        ->label('Postal Code'),
                                ]),
                        ]),

                    // ========================================
                    // Step 3: Academic Information (Required)
                    // ========================================
                    Forms\Components\Wizard\Step::make('Academic Information')
                        ->icon('heroicon-o-academic-cap')
                        ->description('Program and academic details')
                        ->completedIcon('heroicon-o-check-circle')
                        ->schema([
                            Forms\Components\Section::make('Student ID')
                                ->description('Unique student identifier')
                                ->icon('heroicon-o-finger-print')
                                ->columns(2)
                                ->schema([
                                    Forms\Components\Placeholder::make('student_id_preview')
                                        ->label('Auto-Generated Student ID')
                                        ->content(fn () => Student::getNextStudentId())
                                        ->helperText('This ID will be assigned automatically'),
                                    Forms\Components\TextInput::make('student_id')
                                        ->label('Custom Student ID (Optional)')
                                        ->placeholder('Leave empty for auto-generation')
                                        ->unique(ignoreRecord: true)
                                        ->helperText('Only fill if you need a specific ID'),
                                ]),
                            Forms\Components\Section::make('Program Details')
                                ->description('Academic program information')
                                ->icon('heroicon-o-book-open')
                                ->columns(2)
                                ->schema([
                                    Forms\Components\Select::make('program_id')
                                        ->label('Academic Program')
                                        ->relationship('program', 'name_en')
                                        ->searchable()
                                        ->preload()
                                        ->required()
                                        ->live()
                                        ->afterStateUpdated(function (Set $set, $state) {
                                            if ($state) {
                                                $program = \App\Models\Program::find($state);
                                                if ($program) {
                                                    $set('college', $program->college ?? '');
                                                    $set('department', $program->department ?? '');
                                                    $set('major', $program->name_en ?? '');
                                                }
                                            }
                                        })
                                        ->validationMessages([
                                            'required' => 'Please select a program',
                                        ]),
                                    Forms\Components\Select::make('program_type')
                                        ->label('Degree Type')
                                        ->options([
                                            'BACHELOR' => 'Bachelor\'s Degree',
                                            'MASTER' => 'Master\'s Degree',
                                            'PHD' => 'Doctorate (PhD)',
                                            'DIPLOMA' => 'Diploma',
                                        ])
                                        ->required()
                                        ->default('BACHELOR')
                                        ->native(false),
                                    Forms\Components\TextInput::make('college')
                                        ->label('College/Faculty')
                                        ->placeholder('Auto-filled from program'),
                                    Forms\Components\TextInput::make('department')
                                        ->label('Department')
                                        ->placeholder('Auto-filled from program'),
                                    Forms\Components\TextInput::make('major')
                                        ->label('Major/Specialization')
                                        ->placeholder('Auto-filled from program'),
                                    Forms\Components\DatePicker::make('admission_date')
                                        ->label('Admission Date')
                                        ->required()
                                        ->default(now())
                                        ->displayFormat('d/m/Y'),
                                    Forms\Components\TextInput::make('level')
                                        ->label('Academic Level')
                                        ->numeric()
                                        ->default(1)
                                        ->required()
                                        ->minValue(1)
                                        ->maxValue(10),
                                    Forms\Components\Select::make('status')
                                        ->label('Student Status')
                                        ->options([
                                            'ACTIVE' => 'Active',
                                            'SUSPENDED' => 'Suspended',
                                            'GRADUATED' => 'Graduated',
                                            'WITHDRAWN' => 'Withdrawn',
                                        ])
                                        ->required()
                                        ->default('ACTIVE')
                                        ->native(false),
                                ]),
                        ]),

                    // ========================================
                    // Step 4: Guardian & Emergency (Optional)
                    // ========================================
                    Forms\Components\Wizard\Step::make('Guardian & Emergency')
                        ->icon('heroicon-o-users')
                        ->description('Guardian and emergency contacts')
                        ->completedIcon('heroicon-o-check-circle')
                        ->schema([
                            Forms\Components\Section::make('Guardian Information')
                                ->description('Parent or legal guardian details')
                                ->icon('heroicon-o-user-group')
                                ->columns(2)
                                ->collapsible()
                                ->schema([
                                    Forms\Components\TextInput::make('guardian_name')
                                        ->label('Guardian Name'),
                                    Forms\Components\Select::make('guardian_relationship')
                                        ->label('Relationship')
                                        ->options([
                                            'FATHER' => 'Father',
                                            'MOTHER' => 'Mother',
                                            'BROTHER' => 'Brother',
                                            'SISTER' => 'Sister',
                                            'SPOUSE' => 'Spouse',
                                            'GUARDIAN' => 'Legal Guardian',
                                            'OTHER' => 'Other',
                                        ])
                                        ->native(false),
                                    Forms\Components\TextInput::make('guardian_phone')
                                        ->label('Guardian Phone')
                                        ->tel(),
                                    Forms\Components\TextInput::make('guardian_email')
                                        ->label('Guardian Email')
                                        ->email(),
                                ]),
                            Forms\Components\Section::make('Emergency Contact')
                                ->description('Person to contact in case of emergency')
                                ->icon('heroicon-o-exclamation-triangle')
                                ->columns(3)
                                ->collapsible()
                                ->schema([
                                    Forms\Components\TextInput::make('emergency_name')
                                        ->label('Contact Name'),
                                    Forms\Components\TextInput::make('emergency_phone')
                                        ->label('Contact Phone')
                                        ->tel(),
                                    Forms\Components\Select::make('emergency_relationship')
                                        ->label('Relationship')
                                        ->options([
                                            'FATHER' => 'Father',
                                            'MOTHER' => 'Mother',
                                            'BROTHER' => 'Brother',
                                            'SISTER' => 'Sister',
                                            'SPOUSE' => 'Spouse',
                                            'FRIEND' => 'Friend',
                                            'OTHER' => 'Other',
                                        ])
                                        ->native(false),
                                ]),
                        ]),

                    // ========================================
                    // Step 5: Review & Confirm
                    // ========================================
                    Forms\Components\Wizard\Step::make('Review & Confirm')
                        ->icon('heroicon-o-check')
                        ->description('Review all information before saving')
                        ->completedIcon('heroicon-o-check-circle')
                        ->schema([
                            Forms\Components\Section::make('Summary')
                                ->description('Please review all the information before creating the student')
                                ->icon('heroicon-o-clipboard-document-check')
                                ->schema([
                                    Forms\Components\Placeholder::make('review_notice')
                                        ->content('A user account will be automatically created with the university email. The student will receive login credentials.')
                                        ->columnSpanFull(),
                                    Forms\Components\Grid::make(3)
                                        ->schema([
                                            Forms\Components\Placeholder::make('summary_name')
                                                ->label('Student Name')
                                                ->content(fn (Get $get) => $get('name_en') ?: '-'),
                                            Forms\Components\Placeholder::make('summary_email')
                                                ->label('University Email')
                                                ->content(fn (Get $get) => $get('university_email') ?: '-'),
                                            Forms\Components\Placeholder::make('summary_program')
                                                ->label('Program')
                                                ->content(fn (Get $get) => $get('major') ?: '-'),
                                        ]),
                                    // Hidden fields with default values
                                    Forms\Components\Hidden::make('academic_status')
                                        ->default('REGULAR'),
                                    Forms\Components\Hidden::make('financial_status')
                                        ->default('CLEARED'),
                                    Forms\Components\Hidden::make('account_status')
                                        ->default('ACTIVE'),
                                    Forms\Components\Hidden::make('gpa')
                                        ->default(0),
                                    Forms\Components\Hidden::make('completed_credits')
                                        ->default(0),
                                    Forms\Components\Hidden::make('registered_credits')
                                        ->default(0),
                                ]),
                        ]),
                ])
                ->skippable(false) // Cannot skip steps
                ->persistStepInQueryString() // Remember step in URL
                ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('student_id')
                    ->label('Student ID')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name_en')
                    ->label('Name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name_ar')
                    ->label('Arabic Name')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'ACTIVE',
                        'warning' => 'SUSPENDED',
                        'primary' => 'GRADUATED',
                        'danger' => 'WITHDRAWN',
                    ]),
                Tables\Columns\TextColumn::make('program_type')
                    ->badge(),
                Tables\Columns\TextColumn::make('college')
                    ->searchable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('major')
                    ->searchable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('level')
                    ->sortable(),
                Tables\Columns\TextColumn::make('gpa')
                    ->label('GPA')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('academic_status')
                    ->colors([
                        'success' => 'REGULAR',
                        'warning' => 'ON_PROBATION',
                        'danger' => 'DISMISSED',
                        'primary' => 'COMPLETED_REQUIREMENTS',
                    ]),
                Tables\Columns\BadgeColumn::make('financial_status')
                    ->colors([
                        'success' => 'CLEARED',
                        'danger' => 'ON_HOLD',
                    ]),
                Tables\Columns\TextColumn::make('phone')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('university_email')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'ACTIVE' => 'Active',
                        'SUSPENDED' => 'Suspended',
                        'GRADUATED' => 'Graduated',
                        'WITHDRAWN' => 'Withdrawn',
                    ]),
                Tables\Filters\SelectFilter::make('program_type')
                    ->options([
                        'BACHELOR' => 'Bachelor',
                        'MASTER' => 'Master',
                        'PHD' => 'PhD',
                    ]),
                Tables\Filters\SelectFilter::make('academic_status')
                    ->options([
                        'REGULAR' => 'Regular',
                        'ON_PROBATION' => 'On Probation',
                        'DISMISSED' => 'Dismissed',
                        'COMPLETED_REQUIREMENTS' => 'Completed Requirements',
                    ]),
                Tables\Filters\SelectFilter::make('financial_status')
                    ->options([
                        'CLEARED' => 'Cleared',
                        'ON_HOLD' => 'On Hold',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultPaginationPageOption(25)
            ->paginationPageOptions([10, 25, 50])
            ->poll('60s')
            ->deferLoading();
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\EnrollmentsRelationManager::class,
            RelationManagers\GradesRelationManager::class,
            RelationManagers\FinancialRecordsRelationManager::class,
            RelationManagers\DocumentsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListStudents::route('/'),
            'create' => Pages\CreateStudent::route('/create'),
            'view' => Pages\ViewStudent::route('/{record}'),
            'edit' => Pages\EditStudent::route('/{record}/edit'),
        ];
    }
}
