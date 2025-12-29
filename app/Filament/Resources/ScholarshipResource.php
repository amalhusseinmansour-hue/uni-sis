<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ScholarshipResource\Pages;
use App\Filament\Resources\ScholarshipResource\RelationManagers;
use App\Models\Scholarship;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ScholarshipResource extends Resource
{
    protected static ?string $model = Scholarship::class;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?string $navigationGroup = 'Finance / المالية';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Basic Information')
                    ->schema([
                        Forms\Components\TextInput::make('code')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(50),

                        Forms\Components\TextInput::make('name_en')
                            ->label('Name (English)')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\TextInput::make('name_ar')
                            ->label('Name (Arabic)')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\Select::make('type')
                            ->options(Scholarship::getTypes())
                            ->required(),

                        Forms\Components\Toggle::make('is_active')
                            ->default(true),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Coverage Details')
                    ->schema([
                        Forms\Components\Select::make('coverage_type')
                            ->options([
                                'PERCENTAGE' => 'Percentage of Fees',
                                'FIXED_AMOUNT' => 'Fixed Amount',
                            ])
                            ->required()
                            ->reactive(),

                        Forms\Components\TextInput::make('coverage_value')
                            ->label(fn ($get) => $get('coverage_type') === 'PERCENTAGE' ? 'Coverage Percentage (%)' : 'Fixed Amount')
                            ->numeric()
                            ->required()
                            ->suffix(fn ($get) => $get('coverage_type') === 'PERCENTAGE' ? '%' : null)
                            ->prefix(fn ($get) => $get('coverage_type') === 'FIXED_AMOUNT' ? '$' : null),

                        Forms\Components\TextInput::make('max_amount')
                            ->label('Maximum Amount')
                            ->numeric()
                            ->prefix('$')
                            ->helperText('Maximum scholarship amount (for percentage-based)')
                            ->visible(fn ($get) => $get('coverage_type') === 'PERCENTAGE'),

                        Forms\Components\Select::make('currency')
                            ->options([
                                'USD' => 'USD',
                                'SAR' => 'SAR',
                                'EUR' => 'EUR',
                            ])
                            ->default('USD'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Eligibility & Limits')
                    ->schema([
                        Forms\Components\TextInput::make('min_gpa')
                            ->label('Minimum GPA')
                            ->numeric()
                            ->step(0.01)
                            ->minValue(0)
                            ->maxValue(4),

                        Forms\Components\TextInput::make('max_recipients')
                            ->label('Maximum Recipients')
                            ->numeric()
                            ->minValue(1)
                            ->helperText('Leave empty for unlimited'),

                        Forms\Components\Toggle::make('is_renewable')
                            ->label('Renewable')
                            ->default(true),

                        Forms\Components\TextInput::make('max_semesters')
                            ->label('Maximum Semesters')
                            ->numeric()
                            ->minValue(1)
                            ->visible(fn ($get) => $get('is_renewable')),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Application Period')
                    ->schema([
                        Forms\Components\DatePicker::make('application_start')
                            ->label('Application Start Date'),

                        Forms\Components\DatePicker::make('application_end')
                            ->label('Application End Date'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Additional Information')
                    ->schema([
                        Forms\Components\Textarea::make('eligibility_criteria')
                            ->rows(3),

                        Forms\Components\Textarea::make('terms_conditions')
                            ->label('Terms & Conditions')
                            ->rows(3),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('name_en')
                    ->label('Name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\BadgeColumn::make('type')
                    ->colors([
                        'success' => 'FULL',
                        'info' => 'PARTIAL',
                        'primary' => 'MERIT',
                        'warning' => 'NEED_BASED',
                        'purple' => 'GOVERNMENT',
                    ]),

                Tables\Columns\TextColumn::make('coverage_display')
                    ->label('Coverage')
                    ->getStateUsing(fn ($record) => $record->coverage_type === 'PERCENTAGE'
                        ? "{$record->coverage_value}%"
                        : "$" . number_format($record->coverage_value, 2)),

                Tables\Columns\TextColumn::make('current_recipients')
                    ->label('Recipients')
                    ->getStateUsing(fn ($record) => $record->max_recipients
                        ? "{$record->current_recipients}/{$record->max_recipients}"
                        : $record->current_recipients),

                Tables\Columns\TextColumn::make('min_gpa')
                    ->label('Min GPA')
                    ->placeholder('-'),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),

                Tables\Columns\IconColumn::make('is_renewable')
                    ->label('Renewable')
                    ->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options(Scholarship::getTypes()),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active'),

                Tables\Filters\Filter::make('accepting_applications')
                    ->label('Accepting Applications')
                    ->query(fn ($query) => $query->acceptingApplications()),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\StudentsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListScholarships::route('/'),
            'create' => Pages\CreateScholarship::route('/create'),
            'view' => Pages\ViewScholarship::route('/{record}'),
            'edit' => Pages\EditScholarship::route('/{record}/edit'),
        ];
    }
}
