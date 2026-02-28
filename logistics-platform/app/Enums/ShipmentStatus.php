<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum ShipmentStatus: string implements HasLabel, HasColor
{
    case Created = 'created';
    case AtPickup = 'at_pickup';
    case InTransit = 'in_transit';
    case AtDelivery = 'at_delivery';
    case Delivered = 'delivered';
    case Exception = 'exception';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::Created => 'Created',
            self::AtPickup => 'At Pickup',
            self::InTransit => 'In Transit',
            self::AtDelivery => 'At Delivery',
            self::Delivered => 'Delivered',
            self::Exception => 'Exception',
        };
    }

    public function getColor(): string|array|null
    {
        return match ($this) {
            self::Created => 'gray',
            self::AtPickup => 'info',
            self::InTransit => 'primary',
            self::AtDelivery => 'warning',
            self::Delivered => 'success',
            self::Exception => 'danger',
        };
    }
}
