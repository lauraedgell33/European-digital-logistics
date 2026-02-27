<x-mail::message>
# Your Daily Logistics Digest

Hello {{ $userName }}, here's your activity summary for today:

<x-mail::panel>
**📊 Today's Numbers**

| Metric | Value |
|:-------|------:|
| Active Orders | {{ $stats['active_orders'] ?? 0 }} |
| Completed Today | {{ $stats['completed_today'] ?? 0 }} |
| New Matches | {{ count($newMatches) }} |
| Pending Tenders | {{ $stats['pending_tenders'] ?? 0 }} |
</x-mail::panel>

@if(count($recentOrders) > 0)
## Recent Orders

<x-mail::table>
| Order # | Route | Status |
|:--------|:------|:-------|
@foreach($recentOrders as $order)
| {{ $order['order_number'] }} | {{ $order['route'] }} | {{ $order['status'] }} |
@endforeach
</x-mail::table>
@endif

@if(count($newMatches) > 0)
## New Matches Found

@foreach($newMatches as $match)
- **{{ $match['route'] }}** — Score: {{ $match['score'] }}%
@endforeach
@endif

<x-mail::button :url="$dashboardUrl" color="primary">
View Dashboard
</x-mail::button>

Best regards,<br>
The LogiMarket Team
</x-mail::message>
