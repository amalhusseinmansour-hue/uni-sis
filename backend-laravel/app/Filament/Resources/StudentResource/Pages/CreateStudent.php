<?php

namespace App\Filament\Resources\StudentResource\Pages;

use App\Filament\Resources\StudentResource;
use App\Models\User;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateStudent extends CreateRecord
{
    protected static string $resource = StudentResource::class;

    // Enable wizard steps
    use CreateRecord\Concerns\HasWizard;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // If no user_id is provided, create a new user for the student
        if (empty($data['user_id'])) {
            $email = $data['university_email'] ?? $data['personal_email'] ?? null;

            if ($email) {
                // Check if user already exists with this email
                $existingUser = User::where('email', $email)->first();

                if ($existingUser) {
                    $data['user_id'] = $existingUser->id;
                    // Update password if provided
                    if (!empty($data['password'])) {
                        $existingUser->update(['password' => Hash::make($data['password'])]);
                    }
                    session()->flash('user_existed', true);
                } else {
                    // Use provided password or generate random one
                    $password = $data['password'] ?? Str::random(12);

                    // Create new user
                    $user = User::create([
                        'name' => $data['name_en'] ?? $data['name_ar'] ?? 'Student',
                        'email' => $email,
                        'password' => Hash::make($password),
                        'role' => 'STUDENT',
                        'status' => 'active',
                    ]);

                    $data['user_id'] = $user->id;

                    // Store the password in session for display
                    session()->flash('generated_password', $password);
                    session()->flash('student_email', $email);
                    session()->flash('student_name', $data['name_en'] ?? $data['name_ar']);
                }
            }

            // Remove password from data as it's not a Student field
            unset($data['password']);
        }

        // Set default values for new students
        $data['academic_status'] = $data['academic_status'] ?? 'REGULAR';
        $data['financial_status'] = $data['financial_status'] ?? 'CLEARED';
        $data['account_status'] = $data['account_status'] ?? 'ACTIVE';
        $data['gpa'] = $data['gpa'] ?? 0;
        $data['completed_credits'] = $data['completed_credits'] ?? 0;
        $data['registered_credits'] = $data['registered_credits'] ?? 0;

        return $data;
    }

    protected function afterCreate(): void
    {
        $password = session('generated_password');
        $email = session('student_email');
        $name = session('student_name');
        $userExisted = session('user_existed');

        if ($password && $email) {
            // Show detailed notification with login credentials
            Notification::make()
                ->title('Student Created Successfully!')
                ->icon('heroicon-o-check-circle')
                ->iconColor('success')
                ->body("
**Student:** {$name}
**Student ID:** {$this->record->student_id}

**Login Credentials:**
- Email: {$email}
- Password: {$password}

Please save these credentials and share them with the student.
                ")
                ->persistent()
                ->send();
        } elseif ($userExisted) {
            Notification::make()
                ->title('Student Created Successfully!')
                ->icon('heroicon-o-check-circle')
                ->iconColor('success')
                ->body("Student ID: {$this->record->student_id}\n\nNote: User account already existed. Student linked to existing account.")
                ->send();
        } else {
            Notification::make()
                ->title('Student Created Successfully!')
                ->icon('heroicon-o-check-circle')
                ->iconColor('success')
                ->body("Student ID: {$this->record->student_id}")
                ->send();
        }
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function getSteps(): array
    {
        return [];
    }

    protected function hasSkippableSteps(): bool
    {
        return false;
    }
}
