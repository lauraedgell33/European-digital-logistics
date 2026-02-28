<?php

namespace App\Policies;

use App\Models\TransportOrder;
use App\Models\User;

class TransportOrderPolicy
{
    /**
     * Anyone authenticated can list orders (scoped in controller).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Only shipper or carrier company can view the order.
     */
    public function view(User $user, TransportOrder $order): bool
    {
        return $user->company_id === $order->shipper_id
            || $user->company_id === $order->carrier_id;
    }

    /**
     * Authenticated user with a company can create orders.
     */
    public function create(User $user): bool
    {
        return $user->company_id !== null;
    }

    /**
     * Shipper or carrier company can update the order.
     */
    public function update(User $user, TransportOrder $order): bool
    {
        return $user->company_id === $order->shipper_id
            || $user->company_id === $order->carrier_id;
    }

    /**
     * Only the shipper company or an admin can delete.
     */
    public function delete(User $user, TransportOrder $order): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->company_id !== null
            && $user->company_id === $order->shipper_id;
    }

    /**
     * Only the carrier company can accept an order.
     */
    public function accept(User $user, TransportOrder $order): bool
    {
        return $user->company_id === $order->carrier_id;
    }

    /**
     * Only the carrier company can reject an order.
     */
    public function reject(User $user, TransportOrder $order): bool
    {
        return $user->company_id === $order->carrier_id;
    }

    /**
     * Shipper or carrier can update the order status.
     */
    public function updateStatus(User $user, TransportOrder $order): bool
    {
        return ($user->company_id === $order->shipper_id
            || $user->company_id === $order->carrier_id)
            && $user->hasPermission('edit');
    }

    /**
     * Shipper or carrier can cancel.
     */
    public function cancel(User $user, TransportOrder $order): bool
    {
        return $user->company_id === $order->shipper_id
            || $user->company_id === $order->carrier_id;
    }

    public function restore(User $user, TransportOrder $order): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, TransportOrder $order): bool
    {
        return $user->role === 'admin';
    }
}
