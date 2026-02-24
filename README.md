# N-Cash POS (DoraHacks Build)

N-Cash POS adalah sistem Point of Sale berbasis **Bitcoin Cash (BCH) + CashTokens** untuk merchant F&B/retail, dengan target akhir:
- pembayaran BCH real-time,
- loyalty token on-chain,
- receipt NFT,
- analytics operasional,
- integrasi lokasi outlet.

Repository ini sekarang memakai struktur **dua lapis**:
- **Web prototype (Vite + React)** untuk referensi visual Fase 1.
- **Android app (Kotlin + Compose)** sebagai implementasi utama hackathon.

## Progress Tracker
- [x] Fase 1: UI/UX Design & Flow Mapping (Selesai)
- [x] Fase 2: Inisialisasi Proyek & Infrastruktur Inti (Selesai)
- [ ] Fase 3: Integrasi Firebase & Google Maps
- [ ] Fase 4: Integrasi Web3 & CashTokens Engine
- [ ] Fase 5: QA, Finalisasi, & Dokumentasi Submission

## Struktur Repository
```text
NEXUS CASH/
|-- android-app/                      # Android Studio project (main implementation)
|   |-- build.gradle.kts
|   |-- settings.gradle.kts
|   |-- gradle.properties
|   |-- local.properties.example
|   `-- app/
|       |-- build.gradle.kts
|       |-- google-services.json.example
|       `-- src/main/
|           |-- AndroidManifest.xml
|           |-- java/com/ncash/pos/
|           |   |-- MainActivity.kt
|           |   |-- NCashApplication.kt
|           |   |-- core/
|           |   |   |-- model/
|           |   |   |-- repository/
|           |   |   `-- util/
|           |   `-- ui/
|           |       |-- NCashPosApp.kt
|           |       |-- navigation/
|           |       |-- feature/
|           |       `-- theme/
|           `-- res/
|-- src/                              # Web prototype phase-1
|-- docs/
|   |-- ARCHITECTURE.md
|   `-- ROADMAP_DORAHACKS.md
`-- README.md
```

## Fase 2 yang Sudah Dikerjakan
### 1) Proyek Android Studio Baru (Kotlin)
- App package: `com.ncash.pos`
- Stack UI: Jetpack Compose (Material 3)
- Minimum SDK: 24
- Compile/Target SDK: 35

### 2) Setup Dependency Inti
Di `android-app/app/build.gradle.kts` sudah disiapkan:
- **Web3/BCH foundation**: `bitcoinj-core`, `bcprov`
- **Firebase BoM**: Analytics, Auth, Firestore
- **Google Maps**: Play Services Maps + Maps Compose
- **App architecture**: ViewModel Compose, Navigation Compose, Coroutines

### 3) Arsitektur MVVM
Struktur package:
- `core/model`: entity domain
- `core/repository`: interface + mock repository
- `ui/feature/*`: ViewModel + Screen per fitur
- `ui/navigation`: route dan menu
- `ui/theme`: design system dasar

### 4) Implementasi Flow UI Fase 1 ke Compose
Screen utama yang sudah tersedia:
- Dashboard
- Product Catalog
- Transactions
- CashToken Treasury
- Customers
- Employees
- Settings

Semua screen sudah terhubung di satu shell navigasi (`NCashPosApp.kt`) agar siap diisi logic backend dan on-chain di fase berikutnya.

## Cara Menjalankan Android App
## 1. Prasyarat
- Android Studio Hedgehog atau terbaru
- JDK 17
- Android SDK (API 35)

## 2. Setup Lokal
1. Buka folder `android-app` di Android Studio.
2. Copy `android-app/local.properties.example` menjadi `android-app/local.properties`.
3. Isi `sdk.dir` dan `MAPS_API_KEY`.
4. Copy `android-app/app/google-services.json.example` lalu ganti dengan file asli Firebase:
   - simpan sebagai `android-app/app/google-services.json`
5. Sync Gradle project.

## 3. Run
- Jalankan konfigurasi `app` di emulator/device Android.

## Dokumen Pendukung
- [Roadmap DoraHacks](docs/ROADMAP_DORAHACKS.md)
- [Arsitektur & Konvensi Teknis](docs/ARCHITECTURE.md)

## Rencana Lanjut (Next Action)
1. Fase 3: aktifkan Firebase Auth + Firestore transaction store + geolocation outlet.
2. Fase 4: implementasi pembayaran BCH on-chain + mint CashTokens.
3. Fase 5: hardening QA, demo script, dan submission bundle DoraHacks.
