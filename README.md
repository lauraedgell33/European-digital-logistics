# LogiMarket — European Digital Logistics Platform

A full-stack digital logistics marketplace connecting shippers, carriers, and freight forwarders across Europe. Three-platform solution: web dashboard, admin panel, and mobile app.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend API | Laravel | 11 |
| Admin Panel | Filament | 3 |
| Auth | Sanctum | 4 |
| Database | MySQL | 8.4 |
| Cache/Queue | Redis | 7 |
| Frontend | Next.js | 14 |
| UI Framework | React + Tailwind CSS | 18 / 3.4 |
| State | Zustand | 5 |
| Data Fetching | TanStack React Query | 5 |
| Mobile | Expo (React Native) | SDK 55 |
| Monitoring | Prometheus + Grafana | — |
| CI/CD | GitHub Actions | — |

## Project Structure

```
European digital logistics/
├── logistics-platform/          # Laravel 11 Backend
│   ├── app/
│   │   ├── Models/              # 14 Eloquent models
│   │   ├── Http/Controllers/    # API + Filament controllers
│   │   ├── Http/Middleware/     # Security, rate limiting, sanitization
│   │   ├── Policies/           # Authorization policies
│   │   ├── Jobs/               # 5 queue jobs
│   │   └── Filament/           # 9 admin resources
│   ├── routes/api.php          # 87 API endpoints
│   ├── database/               # Migrations, seeders, factories
│   ├── tests/                  # 34 PHPUnit tests
│   └── Dockerfile
├── logistics-frontend/          # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/                # 26 pages (App Router)
│   │   ├── components/         # 39 React components
│   │   ├── lib/                # API client, WebSocket, utilities
│   │   ├── stores/             # Zustand state management
│   │   ├── hooks/              # Custom React hooks
│   │   └── types/              # TypeScript interfaces
│   ├── __tests__/              # 73 Jest tests
│   └── Dockerfile
├── logistics-mobile/            # Expo SDK 55 Mobile App
│   ├── app/                    # 22+ screens (Expo Router)
│   ├── components/             # 12 UI components
│   ├── lib/                    # API, WebSocket, deep linking
│   ├── stores/                 # Zustand stores
│   ├── __tests__/              # 57 Jest tests
│   └── eas.json                # EAS build config
├── monitoring/                  # Prometheus + Grafana
├── scripts/                     # Backup, SSL renewal
├── .github/workflows/           # CI/CD pipelines
└── docker-compose.yml           # Full stack orchestration
```

## Quick Start

### Prerequisites
- PHP 8.3+ / Composer 2
- Node.js 20+ / npm 10+
- MySQL 8.4
- Redis 7+

### Backend Setup
```bash
cd logistics-platform
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
# API: http://localhost:8000/api/v1
# Admin: http://localhost:8000/admin
```

### Frontend Setup
```bash
cd logistics-frontend
npm install
cp .env.local.example .env.local
npm run dev
# http://localhost:3000
```

### Mobile Setup
```bash
cd logistics-mobile
npm install
npx expo start
# Scan QR with Expo Go
```

### Docker (Full Stack)
```bash
docker-compose up -d
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# Admin: http://localhost:8000/admin
```

## Default Credentials
- **Admin**: admin@logistics.eu / Admin@2026!
- **API Health**: GET http://localhost:8000/api/health

## API Overview (87 endpoints)

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | 7 | Login, register, profile, password |
| Freight Offers | 8 | CRUD, search, match |
| Vehicle Offers | 8 | CRUD, search, match |
| Transport Orders | 7 | CRUD, status updates |
| Tenders | 7 | CRUD, bidding, awarding |
| Shipments | 6 | CRUD, events, location tracking |
| Companies | 2 | Directory listing |
| Partner Networks | 6 | CRUD, join/leave |
| Messages | 5 | Conversations, messaging |
| Notifications | 4 | List, read, delete |
| Dashboard | 3 | Overview, analytics, export |
| Matching | 2 | Freight/vehicle matching |
| Route Planning | 1 | Route calculation |
| Pricing | 1 | Price calculation |
| Health | 2 | Basic + detailed health checks |
| Audit | 3 | Audit logs |

## Testing

```bash
# Backend (34 tests)
cd logistics-platform && php artisan test

# Frontend (73 tests)
cd logistics-frontend && npm test

# Mobile (57 tests)
cd logistics-mobile && npm test
```

## Deployment

### EAS Build (Mobile)
```bash
cd logistics-mobile
eas build --platform all --profile production
eas submit --platform all
```

### Docker Production
```bash
docker-compose -f docker-compose.yml up -d
```

### CI/CD
Push to `main` triggers CI checks. Tag `v*` triggers production deploy.

## License
Proprietary — All rights reserved.
