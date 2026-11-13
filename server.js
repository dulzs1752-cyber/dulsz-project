require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Data sementara (hilang kalau server restart) ----------
// Untuk produksi, ganti ini dengan database (SQLite/Postgres/MongoDB dll).
let requests = [];
let links = [];

// ---------- Cek server hidup ----------
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ---------- Request lagu ----------
app.get('/api/requests', (req, res) => res.json(requests));

app.post('/api/requests', (req, res) => {
  const { judul } = req.body;
  if (!judul) return res.status(400).json({ error: 'judul wajib diisi' });
  const item = { id: Date.now(), judul };
  requests.unshift(item);
  res.status(201).json(item);
});

app.delete('/api/requests/:id', (req, res) => {
  requests = requests.filter(r => r.id !== Number(req.params.id));
  res.json({ ok: true });
});

// ---------- Antrian link TikTok/Instagram ----------
app.get('/api/links', (req, res) => res.json(links));

app.post('/api/links', (req, res) => {
  const { url, tipe } = req.body;
  if (!url) return res.status(400).json({ error: 'url wajib diisi' });
  const item = { id: Date.now(), url, tipe: tipe || 'lain' };
  links.unshift(item);
  res.status(201).json(item);
});

app.delete('/api/links/:id', (req, res) => {
  links = links.filter(l => l.id !== Number(req.params.id));
  res.json({ ok: true });
});

// ---------- Cari lagu di Spotify (katalog publik, resmi) ----------
// Pakai Client Credentials Flow: https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
let spotifyToken = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < spotifyTokenExpiry) return spotifyToken;
  const auth = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await r.json();
  spotifyToken = data.access_token;
  spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return spotifyToken;
}

app.get('/api/spotify/search', async (req, res) => {
  try {
    if (!process.env.SPOTIFY_CLIENT_ID) return res.status(501).json({ error: 'SPOTIFY_CLIENT_ID belum diisi di .env' });
    const q = req.query.q || '';
    const token = await getSpotifyToken();
    const r = await fetch(`https://api.spotify.com/v1/search?type=track&limit=10&q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    res.json(data.tracks?.items || []);
  } catch (e) {
    res.status(500).json({ error: 'Gagal mengambil data dari Spotify' });
  }
});

// ---------- Cari video di YouTube (resmi, metadata saja) ----------
app.get('/api/youtube/search', async (req, res) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) return res.status(501).json({ error: 'YOUTUBE_API_KEY belum diisi di .env' });
    const q = req.query.q || '';
    const r = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(q)}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await r.json();
    res.json(data.items || []);
  } catch (e) {
    res.status(500).json({ error: 'Gagal mengambil data dari YouTube' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server jalan di http://localhost:${port}`));
