# Roadmap — NexusCash POS

## Product Vision
Build a complete mobile-first POS system for merchants that can:
- Accept Bitcoin Cash (BCH) payments in real-time
- Perform automatic settlement and treasury management
- Distribute CashToken loyalty rewards to customers
- Issue verifiable digital receipts as NFTs
- Provide a full operational dashboard for business owners

## Phase Status

### Phase 1 — UI/UX Design & Flow Mapping ✅ COMPLETE
- Wireframed all merchant screens (dashboard, catalog, checkout, treasury)
- Defined complete page flow: Dashboard → Products → Checkout → Transactions → Treasury → Customers → Employees → Settings
- Validated visual concept with neo-morphism design system
- Established dark/light theme support

### Phase 2 — Project Init & Core Infrastructure ✅ COMPLETE
**Web Application:**
- React 19 + TypeScript 5.9 + Vite 7 project with TailwindCSS 4
- Complete state management via React Context API
- All 9 screens fully implemented and interactive
- Live checkout flow with payment simulation
- CashToken loyalty engine + NFT receipt system
- Treasury management with hot/cold wallet architecture
- Deployed to Vercel (production)

**Android Application:**
- Android Studio project (Kotlin + Compose) initialized
- Dependencies: Firebase BoM, Maps SDK, bitcoinj-core
- MVVM architecture with Repository pattern
- All screen scaffolds created in Compose

### Phase 3 — Firebase & Google Maps Integration 🔜 NEXT
**Deliverables:**
- Firebase Auth with role-based access (Owner/Cashier)
- Firestore collections: `products`, `transactions`, `customers`, `settings`
- Real-time data binding from repository to ViewModel
- Google Maps: outlet markers, geofencing, store profile

**Definition of Done:**
- Login/logout functional with persistent sessions
- CRUD operations persisted in Firestore
- Map displays outlet locations from backend

### Phase 4 — On-chain BCH & CashTokens Engine 🔜 PLANNED
**Deliverables:**
- BCH payment request generation (HD wallet addresses)
- On-chain transaction verification and confirmation listener
- CashToken loyalty token minting (fungible tokens)
- NFT receipt minting (non-fungible tokens)
- Treasury engine: auto-sweep, hot/cold wallet management

**Definition of Done:**
- End-to-end transaction: scan QR → pay BCH → confirmed → loyalty token distributed → NFT receipt issued

### Phase 5 — QA, Testing & Production Release 🔜 PLANNED
**Deliverables:**
- Unit tests for critical ViewModels
- UAT scenarios for cashier and owner workflows
- Error handling: retry policies, offline fallback, edge cases
- Submission package: final README, architecture docs, demo video, pitch deck

**Definition of Done:**
- Stable end-to-end demo
- Complete documentation ready for review
- Production-grade error handling

## Timeline
| Phase | Target | Status |
|-------|--------|--------|
| Phase 1 | Feb 2026 Week 1 | ✅ Complete |
| Phase 2 | Feb 2026 Week 2-3 | ✅ Complete |
| Phase 3 | Mar 2026 | 🔜 Post-Hackathon |
| Phase 4 | Mar-Apr 2026 | 🔜 Post-Hackathon |
| Phase 5 | Apr 2026 | 🔜 Post-Hackathon |
