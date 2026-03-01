<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum InvoiceStatus: string implements HasLabel, HasColor
{
    case Draft = 'draft';
    case Sent = 'sent';
    case Viewed = 'viewed';
    case Paid = 'paid';
    case Overdue = 'overdue';
    case Cancelled = 'cancelled';
    case PartiallyPaid = 'partially_paid';
    case Refunded = 'refunded';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Sent => 'Sent',
            self::Viewed => 'Viewed',
            self::Paid => 'Paid',
            self::Overdue => 'Overdue',
            self::Cancelled => 'Cancelled',
            self::PartiallyPaid => 'Partially Paid',
            self::Refunded => 'Refunded',
        };
    }

    public function getColor(): string|array|null
    {
        return match ($this) {
            self::Draft => 'gray',
            self::Sent => 'info',
            self::Viewed => 'info',
            self::Paid => 'success',
            self::Overdue => 'danger',
            self::Cancelled => 'gray',
            self::PartiallyPaid => 'warning',
            self::Refunded => 'warning',
        };
    }
}
