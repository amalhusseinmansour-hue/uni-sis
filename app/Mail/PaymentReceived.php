<?php

namespace App\Mail;

use App\Models\AdmissionApplication;
use App\Models\AdmissionPayment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReceived extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public AdmissionApplication $application,
        public AdmissionPayment $payment
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تم استلام رسوم التسجيل',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admission.payment-received',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
