<?php

namespace App\Mail;

use App\Models\AdmissionApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationSubmitted extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public AdmissionApplication $application
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تم استلام طلب الالتحاق بالجامعة',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admission.application-submitted',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
