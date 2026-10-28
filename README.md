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

## Batasan
- Notifikasi saat aplikasi tertutup memakai Periodic Background Sync. Hanya Chrome/Edge yang mendukung, aplikasi harus sudah terinstal, dan Chrome yang menentukan jam pengecekan, jadi bisa telat. iOS Safari tidak mendukungnya.
- Data tidak tersinkron antar perangkat. Pakai ekspor/impor JSON untuk memindahkan data.
- Menghapus data situs di browser menghapus database. Buat cadangan JSON berkala.
- Hasil OCR perlu dicek, terutama untuk struk thermal yang pudar.

## Struktur
`index.html`, `app.js` (logika), `db.js` (database IndexedDB), `sw.js` (offline + notifikasi), `manifest.webmanifest`, `style.css`, `icons/`, `lib/` (Tesseract.js dan data bahasa Indonesia/Inggris).

Lisensi: MIT. Tesseract.js berlisensi Apache 2.0.
