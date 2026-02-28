<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LexiconArticle;

class LexiconSeeder extends Seeder
{
    public function run(): void
    {
        $articles = [
            // ─── Freight & Transport Types ────────────────────
            [
                'slug' => 'ftl-full-truck-load',
                'title' => 'FTL — Full Truck Load',
                'excerpt' => 'A shipment that fills an entire truck trailer. The most efficient way to transport large quantities.',
                'content' => "# Full Truck Load (FTL)\n\nFTL is a shipping method where a single shipper's freight occupies an entire truck trailer.\n\n## Key Characteristics\n- Typically 40,000+ lbs / 18,000+ kg\n- Direct pickup to delivery (no stops)\n- Faster transit times than LTL\n- Lower risk of damage (no handling between transfers)\n\n## When to Use FTL\n- Large volume shipments (>10 pallets)\n- Time-sensitive deliveries\n- High-value or fragile goods\n- Hazardous materials\n\n## Standard Trailer Dimensions (EU)\n- Length: 13.6m\n- Width: 2.48m\n- Height: 2.70m\n- Max weight: ~24,000 kg (payload)\n- Pallet spaces: 33 Euro pallets\n\n## Pricing\nFTL is priced per kilometer/mile, not per pallet. Typical EU rates range from €0.80–€2.50/km depending on the route, season, and vehicle type.",
                'category' => 'freight_types',
                'tags' => ['FTL', 'full truck load', 'shipping', 'transport'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'slug' => 'ltl-less-than-truck-load',
                'title' => 'LTL — Less Than Truck Load',
                'excerpt' => 'Shared truck space for shipments that don\'t fill a full trailer. Cost-effective for smaller loads.',
                'content' => "# Less Than Truck Load (LTL)\n\nLTL shipping consolidates multiple shippers' freight on a single truck.\n\n## Key Characteristics\n- Typically 1–10 pallets\n- Shared trailer space\n- Hub-and-spoke distribution model\n- Multiple pickup/delivery stops\n\n## When to Use LTL\n- Small to medium-sized shipments\n- Budget-conscious shipping\n- Regular scheduled deliveries\n- Non-urgent freight\n\n## Pricing\nLTL is priced per pallet, per loading meter, or per weight. Rates depend on origin, destination, and freight class.\n\n## Loading Meters (LDM)\nA loading meter = 1m × 2.4m = 2.4m² of trailer floor space. Most EU LTL pricing is based on LDM.",
                'category' => 'freight_types',
                'tags' => ['LTL', 'less than truck load', 'partial load', 'groupage'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'slug' => 'groupage-consolidation',
                'title' => 'Groupage / Consolidation',
                'excerpt' => 'Combining multiple small shipments into one truck for efficient transport.',
                'content' => "# Groupage (Consolidation)\n\nGroupage, also called consolidation, is the process of combining small shipments from multiple shippers into a single shipment for transport.\n\n## How It Works\n1. Multiple shippers book partial loads\n2. Freight forwarder consolidates at origin hub\n3. Combined shipment moves as single load\n4. Deconsolidation at destination hub\n5. Final delivery to individual recipients\n\n## Benefits\n- Lower cost than FTL for small shipments\n- Regular scheduled services\n- Wide network coverage\n- Environmental efficiency (reduced empty running)\n\n## EU Groupage Networks\nMajor groupage networks in Europe include Dachser, DB Schenker, DSV, Kuehne+Nagel, and Geis Group.",
                'category' => 'freight_types',
                'tags' => ['groupage', 'consolidation', 'LTL', 'freight forwarding'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],

            // ─── Vehicle Types ────────────────────────────────
            [
                'slug' => 'mega-trailer-megatrailer',
                'title' => 'Mega Trailer',
                'excerpt' => 'Extra-height trailer with 3m internal height, ideal for voluminous goods and double-deck loading.',
                'content' => "# Mega Trailer\n\nA mega trailer (also called mega-height or jumbo trailer) is a semi-trailer with an internal height of approximately 3.0m.\n\n## Specifications\n- Internal height: 3.0m (vs standard 2.7m)\n- Low-deck chassis with small wheels\n- Loading length: 13.6m\n- 33-36 Euro pallet spaces\n\n## Advantages\n- 10-15% more volume than standard trailers\n- Double-deck loading possible\n- Ideal for light, voluminous goods\n\n## Limitations\n- Lower ground clearance\n- Not suitable for rough roads\n- Height restrictions on some routes\n- Cannot carry heavy loads due to smaller wheels",
                'category' => 'vehicle_types',
                'tags' => ['mega trailer', 'jumbo', 'trailer types', 'vehicle'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'slug' => 'curtainsider-tautliner',
                'title' => 'Curtainsider / Tautliner',
                'excerpt' => 'Flexible-sided trailer with curtain walls that can be opened from the sides for easy loading.',
                'content' => "# Curtainsider / Tautliner\n\nA curtainsider (tautliner) is a trailer with flexible curtain sides that can slide open.\n\n## Features\n- Side-loading capability\n- Easy forklift access from both sides\n- Roof can remain closed for weather protection\n- Standard dimensions: 13.6m × 2.48m × 2.7m\n\n## Most Common Vehicle Type\nThe curtainsider is the most widely used trailer type in European road transport, accounting for approximately 60% of all semi-trailers.\n\n## XL Certified\nXL certification (EN 12642) means the curtain and structure meet higher load-securing standards, reducing the need for additional lashing.",
                'category' => 'vehicle_types',
                'tags' => ['curtainsider', 'tautliner', 'trailer', 'side-loading'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],

            // ─── Documents & Regulations ──────────────────────
            [
                'slug' => 'cmr-consignment-note',
                'title' => 'CMR Consignment Note',
                'excerpt' => 'The international road transport document required for cross-border freight in Europe.',
                'content' => "# CMR Consignment Note\n\nThe CMR (Convention relative au contrat de transport international de Marchandises par Route) consignment note is the standardized document for international road freight transport.\n\n## Legal Basis\n- CMR Convention (1956)\n- Ratified by 55+ countries\n- Mandatory for international road transport\n\n## Contents\n1. Sender details (name, address)\n2. Carrier details\n3. Consignee details\n4. Place/date of taking over goods\n5. Place of delivery\n6. Description, quantity, weight of goods\n7. Packaging type and marks\n8. Carrier instructions\n9. Agreed time limit for transport\n\n## Number of Copies\n- Original 1: Sender (red)\n- Original 2: Accompanies goods (blue)\n- Original 3: Carrier (green)\n- Copy 4: Additional copy (black)\n\n## Liability\nUnder CMR, carrier liability is limited to 8.33 SDR per kg of gross weight (approximately €10/kg as of 2024).",
                'category' => 'documents',
                'tags' => ['CMR', 'consignment note', 'waybill', 'international transport'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'slug' => 'adr-dangerous-goods',
                'title' => 'ADR — Transport of Dangerous Goods',
                'excerpt' => 'European agreement concerning the international carriage of dangerous goods by road.',
                'content' => "# ADR — Dangerous Goods Transport\n\nThe ADR (Accord européen relatif au transport international des marchandises Dangereuses par Route) governs the transport of dangerous goods by road in Europe.\n\n## ADR Classes\n1. **Class 1**: Explosives\n2. **Class 2**: Gases\n3. **Class 3**: Flammable liquids\n4. **Class 4**: Flammable solids\n5. **Class 5**: Oxidizing substances\n6. **Class 6**: Toxic substances\n7. **Class 7**: Radioactive material\n8. **Class 8**: Corrosive substances\n9. **Class 9**: Miscellaneous dangerous goods\n\n## Requirements\n- ADR-certified driver (ADR certificate)\n- Vehicle approval certificate\n- Proper packaging and labeling\n- Transport document (dangerous goods declaration)\n- Written instructions (instructions in writing)\n- Safety equipment on board\n\n## Penalties\nViolations can result in fines up to €50,000 and vehicle impoundment.",
                'category' => 'regulations',
                'tags' => ['ADR', 'dangerous goods', 'hazardous', 'safety'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],

            // ─── Industry Terms ───────────────────────────────
            [
                'slug' => 'freight-exchange-definition',
                'title' => 'Freight Exchange',
                'excerpt' => 'A digital marketplace where shippers and carriers post and find available freight and vehicle capacity.',
                'content' => "# Freight Exchange\n\nA freight exchange (also called load board or transport exchange) is a B2B marketplace connecting shippers who need goods transported with carriers who have available vehicle capacity.\n\n## How It Works\n1. **Shippers** post freight offers (loads needing transport)\n2. **Carriers** post vehicle offers (available trucks)\n3. **Matching** occurs based on route, dates, vehicle type\n4. **Negotiation** of price and conditions\n5. **Booking** and transport execution\n\n## Benefits\n- Reduce empty running (currently ~25% of EU truck-km)\n- Find competitive prices\n- Access pan-European network\n- Real-time market transparency\n\n## Major EU Freight Exchanges\n- TIMOCOM (330,000+ offers/day)\n- Trans.eu (300,000+ users)\n- Teleroute/Alpega\n- Wtransnet\n- **LogiMarket** (you're on it! 🚛)",
                'category' => 'industry_terms',
                'tags' => ['freight exchange', 'load board', 'marketplace', 'transport exchange'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'slug' => 'cabotage-rules-eu',
                'title' => 'Cabotage Rules in the EU',
                'excerpt' => 'Rules governing domestic transport operations by foreign carriers within EU member states.',
                'content' => "# Cabotage Rules in the EU\n\nCabotage is the transport of goods within a country by a carrier registered in another country.\n\n## Current EU Rules (Mobility Package I)\nAfter an international delivery into an EU member state, a foreign carrier may perform:\n- **Up to 3 cabotage operations** within **7 days**\n- In the same member state as the international delivery\n\n## Cooling-Off Period\nAfter completing cabotage operations, the vehicle must leave the host country for at least **4 days** before performing further cabotage there.\n\n## Enforcement\n- Smart tachograph data\n- CMR consignment notes\n- Electronic freight documents\n- Real-time tracking\n\n## Penalties\nViolations can result in fines of €1,000–€15,000 per offense depending on the country.",
                'category' => 'regulations',
                'tags' => ['cabotage', 'EU regulation', 'Mobility Package', 'cross-border'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'slug' => 'incoterms-2020',
                'title' => 'Incoterms 2020 Overview',
                'excerpt' => 'International Commercial Terms — standard trade definitions for buyer/seller responsibilities in transport.',
                'content' => "# Incoterms 2020\n\nIncoterms (International Commercial Terms) published by the International Chamber of Commerce (ICC) define the responsibilities of buyers and sellers in international trade.\n\n## Most Used in Road Transport\n\n### EXW (Ex Works)\nBuyer arranges everything from seller's premises.\n\n### FCA (Free Carrier)\nSeller delivers to carrier at named place. Most recommended for road transport.\n\n### CPT (Carriage Paid To)\nSeller pays transport to named destination but risk transfers at handover to carrier.\n\n### CIP (Carriage and Insurance Paid To)\nLike CPT but seller also provides insurance.\n\n### DAP (Delivered at Place)\nSeller delivers to named destination, buyer handles unloading and import.\n\n### DDP (Delivered Duty Paid)\nSeller bears all costs and risks including customs duties.\n\n## Key Point\nFCA is the most commonly used Incoterm for European road transport, replacing the problematic EXW which puts all transport risk on the buyer.",
                'category' => 'trade_terms',
                'tags' => ['Incoterms', 'trade', 'ICC', 'shipping terms'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'slug' => 'loading-meter-ldm-calculation',
                'title' => 'Loading Meter (LDM) Calculation',
                'excerpt' => 'How to calculate loading meters — the standard unit for measuring trailer space usage in Europe.',
                'content' => "# Loading Meter (LDM)\n\nA loading meter (Lademeter) is a unit of measurement representing 1 linear meter of trailer floor space (full width).\n\n## Calculation\n```\n1 LDM = 1.0m length × 2.4m width = 2.4 m²\n```\n\n## Full Trailer\nA standard semi-trailer (13.6m) = **13.6 LDM**\n\n## Euro Pallet Conversion\n- 1 Euro pallet (120×80cm) = **0.4 LDM** (placed lengthwise)\n- 2 Euro pallets side by side = **0.8 LDM**\n- Full trailer = **33 Euro pallets** (or 34 with tight stacking)\n\n## Weight Factor\nOne LDM is typically calculated as:\n- **1,750 kg per LDM** (standard goods)\n- **1,000 kg per LDM** (light goods)\n- **2,500 kg per LDM** (heavy goods)\n\n## Formula for Mixed Loads\n```\nChargeable LDM = MAX(physical_LDM, weight_kg / 1750)\n```\n\nThis ensures that heavy goods are charged fairly even if they occupy little floor space.",
                'category' => 'industry_terms',
                'tags' => ['loading meter', 'LDM', 'Lademeter', 'pallet', 'calculation'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'slug' => 'eu-driving-rest-times',
                'title' => 'EU Driving & Rest Time Rules',
                'excerpt' => 'EC 561/2006 regulations governing maximum driving hours and mandatory rest periods for truck drivers.',
                'content' => "# EU Driving & Rest Time Rules\n\n## Legal Basis\nRegulation (EC) No 561/2006, amended by Regulation (EU) 2020/1054 (Mobility Package I).\n\n## Daily Driving\n- **Maximum**: 9 hours\n- **Extended**: 10 hours (max 2x per week)\n\n## Weekly Driving\n- **Maximum**: 56 hours\n- **Bi-weekly**: Maximum 90 hours in any 2 consecutive weeks\n\n## Breaks\n- After **4.5 hours** of driving: minimum **45-minute break**\n- Can be split: 15 min + 30 min\n\n## Daily Rest\n- **Regular**: 11 consecutive hours\n- **Reduced**: 9 hours (max 3x between weekly rests)\n- Can be split: 3h + 9h (must total 12h)\n\n## Weekly Rest\n- **Regular**: 45 consecutive hours\n- **Reduced**: 24 hours (must be compensated within 3 weeks)\n- Driver must return home every **4 weeks**\n\n## Weekly Rest in Vehicle\nRegular weekly rest (45h) is **prohibited** in the vehicle cab. Reduced weekly rest (24h) is allowed in the vehicle if it has adequate sleeping facilities.\n\n## Penalties\nFines range from €50 to €30,000 depending on country and severity.",
                'category' => 'regulations',
                'tags' => ['driving hours', 'rest times', 'EC 561/2006', 'tachograph'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'slug' => 'toll-systems-europe',
                'title' => 'Toll Systems in Europe',
                'excerpt' => 'Overview of road charging systems for trucks across European countries.',
                'content' => "# European Toll Systems\n\n## Distance-Based Tolling\n- **Germany**: Toll Collect (Maut) — €0.119–€0.351/km based on Euro class, weight, axles\n- **Austria**: GO-Box (ASFINAG) — €0.2107–€0.4473/km\n- **Czech Republic**: CzechToll/Myto — distance-based on motorways and 1st class roads\n- **Poland**: e-TOLL — national roads and motorways\n- **Belgium**: Viapass — Flanders, Wallonia, Brussels\n- **Hungary**: HU-GO — motorways and national roads\n- **Portugal**: Via Verde — motorways\n\n## Vignette Systems\n- **Switzerland**: Annual vignette (CHF 40 for cars, LSVA for trucks)\n- **Romania**: Rovinieta\n- **Bulgaria**: E-vignette\n- **Slovenia**: DarsGo (electronic for trucks)\n\n## EU Interoperability\nThe European Electronic Toll Service (EETS) aims to enable one OBU across all EU toll systems. Currently in progressive rollout.\n\n## Tip for Carriers\nUse route planning tools that calculate total toll costs per route. Toll costs can represent 5-15% of total transport costs.",
                'category' => 'industry_terms',
                'tags' => ['toll', 'maut', 'road charging', 'vignette', 'EETS'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'slug' => 'emission-standards-euro-6',
                'title' => 'Euro Emission Standards',
                'excerpt' => 'EU emission standards for heavy-duty vehicles — from Euro I to Euro VII.',
                'content' => "# Euro Emission Standards\n\nThe European emission standards define the acceptable limits for exhaust emissions of new vehicles sold in the EU.\n\n## Heavy-Duty Vehicle Standards\n\n| Standard | Year | NOx (g/kWh) | PM (g/kWh) |\n|----------|------|-------------|------------|\n| Euro I | 1992 | 8.0 | 0.36 |\n| Euro II | 1996 | 7.0 | 0.15 |\n| Euro III | 2000 | 5.0 | 0.10 |\n| Euro IV | 2005 | 3.5 | 0.02 |\n| Euro V | 2008 | 2.0 | 0.02 |\n| Euro VI | 2014 | 0.4 | 0.01 |\n| Euro VII | 2027 | 0.2 | 0.005 |\n\n## Impact on Logistics\n- **Low Emission Zones**: Many cities only allow Euro 5/6 vehicles\n- **Toll rates**: Lower tolls for cleaner vehicles (DE, AT, CZ)\n- **Carbon footprint**: Directly affects CO₂ per ton-km\n\n## Euro 6d-TEMP vs Euro 6d\nReal Driving Emissions (RDE) testing introduced: 6d-TEMP (2017) and full 6d (2020) measure actual on-road emissions.",
                'category' => 'regulations',
                'tags' => ['emissions', 'Euro standards', 'environment', 'LEZ'],
                'language' => 'en',
                'is_published' => true,
                'published_at' => now(),
            ],
        ];

        foreach ($articles as $article) {
            LexiconArticle::updateOrCreate(
                ['slug' => $article['slug']],
                $article
            );
        }

        $this->command->info('Seeded ' . count($articles) . ' lexicon articles.');
    }
}
