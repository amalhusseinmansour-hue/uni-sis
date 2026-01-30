<?php

namespace App\Filament\Resources\LectureResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class MaterialsRelationManager extends RelationManager
{
    protected static string $relationship = 'materials';

    protected static ?string $title = 'مواد المحاضرة';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title_en')
                    ->label('العنوان (إنجليزي)')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('title_ar')
                    ->label('العنوان (عربي)')
                    ->required()
                    ->maxLength(255),

                Forms\Components\Select::make('type')
                    ->label('النوع')
                    ->options([
                        'SLIDES' => 'شرائح عرض',
                        'PDF' => 'ملف PDF',
                        'VIDEO' => 'فيديو',
                        'AUDIO' => 'صوت',
                        'DOCUMENT' => 'مستند',
                        'LINK' => 'رابط',
                        'IMAGE' => 'صورة',
                        'CODE' => 'كود',
                        'OTHER' => 'أخرى',
                    ])
                    ->required(),

                Forms\Components\FileUpload::make('file_path')
                    ->label('الملف')
                    ->directory('lecture-materials')
                    ->visibility('public')
                    ->maxSize(102400),

                Forms\Components\TextInput::make('external_url')
                    ->label('رابط خارجي')
                    ->url(),

                Forms\Components\Textarea::make('description')
                    ->label('الوصف')
                    ->rows(2),

                Forms\Components\Toggle::make('is_visible_to_students')
                    ->label('مرئي للطلاب')
                    ->default(true),

                Forms\Components\Toggle::make('is_downloadable')
                    ->label('قابل للتحميل')
                    ->default(true),

                Forms\Components\TextInput::make('order')
                    ->label('الترتيب')
                    ->numeric()
                    ->default(0),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order')
                    ->label('#')
                    ->sortable(),

                Tables\Columns\TextColumn::make('title_ar')
                    ->label('العنوان')
                    ->searchable(),

                Tables\Columns\BadgeColumn::make('type')
                    ->label('النوع')
                    ->colors([
                        'primary' => 'SLIDES',
                        'danger' => 'PDF',
                        'success' => 'VIDEO',
                        'warning' => 'AUDIO',
                        'info' => 'LINK',
                    ]),

                Tables\Columns\IconColumn::make('is_visible_to_students')
                    ->label('مرئي')
                    ->boolean(),

                Tables\Columns\IconColumn::make('is_downloadable')
                    ->label('قابل للتحميل')
                    ->boolean(),

                Tables\Columns\TextColumn::make('download_count')
                    ->label('التحميلات')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('تاريخ الرفع')
                    ->dateTime('Y-m-d H:i'),
            ])
            ->defaultSort('order')
            ->reorderable('order')
            ->filters([
                //
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->mutateFormDataUsing(function (array $data): array {
                        $data['uploaded_by'] = auth()->id();
                        return $data;
                    }),
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
