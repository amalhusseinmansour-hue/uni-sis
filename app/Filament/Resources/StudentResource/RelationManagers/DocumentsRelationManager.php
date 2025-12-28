<?php

namespace App\Filament\Resources\StudentResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class DocumentsRelationManager extends RelationManager
{
    protected static string $relationship = 'documents';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('type')
                    ->options([
                        'HIGH_SCHOOL_CERTIFICATE' => 'High School Certificate',
                        'ID_PASSPORT' => 'ID/Passport',
                        'PHOTO' => 'Photo',
                        'OTHER' => 'Other',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\FileUpload::make('file_path')
                    ->required()
                    ->directory('student-documents')
                    ->preserveFilenames(),
                Forms\Components\DatePicker::make('upload_date')
                    ->required()
                    ->default(now()),
                Forms\Components\Select::make('status')
                    ->options([
                        'ACCEPTED' => 'Accepted',
                        'REJECTED' => 'Rejected',
                        'UNDER_REVIEW' => 'Under Review',
                    ])
                    ->required()
                    ->default('UNDER_REVIEW'),
                Forms\Components\Textarea::make('notes'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('type')
                    ->badge(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('upload_date')
                    ->date()
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'ACCEPTED',
                        'danger' => 'REJECTED',
                        'warning' => 'UNDER_REVIEW',
                    ]),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'HIGH_SCHOOL_CERTIFICATE' => 'High School Certificate',
                        'ID_PASSPORT' => 'ID/Passport',
                        'PHOTO' => 'Photo',
                        'OTHER' => 'Other',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'ACCEPTED' => 'Accepted',
                        'REJECTED' => 'Rejected',
                        'UNDER_REVIEW' => 'Under Review',
                    ]),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
