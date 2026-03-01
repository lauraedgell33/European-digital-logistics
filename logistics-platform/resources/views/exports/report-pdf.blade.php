<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ ucfirst($type) }} Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10px; color: #1a1a1a; line-height: 1.5; }
        .container { padding: 25px 30px; }
        .header { border-bottom: 3px solid #1e40af; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { font-size: 20px; color: #1e40af; }
        .header .subtitle { font-size: 10px; color: #6b7280; }
        .header .company { float: right; text-align: right; font-size: 11px; }
        .clear { clear: both; }

        .kpi-grid { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .kpi-grid td { padding: 10px 15px; text-align: center; border: 1px solid #e5e7eb; width: 25%; }
        .kpi-label { font-size: 9px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
        .kpi-value { font-size: 18px; font-weight: bold; color: #1e40af; margin-top: 3px; }
        .kpi-change { font-size: 9px; margin-top: 2px; }
        .positive { color: #059669; }
        .negative { color: #dc2626; }

        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .data-table th { background: #1e40af; color: #fff; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; }
        .data-table td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
        .data-table tr:nth-child(even) { background: #f9fafb; }
        .data-table .right { text-align: right; font-family: monospace; }

        .section-title { font-size: 13px; font-weight: bold; color: #1e40af; margin: 15px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        .footer { text-align: center; font-size: 8px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 25px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company">
                <strong>{{ $company->name ?? 'LogiMarket' }}</strong><br>
                {{ $company->country_code ?? '' }}
            </div>
            <h1>{{ strtoupper($type) }} REPORT</h1>
            <div class="subtitle">Generated: {{ $generatedAt }} &bull; LogiMarket Analytics</div>
            <div class="clear"></div>
        </div>

        @if($type === 'revenue' && isset($data['summary']))
        <table class="kpi-grid">
            <tr>
                <td>
                    <div class="kpi-label">Total Revenue</div>
                    <div class="kpi-value">€{{ number_format($data['summary']['total_revenue'] ?? 0, 0) }}</div>
                </td>
                <td>
                    <div class="kpi-label">Total Orders</div>
                    <div class="kpi-value">{{ $data['summary']['total_orders'] ?? 0 }}</div>
                </td>
                <td>
                    <div class="kpi-label">Avg Order Value</div>
                    <div class="kpi-value">€{{ number_format($data['summary']['avg_order_value'] ?? 0, 0) }}</div>
                </td>
                <td>
                    <div class="kpi-label">YoY Growth</div>
                    <div class="kpi-value {{ ($data['summary']['yoy_growth_pct'] ?? 0) >= 0 ? 'positive' : 'negative' }}">
                        {{ ($data['summary']['yoy_growth_pct'] ?? 0) >= 0 ? '+' : '' }}{{ $data['summary']['yoy_growth_pct'] ?? 0 }}%
                    </div>
                </td>
            </tr>
        </table>

        @if(!empty($data['chart_data']))
        <div class="section-title">Monthly Revenue Breakdown</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Month</th>
                    <th class="right">Revenue</th>
                    <th class="right">Orders</th>
                    <th class="right">Avg Order</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['chart_data'] as $row)
                <tr>
                    <td>{{ $row['month'] }}</td>
                    <td class="right">€{{ number_format($row['revenue'], 2) }}</td>
                    <td class="right">{{ $row['orders'] }}</td>
                    <td class="right">€{{ number_format($row['avg_order_value'], 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
        @endif

        @if($type === 'orders' && isset($data['summary']))
        <table class="kpi-grid">
            <tr>
                <td>
                    <div class="kpi-label">Total Orders</div>
                    <div class="kpi-value">{{ $data['summary']['total'] ?? 0 }}</div>
                </td>
                <td>
                    <div class="kpi-label">Completed</div>
                    <div class="kpi-value positive">{{ $data['summary']['completed'] ?? 0 }}</div>
                </td>
                <td>
                    <div class="kpi-label">Completion Rate</div>
                    <div class="kpi-value">{{ $data['summary']['completion_rate'] ?? 0 }}%</div>
                </td>
                <td>
                    <div class="kpi-label">Cancellation Rate</div>
                    <div class="kpi-value negative">{{ $data['summary']['cancellation_rate'] ?? 0 }}%</div>
                </td>
            </tr>
        </table>
        @endif

        @if($type === 'routes' && isset($data['routes']))
        <div class="section-title">Top Routes ({{ $data['total_routes'] ?? 0 }} routes)</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Route</th>
                    <th class="right">Orders</th>
                    <th class="right">Completed</th>
                    <th class="right">Avg Price</th>
                    <th class="right">Total Revenue</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['routes'] as $route)
                <tr>
                    <td>{{ $route['route'] }}</td>
                    <td class="right">{{ $route['total_orders'] }}</td>
                    <td class="right">{{ $route['completed'] }}</td>
                    <td class="right">€{{ number_format($route['avg_price'], 2) }}</td>
                    <td class="right">€{{ number_format($route['total_revenue'], 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        @if($type === 'carriers' && isset($data['carriers']))
        <div class="section-title">Carrier Performance ({{ $data['total_carriers'] ?? 0 }} carriers)</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Carrier</th>
                    <th class="right">Rating</th>
                    <th class="right">Orders</th>
                    <th class="right">Completion %</th>
                    <th class="right">Total Spent</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['carriers'] as $carrier)
                <tr>
                    <td>{{ $carrier['carrier_name'] }}</td>
                    <td class="right">{{ $carrier['rating'] }}/5</td>
                    <td class="right">{{ $carrier['total_orders'] }}</td>
                    <td class="right">{{ $carrier['completion_rate'] }}%</td>
                    <td class="right">€{{ number_format($carrier['total_spent'], 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        @if($type === 'carbon' && isset($data['summary']))
        <table class="kpi-grid">
            <tr>
                <td>
                    <div class="kpi-label">Total CO₂</div>
                    <div class="kpi-value">{{ number_format($data['summary']['total_co2_kg'] ?? 0, 0) }} kg</div>
                </td>
                <td>
                    <div class="kpi-label">Offset</div>
                    <div class="kpi-value positive">{{ number_format($data['summary']['total_offset_kg'] ?? 0, 0) }} kg</div>
                </td>
                <td>
                    <div class="kpi-label">Net CO₂</div>
                    <div class="kpi-value">{{ number_format($data['summary']['net_co2_kg'] ?? 0, 0) }} kg</div>
                </td>
                <td>
                    <div class="kpi-label">Offset Rate</div>
                    <div class="kpi-value">{{ $data['summary']['offset_rate_pct'] ?? 0 }}%</div>
                </td>
            </tr>
        </table>
        @endif

        @if($type === 'summary' && isset($data['orders']))
        <table class="kpi-grid">
            <tr>
                <td>
                    <div class="kpi-label">Orders This Month</div>
                    <div class="kpi-value">{{ $data['orders']['this_month'] ?? 0 }}</div>
                    <div class="kpi-change {{ ($data['orders']['change_pct'] ?? 0) >= 0 ? 'positive' : 'negative' }}">
                        {{ ($data['orders']['change_pct'] ?? 0) >= 0 ? '↑' : '↓' }} {{ abs($data['orders']['change_pct'] ?? 0) }}% vs last month
                    </div>
                </td>
                <td>
                    <div class="kpi-label">Revenue This Month</div>
                    <div class="kpi-value">€{{ number_format($data['revenue']['this_month'] ?? 0, 0) }}</div>
                    <div class="kpi-change {{ ($data['revenue']['change_pct'] ?? 0) >= 0 ? 'positive' : 'negative' }}">
                        {{ ($data['revenue']['change_pct'] ?? 0) >= 0 ? '↑' : '↓' }} {{ abs($data['revenue']['change_pct'] ?? 0) }}%
                    </div>
                </td>
                <td>
                    <div class="kpi-label">Active Freight</div>
                    <div class="kpi-value">{{ $data['active_listings']['freight'] ?? 0 }}</div>
                </td>
                <td>
                    <div class="kpi-label">Pending Invoices</div>
                    <div class="kpi-value">€{{ number_format($data['financials']['pending_invoices_amount'] ?? 0, 0) }}</div>
                </td>
            </tr>
        </table>
        @endif

        <div class="footer">
            LogiMarket Analytics Report &mdash; Generated {{ $generatedAt }} &bull; Confidential
        </div>
    </div>
</body>
</html>
