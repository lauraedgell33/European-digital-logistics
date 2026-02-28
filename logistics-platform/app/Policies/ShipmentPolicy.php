<?php

namespace App\Policies;

use App\Models\Shipment;
use App\Models\User;

class ShipmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Only shipper/carrier of the related transport order can view.
     */
    public function view(User $user, Shipment $shipment): bool
    {
        $order = $shipment->transportOrder;
        if (! $order) {
            return false;
        }

        return $user->company_id === $order->shipper_id
            || $user->company_id === $order->carrier_id;
    }

    /**
     * Only carrier can update position.
     */
    public function updatePosition(User $user, Shipment $shipment): bool
    {
        $order = $shipment->transportOrder;
        if (! $order) {
            return false;
        }

        return $user->company_id === $order->carrier_id;
    }

    /**
     * Both shipper and carrier can add events.
     */
    public function addEvent(User $user, Shipment $shipment): bool
    {
        $order = $shipment->transportOrder;
        if (! $order) {
            return false;
        }

        return $user->company_id === $order->shipper_id
            || $user->company_id === $order->carrier_id;
    }

    public function create(User $user): bool
    {
        return $user->company_id !== null;
    }

    public function update(User $user, Shipment $shipment): bool
    {
        $order = $shipment->transportOrder;
        if (! $order) {
            return false;
        }

        return $user->company_id === $order->shipper_id
            || $user->company_id === $order->carrier_id;
    }

    public function delete(User $user, Shipment $shipment): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Shipment $shipment): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Shipment $shipment): bool
    {
        return $user->role === 'admin';
    }
}
