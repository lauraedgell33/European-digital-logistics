<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Transport Orders Report</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a1a1a; margin: 0; padding: 20px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0070f3; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { font-size: 18px; margin: 0; color: #0070f3; }
        .header .meta { text-align: right; color: #666; font-size: 9px; }
        .filters { background: #f5f5f5; padding: 8px 12px; border-radius: 4px; margin-bottom: 16px; font-size: 9px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        thead th { background: #0070f3; color: #fff; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: 600; }
        tbody td { padding: 5px 8px; border-bottom: 1px solid #eaeaea; font-size: 9px; }
        tbody tr:nth-child(even) { background: #fafafa; }
        .status { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 8px; font-weight: 600; text-transform: uppercase; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-accepted { background: #d4edda; color: #155724; }
        .status-in_transit { background: #cce5ff; color: #004085; }
        .status-completed { background: #d1e7dd; color: #0f5132; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        .footer { margin-top: 20px; text-align: center; font-size: 8px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
        .summary { display: flex; gap: 20px; margin: 12px 0; }
        .summary-box { background: #f5f5f5; padding: 10px 16px; border-radius: 4px; text-align: center; }
        .summary-box .value { font-size: 18px; font-weight: bold; color: #0070f3; }
        .summary-box .label { font-size: 9px; color: #666; margin-top: 2px; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>Transport Orders Report</h1>
            <p style="margin: 4px 0 0; color: #666;">{{ $company->name ?? 'LogiMarket' }}</p>
        </div>
        <div class="meta">
            <p>Generated: {{ $generatedAt }}</p>
            <p>Total records: {{ $orders->count() }}</p>
        </div>
    </div>

    @if(!empty($filters['status']) || !empty($filters['from']) || !empty($filters['to']))
    <div class="filters">
        <strong>Filters:</strong>
        @if(!empty($filters['status'])) Status: {{ ucfirst($filters['status']) }} | @endif
        @if(!empty($filters['from'])) From: {{ $filters['from'] }} | @endif
        @if(!empty($filters['to'])) To: {{ $filters['to'] }} @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>Order #</th>
                <th>Status</th>
                <th>Shipper</th>
                <th>Carrier</th>
                <th>Pickup</th>
                <th>Delivery</th>
                <th>Cargo</th>
                <th>Weight</th>
                <th>Price</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @forelse($orders as $order)
            <tr>
                <td><strong>{{ $order->order_number }}</strong></td>
                <td>
                    <span class="status status-{{ $order->status }}">
                        {{ ucfirst(str_replace('_', ' ', $order->status ?? '')) }}
                    </span>
                </td>
                <td>{{ $order->shipper->name ?? '-' }}</td>
                <td>{{ $order->carrier->name ?? '-' }}</td>
                <td>{{ $order->pickup_city }}, {{ $order->pickup_country }}</td>
                <td>{{ $order->delivery_city }}, {{ $order->delivery_country }}</td>
                <td>{{ $order->cargo_type }}</td>
                <td>{{ $order->weight ? number_format($order->weight, 0) . ' kg' : '-' }}</td>
                <td>{{ $order->total_price ? '€' . number_format($order->total_price, 2) : '-' }}</td>
                <td>{{ $order->created_at?->format('d.m.Y') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="10" style="text-align: center; padding: 20px; color: #999;">No orders found</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        LogiMarket — European Digital Logistics Marketplace &bull; {{ $generatedAt }}
    </div>
</body>
</html>
