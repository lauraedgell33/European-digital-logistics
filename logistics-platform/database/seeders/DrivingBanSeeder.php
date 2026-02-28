<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DrivingBan;

class DrivingBanSeeder extends Seeder
{
    public function run(): void
    {
        $bans = [
            // ─── GERMANY ──────────────────────────────────────
            [
                'country' => 'DE',
                'ban_type' => 'weekend',
                'title' => 'Sonntagsfahrverbot (Sunday Driving Ban)',
                'description' => 'Trucks over 7.5t are prohibited from driving on Sundays and public holidays throughout Germany.',
                'start_time' => '00:00',
                'end_time' => '22:00',
                'days_of_week' => [0], // Sunday
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['All federal roads (Bundesstraßen)', 'All motorways (Autobahnen)'],
                'exemptions' => ['Combined transport (last/first mile)', 'Fresh food/perishable goods', 'Harvest products (Jun-Oct)', 'Military transports'],
                'fine_amount' => 500,
                'fine_currency' => 'EUR',
            ],
            [
                'country' => 'DE',
                'ban_type' => 'holiday',
                'title' => 'Feiertagsfahrverbot (Public Holiday Ban)',
                'description' => 'Same restrictions as Sunday ban apply on all national public holidays.',
                'start_time' => '00:00',
                'end_time' => '22:00',
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'exemptions' => ['Combined transport', 'Fresh food/perishable goods'],
                'fine_amount' => 500,
                'fine_currency' => 'EUR',
            ],
            [
                'country' => 'DE',
                'ban_type' => 'seasonal',
                'title' => 'Ferienreiseverordnung (Holiday Travel Restrictions)',
                'description' => 'On Saturdays during summer holiday season, trucks >7.5t banned on key motorways from 07:00-20:00.',
                'start_time' => '07:00',
                'end_time' => '20:00',
                'days_of_week' => [6], // Saturday
                'start_date' => '07-01',
                'end_date' => '08-31',
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['A1', 'A2', 'A3', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A45', 'A61', 'A81', 'A93', 'A99'],
                'fine_amount' => 500,
                'fine_currency' => 'EUR',
            ],
            [
                'country' => 'DE',
                'ban_type' => 'night',
                'title' => 'Nachtfahrverbot (Night Driving Ban)',
                'description' => 'Night driving ban for trucks in certain residential areas and specific routes.',
                'start_time' => '22:00',
                'end_time' => '06:00',
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_zones' => ['Specific city zones', 'Residential areas near motorways'],
            ],

            // ─── AUSTRIA ──────────────────────────────────────
            [
                'country' => 'AT',
                'ban_type' => 'weekend',
                'title' => 'Wochenendfahrverbot (Weekend Driving Ban)',
                'description' => 'Trucks >7.5t banned Saturday 15:00 to Sunday 22:00 on all Austrian roads.',
                'start_time' => '15:00',
                'end_time' => '22:00',
                'days_of_week' => [6, 0], // Saturday, Sunday
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['All roads in Austria'],
                'exemptions' => ['Round timber transport', 'Combined transport', 'Fresh food transport'],
                'fine_amount' => 726,
                'fine_currency' => 'EUR',
            ],
            [
                'country' => 'AT',
                'ban_type' => 'night',
                'title' => 'Nachtfahrverbot Inntal (Inn Valley Night Ban)',
                'description' => 'Night driving ban on A12/A13 (Brenner corridor) for trucks >7.5t.',
                'start_time' => '20:00',
                'end_time' => '05:00',
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['A12 Inntal Autobahn', 'A13 Brenner Autobahn'],
                'affected_zones' => ['Inntal/Wipp Valley corridor'],
                'exemptions' => ['Euro 6 with noise-reduced trailers'],
                'fine_amount' => 1450,
                'fine_currency' => 'EUR',
            ],
            [
                'country' => 'AT',
                'ban_type' => 'seasonal',
                'title' => 'Blockabfertigung/Sectoral Driving Ban',
                'description' => 'Sectoral driving ban on A12 for certain goods (waste, stones, soil, timber, vehicles, steel) to reduce Brenner corridor congestion.',
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['A12 Inntal Autobahn'],
                'affected_zones' => ['Tirol/Tyrol region'],
                'fine_amount' => 2180,
                'fine_currency' => 'EUR',
            ],

            // ─── FRANCE ───────────────────────────────────────
            [
                'country' => 'FR',
                'ban_type' => 'weekend',
                'title' => 'Interdiction de circulation du week-end',
                'description' => 'Trucks >7.5t banned on Saturdays from 22:00 and Sundays until 22:00.',
                'start_time' => '22:00',
                'end_time' => '22:00',
                'days_of_week' => [6, 0], // Saturday 22:00 to Sunday 22:00
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['All national roads', 'All motorways'],
                'exemptions' => ['Perishable goods', 'Live animals', 'Agricultural products'],
                'fine_amount' => 750,
                'fine_currency' => 'EUR',
            ],
            [
                'country' => 'FR',
                'ban_type' => 'seasonal',
                'title' => 'Circulation Bison Futé (Summer holiday bans)',
                'description' => 'Enhanced restrictions on specific Saturdays during summer holidays (red/black days).',
                'start_time' => '07:00',
                'end_time' => '19:00',
                'start_date' => '07-01',
                'end_date' => '08-31',
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'fine_amount' => 750,
                'fine_currency' => 'EUR',
            ],

            // ─── ITALY ────────────────────────────────────────
            [
                'country' => 'IT',
                'ban_type' => 'weekend',
                'title' => 'Divieto di circolazione festivo',
                'description' => 'Trucks >7.5t banned on Sundays and public holidays. Ban times vary by season.',
                'start_time' => '08:00',
                'end_time' => '22:00',
                'days_of_week' => [0], // Sunday
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['All Italian roads outside urban areas'],
                'exemptions' => ['Perishable goods', 'Live animals', 'International combined transport', 'Fuel tankers'],
                'fine_amount' => 422,
                'fine_currency' => 'EUR',
            ],
            [
                'country' => 'IT',
                'ban_type' => 'seasonal',
                'title' => 'Divieto estivo (Summer driving ban)',
                'description' => 'Enhanced restrictions during summer: Saturday bans added July-September.',
                'start_time' => '08:00',
                'end_time' => '16:00',
                'days_of_week' => [6], // Saturday
                'start_date' => '06-22',
                'end_date' => '09-10',
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'fine_amount' => 422,
                'fine_currency' => 'EUR',
            ],
            [
                'country' => 'IT',
                'ban_type' => 'holiday',
                'title' => 'Divieto Ferragosto (August 15th ban)',
                'description' => 'Extended ban around August 15th (Ferragosto) national holiday.',
                'is_recurring' => true,
                'specific_dates' => ['08-14', '08-15', '08-16'],
                'min_weight_tons' => 7.5,
                'fine_amount' => 422,
                'fine_currency' => 'EUR',
            ],

            // ─── SPAIN ────────────────────────────────────────
            [
                'country' => 'ES',
                'ban_type' => 'weekend',
                'title' => 'Restricción de circulación fin de semana',
                'description' => 'Sunday and public holiday driving restrictions for trucks >7.5t on specific routes.',
                'start_time' => '08:00',
                'end_time' => '24:00',
                'days_of_week' => [0],
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['N-340', 'N-II', 'AP-7 (certain sections)'],
                'fine_amount' => 200,
                'fine_currency' => 'EUR',
            ],

            // ─── POLAND ───────────────────────────────────────
            [
                'country' => 'PL',
                'ban_type' => 'weekend',
                'title' => 'Zakaz ruchu w weekendy (Weekend Ban)',
                'description' => 'Trucks >12t banned from 18:00 Friday (day before public holiday) to 22:00 Sunday.',
                'start_time' => '18:00',
                'end_time' => '22:00',
                'days_of_week' => [5, 6, 0], // Fri evening, Sat, Sun
                'is_recurring' => true,
                'min_weight_tons' => 12,
                'affected_roads' => ['All national roads', 'All motorways'],
                'exemptions' => ['Combined transport', 'Perishable goods', 'Live animals', 'Postal services'],
                'fine_amount' => 1500,
                'fine_currency' => 'PLN',
            ],
            [
                'country' => 'PL',
                'ban_type' => 'seasonal',
                'title' => 'Zakaz ruchu letni (Summer Holiday Ban)',
                'description' => 'Extended restrictions June-August: additional Saturday bans from 08:00-14:00 for trucks >12t.',
                'start_time' => '08:00',
                'end_time' => '14:00',
                'days_of_week' => [6],
                'start_date' => '06-15',
                'end_date' => '09-15',
                'is_recurring' => true,
                'min_weight_tons' => 12,
                'fine_amount' => 1500,
                'fine_currency' => 'PLN',
            ],

            // ─── CZECH REPUBLIC ───────────────────────────────
            [
                'country' => 'CZ',
                'ban_type' => 'weekend',
                'title' => 'Zákaz jízdy o víkendu',
                'description' => 'Trucks >7.5t banned Sunday 00:00-22:00 (winter) or 13:00 Sat - 22:00 Sun (summer).',
                'start_time' => '00:00',
                'end_time' => '22:00',
                'days_of_week' => [0],
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['All Class I roads (1st class)', 'Motorways (dálnice)', 'Expressways (rychlostní silnice)'],
                'exemptions' => ['Perishable goods', 'Live animals', 'Fuel transport'],
                'fine_amount' => 25000,
                'fine_currency' => 'CZK',
            ],

            // ─── HUNGARY ──────────────────────────────────────
            [
                'country' => 'HU',
                'ban_type' => 'weekend',
                'title' => 'Hétvégi kamionszünetek',
                'description' => 'Trucks >7.5t banned Saturday 22:00 to Sunday 22:00 on main roads.',
                'start_time' => '22:00',
                'end_time' => '22:00',
                'days_of_week' => [6, 0],
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['All main roads', 'Motorways M0-M85'],
                'exemptions' => ['Perishable goods', 'Live animals'],
                'fine_amount' => 300000,
                'fine_currency' => 'HUF',
            ],
            [
                'country' => 'HU',
                'ban_type' => 'seasonal',
                'title' => 'Nyári közlekedési tilalom (Summer Ban)',
                'description' => 'Summer season: Saturday bans extended from 08:00-22:00, plus Friday eve.',
                'start_time' => '08:00',
                'end_time' => '22:00',
                'days_of_week' => [6],
                'start_date' => '06-15',
                'end_date' => '08-31',
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'fine_amount' => 300000,
                'fine_currency' => 'HUF',
            ],

            // ─── ROMANIA ──────────────────────────────────────
            [
                'country' => 'RO',
                'ban_type' => 'weekend',
                'title' => 'Restricție circulație camioane weekend',
                'description' => 'Trucks >7.5t restricted on DN7 (Valea Oltului) on weekends and holidays.',
                'start_time' => '06:00',
                'end_time' => '22:00',
                'days_of_week' => [0],
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['DN7 (Valea Oltului)', 'DN1 (certain sections)', 'DN7C'],
                'exemptions' => ['Perishable goods', 'Fuel transport', 'Emergency vehicles'],
                'fine_amount' => 2900,
                'fine_currency' => 'RON',
            ],
            [
                'country' => 'RO',
                'ban_type' => 'seasonal',
                'title' => 'Restricție circulație camioane vară',
                'description' => 'Summer weekend and holiday restrictions extended on main routes to/from coast.',
                'start_time' => '06:00',
                'end_time' => '22:00',
                'days_of_week' => [5, 6, 0],
                'start_date' => '06-01',
                'end_date' => '09-15',
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['DN7', 'DN1', 'A2 Autostrada Soarelui'],
                'fine_amount' => 2900,
                'fine_currency' => 'RON',
            ],

            // ─── SWITZERLAND ──────────────────────────────────
            [
                'country' => 'CH',
                'ban_type' => 'night',
                'title' => 'Nachtfahrverbot (Night Ban)',
                'description' => 'Complete night driving ban for trucks >3.5t across all of Switzerland.',
                'start_time' => '22:00',
                'end_time' => '05:00',
                'is_recurring' => true,
                'min_weight_tons' => 3.5,
                'affected_roads' => ['All Swiss roads'],
                'fine_amount' => 600,
                'fine_currency' => 'CHF',
            ],
            [
                'country' => 'CH',
                'ban_type' => 'weekend',
                'title' => 'Sonntagsfahrverbot (Sunday Ban)',
                'description' => 'Complete Sunday and public holiday ban for trucks >3.5t.',
                'start_time' => '00:00',
                'end_time' => '24:00',
                'days_of_week' => [0],
                'is_recurring' => true,
                'min_weight_tons' => 3.5,
                'affected_roads' => ['All Swiss roads'],
                'fine_amount' => 600,
                'fine_currency' => 'CHF',
            ],

            // ─── NETHERLANDS ──────────────────────────────────
            [
                'country' => 'NL',
                'ban_type' => 'environmental',
                'title' => 'Milieuzone (Environmental Zone)',
                'description' => 'Low emission zones in major Dutch cities. Only Euro 6 diesel trucks allowed.',
                'is_recurring' => true,
                'affected_zones' => ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Tilburg', 'Breda'],
                'fine_amount' => 250,
                'fine_currency' => 'EUR',
            ],

            // ─── BELGIUM ──────────────────────────────────────
            [
                'country' => 'BE',
                'ban_type' => 'environmental',
                'title' => 'Lage-emissiezone (LEZ)',
                'description' => 'Low emission zones in Brussels, Antwerp, and Ghent. Phase-out schedule by Euro class.',
                'is_recurring' => true,
                'affected_zones' => ['Brussels Region', 'Antwerp', 'Ghent'],
                'fine_amount' => 350,
                'fine_currency' => 'EUR',
            ],
            [
                'country' => 'BE',
                'ban_type' => 'weekend',
                'title' => 'Weekend rijverbod (Weekend Ban)',
                'description' => 'Weekend and holiday restrictions on certain roads for trucks >7.5t.',
                'start_time' => '22:00',
                'end_time' => '22:00',
                'days_of_week' => [6, 0],
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['E40 (certain sections)', 'E17'],
                'fine_amount' => 250,
                'fine_currency' => 'EUR',
            ],

            // ─── LUXEMBOURG ───────────────────────────────────
            [
                'country' => 'LU',
                'ban_type' => 'weekend',
                'title' => 'Sonndesfahrverbot (Sunday Ban)',
                'description' => 'Trucks >7.5t banned on Sundays and public holidays.',
                'start_time' => '00:00',
                'end_time' => '22:00',
                'days_of_week' => [0],
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'fine_amount' => 500,
                'fine_currency' => 'EUR',
            ],

            // ─── SLOVAKIA ─────────────────────────────────────
            [
                'country' => 'SK',
                'ban_type' => 'weekend',
                'title' => 'Zákaz jazdy (Weekend Ban)',
                'description' => 'Trucks >7.5t banned Sunday 00:00-22:00 and holidays on all roads except motorways.',
                'start_time' => '00:00',
                'end_time' => '22:00',
                'days_of_week' => [0],
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['All roads outside motorways'],
                'fine_amount' => 700,
                'fine_currency' => 'EUR',
            ],

            // ─── CROATIA ─────────────────────────────────────
            [
                'country' => 'HR',
                'ban_type' => 'seasonal',
                'title' => 'Ljetna zabrana prometa (Summer Ban)',
                'description' => 'Summer driving restrictions for trucks >7.5t on weekends, especially on coastal roads.',
                'start_time' => '04:00',
                'end_time' => '14:00',
                'days_of_week' => [6],
                'start_date' => '06-15',
                'end_date' => '09-15',
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['A6', 'A1 (Zagreb-Split)', 'D8 Adriatic coastal road'],
                'fine_amount' => 660,
                'fine_currency' => 'EUR',
            ],

            // ─── SLOVENIA ─────────────────────────────────────
            [
                'country' => 'SI',
                'ban_type' => 'weekend',
                'title' => 'Prepoved vožnje ob vikendih',
                'description' => 'Trucks >7.5t banned on Sundays and holidays 08:00-21:00.',
                'start_time' => '08:00',
                'end_time' => '21:00',
                'days_of_week' => [0],
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['All Slovenian roads'],
                'exemptions' => ['Perishable goods', 'Live animals'],
                'fine_amount' => 500,
                'fine_currency' => 'EUR',
            ],

            // ─── BULGARIA ─────────────────────────────────────
            [
                'country' => 'BG',
                'ban_type' => 'seasonal',
                'title' => 'Летни ограничения за тежкотоварни (Summer restrictions)',
                'description' => 'Summer Friday-Sunday restrictions for trucks >12t on main roads from 14:00-20:00.',
                'start_time' => '14:00',
                'end_time' => '20:00',
                'days_of_week' => [5, 6, 0],
                'start_date' => '06-15',
                'end_date' => '09-15',
                'is_recurring' => true,
                'min_weight_tons' => 12,
                'affected_roads' => ['E80', 'I-1 (Sofia-Burgas)', 'I-6 (Sofia-Burgas via Karlovo)'],
                'fine_amount' => 1000,
                'fine_currency' => 'BGN',
            ],

            // ─── GREECE ───────────────────────────────────────
            [
                'country' => 'GR',
                'ban_type' => 'weekend',
                'title' => 'Απαγόρευση κυκλοφορίας (Weekend Ban)',
                'description' => 'Trucks >3.5t banned on weekends and holidays on certain national roads.',
                'start_time' => '07:00',
                'end_time' => '23:00',
                'days_of_week' => [0],
                'is_recurring' => true,
                'min_weight_tons' => 3.5,
                'affected_roads' => ['PATHE motorway', 'National roads near Athens'],
                'fine_amount' => 400,
                'fine_currency' => 'EUR',
            ],

            // ─── PORTUGAL ─────────────────────────────────────
            [
                'country' => 'PT',
                'ban_type' => 'weekend',
                'title' => 'Proibição de circulação (Sunday Ban)',
                'description' => 'Trucks >7.5t restricted on Sundays and public holidays on main roads.',
                'start_time' => '08:00',
                'end_time' => '20:00',
                'days_of_week' => [0],
                'is_recurring' => true,
                'min_weight_tons' => 7.5,
                'affected_roads' => ['EN1', 'IC1', 'Main national routes'],
                'fine_amount' => 300,
                'fine_currency' => 'EUR',
            ],

            // ─── DENMARK ──────────────────────────────────────
            [
                'country' => 'DK',
                'ban_type' => 'environmental',
                'title' => 'Miljøzone (Environmental Zone)',
                'description' => 'Environmental zones in Copenhagen, Frederiksberg, Aarhus, Aalborg, Odense. Min Euro 5 + particles filter.',
                'is_recurring' => true,
                'affected_zones' => ['Copenhagen', 'Frederiksberg', 'Aarhus', 'Aalborg', 'Odense'],
                'fine_amount' => 20000,
                'fine_currency' => 'DKK',
            ],

            // ─── SWEDEN ───────────────────────────────────────
            [
                'country' => 'SE',
                'ban_type' => 'environmental',
                'title' => 'Miljözon (Environmental Zone)',
                'description' => 'Environmental zones in Stockholm, Gothenburg, Malmö, and other cities. Three zone classes.',
                'is_recurring' => true,
                'affected_zones' => ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Umeå'],
                'fine_amount' => 5000,
                'fine_currency' => 'SEK',
            ],
        ];

        $countryNames = [
            'DE' => 'Germany', 'AT' => 'Austria', 'FR' => 'France', 'IT' => 'Italy',
            'ES' => 'Spain', 'PL' => 'Poland', 'CZ' => 'Czech Republic', 'HU' => 'Hungary',
            'RO' => 'Romania', 'CH' => 'Switzerland', 'NL' => 'Netherlands', 'BE' => 'Belgium',
            'LU' => 'Luxembourg', 'SK' => 'Slovakia', 'HR' => 'Croatia', 'SI' => 'Slovenia',
            'BG' => 'Bulgaria', 'GR' => 'Greece', 'PT' => 'Portugal', 'DK' => 'Denmark',
            'SE' => 'Sweden',
        ];

        foreach ($bans as $ban) {
            // Map legacy keys to actual DB columns
            $cc = $ban['country'];
            unset($ban['country']);
            $ban['country_code'] = $cc;
            $ban['country_name'] = $countryNames[$cc] ?? $cc;

            if (isset($ban['fine_amount'])) {
                $ban['fine_min'] = $ban['fine_amount'];
                $ban['fine_max'] = $ban['fine_amount'];
                unset($ban['fine_amount']);
            }

            DrivingBan::updateOrCreate(
                [
                    'country_code' => $ban['country_code'],
                    'ban_type' => $ban['ban_type'],
                    'title' => $ban['title'],
                ],
                $ban
            );
        }

        $this->command->info('Seeded ' . count($bans) . ' driving bans for ' . collect($bans)->pluck('country_code')->unique()->count() . ' countries.');
    }
}
