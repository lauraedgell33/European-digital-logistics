<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum ShipmentStatus: string implements HasLabel, HasColor
{
    case WaitingPickup = 'waiting_pickup';
    case PickedUp = 'picked_up';
    case InTransit = 'in_transit';
    case AtCustoms = 'at_customs';
    case OutForDelivery = 'out_for_delivery';
    case Delivered = 'delivered';
    case Delayed = 'delayed';
    case Exception = 'exception';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::WaitingPickup => 'Waiting Pickup',
            self::PickedUp => 'Picked Up',
            self::InTransit => 'In Transit',
            self::AtCustoms => 'At Customs',
            self::OutForDelivery => 'Out for Delivery',
            self::Delivered => 'Delivered',
            self::Delayed => 'Delayed',
            self::Exception => 'Exception',
        };
    }

    public function getColor(): string|array|null
    {
        return match ($this) {
            self::WaitingPickup => 'gray',
            self::PickedUp => 'info',
            self::InTransit => 'primary',
            self::AtCustoms => 'warning',
            self::OutForDelivery => 'info',
            self::Delivered => 'success',
            self::Delayed => 'danger',
            self::Exception => 'danger',
        };
    }
}
