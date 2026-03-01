<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum TransportOrderStatus: string implements HasLabel, HasColor, HasIcon
{
    case Draft = 'draft';
    case Pending = 'pending';
    case Accepted = 'accepted';
    case PickupScheduled = 'pickup_scheduled';
    case PickedUp = 'picked_up';
    case InTransit = 'in_transit';
    case Delivered = 'delivered';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Rejected = 'rejected';
    case Disputed = 'disputed';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Pending => 'Pending',
            self::Accepted => 'Accepted',
            self::PickupScheduled => 'Pickup Scheduled',
            self::PickedUp => 'Picked Up',
            self::InTransit => 'In Transit',
            self::Delivered => 'Delivered',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
            self::Rejected => 'Rejected',
            self::Disputed => 'Disputed',
        };
    }

    public function getColor(): string|array|null
    {
        return match ($this) {
            self::Draft => 'gray',
            self::Pending => 'warning',
            self::Accepted => 'info',
            self::PickupScheduled => 'info',
            self::PickedUp => 'info',
            self::InTransit => 'primary',
            self::Delivered => 'success',
            self::Completed => 'success',
            self::Cancelled => 'danger',
            self::Rejected => 'danger',
            self::Disputed => 'warning',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::Draft => 'heroicon-o-pencil',
            self::Pending => 'heroicon-o-clock',
            self::Accepted => 'heroicon-o-check',
            self::PickupScheduled => 'heroicon-o-calendar',
            self::PickedUp => 'heroicon-o-truck',
            self::InTransit => 'heroicon-o-arrow-right',
            self::Delivered => 'heroicon-o-check-badge',
            self::Completed => 'heroicon-o-check-circle',
            self::Cancelled => 'heroicon-o-x-circle',
            self::Rejected => 'heroicon-o-no-symbol',
            self::Disputed => 'heroicon-o-exclamation-triangle',
        };
    }
}
