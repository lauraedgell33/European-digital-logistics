<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Analytics Report</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1a1a1a; margin: 0; padding: 30px; }
        .header { border-bottom: 3px solid #0070f3; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 22px; margin: 0; color: #0070f3; }
        .header .sub { font-size: 12px; color: #666; margin-top: 4px; }
        .summary { display: table; width: 100%; margin-bottom: 24px; }
        .summary-item { display: table-cell; width: 25%; text-align: center; padding: 12px; }
        .summary-item .value { font-size: 22px; font-weight: bold; color: #0070f3; }
        .summary-item .label { font-size: 10px; color: #666; margin-top: 4px; }
        .summary-item .box { background: #f5f5f5; border-radius: 6px; padding: 16px 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        thead th { background: #0070f3; color: #fff; padding: 8px 12px; text-align: left; font-size: 10px; }
        tbody td { padding: 7px 12px; border-bottom: 1px solid #eaeaea; font-size: 10px; }
        tbody tr:nth-child(even) { background: #fafafa; }
        .section h2 { font-size: 14px; color: #0070f3; margin: 24px 0 8px; border-bottom: 1px solid #eaeaea; padding-bottom: 6px; }
        .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Analytics Report</h1>
        <p class="sub">{{ $company->name ?? 'LogiMarket' }} &bull; Generated {{ $generatedAt }}</p>
    </div>

    <div class="summary">
        <div class="summary-item">
            <div class="box">
                <div class="value">{{ number_format($totalOrders) }}</div>
                <div class="label">Total Orders</div>
            </div>
        </div>
        <div class="summary-item">
            <div class="box">
                <div class="value">{{ number_format($completedOrders) }}</div>
                <div class="label">Completed</div>
            </div>
        </div>
        <div class="summary-item">
            <div class="box">
                <div class="value">€{{ number_format($totalRevenue, 0) }}</div>
                <div class="label">Total Revenue</div>
            </div>
        </div>
        <div class="summary-item">
            <div class="box">
                <div class="value">€{{ number_format($avgValue, 0) }}</div>
                <div class="label">Avg. Order Value</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Monthly Breakdown</h2>
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Total Orders</th>
                    <th>Completed</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
                @forelse($monthly as $row)
                <tr>
                    <td><strong>{{ $row->month }}</strong></td>
                    <td>{{ number_format($row->total) }}</td>
                    <td>{{ number_format($row->completed) }}</td>
                    <td>€{{ number_format($row->revenue, 2) }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="4" style="text-align: center; padding: 16px; color: #999;">No data available</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="footer">
        LogiMarket — European Digital Logistics Marketplace &bull; {{ $generatedAt }}
    </div>
</body>
</html>
