# Panduan: Menyambungkan Aspirasi Warga (Google Form + Sheets)

Halaman **Aspirasi Warga** (`aspirasi.html`) punya 2 bagian:
1. **Form isian** — tempat warga mengirim aspirasi/pengaduan
2. **Daftar aspirasi yang tampil** — otomatis diambil dari Google Sheets, tapi HANYA yang sudah kamu tandai "Tampilkan = Ya" (supaya isinya tidak langsung terbit tanpa ditinjau)

## Langkah setup (±10 menit)

### 1. Buat Google Form
Buka [forms.google.com](https://forms.google.com) → buat form baru, judul misalnya **"Aspirasi Warga Desa Matang Labong"**.

Buat 3 pertanyaan:
| Pertanyaan | Tipe |
|---|---|
| Nama | Jawaban singkat |
| Kategori | Pilihan ganda: Infrastruktur / Pelayanan / Lingkungan / Lainnya |
| Isi Aspirasi | Paragraf |

### 2. Hubungkan ke Google Sheets
Di form, buka tab **Responses (Tanggapan)** → klik ikon Sheets hijau → form akan otomatis membuat spreadsheet baru untuk menampung semua jawaban warga.

### 3. Ambil link form untuk ditempel ke web
Klik tombol **Send (Kirim)** di form → salin link-nya.

Buka file `aspirasi.html`, cari bagian ini:

```html
<div class="form-embed" id="formEmbedWrap">
  <div class="aspirasi-state">
    Form belum terpasang. Lihat PANDUAN-ASPIRASI.md untuk cara menghubungkan Google Form.
  </div>
</div>
```

Ganti isinya jadi:

```html
<div class="form-embed" id="formEmbedWrap">
  <iframe src="LINK_FORM_KAMU?embedded=true"></iframe>
</div>
```

(Tambahkan `?embedded=true` di akhir link form kamu supaya tampil rapi tanpa bingkai Google.)

### 4. Tambahkan kolom moderasi di spreadsheet
Buka spreadsheet jawaban yang otomatis terbuat → tambahkan **1 kolom baru** di paling kanan, judulnya persis: `Tampilkan`

Kolom ini kamu isi manual:
- Ketik **`Ya`** kalau aspirasi itu sudah ditinjau dan boleh tampil ke publik
- Biarkan **kosong** kalau belum ditinjau, atau memang tidak ingin ditampilkan

### 5. Bagikan spreadsheet-nya
Klik **Bagikan** → ubah jadi **"Siapa saja yang memiliki link"** → **"Melihat"**.

### 6. Ambil SHEET_ID dan tempel ke kode
Lihat URL spreadsheet-nya:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_DI_SINI/edit
```

Buka file `assets/aspirasi.js`, cari baris:
```js
const ASPIRASI_SHEET_ID = 'GANTI_DENGAN_SHEET_ID_KAMU';
```
Ganti dengan ID yang kamu salin. Simpan, upload ulang `aspirasi.html` dan `assets/aspirasi.js` ke GitHub.

## Cara kerja moderasi sehari-hari

1. Warga isi form di halaman Aspirasi Warga
2. Jawaban otomatis masuk ke spreadsheet
3. Kamu (atau perangkat desa) buka spreadsheet, baca aspirasi yang masuk
4. Kalau layak ditampilkan, ketik **`Ya`** di kolom `Tampilkan` pada baris itu
5. Situs otomatis menampilkan aspirasi itu ke publik — tidak perlu edit kode atau upload ulang

## Catatan

- Nama tab respons default Google Form biasanya `Form Responses 1` — kalau kamu ganti namanya, sesuaikan juga variabel `ASPIRASI_SHEET_NAME` di `assets/aspirasi.js`.
- Kolom `Kategori` dan `Nama` boleh dikosongkan warga, situs tetap menampilkannya.
- Karena kolom `Tampilkan` adalah penentu utama, aspirasi yang belum ditandai `Ya` **tidak akan pernah muncul di publik** — jadi aman dari spam atau isi yang tidak pantas.
