<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.5; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #0070f3; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 28px; color: #0070f3; font-weight: 700; }
        .invoice-title .number { font-size: 14px; color: #666; margin-top: 4px; }
        .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .party { width: 48%; }
        .party-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px; font-weight: 600; }
        .party-name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
        .meta-table { width: 100%; margin-bottom: 30px; }
        .meta-table td { padding: 8px 12px; border-bottom: 1px solid #eee; }
        .meta-table td:first-child { font-weight: 600; width: 150px; color: #666; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #f8f9fa; padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 2px solid #0070f3; }
        .items-table td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        .items-table .amount { text-align: right; font-variant-numeric: tabular-nums; }
        .totals { margin-left: auto; width: 300px; }
        .totals table { width: 100%; }
        .totals td { padding: 6px 12px; }
        .totals .total-row { font-size: 16px; font-weight: 700; border-top: 2px solid #0070f3; }
        .totals .total-row td { padding-top: 12px; }
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 10px; color: #999; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .status-paid { background: #e6f4ea; color: #1e7e34; }
        .status-sent { background: #e3f2fd; color: #1565c0; }
        .status-overdue { background: #fce4ec; color: #c62828; }
        .status-draft { background: #f5f5f5; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <table style="width: 100%; margin-bottom: 40px;">
            <tr>
                <td><div class="logo">LogiMarket</div><div style="font-size: 11px; color: #666; margin-top: 4px;">European Digital Logistics</div></td>
                <td style="text-align: right;"><h1 style="font-size: 28px; color: #0070f3; font-weight: 700;">INVOICE</h1><div style="font-size: 14px; color: #666; margin-top: 4px;">{{ $invoice->invoice_number }}</div></td>
            </tr>
        </table>

        <table style="width: 100%; margin-bottom: 30px;">
            <tr>
                <td style="width: 48%; vertical-align: top;">
                    <div class="party-label">FROM</div>
                    <div class="party-name">{{ $invoice->company?->name ?? 'LogiMarket' }}</div>
                    <div>{{ $invoice->company?->address ?? '' }}</div>
                    <div>{{ $invoice->company?->city ?? '' }}, {{ $invoice->company?->country_code ?? '' }}</div>
                    <div>VAT: {{ $invoice->company?->vat_number ?? '' }}</div>
                </td>
                <td style="width: 48%; vertical-align: top;">
                    <div class="party-label">BILL TO</div>
                    <div class="party-name">{{ $invoice->customer_name ?? $invoice->customerCompany?->name ?? '' }}</div>
                    <div>{{ $invoice->customer_address ?? '' }}</div>
                    <div>VAT: {{ $invoice->customer_vat_number ?? '' }}</div>
                </td>
            </tr>
        </table>

        <table class="meta-table">
            <tr><td>Issue Date</td><td>{{ $invoice->issue_date?->format('d M Y') }}</td></tr>
            <tr><td>Due Date</td><td>{{ $invoice->due_date?->format('d M Y') }}</td></tr>
            <tr><td>Status</td><td><span class="status status-{{ $invoice->status }}">{{ strtoupper($invoice->status) }}</span></td></tr>
            @if($invoice->payment_terms)<tr><td>Payment Terms</td><td>{{ $invoice->payment_terms }}</td></tr>@endif
            @if($invoice->transportOrder)<tr><td>Transport Order</td><td>{{ $invoice->transportOrder->order_number }}</td></tr>@endif
        </table>

        <table class="items-table">
            <thead><tr><th>Description</th><th>Qty</th><th class="amount">Unit Price</th><th class="amount">Amount</th></tr></thead>
            <tbody>
                @if($invoice->line_items && is_array($invoice->line_items))
                    @foreach($invoice->line_items as $item)
                    <tr>
                        <td>{{ $item['description'] ?? 'Service' }}</td>
                        <td>{{ $item['quantity'] ?? 1 }}</td>
                        <td class="amount">€{{ number_format($item['unit_price'] ?? 0, 2) }}</td>
                        <td class="amount">€{{ number_format(($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0), 2) }}</td>
                    </tr>
                    @endforeach
                @else
                    <tr>
                        <td>Logistics Services</td>
                        <td>1</td>
                        <td class="amount">€{{ number_format($invoice->subtotal ?? $invoice->total_amount, 2) }}</td>
                        <td class="amount">€{{ number_format($invoice->subtotal ?? $invoice->total_amount, 2) }}</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr><td>Subtotal</td><td class="amount">€{{ number_format($invoice->subtotal ?? $invoice->total_amount, 2) }}</td></tr>
                @if($invoice->tax_rate)<tr><td>Tax ({{ $invoice->tax_rate }}%)</td><td class="amount">€{{ number_format($invoice->tax_amount ?? 0, 2) }}</td></tr>@endif
                <tr class="total-row"><td>Total</td><td class="amount">€{{ number_format($invoice->total_amount, 2) }}</td></tr>
                @if($invoice->paid_amount > 0)<tr><td>Paid</td><td class="amount">€{{ number_format($invoice->paid_amount, 2) }}</td></tr>@endif
                @if($invoice->balance_due > 0)<tr style="color: #c62828;"><td>Balance Due</td><td class="amount">€{{ number_format($invoice->balance_due, 2) }}</td></tr>@endif
            </table>
        </div>

        @if($invoice->bank_iban || $invoice->bank_bic)
        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 8px;">Bank Details</div>
            @if($invoice->bank_iban)<div>IBAN: {{ $invoice->bank_iban }}</div>@endif
            @if($invoice->bank_bic)<div>BIC: {{ $invoice->bank_bic }}</div>@endif
        </div>
        @endif

        @if($invoice->notes)
        <div style="margin-top: 20px;">
            <div style="font-weight: 600; margin-bottom: 4px;">Notes</div>
            <div style="color: #666;">{{ $invoice->notes }}</div>
        </div>
        @endif

        <div class="footer">
            <p>Generated by LogiMarket &middot; European Digital Logistics Platform</p>
            <p>{{ now()->format('d M Y H:i') }}</p>
        </div>
    </div>
</body>
</html>
