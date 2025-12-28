<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AdmissionApplicationResource\Pages;
use App\Models\AdmissionApplication;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AdmissionApplicationResource extends Resource
{
    protected static ?string $model = AdmissionApplication::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?int $navigationSort = 1;

    public static function getNavigationGroup(): ?string
    {
        return __('filament.navigation.admissions');
    }

    public static function getNavigationLabel(): string
    {
        return __('filament.admission_application.title');
    }

    public static function getModelLabel(): string
    {
        return __('filament.admission_application.singular');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.admission_application.plural');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make(__('filament.admission_application.applicant_information'))
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('full_name')
                            ->label(__('filament.admission_application.full_name'))
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('national_id')
                            ->label(__('filament.admission_application.national_id'))
                            ->required()
                            ->maxLength(20),
                        Forms\Components\TextInput::make('email')
                            ->label(__('filament.admission_application.email'))
                            ->email()
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('phone')
                            ->label(__('filament.admission_application.phone'))
                            ->tel()
                            ->maxLength(20),
                        Forms\Components\DatePicker::make('date_of_birth')
                            ->label(__('filament.admission_application.date_of_birth')),
                        Forms\Components\Select::make('gender')
                            ->label(__('filament.admission_application.gender'))
                            ->options([
                                'MALE' => __('filament.admission_application.gender_male'),
                                'FEMALE' => __('filament.admission_application.gender_female'),
                            ]),
                        Forms\Components\TextInput::make('nationality')
                            ->label(__('filament.admission_application.nationality'))
                            ->maxLength(100),
                        Forms\Components\Textarea::make('address')
                            ->label(__('filament.admission_application.address'))
                            ->columnSpanFull(),
                    ]),
                Forms\Components\Section::make(__('filament.admission_application.education_info'))
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('high_school_name')
                            ->label(__('filament.admission_application.high_school_name'))
                            ->maxLength(255),
                        Forms\Components\TextInput::make('high_school_score')
                            ->label(__('filament.admission_application.high_school_score'))
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->suffix('%'),
                        Forms\Components\TextInput::make('high_school_year')
                            ->label(__('filament.admission_application.high_school_year'))
                            ->numeric(),
                    ]),
                Forms\Components\Section::make(__('filament.admission_application.application_details'))
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('program_id')
                            ->label(__('filament.admission_application.program_id'))
                            ->relationship('program', 'name_en')
                            ->searchable()
                            ->preload(),
                        Forms\Components\DatePicker::make('date')
                            ->label(__('filament.admission_application.date'))
                            ->required()
                            ->default(now()),
                        Forms\Components\Select::make('status')
                            ->label(__('filament.admission_application.status'))
                            ->options([
                                'PENDING' => __('filament.admission_application.status_pending'),
                                'APPROVED' => __('filament.admission_application.status_approved'),
                                'REJECTED' => __('filament.admission_application.status_rejected'),
                                'WAITLISTED' => __('filament.admission_application.status_waitlisted'),
                            ])
                            ->required()
                            ->default('PENDING'),
                        Forms\Components\Textarea::make('notes')
                            ->label(__('filament.admission_application.notes'))
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('full_name')
                    ->label(__('filament.admission_application.full_name'))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('national_id')
                    ->label(__('filament.admission_application.national_id'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('email')
                    ->label(__('filament.admission_application.email'))
                    ->searchable(),
                Tables\Columns\TextColumn::make('program.name_en')
                    ->label(__('filament.admission_application.program'))
                    ->sortable(),
                Tables\Columns\TextColumn::make('high_school_score')
                    ->label(__('filament.admission_application.high_school_score'))
                    ->suffix('%')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->label(__('filament.admission_application.status'))
                    ->formatStateUsing(fn (string $state): string => match($state) {
                        'PENDING' => __('filament.admission_application.status_pending'),
                        'APPROVED' => __('filament.admission_application.status_approved'),
                        'REJECTED' => __('filament.admission_application.status_rejected'),
                        'WAITLISTED' => __('filament.admission_application.status_waitlisted'),
                        default => $state,
                    })
                    ->colors([
                        'warning' => 'PENDING',
                        'success' => 'APPROVED',
                        'danger' => 'REJECTED',
                        'info' => 'WAITLISTED',
                    ]),
                Tables\Columns\TextColumn::make('date')
                    ->label(__('filament.admission_application.date'))
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label(__('filament.admission_application.created_at'))
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label(__('filament.admission_application.status'))
                    ->options([
                        'PENDING' => __('filament.admission_application.status_pending'),
                        'APPROVED' => __('filament.admission_application.status_approved'),
                        'REJECTED' => __('filament.admission_application.status_rejected'),
                        'WAITLISTED' => __('filament.admission_application.status_waitlisted'),
                    ]),
                Tables\Filters\SelectFilter::make('program')
                    ->label(__('filament.admission_application.program'))
                    ->relationship('program', 'name_en'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('approve')
                    ->label(__('filament.admission_application.approve'))
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading(__('filament.admission_application.approve'))
                    ->modalDescription(__('filament.admission_application.approve_confirmation'))
                    ->visible(fn ($record) => $record->status === 'PENDING')
                    ->action(fn ($record) => $record->update(['status' => 'APPROVED'])),
                Tables\Actions\Action::make('reject')
                    ->label(__('filament.admission_application.reject'))
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading(__('filament.admission_application.reject'))
                    ->modalDescription(__('filament.admission_application.reject_confirmation'))
                    ->visible(fn ($record) => $record->status === 'PENDING')
                    ->action(fn ($record) => $record->update(['status' => 'REJECTED'])),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('date', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAdmissionApplications::route('/'),
            'create' => Pages\CreateAdmissionApplication::route('/create'),
            'edit' => Pages\EditAdmissionApplication::route('/{record}/edit'),
        ];
    }
}
