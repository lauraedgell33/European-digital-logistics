<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum CompanyVerificationStatus: string implements HasLabel, HasColor
{
    case Pending = 'pending';
    case Verified = 'verified';
    case Rejected = 'rejected';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Verified => 'Verified',
            self::Rejected => 'Rejected',
        };
    }

    public function getColor(): string|array|null
    {
        return match ($this) {
            self::Pending => 'warning',
            self::Verified => 'success',
            self::Rejected => 'danger',
        };
    }
}
