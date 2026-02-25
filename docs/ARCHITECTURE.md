# Technical Architecture — NexusCash POS

## Architecture Principles
- **MVVM** separation of UI concerns from business state
- **Repository Pattern** for data source abstraction (mock → Firebase → on-chain)
- **Feature-first UI packaging** for scalable development
- **Context-driven state** (React) / **Single-activity Compose** (Android)

## Two-Layer Strategy
NexusCash POS runs as a dual-platform project:

### Web Application (Primary Demo)
- **Framework**: React 19 + TypeScript 5.9 + Vite 7
- **Styling**: TailwindCSS 4 with custom neo-morphism design system
- **State**: React Context API with centralized DemoDataContext
- **Charts**: Recharts 3.7 for dashboard analytics
- **Deployment**: Vercel (production)

### Android Application (Native Roadmap)
- **Language**: Kotlin
- **UI**: Jetpack Compose (Material 3)
- **Minimum SDK**: 24 | Target SDK: 35
- **Architecture**: MVVM + Repository Pattern

## Web Application Layering

### 1. Context Layer (State Management)
| Context | Responsibility |
|---------|---------------|
| `ThemeContext` | Dark/Light mode with localStorage persistence |
| `AuthContext` | Gmail + BCH wallet authentication, session management |
| `DemoDataContext` | Master state engine: products, cart, checkout, transactions, treasury, employees, settings |

### 2. Component Layer
| Component | Role |
|-----------|------|
| `Sidebar` | Navigation shell with 8 routes, collapsible on mobile |
| `Header` | Top bar with search, wallet status, notifications, theme toggle, user avatar |

### 3. Page Layer (9 Screens)
| Screen | Key Features |
|--------|-------------|
| `Login` | Gmail + BCH wallet connect (demo mode) |
| `Dashboard` | Revenue charts (Area, Bar, Pie), stat cards with trend comparison |
| `Products` | CRUD with form modal, category filter, cart integration |
| `Checkout` | Payment lifecycle: awaiting → broadcasting → confirming → confirmed |
| `Transactions` | Advanced filters, sort, CSV export, QR viewer, explorer links |
| `Treasury` | Token supply management, sweep, burn, mint, supply chart |
| `Customers` | Auto-derived profiles, tier system, spend analytics |
| `Employees` | CRUD with role validation, shift scheduling |
| `Settings` | 7 sections, 18+ options, draft-save pattern |

### 4. Utility Layer
| Utility | Purpose |
|---------|---------|
| `cn.ts` | Tailwind class merging (clsx + tailwind-merge) |
| `currency.ts` | USD formatting, BCH conversion rate |

## Android Application Layering

### 1. Model Layer (`core/model`)
Domain entities:
- `Product`
- `SaleTransaction`
- `DashboardSnapshot`
- `TreasurySnapshot`
- `Customer`
- `Employee`

### 2. Data Layer (`core/repository`)
- `NCashRepository`: data contract interface
- `MockNCashRepository`: mock data provider for early phases

Future expansion (Phase 3-4):
- `FirebaseRepository` — Firestore integration
- `BchChainRepository` — On-chain BCH operations
- `CashTokenRepository` — FT/NFT token operations

### 3. Presentation Layer (`ui/feature/*`)
Each feature contains:
- `ViewModel` — Business logic and state
- `UiState` — Immutable state representation
- `Screen` — Composable UI

### 4. Navigation Layer (`ui/navigation`)
- `NCashScreen` — Source of truth for routes, titles, and icons
- `NCashPosApp` — Main shell with drawer navigation

## Dependency Matrix

### Web Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.3 | UI framework |
| recharts | 3.7.0 | Charts & data visualization |
| lucide-react | 0.575.0 | Icon library |
| tailwindcss | 4.1.17 | Utility-first CSS |
| vite | 7.2.4 | Build tool & dev server |

### Android Dependencies
| Category | Libraries |
|----------|-----------|
| UI | `material3`, `navigation-compose`, `viewmodel-compose` |
| Concurrency | `kotlinx-coroutines-android` |
| Firebase (Phase 3) | `firebase-bom`, `firebase-auth`, `firebase-firestore` |
| Maps (Phase 3) | `play-services-maps`, `maps-compose` |
| Web3 (Phase 4) | `bitcoinj-core`, `bcprov-jdk18on` |

## Code Conventions
- One feature per folder (`ui/feature/<feature-name>`)
- All screen state flows through immutable state objects
- No heavy business logic in UI components
- Centralized currency formatting utilities
- Strict TypeScript mode with no unused variables/parameters

## Upgrade Strategy

### Phase 3 — Firebase & Maps
- Add `data/remote/firebase/*` for Firestore DTO mapping
- Add `data/mapper/*` for DTO → domain model conversion
- DI injection (Hilt/Koin) for testable repositories
- Google Maps integration for outlet geolocation

### Phase 4 — On-chain BCH
- `PaymentAddressGenerator` — HD wallet address derivation
- `TransactionVerifier` — Mempool/block confirmation listener
- `CashTokenMintService` — FT loyalty token + NFT receipt minting
- Background worker for chain polling and confirmation

### Phase 5 — QA & Release
- Unit tests for ViewModels (filter logic, calculations, state transitions)
- Integration tests with mock repositories
- Error handling, retry policies, offline fallback
- Production hardening and release packaging
