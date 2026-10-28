# CatatUang

Aplikasi web (PWA) untuk mencatat pengeluaran harian dan pemasukan bulanan. Jalan di Android, Windows, Mac, dan Linux. Data disimpan di database IndexedDB di perangkatmu sendiri, tanpa akun dan tanpa server.

## Fitur
- Catat pengeluaran harian dan pemasukan bulanan, ringkasan per kategori
- Foto struk: total dan kategori dibaca otomatis (OCR Tesseract, jalan offline)
- Notifikasi ringkasan tiap malam (jam bisa diatur)
- Ekspor CSV dan cadangan JSON
- Bisa dipakai offline setelah dibuka sekali

## Cara pakai (pengguna)
Buka alamat situs GitHub Pages milik repo ini di Chrome atau Edge.
- **Android:** menu ⋮ lalu "Instal aplikasi" atau "Tambahkan ke layar utama".
- **PC/laptop:** klik ikon instal di kanan address bar, atau menu ⋮ lalu "Instal CatatUang".

Setelah terpasang, buka tab Atur, tap "Aktifkan notifikasi", lalu coba "Tes notifikasi sekarang".

## Cara upload ke GitHub (pemilik repo)
1. Buat repo baru di github.com (publik), mis. `catatuang`.
2. Upload semua isi folder ini ke root repo (termasuk folder `lib`, `icons`, dan file `.nojekyll`).
3. Buka Settings > Pages. Source: "Deploy from a branch", branch `main`, folder `/ (root)`. Simpan.
4. Tunggu sekitar 1 menit. Alamatnya: `https://USERNAME.github.io/catatuang/`

Bagikan alamat itu. Orang lain tinggal membukanya dan menginstal. Tiap pengguna punya data sendiri di perangkatnya.

## Jadi file APK (opsional)
Buka https://www.pwabuilder.com, masukkan alamat GitHub Pages-mu, lalu pilih paket Android. Hasilnya bisa diunggah ke GitHub Releases supaya orang bisa mengunduh APK.

## Fitur PWA
- **Pintasan ikon aplikasi:** tekan lama ikon di Android (atau klik kanan di PC) untuk "Tambah pengeluaran", "Ringkasan bulan ini", dan "Foto struk" (langsung membuka kamera).
- **Screenshot di dialog instal:** `screenshots/narrow.png` dan `wide.png` adalah ilustrasi dengan data contoh. Ganti dengan tangkapan layar asli sebelum dipublikasikan.
- **IARC rating:** `iarc_rating_id` sengaja tidak diisi. Kodenya harus dari kuesioner IARC (gratis, lewat Google Play Console). Isi di `manifest.webmanifest` kalau mau terbit di Play Store.

## Kemampuan PWA yang aktif
- **Pintasan** (tekan lama ikon) dan **bagikan foto struk** ke aplikasi
- **File handler:** buka file cadangan `.json` langsung dengan CatatUang
- **Protocol handler:** tautan `web+catatuang:add?amt=25000&note=kopi&cat=Makan` membuka form yang sudah terisi
- **Launch handler:** membuka jendela yang sudah ada, bukan jendela baru
- **Widget Windows 11:** total pengeluaran hari ini
- **Window Controls Overlay, tabbed display, edge side panel, note taking:** tampilan desktop
- **Service worker:** offline, periodic sync, background sync, push (handler siap, belum ada server push)
- `.well-known/assetlinks.json` dan `.well-known/web-app-origin-association` memakai domain `exsors-code.github.io`. Ganti kalau domainmu berbeda.
- `iarc_rating_id` belum diisi karena harus berupa kode sertifikat IARC asli.

## Terbit ke Play Store
1. Hosting harus di domain root (mis. `USERNAME.github.io`) agar `/.well-known/assetlinks.json` bisa diakses. Repo project di `/NAMA-REPO/` tidak cukup.
2. Jangan commit `signing.keystore` atau `signing-key-info.txt` ke GitHub (sudah ada di `.gitignore`).
3. Pakai Play App Signing, lalu tambahkan sidik jari SHA-256 dari Play Console ke `assetlinks.json`.
4. Isi `iarc_rating_id` dan alamat kebijakan privasi (`privacy.html`) di Play Console.

## Update aplikasi
Service worker memakai cache lebih dulu. Setiap kali kamu mengubah file, naikkan nomor versi `V` di `sw.js` (mis. `catatuang-v6`) supaya pengguna menerima versi baru.

## Batasan
- Notifikasi saat aplikasi tertutup memakai Periodic Background Sync. Hanya Chrome/Edge yang mendukung, aplikasi harus sudah terinstal, dan Chrome yang menentukan jam pengecekan, jadi bisa telat. iOS Safari tidak mendukungnya.
- Data tidak tersinkron antar perangkat. Pakai ekspor/impor JSON untuk memindahkan data.
- Menghapus data situs di browser menghapus database. Buat cadangan JSON berkala.
- Hasil OCR perlu dicek, terutama untuk struk thermal yang pudar.

## Struktur
`index.html`, `app.js` (logika), `db.js` (database IndexedDB), `sw.js` (offline + notifikasi), `manifest.webmanifest`, `style.css`, `icons/`, `lib/` (Tesseract.js dan data bahasa Indonesia/Inggris).

Lisensi: MIT. Tesseract.js berlisensi Apache 2.0.
