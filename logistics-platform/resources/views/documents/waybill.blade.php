<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Waybill {{ $waybillNumber }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10px; color: #1a1a1a; line-height: 1.4; }
        .container { padding: 25px 35px; }
        .header { border-bottom: 3px solid #059669; padding-bottom: 12px; margin-bottom: 15px; }
        .header h1 { font-size: 22px; color: #059669; display: inline-block; }
        .header .wb-number { float: right; font-size: 16px; font-weight: bold; color: #059669; margin-top: 5px; }
        .clear { clear: both; }
        .grid { border: 1px solid #333; border-collapse: collapse; width: 100%; margin-bottom: 12px; }
        .grid td, .grid th { border: 1px solid #333; padding: 6px 8px; vertical-align: top; }
        .grid th { background: #ecfdf5; font-size: 9px; text-transform: uppercase; color: #065f46; text-align: left; }
        .section { font-size: 9px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 3px; }
        .value { font-weight: bold; font-size: 11px; }
        .signature-area { height: 50px; }
        .sig-line { border-top: 1px solid #333; width: 70%; margin-top: 35px; }
        .footer { text-align: center; font-size: 8px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 20px; }
        .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 3px; font-size: 9px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>WAYBILL</h1>
            <div class="wb-number">{{ $waybillNumber }}</div>
            <div class="clear"></div>
            <div style="font-size: 9px; color: #6b7280;">Transport Document — Road Freight</div>
        </div>

        {{-- Parties --}}
        <table class="grid">
            <tr>
                <th style="width: 50%;">Shipper / Consignor</th>
                <th style="width: 50%;">Carrier / Transporter</th>
            </tr>
            <tr>
                <td>
                    <div class="value">{{ $shipper->name ?? 'N/A' }}</div>
                    <div>{{ $shipper->address ?? '' }}</div>
                    <div>{{ $shipper->city ?? '' }}, {{ $shipper->country_code ?? '' }}</div>
                    @if($shipper->phone ?? false)<div>Tel: {{ $shipper->phone }}</div>@endif
                </td>
                <td>
                    <div class="value">{{ $carrier->name ?? 'N/A' }}</div>
                    <div>{{ $carrier->address ?? '' }}</div>
                    <div>{{ $carrier->city ?? '' }}, {{ $carrier->country_code ?? '' }}</div>
                    @if($carrier->phone ?? false)<div>Tel: {{ $carrier->phone }}</div>@endif
                </td>
            </tr>
        </table>

        {{-- Route --}}
        <table class="grid">
            <tr>
                <th style="width: 50%;">Origin / Pickup</th>
                <th style="width: 50%;">Destination / Delivery</th>
            </tr>
            <tr>
                <td>
                    <div class="value">{{ $order->pickup_address ?? ($freight->origin_city ?? '') }}</div>
                    <div>{{ $order->pickup_city ?? '' }}, {{ $order->pickup_country ?? ($freight->origin_country ?? '') }}</div>
                    <div class="section" style="margin-top: 5px;">Pickup Date</div>
                    <div>{{ $freight->loading_date ?? ($order->pickup_date ?? '-') }}</div>
                </td>
                <td>
                    <div class="value">{{ $order->delivery_address ?? ($freight->destination_city ?? '') }}</div>
                    <div>{{ $order->delivery_city ?? '' }}, {{ $order->delivery_country ?? ($freight->destination_country ?? '') }}</div>
                    <div class="section" style="margin-top: 5px;">Expected Delivery</div>
                    <div>{{ $freight->unloading_date ?? ($order->delivery_date ?? '-') }}</div>
                </td>
            </tr>
        </table>

        {{-- Goods --}}
        <table class="grid">
            <tr>
                <th>Description of Goods</th>
                <th style="width: 12%; text-align: center;">Weight (kg)</th>
                <th style="width: 12%; text-align: center;">Volume (m³)</th>
                <th style="width: 12%; text-align: center;">Packages</th>
                <th style="width: 14%; text-align: center;">Vehicle Type</th>
            </tr>
            <tr>
                <td>{{ $freight->cargo_description ?? ($freight->title ?? 'General cargo') }}</td>
                <td style="text-align: center;">{{ number_format($freight->weight ?? 0, 0) }}</td>
                <td style="text-align: center;">{{ $freight->volume ?? '-' }}</td>
                <td style="text-align: center;">{{ $freight->packages ?? '-' }}</td>
                <td style="text-align: center;">{{ ucfirst($freight->vehicle_type ?? 'Standard') }}</td>
            </tr>
        </table>

        {{-- Special conditions --}}
        <table class="grid">
            <tr>
                <th style="width: 50%;">Special Conditions / Instructions</th>
                <th style="width: 25%;">Hazardous</th>
                <th style="width: 25%;">Temperature Controlled</th>
            </tr>
            <tr>
                <td>{{ $freight->special_requirements ?? ($order->notes ?? 'None') }}</td>
                <td style="text-align: center;">
                    @if($freight->is_hazardous ?? false)
                        <span style="color: #dc2626; font-weight: bold;">YES — ADR</span>
                    @else
                        NO
                    @endif
                </td>
                <td style="text-align: center;">
                    @if($freight->requires_temperature_control ?? false)
                        <span style="color: #2563eb; font-weight: bold;">YES ({{ $freight->temperature_min ?? '?' }}°C – {{ $freight->temperature_max ?? '?' }}°C)</span>
                    @else
                        NO
                    @endif
                </td>
            </tr>
        </table>

        {{-- Financial --}}
        <table class="grid">
            <tr>
                <th style="width: 33%;">Agreed Price</th>
                <th style="width: 33%;">Payment Terms</th>
                <th style="width: 34%;">Order Reference</th>
            </tr>
            <tr>
                <td class="value">{{ number_format($order->total_price ?? ($freight->price ?? 0), 2) }} {{ $order->currency ?? ($freight->currency ?? 'EUR') }}</td>
                <td>{{ $order->payment_terms ?? '30 days net' }}</td>
                <td class="value">{{ $order->order_number ?? '-' }}</td>
            </tr>
        </table>

        {{-- Signatures --}}
        <table class="grid">
            <tr>
                <th style="width: 33%;">Shipper's Signature</th>
                <th style="width: 33%;">Carrier's Signature</th>
                <th style="width: 34%;">Receiver's Signature</th>
            </tr>
            <tr>
                <td class="signature-area">
                    <div class="sig-line"></div>
                    <div style="font-size: 8px; color: #9ca3af;">Date: _______________</div>
                </td>
                <td class="signature-area">
                    <div class="sig-line"></div>
                    <div style="font-size: 8px; color: #9ca3af;">Date: _______________</div>
                </td>
                <td class="signature-area">
                    <div class="sig-line"></div>
                    <div style="font-size: 8px; color: #9ca3af;">Date: _______________</div>
                </td>
            </tr>
        </table>

        <div class="footer">
            Generated by LogiMarket &mdash; {{ $generatedAt }} &bull; {{ $waybillNumber }}
        </div>
    </div>
</body>
</html>
