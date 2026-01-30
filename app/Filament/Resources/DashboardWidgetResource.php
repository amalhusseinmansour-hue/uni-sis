<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DashboardWidgetResource\Pages;
use App\Models\DashboardWidget;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DashboardWidgetResource extends Resource
{
    protected static ?string $model = DashboardWidget::class;

    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';

    protected static ?string $navigationGroup = 'Frontend Control';

    protected static ?int $navigationSort = 2;

    public static function getNavigationLabel(): string
    {
        return __('Dashboard Widgets');
    }

    public static function getModelLabel(): string
    {
        return __('Widget');
    }

    public static function getPluralModelLabel(): string
    {
        return __('Widgets');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Wizard::make([
                    Forms\Components\Wizard\Step::make(__('Basic Info'))
                        ->icon('heroicon-o-information-circle')
                        ->schema([
                            Forms\Components\Grid::make(2)
                                ->schema([
                                    Forms\Components\TextInput::make('code')
                                        ->label(__('Code'))
                                        ->required()
                                        ->unique(ignoreRecord: true)
                                        ->alphaDash()
                                        ->maxLength(50)
                                        ->placeholder('total_students'),

                                    Forms\Components\Select::make('type')
                                        ->label(__('Widget Type'))
                                        ->required()
                                        ->options([
                                            'stat_card' => __('Statistics Card'),
                                            'chart' => __('Chart'),
                                            'table' => __('Data Table'),
                                            'list' => __('List'),
                                            'calendar' => __('Calendar'),
                                            'custom' => __('Custom Component'),
                                        ])
                                        ->reactive()
                                        ->default('stat_card'),
                                ]),

                            Forms\Components\Grid::make(2)
                                ->schema([
                                    Forms\Components\TextInput::make('name_en')
                                        ->label(__('Name (English)'))
                                        ->required()
                                        ->maxLength(100)
                                        ->placeholder('Total Students'),

                                    Forms\Components\TextInput::make('name_ar')
                                        ->label(__('Name (Arabic)'))
                                        ->required()
                                        ->maxLength(100)
                                        ->placeholder('إجمالي الطلاب'),
                                ]),

                            Forms\Components\Grid::make(2)
                                ->schema([
                                    Forms\Components\Select::make('size')
                                        ->label(__('Size'))
                                        ->options([
                                            'small' => __('Small (1 column)'),
                                            'medium' => __('Medium (2 columns)'),
                                            'large' => __('Large (3 columns)'),
                                            'full' => __('Full Width (4 columns)'),
                                        ])
                                        ->default('small'),

                                    Forms\Components\TextInput::make('component')
                                        ->label(__('Component Name'))
                                        ->placeholder('StatsCard')
                                        ->helperText(__('React component name for custom widgets')),
                                ]),
                        ]),

                    Forms\Components\Wizard\Step::make(__('Data Source'))
                        ->icon('heroicon-o-circle-stack')
                        ->schema([
                            Forms\Components\Select::make('data_source.type')
                                ->label(__('Source Type'))
                                ->options([
                                    'query' => __('Database Query'),
                                    'api' => __('API Endpoint'),
                                    'static' => __('Static Data'),
                                ])
                                ->default('query')
                                ->reactive(),

                            // Query-based data source
                            Forms\Components\Fieldset::make(__('Query Configuration'))
                                ->visible(fn ($get) => $get('data_source.type') === 'query')
                                ->schema([
                                    Forms\Components\Select::make('data_source.model')
                                        ->label(__('Model'))
                                        ->options([
                                            'App\\Models\\Student' => __('Students'),
                                            'App\\Models\\Course' => __('Courses'),
                                            'App\\Models\\Enrollment' => __('Enrollments'),
                                            'App\\Models\\Grade' => __('Grades'),
                                            'App\\Models\\FinancialRecord' => __('Financial Records'),
                                            'App\\Models\\AdmissionApplication' => __('Admission Applications'),
                                            'App\\Models\\ServiceRequest' => __('Service Requests'),
                                            'App\\Models\\Notification' => __('Notifications'),
                                        ])
                                        ->searchable(),

                                    Forms\Components\Grid::make(2)
                                        ->schema([
                                            Forms\Components\Select::make('data_source.aggregation.function')
                                                ->label(__('Aggregation'))
                                                ->options([
                                                    'count' => __('Count'),
                                                    'sum' => __('Sum'),
                                                    'avg' => __('Average'),
                                                    'min' => __('Minimum'),
                                                    'max' => __('Maximum'),
                                                ]),

                                            Forms\Components\TextInput::make('data_source.aggregation.field')
                                                ->label(__('Field'))
                                                ->placeholder('*'),
                                        ]),

                                    Forms\Components\TextInput::make('data_source.group_by')
                                        ->label(__('Group By'))
                                        ->placeholder('status')
                                        ->helperText(__('For chart data grouping')),

                                    Forms\Components\TextInput::make('data_source.limit')
                                        ->label(__('Limit'))
                                        ->numeric()
                                        ->default(10),

                                    Forms\Components\Repeater::make('data_source.filters')
                                        ->label(__('Filters'))
                                        ->schema([
                                            Forms\Components\Grid::make(4)
                                                ->schema([
                                                    Forms\Components\TextInput::make('field')
                                                        ->label(__('Field'))
                                                        ->required(),

                                                    Forms\Components\Select::make('operator')
                                                        ->label(__('Operator'))
                                                        ->options([
                                                            '=' => __('Equals'),
                                                            '!=' => __('Not Equals'),
                                                            '>' => __('Greater Than'),
                                                            '<' => __('Less Than'),
                                                            'like' => __('Contains'),
                                                        ])
                                                        ->default('='),

                                                    Forms\Components\TextInput::make('default')
                                                        ->label(__('Default Value')),

                                                    Forms\Components\TextInput::make('param')
                                                        ->label(__('Parameter Name')),
                                                ]),
                                        ])
                                        ->collapsible()
                                        ->collapsed(),
                                ]),

                            // API-based data source
                            Forms\Components\TextInput::make('data_source.endpoint')
                                ->label(__('API Endpoint'))
                                ->visible(fn ($get) => $get('data_source.type') === 'api')
                                ->placeholder('/api/dashboard/stats'),

                            // Static data
                            Forms\Components\Textarea::make('data_source.data')
                                ->label(__('Static Data (JSON)'))
                                ->visible(fn ($get) => $get('data_source.type') === 'static')
                                ->rows(5)
                                ->placeholder('{"value": 100, "label": "Total"}'),
                        ]),

                    Forms\Components\Wizard\Step::make(__('Appearance'))
                        ->icon('heroicon-o-paint-brush')
                        ->schema([
                            Forms\Components\Section::make(__('Settings'))
                                ->schema([
                                    Forms\Components\Grid::make(2)
                                        ->schema([
                                            Forms\Components\TextInput::make('settings.icon')
                                                ->label(__('Icon'))
                                                ->placeholder('heroicon-o-users'),

                                            Forms\Components\Select::make('settings.color')
                                                ->label(__('Color'))
                                                ->options([
                                                    'blue' => __('Blue'),
                                                    'green' => __('Green'),
                                                    'red' => __('Red'),
                                                    'yellow' => __('Yellow'),
                                                    'purple' => __('Purple'),
                                                    'pink' => __('Pink'),
                                                    'indigo' => __('Indigo'),
                                                    'gray' => __('Gray'),
                                                ])
                                                ->default('blue'),
                                        ]),

                                    Forms\Components\TextInput::make('settings.description')
                                        ->label(__('Description'))
                                        ->placeholder('Total active students'),

                                    Forms\Components\Select::make('settings.chart_type')
                                        ->label(__('Chart Type'))
                                        ->options([
                                            'bar' => __('Bar Chart'),
                                            'line' => __('Line Chart'),
                                            'pie' => __('Pie Chart'),
                                            'doughnut' => __('Doughnut Chart'),
                                            'area' => __('Area Chart'),
                                        ])
                                        ->visible(fn ($get) => $get('type') === 'chart'),

                                    Forms\Components\Toggle::make('settings.show_trend')
                                        ->label(__('Show Trend'))
                                        ->default(false),

                                    Forms\Components\Toggle::make('settings.show_comparison')
                                        ->label(__('Show Comparison'))
                                        ->default(false),
                                ]),

                            Forms\Components\Section::make(__('Custom Styles'))
                                ->collapsible()
                                ->collapsed()
                                ->schema([
                                    Forms\Components\Grid::make(2)
                                        ->schema([
                                            Forms\Components\TextInput::make('styles.background')
                                                ->label(__('Background Color'))
                                                ->placeholder('#ffffff'),

                                            Forms\Components\TextInput::make('styles.text_color')
                                                ->label(__('Text Color'))
                                                ->placeholder('#1f2937'),
                                        ]),

                                    Forms\Components\TextInput::make('styles.border_radius')
                                        ->label(__('Border Radius'))
                                        ->placeholder('8px'),

                                    Forms\Components\TextInput::make('styles.shadow')
                                        ->label(__('Shadow'))
                                        ->placeholder('0 1px 3px rgba(0,0,0,0.1)'),
                                ]),
                        ]),

                    Forms\Components\Wizard\Step::make(__('Access'))
                        ->icon('heroicon-o-lock-closed')
                        ->schema([
                            Forms\Components\CheckboxList::make('roles')
                                ->label(__('Visible to Roles'))
                                ->options([
                                    'STUDENT' => __('Student'),
                                    'LECTURER' => __('Lecturer'),
                                    'ADMIN' => __('Admin'),
                                    'FINANCE' => __('Finance'),
                                ])
                                ->columns(4)
                                ->helperText(__('Leave empty to show for all roles')),

                            Forms\Components\Toggle::make('is_active')
                                ->label(__('Active'))
                                ->default(true),
                        ]),
                ])
                ->columnSpanFull()
                ->skippable(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')
                    ->label(__('Code'))
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('primary'),

                Tables\Columns\TextColumn::make('name_en')
                    ->label(__('Name (EN)'))
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('type')
                    ->label(__('Type'))
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'stat_card' => 'info',
                        'chart' => 'success',
                        'table' => 'warning',
                        'list' => 'gray',
                        'calendar' => 'danger',
                        'custom' => 'primary',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('size')
                    ->label(__('Size'))
                    ->badge()
                    ->color('gray'),

                Tables\Columns\TextColumn::make('roles')
                    ->label(__('Roles'))
                    ->badge()
                    ->separator(',')
                    ->formatStateUsing(fn ($state) => is_array($state) ? implode(', ', $state) : ($state ?: 'All')),

                Tables\Columns\IconColumn::make('is_active')
                    ->label(__('Active'))
                    ->boolean(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label(__('Updated'))
                    ->dateTime('M j, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label(__('Type'))
                    ->options([
                        'stat_card' => __('Statistics Card'),
                        'chart' => __('Chart'),
                        'table' => __('Data Table'),
                        'list' => __('List'),
                        'calendar' => __('Calendar'),
                        'custom' => __('Custom'),
                    ]),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label(__('Active')),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\Action::make('preview')
                        ->label(__('Preview'))
                        ->icon('heroicon-o-eye')
                        ->color('info')
                        ->modalHeading(fn ($record) => __('Preview: ') . $record->name_en)
                        ->modalContent(fn ($record) => view('filament.widgets.preview', ['widget' => $record])),
                    Tables\Actions\DeleteAction::make(),
                ]),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('activate')
                        ->label(__('Activate'))
                        ->icon('heroicon-o-check')
                        ->action(fn ($records) => $records->each->update(['is_active' => true]))
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('deactivate')
                        ->label(__('Deactivate'))
                        ->icon('heroicon-o-x-mark')
                        ->action(fn ($records) => $records->each->update(['is_active' => false]))
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->defaultSort('code');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDashboardWidgets::route('/'),
            'create' => Pages\CreateDashboardWidget::route('/create'),
            'edit' => Pages\EditDashboardWidget::route('/{record}/edit'),
        ];
    }
}
