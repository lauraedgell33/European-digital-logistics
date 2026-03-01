<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 11px; color: #1a1a1a; line-height: 1.5; }
        .container { padding: 30px 40px; }

        /* Header */
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #1e40af; padding-bottom: 15px; margin-bottom: 25px; }
        .logo-section { width: 50%; }
        .logo-section h1 { font-size: 24px; color: #1e40af; margin-bottom: 4px; }
        .logo-section p { font-size: 10px; color: #6b7280; }
        .invoice-info { width: 45%; text-align: right; }
        .invoice-info h2 { font-size: 28px; color: #1e40af; text-transform: uppercase; letter-spacing: 2px; }
        .invoice-info .number { font-size: 13px; font-weight: bold; margin-top: 5px; }
        .invoice-info .date { font-size: 10px; color: #6b7280; }

        /* Parties */
        .parties { display: flex; justify-content: space-between; margin-bottom: 25px; }
        .party { width: 48%; }
        .party h3 { font-size: 10px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px; margin-bottom: 5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; }
        .party .name { font-weight: bold; font-size: 13px; }

        /* Table */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th { background: #1e40af; color: #fff; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .items-table td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
        .items-table tr:nth-child(even) { background: #f9fafb; }
        .items-table .right { text-align: right; }
        .items-table .num { font-family: monospace; }

        /* Totals */
        .totals { width: 300px; float: right; margin-bottom: 30px; }
        .totals table { width: 100%; border-collapse: collapse; }
        .totals td { padding: 5px 10px; }
        .totals .label { text-align: left; color: #6b7280; }
        .totals .value { text-align: right; font-family: monospace; }
        .totals .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #1e40af; color: #1e40af; }

        /* Payment */
        .payment-info { clear: both; background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 5px; padding: 12px 15px; margin-bottom: 15px; }
        .payment-info h3 { font-size: 11px; color: #1e40af; margin-bottom: 5px; text-transform: uppercase; }

        /* Footer */
        .footer { border-top: 1px solid #e5e7eb; padding-top: 10px; text-align: center; font-size: 9px; color: #9ca3af; margin-top: 30px; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 3px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .status-draft { background: #fef3c7; color: #92400e; }
        .status-sent { background: #dbeafe; color: #1e40af; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-overdue { background: #fee2e2; color: #991b1b; }

        .clear { clear: both; }
    </style>
</head>
<body>
    <div class="container">
        {{-- Header --}}
        <table style="width: 100%; margin-bottom: 25px; border-bottom: 3px solid #1e40af; padding-bottom: 15px;">
            <tr>
                <td style="width: 50%;">
                    <h1 style="font-size: 24px; color: #1e40af; margin-bottom: 4px;">LogiMarket</h1>
                    <p style="font-size: 10px; color: #6b7280;">European Digital Logistics Platform</p>
                </td>
                <td style="width: 50%; text-align: right;">
                    <h2 style="font-size: 28px; color: #1e40af; text-transform: uppercase; letter-spacing: 2px;">INVOICE</h2>
                    <div style="font-size: 13px; font-weight: bold; margin-top: 5px;">{{ $invoice->invoice_number }}</div>
                    <div style="font-size: 10px; color: #6b7280;">
                        Issue Date: {{ \Carbon\Carbon::parse($invoice->issue_date)->format('d.m.Y') }}<br>
                        Due Date: {{ \Carbon\Carbon::parse($invoice->due_date)->format('d.m.Y') }}
                    </div>
                    <span class="status-badge status-{{ $invoice->status }}">{{ strtoupper($invoice->status) }}</span>
                </td>
            </tr>
        </table>

        {{-- Parties --}}
        <table style="width: 100%; margin-bottom: 25px;">
            <tr>
                <td style="width: 48%; vertical-align: top;">
                    <h3 style="font-size: 10px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 5px;">FROM</h3>
                    @if($company)
                        <div style="font-weight: bold; font-size: 13px;">{{ $company->name ?? 'LogiMarket' }}</div>
                        <div>{{ $company->address ?? '' }}</div>
                        <div>{{ $company->city ?? '' }}, {{ $company->country_code ?? '' }}</div>
                        @if($company->vat_number ?? false)<div>VAT: {{ $company->vat_number }}</div>@endif
                    @else
                        <div style="font-weight: bold; font-size: 13px;">LogiMarket Platform</div>
                    @endif
                </td>
                <td style="width: 4%;"></td>
                <td style="width: 48%; vertical-align: top;">
                    <h3 style="font-size: 10px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 5px;">BILL TO</h3>
                    <div style="font-weight: bold; font-size: 13px;">{{ $invoice->customer_name }}</div>
                    <div>{{ $invoice->customer_address ?? '' }}</div>
                    <div>{{ $invoice->customer_country ?? '' }}</div>
                    @if($invoice->customer_vat_number)<div>VAT: {{ $invoice->customer_vat_number }}</div>@endif
                </td>
            </tr>
        </table>

        @if($invoice->transport_order_id)
        <div style="background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 5px; padding: 8px 12px; margin-bottom: 15px; font-size: 10px;">
            <strong>Transport Order:</strong> {{ $invoice->transportOrder->order_number ?? $invoice->transport_order_id }}
        </div>
        @endif

        {{-- Line Items --}}
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 45%;">Description</th>
                    <th class="right" style="width: 12%;">Qty</th>
                    <th class="right" style="width: 18%;">Unit Price</th>
                    <th class="right" style="width: 20%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($lineItems as $i => $item)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $item['description'] ?? '' }}</td>
                    <td class="right num">{{ number_format($item['quantity'] ?? 0, 0) }}</td>
                    <td class="right num">{{ number_format($item['unit_price'] ?? 0, 2) }} {{ $invoice->currency }}</td>
                    <td class="right num">{{ number_format(($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0), 2) }} {{ $invoice->currency }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        {{-- Totals --}}
        <div class="totals">
            <table>
                <tr>
                    <td class="label">Subtotal</td>
                    <td class="value">{{ number_format($invoice->subtotal, 2) }} {{ $invoice->currency }}</td>
                </tr>
                @if($invoice->tax_rate > 0)
                <tr>
                    <td class="label">Tax ({{ $invoice->tax_rate }}%)</td>
                    <td class="value">{{ number_format($invoice->tax_amount, 2) }} {{ $invoice->currency }}</td>
                </tr>
                @endif
                <tr class="grand-total">
                    <td class="label">Total Due</td>
                    <td class="value">{{ number_format($invoice->total_amount, 2) }} {{ $invoice->currency }}</td>
                </tr>
                @if($invoice->paid_amount > 0)
                <tr>
                    <td class="label">Paid</td>
                    <td class="value" style="color: #065f46;">-{{ number_format($invoice->paid_amount, 2) }} {{ $invoice->currency }}</td>
                </tr>
                <tr style="font-weight: bold;">
                    <td class="label">Balance Due</td>
                    <td class="value">{{ number_format($invoice->total_amount - $invoice->paid_amount, 2) }} {{ $invoice->currency }}</td>
                </tr>
                @endif
            </table>
        </div>
        <div class="clear"></div>

        {{-- Payment Info --}}
        <div class="payment-info">
            <h3>Payment Information</h3>
            @if($invoice->bank_iban)<div>IBAN: {{ $invoice->bank_iban }}</div>@endif
            @if($invoice->bank_bic)<div>BIC/SWIFT: {{ $invoice->bank_bic }}</div>@endif
            @if($invoice->payment_terms)<div>Terms: {{ $invoice->payment_terms }}</div>@endif
            <div>Reference: {{ $invoice->invoice_number }}</div>
        </div>

        @if($invoice->notes)
        <div style="margin-bottom: 15px;">
            <strong>Notes:</strong><br>
            {{ $invoice->notes }}
        </div>
        @endif

        {{-- Footer --}}
        <div class="footer">
            Generated by LogiMarket &mdash; {{ $generatedAt }} &bull; This is a computer-generated document.
        </div>
    </div>
</body>
</html>
