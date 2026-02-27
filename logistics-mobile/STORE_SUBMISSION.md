# LogiMarket - Store Submission Guide

## App Store (iOS)

### App Information
- **App Name**: LogiMarket
- **Subtitle**: European Digital Logistics
- **Bundle ID**: com.logimarket.app
- **Category**: Business
- **Secondary Category**: Productivity
- **Age Rating**: 4+

### Description
LogiMarket is the premier digital logistics marketplace for European freight and transport. Connect shippers with carriers in real-time, manage transport orders, track shipments live, and grow your logistics network across Europe.

**Key Features:**
• Digital Freight Marketplace — Post or find freight offers across all EU countries
• Vehicle Matching — Match available vehicles with cargo needs instantly
• Transport Order Management — Create, accept, and manage orders end-to-end
• Live Shipment Tracking — Real-time GPS tracking on interactive maps
• Secure Messaging — Communicate directly with partners in-app
• Multi-language Support — Available in 7 European languages (EN, DE, FR, RO, ES, IT, PL)
• Push Notifications — Instant alerts for new orders, messages, and status updates
• Analytics Dashboard — Monitor your logistics performance at a glance
• GDPR Compliant — Enterprise-grade data protection and audit logging

Whether you're a shipper looking for reliable transport or a carrier seeking freight, LogiMarket streamlines your logistics operations across Europe.

### Keywords
logistics, freight, transport, shipping, carrier, marketplace, tracking, EU, European, cargo, trucking, supply chain

### Privacy Policy URL
https://logimarket.eu/privacy

### Support URL
https://logimarket.eu/support

---

## Google Play Store (Android)

### Store Listing
- **App Name**: LogiMarket - Digital Logistics
- **Short Description**: European freight marketplace. Find cargo & vehicles. Track shipments live.
- **Package Name**: com.logimarket.app
- **Category**: Business
- **Content Rating**: Everyone

### Full Description
LogiMarket is the leading European digital logistics marketplace that connects shippers and carriers for efficient freight transport across the EU.

🚛 FREIGHT MARKETPLACE
Post freight offers or browse available cargo. Filter by route, weight, cargo type, and equipment requirements. Get matched with the right transport partner instantly.

🚚 VEHICLE OFFERS
List your available vehicles or find the perfect carrier. Specify vehicle type, capacity, route, and pricing. Our smart matching system connects supply with demand.

📋 ORDER MANAGEMENT
Create and manage transport orders digitally. Track order status from creation through pickup, transit, and delivery. Accept or reject orders with one tap.

📍 LIVE TRACKING
Monitor your shipments in real-time on an interactive map. See vehicle positions, speed, and estimated arrival times. Share tracking links with your customers.

💬 IN-APP MESSAGING
Communicate directly with your logistics partners. Send messages, share documents, and coordinate pickups — all within the app.

📊 ANALYTICS DASHBOARD
Get insights into your logistics performance. Track revenue, order volumes, and key metrics at a glance.

🌍 PAN-EUROPEAN
Available in 7 languages: English, German, French, Romanian, Spanish, Italian, and Polish. Operate seamlessly across all EU countries.

🔒 SECURE & COMPLIANT
Enterprise-grade security with GDPR compliance, encrypted communications, and comprehensive audit logging.

---

## Screenshots Required

### iPhone (6.7")
1. Dashboard with stats
2. Orders list with filters
3. Marketplace — freight offers
4. Live shipment tracking map
5. Messages/chat screen
6. Profile with language selector

### iPad (12.9")
Same screens as iPhone, landscape-optimized

### Android Phone
Same as iPhone screenshots

### Android Tablet (10")
Same screens, landscape-optimized

---

## Pre-Submission Checklist

### iOS
- [ ] App Store Connect account active
- [ ] Certificates & provisioning profiles configured
- [ ] App icons (1024x1024 + all sizes)
- [ ] Launch screen / splash screen
- [ ] Privacy manifest (PrivacyInfo.xcprivacy)
- [ ] App Tracking Transparency if applicable
- [ ] Screenshots for all required device sizes
- [ ] Review guidelines compliance check

### Android
- [ ] Google Play Console account active
- [ ] Signing key configured (upload key + app signing)
- [ ] App icons (512x512 + adaptive icons)
- [ ] Feature graphic (1024x500)
- [ ] Privacy policy URL added
- [ ] Content rating questionnaire completed
- [ ] Target API level meets current requirements (API 34+)
- [ ] Data safety form completed
- [ ] Screenshots for phone and tablet

---

## Build Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Development build (simulator/emulator)
eas build --profile development --platform all

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Over-the-air update
eas update --branch production --message "Bug fixes"
```
