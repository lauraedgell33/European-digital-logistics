<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Transport Order — {{ $order->order_number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1a1a1a; margin: 0; padding: 30px; }
        .header { border-bottom: 3px solid #0070f3; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 22px; margin: 0; color: #0070f3; }
        .header .order-num { font-size: 14px; color: #666; margin-top: 4px; }
        .grid { display: table; width: 100%; margin-bottom: 20px; }
        .grid-half { display: table-cell; width: 48%; vertical-align: top; }
        .grid-spacer { display: table-cell; width: 4%; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 13px; color: #0070f3; border-bottom: 1px solid #eaeaea; padding-bottom: 6px; margin: 0 0 10px; }
        .field { margin-bottom: 6px; }
        .field .label { font-weight: 600; color: #555; display: inline-block; width: 140px; }
        .field .value { color: #1a1a1a; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-accepted { background: #d4edda; color: #155724; }
        .status-in_transit { background: #cce5ff; color: #004085; }
        .status-completed { background: #d1e7dd; color: #0f5132; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        .footer { margin-top: 40px; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        .signature { margin-top: 40px; display: table; width: 100%; }
        .signature-box { display: table-cell; width: 45%; border-top: 1px solid #999; padding-top: 8px; text-align: center; font-size: 10px; color: #666; }
        .signature-spacer { display: table-cell; width: 10%; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Transport Order</h1>
        <p class="order-num">{{ $order->order_number }}</p>
        <span class="status-badge status-{{ $order->status }}">
            {{ ucfirst(str_replace('_', ' ', $order->status ?? '')) }}
        </span>
    </div>

    <div class="grid">
        <div class="grid-half">
            <div class="section">
                <h2>Pickup</h2>
                <div class="field"><span class="label">City:</span> <span class="value">{{ $order->pickup_city }}, {{ $order->pickup_country }}</span></div>
                <div class="field"><span class="label">Address:</span> <span class="value">{{ $order->pickup_address ?? '-' }}</span></div>
                <div class="field"><span class="label">Postal Code:</span> <span class="value">{{ $order->pickup_postal_code ?? '-' }}</span></div>
                <div class="field"><span class="label">Date:</span> <span class="value">{{ $order->pickup_date?->format('d.m.Y') }}</span></div>
                <div class="field"><span class="label">Time Window:</span> <span class="value">{{ $order->pickup_time_from ?? '-' }} – {{ $order->pickup_time_to ?? '-' }}</span></div>
                <div class="field"><span class="label">Contact:</span> <span class="value">{{ $order->pickup_contact_name ?? '-' }}</span></div>
                <div class="field"><span class="label">Phone:</span> <span class="value">{{ $order->pickup_contact_phone ?? '-' }}</span></div>
            </div>
        </div>
        <div class="grid-spacer"></div>
        <div class="grid-half">
            <div class="section">
                <h2>Delivery</h2>
                <div class="field"><span class="label">City:</span> <span class="value">{{ $order->delivery_city }}, {{ $order->delivery_country }}</span></div>
                <div class="field"><span class="label">Address:</span> <span class="value">{{ $order->delivery_address ?? '-' }}</span></div>
                <div class="field"><span class="label">Postal Code:</span> <span class="value">{{ $order->delivery_postal_code ?? '-' }}</span></div>
                <div class="field"><span class="label">Date:</span> <span class="value">{{ $order->delivery_date?->format('d.m.Y') }}</span></div>
                <div class="field"><span class="label">Time Window:</span> <span class="value">{{ $order->delivery_time_from ?? '-' }} – {{ $order->delivery_time_to ?? '-' }}</span></div>
                <div class="field"><span class="label">Contact:</span> <span class="value">{{ $order->delivery_contact_name ?? '-' }}</span></div>
                <div class="field"><span class="label">Phone:</span> <span class="value">{{ $order->delivery_contact_phone ?? '-' }}</span></div>
            </div>
        </div>
    </div>

    <div class="grid">
        <div class="grid-half">
            <div class="section">
                <h2>Cargo Details</h2>
                <div class="field"><span class="label">Type:</span> <span class="value">{{ $order->cargo_type ?? '-' }}</span></div>
                <div class="field"><span class="label">Description:</span> <span class="value">{{ $order->cargo_description ?? '-' }}</span></div>
                <div class="field"><span class="label">Weight:</span> <span class="value">{{ $order->weight ? number_format($order->weight, 0) . ' kg' : '-' }}</span></div>
                <div class="field"><span class="label">Volume:</span> <span class="value">{{ $order->volume ? number_format($order->volume, 1) . ' m³' : '-' }}</span></div>
                <div class="field"><span class="label">Pallets:</span> <span class="value">{{ $order->pallet_count ?? '-' }}</span></div>
            </div>
        </div>
        <div class="grid-spacer"></div>
        <div class="grid-half">
            <div class="section">
                <h2>Financial</h2>
                <div class="field"><span class="label">Total Price:</span> <span class="value">€{{ number_format($order->total_price ?? 0, 2) }}</span></div>
                <div class="field"><span class="label">Currency:</span> <span class="value">{{ $order->currency ?? 'EUR' }}</span></div>
                <div class="field"><span class="label">Payment Terms:</span> <span class="value">{{ $order->payment_terms ?? '-' }}</span></div>
                <div class="field"><span class="label">Payment Status:</span> <span class="value">{{ ucfirst($order->payment_status ?? 'pending') }}</span></div>
            </div>
        </div>
    </div>

    <div class="grid">
        <div class="grid-half">
            <div class="section">
                <h2>Shipper</h2>
                <div class="field"><span class="label">Company:</span> <span class="value">{{ $order->shipper->name ?? '-' }}</span></div>
            </div>
        </div>
        <div class="grid-spacer"></div>
        <div class="grid-half">
            <div class="section">
                <h2>Carrier</h2>
                <div class="field"><span class="label">Company:</span> <span class="value">{{ $order->carrier->name ?? '-' }}</span></div>
            </div>
        </div>
    </div>

    @if($order->special_instructions)
    <div class="section">
        <h2>Special Instructions</h2>
        <p>{{ $order->special_instructions }}</p>
    </div>
    @endif

    <div class="signature">
        <div class="signature-box">Shipper Signature / Stamp</div>
        <div class="signature-spacer"></div>
        <div class="signature-box">Carrier Signature / Stamp</div>
    </div>

    <div class="footer">
        LogiMarket — European Digital Logistics Marketplace &bull; Generated: {{ $generatedAt }}
    </div>
</body>
</html>
