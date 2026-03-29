<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            margin: 0 auto;
            padding: 30px;
        }
        .header {
            border-bottom: 2px solid #7c3aed; /* primary purple */
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: 900;
            color: #7c3aed;
            text-transform: uppercase;
            letter-spacing: -1px;
        }
        .receipt-label {
            float: right;
            text-align: right;
        }
        .receipt-label h1 {
            margin: 0;
            font-size: 24px;
            color: #111827;
        }
        .receipt-label p {
            margin: 0;
            color: #6b7280;
            font-size: 12px;
        }
        .info-grid {
            width: 100%;
            margin-bottom: 40px;
        }
        .info-col {
            width: 50%;
            vertical-align: top;
        }
        .label {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            color: #9ca3af;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        .value {
            font-size: 14px;
            color: #1f2937;
            font-weight: bold;
        }
        .amount-box {
            background: #f5f3ff;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin-bottom: 40px;
            border: 1px solid #ddd6fe;
        }
        .amount-label {
            font-size: 12px;
            color: #7c3aed;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .amount-value {
            font-size: 42px;
            font-weight: 900;
            color: #1e1b4b;
            margin: 0;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
        }
        .details-table th {
            text-align: left;
            background: #f9fafb;
            padding: 12px;
            font-size: 10px;
            text-transform: uppercase;
            color: #6b7280;
            border-bottom: 1px solid #e5e7eb;
        }
        .details-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 13px;
        }
        .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
            padding-top: 20px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-incoming {
            background: #dcfce7;
            color: #15803d;
        }
        .badge-outgoing {
            background: #fee2e2;
            color: #b91c1c;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header clearfix">
            <div style="float: left;">
                <div class="logo">InvenTrust</div>
                <div style="font-size: 10px; color: #6b7280; margin-top: 5px;">
                    Professional Inventory & Ledger System
                </div>
            </div>
            <div class="receipt-label">
                <h1>PAYMENT RECEIPT</h1>
                <p>#PAY-{{ str_pad($payment->id, 6, '0', STR_PAD_LEFT) }}</p>
            </div>
        </div>

        <div class="amount-box">
            <div class="amount-label">Verified Payment Amount</div>
            <div class="amount-value">${{ number_format($payment->amount, 2) }}</div>
            <div style="margin-top: 10px;">
                <span class="badge badge-{{ $payment->type }}">
                    {{ $payment->type === 'incoming' ? 'Funds Received' : 'Funds Disbursed' }}
                </span>
            </div>
        </div>

        <table class="info-grid">
            <tr>
                <td class="info-col">
                    <div class="label">Date of Transaction</div>
                    <div class="value">{{ \Carbon\Carbon::parse($payment->date)->format('M d, Y') }}</div>
                </td>
                <td class="info-col" style="text-align: right;">
                    <div class="label">Payment Method</div>
                    <div class="value" style="text-transform: capitalize;">{{ $payment->method }}</div>
                </td>
            </tr>
        </table>

        <table class="details-table">
            <thead>
                <tr>
                    <th>Particulars</th>
                    <th style="text-align: right;">Information</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>{{ $payment->type === 'incoming' ? 'Received From' : 'Paid To' }}</strong></td>
                    <td style="text-align: right;">{{ $payment->party->name }}</td>
                </tr>
                <tr>
                    <td>Transaction Reference</td>
                    <td style="text-align: right;">{{ $payment->reference ?? 'N/A' }}</td>
                </tr>
                @if($payment->invoice)
                <tr>
                    <td>Against Invoice</td>
                    <td style="text-align: right;">{{ $payment->invoice->invoice_no }}</td>
                </tr>
                @endif
                @if($payment->purchase)
                <tr>
                    <td>Against Purchase</td>
                    <td style="text-align: right;">{{ $payment->purchase->purchase_no }}</td>
                </tr>
                @endif
            </tbody>
        </table>

        <div class="footer">
            <p>This is a computer-generated receipt and does not require a physical signature.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name', 'InvenTrust ERP') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
