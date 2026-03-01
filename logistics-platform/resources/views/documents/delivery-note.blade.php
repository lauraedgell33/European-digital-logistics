<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Delivery Note {{ $noteNumber }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10px; color: #1a1a1a; line-height: 1.4; }
        .container { padding: 25px 35px; }
        .header { border-bottom: 3px solid #7c3aed; padding-bottom: 12px; margin-bottom: 15px; }
        .header h1 { font-size: 22px; color: #7c3aed; }
        .header .dn-number { font-size: 14px; font-weight: bold; color: #7c3aed; }
        .grid { border: 1px solid #333; border-collapse: collapse; width: 100%; margin-bottom: 12px; }
        .grid td, .grid th { border: 1px solid #333; padding: 6px 8px; vertical-align: top; }
        .grid th { background: #f5f3ff; font-size: 9px; text-transform: uppercase; color: #5b21b6; text-align: left; }
        .value { font-weight: bold; font-size: 11px; }
        .section { font-size: 9px; text-transform: uppercase; color: #6b7280; }
        .footer { text-align: center; font-size: 8px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 20px; }
        .checklist td { padding: 4px 8px; }
        .checkbox { display: inline-block; width: 12px; height: 12px; border: 1px solid #333; margin-right: 5px; vertical-align: middle; }
    </style>
</head>
<body>
    <div class="container">
        <table style="width: 100%; margin-bottom: 15px; border-bottom: 3px solid #7c3aed; padding-bottom: 12px;">
            <tr>
                <td style="width: 60%;">
                    <h1 style="font-size: 22px; color: #7c3aed;">DELIVERY NOTE</h1>
                    <div style="font-size: 9px; color: #6b7280;">Proof of Delivery Document</div>
                </td>
                <td style="width: 40%; text-align: right;">
                    <div style="font-size: 14px; font-weight: bold; color: #7c3aed;">{{ $noteNumber }}</div>
                    <div style="font-size: 10px; color: #6b7280;">Date: {{ now()->format('d.m.Y') }}</div>
                    <div style="font-size: 10px; color: #6b7280;">Order: {{ $order->order_number ?? '-' }}</div>
                </td>
            </tr>
        </table>

        {{-- Parties --}}
        <table class="grid">
            <tr>
                <th style="width: 33%;">Shipper</th>
                <th style="width: 33%;">Carrier</th>
                <th style="width: 34%;">Consignee / Receiver</th>
            </tr>
            <tr>
                <td>
                    <div class="value">{{ $shipper->name ?? 'N/A' }}</div>
                    <div>{{ $shipper->address ?? '' }}</div>
                    <div>{{ $shipper->city ?? '' }}, {{ $shipper->country_code ?? '' }}</div>
                </td>
                <td>
                    <div class="value">{{ $carrier->name ?? 'N/A' }}</div>
                    <div>{{ $carrier->address ?? '' }}</div>
                    <div>{{ $carrier->city ?? '' }}, {{ $carrier->country_code ?? '' }}</div>
                </td>
                <td>
                    <div class="value">{{ $order->delivery_company ?? ($order->delivery_contact ?? 'N/A') }}</div>
                    <div>{{ $order->delivery_address ?? '' }}</div>
                    <div>{{ $order->delivery_city ?? '' }}, {{ $order->delivery_country ?? '' }}</div>
                </td>
            </tr>
        </table>

        {{-- Goods --}}
        <table class="grid">
            <tr>
                <th style="width: 40%;">Goods Description</th>
                <th style="width: 15%; text-align: center;">Weight (kg)</th>
                <th style="width: 15%; text-align: center;">Volume (m³)</th>
                <th style="width: 15%; text-align: center;">Packages</th>
                <th style="width: 15%; text-align: center;">Condition</th>
            </tr>
            <tr>
                <td>{{ $freight->cargo_description ?? ($freight->title ?? 'General cargo') }}</td>
                <td style="text-align: center;">{{ number_format($freight->weight ?? 0, 0) }}</td>
                <td style="text-align: center;">{{ $freight->volume ?? '-' }}</td>
                <td style="text-align: center;">{{ $freight->packages ?? '-' }}</td>
                <td style="text-align: center; font-weight: bold; color: #059669;">GOOD</td>
            </tr>
        </table>

        {{-- Delivery Checklist --}}
        <table class="grid">
            <tr>
                <th colspan="2">Delivery Checklist</th>
            </tr>
            <tr class="checklist">
                <td style="width: 50%;"><span class="checkbox"></span> Goods received in good condition</td>
                <td style="width: 50%;"><span class="checkbox"></span> Correct quantity delivered</td>
            </tr>
            <tr class="checklist">
                <td><span class="checkbox"></span> Packaging intact / undamaged</td>
                <td><span class="checkbox"></span> Seals intact (if applicable)</td>
            </tr>
            <tr class="checklist">
                <td><span class="checkbox"></span> Temperature within range (if applicable)</td>
                <td><span class="checkbox"></span> All documents received</td>
            </tr>
        </table>

        {{-- Remarks --}}
        <table class="grid">
            <tr><th>Remarks / Damages / Discrepancies</th></tr>
            <tr><td style="min-height: 50px; height: 60px;">
                {{ $order->notes ?? '' }}
            </td></tr>
        </table>

        {{-- Signatures --}}
        <table class="grid">
            <tr>
                <th style="width: 50%;">Delivered By (Driver)</th>
                <th style="width: 50%;">Received By (Consignee)</th>
            </tr>
            <tr>
                <td style="height: 70px; vertical-align: bottom;">
                    <div>Name: ________________________________</div>
                    <div style="margin-top: 8px;">Signature: ____________________________</div>
                    <div style="margin-top: 8px;">Date / Time: __________________________</div>
                </td>
                <td style="height: 70px; vertical-align: bottom;">
                    <div>Name: ________________________________</div>
                    <div style="margin-top: 8px;">Signature: ____________________________</div>
                    <div style="margin-top: 8px;">Date / Time: __________________________</div>
                    <div style="margin-top: 8px;">Stamp:</div>
                </td>
            </tr>
        </table>

        <div class="footer">
            Generated by LogiMarket &mdash; {{ $generatedAt }} &bull; {{ $noteNumber }}
        </div>
    </div>
</body>
</html>
