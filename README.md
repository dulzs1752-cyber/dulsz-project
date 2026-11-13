# Music Hub Server — Starter

Server API dasar untuk Music Hub Panel: request lagu, antrian link, dan pencarian lagu/video lewat API resmi Spotify & YouTube.

## 1. Jalankan di laptop/PC

```bash
npm install
cp .env.example .env
npm start
```

Server jalan di `http://localhost:3000`. Coba buka `http://localhost:3000/api/health` — kalau muncul `{"ok":true}`, berarti sudah jalan.

## 2. Endpoint yang tersedia

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/requests` | Lihat semua request lagu |
| POST | `/api/requests` | Kirim request lagu baru, body: `{"judul": "..."}` |
| DELETE | `/api/requests/:id` | Hapus satu request |
| GET | `/api/links` | Lihat antrian link TikTok/Instagram |
| POST | `/api/links` | Simpan link baru, body: `{"url": "...", "tipe": "tiktok"}` |
| GET | `/api/spotify/search?q=judul` | Cari lagu di katalog Spotify |
| GET | `/api/youtube/search?q=judul` | Cari video di YouTube |

## 3. Supaya pencarian Spotify/YouTube jalan

- **Spotify**: daftar app gratis di [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard), salin Client ID & Client Secret ke file `.env`.
- **YouTube**: aktifkan "YouTube Data API v3" di [console.cloud.google.com](https://console.cloud.google.com), buat API key, isi ke `.env`.

Tanpa isi `.env`, dua endpoint itu akan balas error 501 (belum dikonfigurasi) — endpoint request lagu & link tetap jalan normal.

## 4. Catatan penting (legal)

- Endpoint Spotify/YouTube di sini cuma **mencari metadata** (judul, artis, durasi, thumbnail) — bukan mengunduh file lagu/videonya. Ini sesuai Terms of Service kedua platform.
- Untuk benar-benar **memutar** lagu Spotify di halaman kamu (bukan cuma cari), langkah selanjutnya adalah pakai **Spotify Web Playback SDK**: pengguna login dengan akun Spotify Premium mereka sendiri, lalu kontrol play/pause langsung dari browser. Ini butuh OAuth (bukan Client Credentials seperti di atas).
- Untuk YouTube, cara resmi menampilkan video adalah **embed `<iframe>`** dari `youtube.com/embed/...` — bukan mengunduh file audionya.

## 5. Deploy supaya bisa diakses dari HP di mana saja

Setelah jalan lancar di laptop, upload project ini ke layanan seperti Railway, Render, atau Fly.io (ada paket gratis), lalu isi environment variable `SPOTIFY_CLIENT_ID`, dll di dashboard mereka — jangan upload file `.env` ke git/public repo.
