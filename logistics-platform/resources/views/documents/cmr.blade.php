<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CMR {{ $cmrNumber }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10px; color: #1a1a1a; line-height: 1.4; }
        .container { padding: 20px 30px; }

        .title-bar { background: #1e40af; color: #fff; padding: 10px 15px; text-align: center; margin-bottom: 15px; }
        .title-bar h1 { font-size: 18px; letter-spacing: 2px; }
        .title-bar p { font-size: 9px; opacity: 0.8; }

        .cmr-number { text-align: right; font-size: 14px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }

        .grid { border: 1px solid #333; border-collapse: collapse; width: 100%; margin-bottom: 10px; }
        .grid td, .grid th { border: 1px solid #333; padding: 6px 8px; vertical-align: top; }
        .grid th { background: #f3f4f6; font-size: 9px; text-transform: uppercase; color: #4b5563; text-align: left; }
        .grid .box-num { background: #1e40af; color: #fff; font-weight: bold; text-align: center; width: 25px; font-size: 12px; }

        .section-title { font-size: 9px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
        .value { font-weight: bold; font-size: 11px; }

        .signature-row td { height: 50px; vertical-align: bottom; }
        .signature-line { border-top: 1px solid #333; width: 80%; margin-top: 30px; }
        .sig-label { font-size: 8px; color: #6b7280; text-transform: uppercase; }

        .footer { text-align: center; font-size: 8px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="title-bar">
            <h1>CMR CONSIGNMENT NOTE</h1>
            <p>Convention relative au contrat de transport international de Marchandises par Route (CMR, Geneva 1956)</p>
        </div>

        <div class="cmr-number">{{ $cmrNumber }}</div>

        <table class="grid">
            {{-- Row 1: Sender / Consignee --}}
            <tr>
                <td class="box-num" rowspan="2">1</td>
                <td style="width: 48%;">
                    <div class="section-title">Sender (Shipper)</div>
                    <div class="value">{{ $shipper->name ?? 'N/A' }}</div>
                    <div>{{ $shipper->address ?? '' }}</div>
                    <div>{{ $shipper->city ?? '' }}, {{ $shipper->country_code ?? '' }}</div>
                    @if($shipper->vat_number ?? false)<div>VAT: {{ $shipper->vat_number }}</div>@endif
                </td>
                <td class="box-num" rowspan="2">2</td>
                <td style="width: 48%;">
                    <div class="section-title">Consignee (Receiver)</div>
                    <div class="value">{{ $order->delivery_company ?? ($order->delivery_contact ?? 'N/A') }}</div>
                    <div>{{ $order->delivery_address ?? '' }}</div>
                    <div>{{ $order->delivery_city ?? '' }}, {{ $order->delivery_country ?? '' }}</div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="section-title">Sender's Reference</div>
                    <div>{{ $order->order_number ?? '' }}</div>
                </td>
                <td>
                    <div class="section-title">Delivery Contact</div>
                    <div>{{ $order->delivery_contact ?? '' }}</div>
                    <div>{{ $order->delivery_phone ?? '' }}</div>
                </td>
            </tr>

            {{-- Row 2: Place of delivery / loading --}}
            <tr>
                <td class="box-num">3</td>
                <td>
                    <div class="section-title">Place of Delivery</div>
                    <div class="value">{{ $order->delivery_address ?? ($freight->destination_city ?? '') }}, {{ $order->delivery_country ?? ($freight->destination_country ?? '') }}</div>
                </td>
                <td class="box-num">4</td>
                <td>
                    <div class="section-title">Place & Date of Loading</div>
                    <div class="value">{{ $order->pickup_address ?? ($freight->origin_city ?? '') }}, {{ $order->pickup_country ?? ($freight->origin_country ?? '') }}</div>
                    <div>Date: {{ $freight->loading_date ?? ($order->pickup_date ?? now()->format('d.m.Y')) }}</div>
                </td>
            </tr>

            {{-- Row 3: Carrier --}}
            <tr>
                <td class="box-num">5</td>
                <td colspan="3">
                    <div class="section-title">Carrier</div>
                    <div class="value">{{ $carrier->name ?? 'N/A' }}</div>
                    <div>{{ $carrier->address ?? '' }}, {{ $carrier->city ?? '' }}, {{ $carrier->country_code ?? '' }}</div>
                    @if($carrier->vat_number ?? false)<div>VAT: {{ $carrier->vat_number }}</div>@endif
                </td>
            </tr>

            {{-- Row 4: Goods description --}}
            <tr>
                <td class="box-num">6</td>
                <td colspan="3">
                    <table style="width: 100%; border: none;">
                        <tr>
                            <th style="border: none; text-align: left; width: 40%;">Description of Goods</th>
                            <th style="border: none; text-align: center; width: 15%;">Packages</th>
                            <th style="border: none; text-align: center; width: 15%;">Gross Weight (kg)</th>
                            <th style="border: none; text-align: center; width: 15%;">Volume (m³)</th>
                            <th style="border: none; text-align: center; width: 15%;">ADR/IMO</th>
                        </tr>
                        <tr>
                            <td style="border: none;">{{ $freight->cargo_description ?? ($freight->title ?? 'General cargo') }}</td>
                            <td style="border: none; text-align: center;">{{ $freight->packages ?? '-' }}</td>
                            <td style="border: none; text-align: center;">{{ number_format($freight->weight ?? 0, 0) }}</td>
                            <td style="border: none; text-align: center;">{{ $freight->volume ?? '-' }}</td>
                            <td style="border: none; text-align: center;">{{ ($freight->is_hazardous ?? false) ? 'YES' : 'NO' }}</td>
                        </tr>
                    </table>
                </td>
            </tr>

            {{-- Row 5: Vehicle --}}
            <tr>
                <td class="box-num">7</td>
                <td>
                    <div class="section-title">Vehicle Type</div>
                    <div class="value">{{ ucfirst($vehicle->vehicle_type ?? ($freight->vehicle_type ?? 'Standard')) }}</div>
                </td>
                <td class="box-num">8</td>
                <td>
                    <div class="section-title">Vehicle Registration</div>
                    <div class="value">{{ $vehicle->registration_number ?? '-' }}</div>
                    <div>Capacity: {{ number_format($vehicle->capacity_kg ?? 0, 0) }} kg</div>
                </td>
            </tr>

            {{-- Row 6: Instructions --}}
            <tr>
                <td class="box-num">9</td>
                <td colspan="3">
                    <div class="section-title">Special Instructions / Remarks</div>
                    <div>{{ $freight->special_requirements ?? ($order->notes ?? 'None') }}</div>
                    @if($freight->requires_temperature_control ?? false)
                    <div style="color: #b91c1c; font-weight: bold;">⚠ TEMPERATURE CONTROLLED: {{ $freight->temperature_min ?? '?' }}°C – {{ $freight->temperature_max ?? '?' }}°C</div>
                    @endif
                </td>
            </tr>

            {{-- Row 7: Price --}}
            <tr>
                <td class="box-num">10</td>
                <td>
                    <div class="section-title">Agreed Price</div>
                    <div class="value">{{ number_format($order->total_price ?? ($freight->price ?? 0), 2) }} {{ $order->currency ?? ($freight->currency ?? 'EUR') }}</div>
                </td>
                <td class="box-num">11</td>
                <td>
                    <div class="section-title">Payment Terms</div>
                    <div>{{ $order->payment_terms ?? '30 days net' }}</div>
                </td>
            </tr>

            {{-- Signatures --}}
            <tr class="signature-row">
                <td class="box-num">12</td>
                <td>
                    <div class="sig-label">Sender's Signature & Stamp</div>
                    <div class="signature-line"></div>
                    <div style="font-size: 8px; color: #9ca3af; margin-top: 5px;">Place: ________________ Date: ________________</div>
                </td>
                <td class="box-num">13</td>
                <td>
                    <div class="sig-label">Carrier's Signature & Stamp</div>
                    <div class="signature-line"></div>
                    <div style="font-size: 8px; color: #9ca3af; margin-top: 5px;">Place: ________________ Date: ________________</div>
                </td>
            </tr>
            <tr class="signature-row">
                <td class="box-num">14</td>
                <td colspan="3">
                    <div class="sig-label">Consignee's Signature — Goods Received</div>
                    <div style="display: inline-block; width: 45%;">
                        <div class="signature-line"></div>
                        <div style="font-size: 8px; color: #9ca3af; margin-top: 5px;">Place: ________________ Date: ________________ Time: ________________</div>
                    </div>
                    <div style="display: inline-block; width: 45%; margin-left: 5%;">
                        <div class="section-title">Remarks on reception</div>
                        <div style="border: 1px dotted #999; min-height: 30px; padding: 4px;"></div>
                    </div>
                </td>
            </tr>
        </table>

        <div class="footer">
            Generated by LogiMarket &mdash; {{ $generatedAt }} &bull; CMR Note per Convention of Geneva, 19 May 1956 &bull; {{ $cmrNumber }}
        </div>
    </div>
</body>
</html>
