# DoraHacks Roadmap - N-Cash POS

## Target Akhir Produk
Membangun POS mobile untuk merchant yang mampu:
- menerima pembayaran BCH,
- melakukan settlement otomatis,
- memberikan loyalty CashTokens,
- mencetak bukti transaksi digital (NFT receipt),
- menyediakan dashboard operasional untuk owner.

## Status Per Fase
## Fase 1 - UI/UX Design and Flow Mapping (DONE)
- Wireframe dashboard kasir + owner.
- Definisi page flow: Dashboard, Produk, Transaksi, Treasury, Customers, Employees, Settings.
- Validasi konsep visual.

## Fase 2 - Android Init and Core Infrastructure (DONE)
- Proyek Android Studio (Kotlin + Compose) dibuat.
- Dependency dasar terpasang: Firebase BoM, Maps SDK, web3 foundation.
- Arsitektur MVVM dibangun.
- Semua screen utama hasil Fase 1 dipindahkan ke Compose.

## Fase 3 - Firebase and Google Maps Integration (NEXT)
Deliverables:
- Firebase Auth (role owner/cashier).
- Firestore collections:
  - `products`
  - `transactions`
  - `customers`
  - `settings`
- Realtime data binding dari repository ke ViewModel.
- Google Maps:
  - Marker outlet aktif
  - geofencing dasar (opsional)
  - map in settings/store profile

Definition of Done:
- Login/logout berjalan.
- CRUD produk dan transaksi tersimpan di Firestore.
- Peta menampilkan lokasi outlet dari backend.

## Fase 4 - Web3 and CashTokens Engine (NEXT)
Deliverables:
- BCH payment request flow (address + amount).
- Listener/verification transaksi on-chain.
- Mint loyalty token setelah transaksi confirmed.
- Treasury engine:
  - auto-sweep threshold,
  - hot/cold wallet flow.

Definition of Done:
- Satu transaksi end-to-end:
  - scan/pay BCH,
  - status confirmed,
  - loyalty token terdistribusi.

## Fase 5 - QA and Submission Packaging (NEXT)
Deliverables:
- Unit test untuk ViewModel kritikal.
- Uji UAT kasir/owner scenario.
- Hardening:
  - error states,
  - retry policy,
  - fallback offline.
- Submission package:
  - README final,
  - architecture notes,
  - demo video script,
  - screenshot dan pitch ringkas.

Definition of Done:
- Demo stabil end-to-end.
- Dokumen lengkap dan siap dinilai juri.
