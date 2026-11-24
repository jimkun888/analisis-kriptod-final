# Crypto Analyzer (versi desktop untuk Windows)

Aplikasi desktop untuk memantau harga kripto, menganalisis koin, dan melihat prediksi harga.
Sumber data: CoinGecko (harga, market cap, riwayat harga), alternative.me (Fear & Greed), CryptoCompare (berita). Tanpa API key.

## Cara 1: Buat installer dengan klik dua kali (tanpa mengetik perintah)
1. Ekstrak folder ini.
2. Klik dua kali `Buat-Installer.bat`. Jika Node.js belum ada, file ini memasangnya lewat winget; setelah itu tutup jendela dan klik dua kali lagi.
3. Tunggu beberapa menit. Folder `dist` akan terbuka berisi `CryptoAnalyzer-Setup-1.0.0.exe`.
4. Klik dua kali installer itu. Setelah terpasang, buka aplikasi dari ikon desktop atau Start Menu, tanpa terminal.
   Windows mungkin menampilkan peringatan SmartScreen karena installer belum bertanda tangan digital: pilih "More info" lalu "Run anyway".

## Cara 2: Bangun di GitHub (tanpa memasang apa pun di PC)
1. Buat repositori GitHub, unggah seluruh isi folder ini lewat tombol "Upload files" (termasuk folder `.github`).
2. Buka tab Actions, jalankan "Build Windows installer", lalu unduh `CryptoAnalyzer-Setup` dari hasilnya.

## Catatan
- Pembaruan otomatis: harga tiap 30 detik, data penuh (Top 100, teknikal, berita, Fear & Greed) tiap 2 menit. Tombol Refresh tersedia untuk pembaruan manual.
- API gratis CoinGecko punya batas permintaan. Jika muncul "HTTP 429", tunggu semenit lalu klik Refresh.
- Data ETF tidak tersedia di versi ini. Perubahan harga 30 menit, 4 jam, dan 12 jam juga tidak tersedia.
- Indikator teknikal dihitung dari harga penutupan harian 365 hari; pivot adalah perkiraan sederhana.
- Daftar Berita kurasi, XAU/USD, dan USD/IDR masih snapshot tanggal 23-24 Nov 2026.
- Prediksi adalah model heuristik, bukan jaminan dan bukan nasihat keuangan.
