<?php

namespace App\Exports;

use App\Models\TransportOrder;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OrdersExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function query()
    {
        $query = TransportOrder::with(['shipper', 'carrier'])
            ->where(function ($q) {
                $q->where('shipper_id', $this->request->user()->company_id)
                  ->orWhere('carrier_id', $this->request->user()->company_id);
            });

        if ($this->request->filled('status')) {
            $query->where('status', $this->request->status);
        }
        if ($this->request->filled('from')) {
            $query->whereDate('created_at', '>=', $this->request->from);
        }
        if ($this->request->filled('to')) {
            $query->whereDate('created_at', '<=', $this->request->to);
        }

        return $query->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'Order Number',
            'Status',
            'Shipper',
            'Carrier',
            'Pickup City',
            'Pickup Country',
            'Pickup Date',
            'Delivery City',
            'Delivery Country',
            'Delivery Date',
            'Cargo Type',
            'Weight (kg)',
            'Volume (m³)',
            'Pallets',
            'Price',
            'Currency',
            'Payment Status',
            'Created At',
        ];
    }

    public function map($order): array
    {
        return [
            $order->order_number,
            ucfirst(str_replace('_', ' ', $order->status ?? '')),
            $order->shipper->name ?? '-',
            $order->carrier->name ?? '-',
            $order->pickup_city,
            $order->pickup_country,
            $order->pickup_date?->format('d.m.Y'),
            $order->delivery_city,
            $order->delivery_country,
            $order->delivery_date?->format('d.m.Y'),
            $order->cargo_type,
            $order->weight,
            $order->volume,
            $order->pallet_count,
            $order->total_price,
            $order->currency ?? 'EUR',
            ucfirst($order->payment_status ?? 'pending'),
            $order->created_at?->format('d.m.Y H:i'),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 11]],
        ];
    }
}
