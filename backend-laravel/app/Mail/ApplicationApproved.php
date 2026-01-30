<?php

namespace App\Mail;

use App\Models\AdmissionApplication;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ApplicationApproved extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $temporaryPassword;

    public function __construct(
        public AdmissionApplication $application,
        public User $user,
        public array $documents
    ) {
        $this->temporaryPassword = $user->temporary_password ?? '';
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'مبروك! تم قبولك في الجامعة',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admission.application-approved',
        );
    }

    public function attachments(): array
    {
        $attachments = [];

        // إرفاق خطاب القبول
        if (!empty($this->documents['acceptance_letter_path'])) {
            $attachments[] = Attachment::fromStorage($this->documents['acceptance_letter_path'])
                ->as('acceptance_letter.pdf')
                ->withMime('application/pdf');
        }

        // إرفاق بطاقة الجامعة
        if (!empty($this->documents['university_card_path'])) {
            $attachments[] = Attachment::fromStorage($this->documents['university_card_path'])
                ->as('university_card.pdf')
                ->withMime('application/pdf');
        }

        return $attachments;
    }
}
