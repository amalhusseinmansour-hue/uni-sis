<?php

namespace App\Filament\Resources;

use App\Filament\Resources\StudentResource\Pages;
use App\Filament\Resources\StudentResource\RelationManagers;
use App\Models\Student;
use Filament\Forms;
use Filament\Forms\Form;
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
                Forms\Components\Tabs::make('Student Information')
                    ->tabs([
                        Forms\Components\Tabs\Tab::make('Basic Info')
                            ->icon('heroicon-o-user')
                            ->schema([
                                Forms\Components\Section::make('Student Identity')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('student_id')
                                            ->label('Student ID')
                                            ->required()
                                            ->unique(ignoreRecord: true),
                                        Forms\Components\TextInput::make('name_ar')
                                            ->label('Name (Arabic)')
                                            ->required(),
                                        Forms\Components\TextInput::make('name_en')
                                            ->label('Name (English)')
                                            ->required(),
                                        Forms\Components\Select::make('status')
                                            ->options([
                                                'ACTIVE' => 'Active',
                                                'SUSPENDED' => 'Suspended',
                                                'GRADUATED' => 'Graduated',
                                                'WITHDRAWN' => 'Withdrawn',
                                            ])
                                            ->required()
                                            ->default('ACTIVE'),
                                        Forms\Components\Select::make('program_type')
                                            ->options([
                                                'BACHELOR' => 'Bachelor',
                                                'MASTER' => 'Master',
                                                'PHD' => 'PhD',
                                            ])
                                            ->required()
                                            ->default('BACHELOR'),
                                        Forms\Components\Select::make('user_id')
                                            ->relationship('user', 'name')
                                            ->required()
                                            ->searchable()
                                            ->preload()
                                            ->createOptionForm([
                                                Forms\Components\TextInput::make('name')
                                                    ->required(),
                                                Forms\Components\TextInput::make('email')
                                                    ->email()
                                                    ->required(),
                                                Forms\Components\TextInput::make('password')
                                                    ->password()
                                                    ->required(),
                                            ]),
                                    ]),
                                Forms\Components\Section::make('Personal Data')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('national_id')
                                            ->label('National ID')
                                            ->required()
                                            ->unique(ignoreRecord: true),
                                        Forms\Components\TextInput::make('passport_number')
                                            ->label('Passport Number'),
                                        Forms\Components\DatePicker::make('date_of_birth')
                                            ->label('Date of Birth')
                                            ->required(),
                                        Forms\Components\TextInput::make('birth_city')
                                            ->label('Birth City'),
                                        Forms\Components\TextInput::make('birth_country')
                                            ->label('Birth Country'),
                                        Forms\Components\Select::make('gender')
                                            ->options([
                                                'MALE' => 'Male',
                                                'FEMALE' => 'Female',
                                            ])
                                            ->required(),
                                        Forms\Components\TextInput::make('nationality')
                                            ->required(),
                                        Forms\Components\Select::make('marital_status')
                                            ->options([
                                                'SINGLE' => 'Single',
                                                'MARRIED' => 'Married',
                                                'DIVORCED' => 'Divorced',
                                                'WIDOWED' => 'Widowed',
                                            ])
                                            ->required()
                                            ->default('SINGLE'),
                                        Forms\Components\DatePicker::make('admission_date')
                                            ->label('Admission Date')
                                            ->required(),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Contact Info')
                            ->icon('heroicon-o-phone')
                            ->schema([
                                Forms\Components\Section::make('Contact Information')
                                    ->columns(2)
                                    ->schema([
                                        Forms\Components\TextInput::make('phone')
                                            ->tel()
                                            ->required(),
                                        Forms\Components\TextInput::make('alternative_phone')
                                            ->tel(),
                                        Forms\Components\TextInput::make('personal_email')
                                            ->email()
                                            ->required(),
                                        Forms\Components\TextInput::make('university_email')
                                            ->email()
                                            ->required()
                                            ->unique(ignoreRecord: true),
                                    ]),
                                Forms\Components\Section::make('Address')
                                    ->columns(2)
                                    ->schema([
                                        Forms\Components\TextInput::make('address_country'),
                                        Forms\Components\TextInput::make('address_city'),
                                        Forms\Components\TextInput::make('address_street'),
                                        Forms\Components\TextInput::make('postal_code'),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Guardian & Emergency')
                            ->icon('heroicon-o-users')
                            ->schema([
                                Forms\Components\Section::make('Guardian Information')
                                    ->columns(2)
                                    ->schema([
                                        Forms\Components\TextInput::make('guardian_name'),
                                        Forms\Components\Select::make('guardian_relationship')
                                            ->options([
                                                'FATHER' => 'Father',
                                                'MOTHER' => 'Mother',
                                                'BROTHER' => 'Brother',
                                                'SISTER' => 'Sister',
                                                'SPOUSE' => 'Spouse',
                                                'GUARDIAN' => 'Guardian',
                                                'OTHER' => 'Other',
                                            ]),
                                        Forms\Components\TextInput::make('guardian_phone')->tel(),
                                        Forms\Components\TextInput::make('guardian_email')->email(),
                                        Forms\Components\TextInput::make('guardian_address')
                                            ->columnSpanFull(),
                                    ]),
                                Forms\Components\Section::make('Emergency Contact')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('emergency_name'),
                                        Forms\Components\TextInput::make('emergency_phone')->tel(),
                                        Forms\Components\Select::make('emergency_relationship')
                                            ->options([
                                                'FATHER' => 'Father',
                                                'MOTHER' => 'Mother',
                                                'BROTHER' => 'Brother',
                                                'SISTER' => 'Sister',
                                                'SPOUSE' => 'Spouse',
                                                'GUARDIAN' => 'Guardian',
                                                'OTHER' => 'Other',
                                            ]),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Academic')
                            ->icon('heroicon-o-book-open')
                            ->schema([
                                Forms\Components\Section::make('Program Information')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\Select::make('program_id')
                                            ->relationship('program', 'name_en')
                                            ->required()
                                            ->searchable()
                                            ->preload(),
                                        Forms\Components\Select::make('advisor_id')
                                            ->relationship('advisor', 'name')
                                            ->searchable()
                                            ->preload(),
                                        Forms\Components\TextInput::make('college'),
                                        Forms\Components\TextInput::make('department'),
                                        Forms\Components\TextInput::make('major'),
                                        Forms\Components\TextInput::make('degree'),
                                        Forms\Components\TextInput::make('study_plan_code'),
                                        Forms\Components\TextInput::make('study_plan_name'),
                                        Forms\Components\TextInput::make('cohort'),
                                    ]),
                                Forms\Components\Section::make('Academic Status')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('level')
                                            ->numeric()
                                            ->default(1)
                                            ->required(),
                                        Forms\Components\TextInput::make('current_semester'),
                                        Forms\Components\Select::make('academic_status')
                                            ->options([
                                                'REGULAR' => 'Regular',
                                                'ON_PROBATION' => 'On Probation',
                                                'DISMISSED' => 'Dismissed',
                                                'COMPLETED_REQUIREMENTS' => 'Completed Requirements',
                                            ])
                                            ->required()
                                            ->default('REGULAR'),
                                    ]),
                                Forms\Components\Section::make('Credits & GPA')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('total_required_credits')
                                            ->numeric()
                                            ->default(0),
                                        Forms\Components\TextInput::make('completed_credits')
                                            ->numeric()
                                            ->default(0),
                                        Forms\Components\TextInput::make('registered_credits')
                                            ->numeric()
                                            ->default(0),
                                        Forms\Components\TextInput::make('remaining_credits')
                                            ->numeric()
                                            ->default(0),
                                        Forms\Components\TextInput::make('term_gpa')
                                            ->numeric()
                                            ->default(0)
                                            ->step(0.01),
                                        Forms\Components\TextInput::make('gpa')
                                            ->label('Cumulative GPA')
                                            ->numeric()
                                            ->default(0)
                                            ->step(0.01),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Financial')
                            ->icon('heroicon-o-currency-dollar')
                            ->schema([
                                Forms\Components\Section::make('Financial Summary')
                                    ->columns(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('total_fees')
                                            ->numeric()
                                            ->prefix('$')
                                            ->default(0),
                                        Forms\Components\TextInput::make('paid_amount')
                                            ->numeric()
                                            ->prefix('$')
                                            ->default(0),
                                        Forms\Components\TextInput::make('current_balance')
                                            ->numeric()
                                            ->prefix('$')
                                            ->default(0),
                                        Forms\Components\TextInput::make('previous_balance')
                                            ->numeric()
                                            ->prefix('$')
                                            ->default(0),
                                        Forms\Components\TextInput::make('scholarships')
                                            ->numeric()
                                            ->prefix('$')
                                            ->default(0),
                                        Forms\Components\Select::make('financial_status')
                                            ->options([
                                                'CLEARED' => 'Cleared',
                                                'ON_HOLD' => 'On Hold',
                                            ])
                                            ->required()
                                            ->default('CLEARED'),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('System Access')
                            ->icon('heroicon-o-computer-desktop')
                            ->schema([
                                Forms\Components\Section::make('System Accounts')
                                    ->columns(2)
                                    ->schema([
                                        Forms\Components\TextInput::make('sis_username')
                                            ->label('SIS Username'),
                                        Forms\Components\TextInput::make('lms_username')
                                            ->label('LMS Username'),
                                        Forms\Components\Select::make('account_status')
                                            ->options([
                                                'ACTIVE' => 'Active',
                                                'LOCKED' => 'Locked',
                                            ])
                                            ->required()
                                            ->default('ACTIVE'),
                                        Forms\Components\DateTimePicker::make('last_login')
                                            ->disabled(),
                                    ]),
                            ]),
                    ])
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
