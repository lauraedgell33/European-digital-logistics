<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\OrderStatusNotification;
use App\Notifications\NewMatchNotification;
use App\Notifications\TenderUpdateNotification;

class NotificationService
{
    /**
     * Notify about order status change.
     */
    public function notifyOrderStatus(\App\Models\TransportOrder $order, string $newStatus): void
    {
        $recipientCompanyIds = [$order->shipper_id, $order->carrier_id];

        $users = User::whereIn('company_id', $recipientCompanyIds)
            ->whereIn('role', ['admin', 'manager'])
            ->get();

        foreach ($users as $user) {
            $user->notify(new OrderStatusNotification($order, $newStatus));
        }
    }

    /**
     * Notify about new matching offers.
     */
    public function notifyNewMatch(int $companyId, array $matchData): void
    {
        $users = User::where('company_id', $companyId)
            ->whereIn('role', ['admin', 'manager', 'operator'])
            ->get();

        foreach ($users as $user) {
            $user->notify(new NewMatchNotification($matchData));
        }
    }

    /**
     * Notify about tender updates (new bid, award, etc.).
     */
    public function notifyTenderUpdate(\App\Models\Tender $tender, string $event): void
    {
        $users = User::where('company_id', $tender->company_id)
            ->whereIn('role', ['admin', 'manager'])
            ->get();

        foreach ($users as $user) {
            $user->notify(new TenderUpdateNotification($tender, $event));
        }
    }

    /**
     * Notify about shipment delay.
     */
    public function notifyShipmentDelay(\App\Models\Shipment $shipment): void
    {
        $order = $shipment->transportOrder;
        if (!$order) return;

        $users = User::whereIn('company_id', [$order->shipper_id, $order->carrier_id])
            ->whereIn('role', ['admin', 'manager'])
            ->get();

        foreach ($users as $user) {
            $user->notify(new \App\Notifications\ShipmentDelayNotification($shipment));
        }
    }
}
