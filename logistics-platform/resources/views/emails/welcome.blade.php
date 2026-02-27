<x-mail::message>
# Welcome to LogiMarket, {{ $userName }}! 🚛

We're thrilled to have **{{ $companyName }}** join our European digital logistics network.

LogiMarket connects shippers and carriers across Europe, offering:

- **Freight Exchange** — Post and find loads instantly
- **Vehicle Exchange** — Optimize fleet utilization
- **Smart Matching** — AI-powered load-vehicle matching
- **Real-time Tracking** — Track shipments with live GPS
- **Tender Management** — Streamline your bidding process
- **Analytics** — Data-driven logistics decisions

<x-mail::button :url="$dashboardUrl" color="primary">
Open Your Dashboard
</x-mail::button>

<x-mail::panel>
**Getting Started Tips:**
1. Complete your company profile with operating regions and fleet details
2. Post your first freight or vehicle offer
3. Explore matching results for optimal pairings
4. Invite your team members for collaborative management
</x-mail::panel>

Need help? Our support team is ready to assist you at **support@logimarket.eu**.

Best regards,<br>
The LogiMarket Team
</x-mail::message>
