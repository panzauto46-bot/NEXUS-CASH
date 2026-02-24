# Arsitektur Teknis N-Cash POS (Android)

## Prinsip Arsitektur
- **MVVM** untuk pemisahan concern UI vs business state.
- **Repository Pattern** untuk abstraksi sumber data (mock, Firebase, on-chain).
- **Feature-first UI package** agar scaling lebih mudah.
- **Single-activity Compose app** dengan Navigation Compose.

## Layering
## 1. Model Layer (`core/model`)
Berisi data class domain:
- `Product`
- `SaleTransaction`
- `DashboardSnapshot`
- `TreasurySnapshot`
- `Customer`
- `Employee`

## 2. Data Layer (`core/repository`)
- `NCashRepository`: kontrak data app.
- `MockNCashRepository`: provider mock data fase awal.

Pada Fase 3 dan Fase 4, layer ini akan dipecah menjadi:
- `FirebaseRepository`
- `BchChainRepository`
- `CashTokenRepository`

## 3. Presentation Layer (`ui/feature/*`)
Setiap fitur memiliki:
- `ViewModel`
- `UiState`
- `Screen`

Contoh:
- `ui/feature/products/ProductsViewModel.kt`
- `ui/feature/products/ProductsScreen.kt`

## 4. Navigation Layer (`ui/navigation`)
- `NCashScreen` sebagai source of truth route + title + icon.
- `NCashPosApp` sebagai shell utama:
  - drawer navigation
  - top app bar
  - host semua composable route

## Dependency Matrix
## UI
- `androidx.compose.material3:material3`
- `androidx.navigation:navigation-compose`
- `androidx.lifecycle:lifecycle-viewmodel-compose`

## Data and Concurrency
- `kotlinx-coroutines-android`

## Firebase (Fase 3)
- `firebase-bom`
- `firebase-auth-ktx`
- `firebase-firestore-ktx`
- `firebase-analytics-ktx`

## Maps (Fase 3)
- `play-services-maps`
- `maps-compose`

## Web3/BCH Foundation (Fase 4)
- `bitcoinj-core`
- `bcprov-jdk18on`

## Konvensi Kode
- Satu fitur satu folder (`ui/feature/<feature-name>`).
- Seluruh state layar wajib melalui `UiState`.
- Hindari business logic berat di composable.
- Currency formatting terpusat pada util (`CurrencyFormat`).

## Strategy Upgrade Berikutnya
## Fase 3 Refactor Plan
- Tambah `data/remote/firebase/*` untuk mapping Firestore DTO.
- Tambah `data/mapper/*` untuk konversi DTO -> domain model.
- Inject repository lewat DI (Hilt/Koin) agar testable.

## Fase 4 Refactor Plan
- Pisahkan on-chain adapter:
  - `PaymentAddressGenerator`
  - `TransactionVerifier`
  - `CashTokenMintService`
- Tambah background worker untuk polling/confirmation chain.

## Testing Plan
- Unit test ViewModel:
  - filter logic,
  - summary calculation,
  - state transitions.
- Integration test repository dengan fake backend.
