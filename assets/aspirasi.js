/* ===========================================================
   Aspirasi Warga — sumber data: Google Form + Google Sheets
   ===========================================================

   CARA SETUP (sekali saja, ±10 menit):

   BAGIAN 1 — Buat Google Form buat warga isi aspirasi

   1. Buka https://forms.google.com → buat form baru.
   2. Kasih judul, misal "Aspirasi Warga Desa Matang Labong".
   3. Buat pertanyaan (urutan bebas, tapi sebaiknya seperti ini):
        - Nama (jawaban singkat)
        - Kategori (pilihan ganda: Infrastruktur / Pelayanan /
          Lingkungan / Lainnya)
        - Isi Aspirasi (paragraf)
   4. Klik tab "Responses" (Tanggapan) di bagian atas form.
   5. Klik ikon Google Sheets hijau untuk membuat spreadsheet
      tujuan jawaban secara otomatis.
   6. Klik tombol "Send" (Kirim) → salin link form-nya.

   BAGIAN 2 — Pasang link form ke halaman web

   7. Buka file aspirasi.html, cari <div id="formEmbedWrap">.
      Ganti isinya dengan:
        <iframe src="LINK_FORM_KAMU?embedded=true"></iframe>
      (tambahkan "?embedded=true" di akhir link form kamu)

   BAGIAN 3 — Siapkan kolom moderasi di spreadsheet

   8. Buka spreadsheet jawaban yang otomatis terbuat tadi.
   9. Tambahkan 1 kolom baru di paling kanan, beri judul: Tampilkan
      Kolom ini kamu isi manual "Ya" untuk aspirasi yang sudah
      ditinjau dan boleh tampil ke publik. Biarkan kosong kalau
      belum ditinjau atau tidak ingin ditampilkan.

   BAGIAN 4 — Bagikan & sambungkan spreadsheet ke web

   10. Di spreadsheet, klik "Bagikan" → ubah jadi
       "Siapa saja yang memiliki link" → "Melihat".
   11. Salin SHEET_ID dari link spreadsheet-nya (bagian panjang
       di antara /d/ dan /edit).
   12. Tempel ke variabel SHEET_ID di bawah ini.

   Setelah semua ini, warga bisa isi form kapan saja, dan kamu
   tinggal buka spreadsheet buat menandai "Ya" pada aspirasi yang
   mau ditampilkan — situs otomatis ikut menampilkannya.
   =========================================================== */

const ASPIRASI_SHEET_ID = 'GANTI_DENGAN_SHEET_ID_KAMU';   // <-- ganti ini
const ASPIRASI_SHEET_NAME = 'Form Responses 1';             // <-- nama tab respons (default Google Form)

const ASPIRASI_CSV_URL = `https://docs.google.com/spreadsheets/d/${ASPIRASI_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(ASPIRASI_SHEET_NAME)}`;

const ASPIRASI_DEMO = [
  {
    tanggal: 'Contoh — belum tersambung',
    nama: 'Panduan Setup',
    kategori: 'Info',
    isi: 'Buka assets/aspirasi.js, ikuti langkah di komentar bagian atas file untuk menyambungkan Google Form dan Google Sheets. Setelah tersambung, aspirasi yang kamu tandai "Tampilkan = Ya" di spreadsheet akan otomatis muncul di sini.'
  }
];

function parseCSVAspirasi(text){
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for(let i = 0; i < text.length; i++){
    const c = text[i], next = text[i+1];
    if(inQuotes){
      if(c === '"' && next === '"'){ field += '"'; i++; }
      else if(c === '"'){ inQuotes = false; }
      else{ field += c; }
    }else{
      if(c === '"'){ inQuotes = true; }
      else if(c === ','){ row.push(field); field = ''; }
      else if(c === '\n'){ row.push(field); rows.push(row); row = []; field = ''; }
      else if(c === '\r'){ /* skip */ }
      else{ field += c; }
    }
  }
  if(field.length || row.length){ row.push(field); rows.push(row); }
  return rows.filter(r => r.length && r.some(c => c.trim() !== ''));
}

function escapeHtmlAspirasi(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderAspirasi(items){
  const list = document.getElementById('aspirasiList');
  if(!list) return;
  if(!items.length){
    list.innerHTML = '<div class="aspirasi-state">Belum ada aspirasi yang ditampilkan.</div>';
    return;
  }
  list.innerHTML = items.map(item => `
    <div class="aspirasi-card">
      <div class="aspirasi-meta">
        <span class="aspirasi-date">${escapeHtmlAspirasi(item.tanggal || '')}</span>
        ${item.kategori ? `<span class="aspirasi-cat">${escapeHtmlAspirasi(item.kategori)}</span>` : ''}
      </div>
      <div class="aspirasi-name">${escapeHtmlAspirasi(item.nama || 'Warga')}</div>
      <div class="aspirasi-body">${escapeHtmlAspirasi(item.isi || '')}</div>
    </div>
  `).join('');
}

async function loadAspirasi(){
  const formWrap = document.getElementById('formEmbedWrap');

  if(ASPIRASI_SHEET_ID === 'GANTI_DENGAN_SHEET_ID_KAMU'){
    renderAspirasi(ASPIRASI_DEMO);
    return;
  }
  try{
    const res = await fetch(ASPIRASI_CSV_URL);
    if(!res.ok) throw new Error('Gagal mengambil data');
    const text = await res.text();
    const rows = parseCSVAspirasi(text);
    if(rows.length < 2){ renderAspirasi([]); return; }
    const [header, ...dataRows] = rows;
    const norm = h => h.trim().toLowerCase();
    const idx = {
      tanggal: header.findIndex(h => norm(h) === 'timestamp' || norm(h) === 'tanggal'),
      nama: header.findIndex(h => norm(h) === 'nama'),
      kategori: header.findIndex(h => norm(h) === 'kategori'),
      isi: header.findIndex(h => norm(h).includes('aspirasi') || norm(h) === 'isi'),
      tampilkan: header.findIndex(h => norm(h) === 'tampilkan'),
    };
    const items = dataRows
      .filter(r => idx.tampilkan >= 0 && (r[idx.tampilkan] || '').trim().toLowerCase() === 'ya')
      .map(r => ({
        tanggal: idx.tanggal >= 0 ? r[idx.tanggal] : '',
        nama: idx.nama >= 0 ? r[idx.nama] : '',
        kategori: idx.kategori >= 0 ? r[idx.kategori] : '',
        isi: idx.isi >= 0 ? r[idx.isi] : '',
      }))
      .reverse();
    renderAspirasi(items);
  }catch(err){
    const list = document.getElementById('aspirasiList');
    if(list){
      list.innerHTML = `<div class="aspirasi-state">
        ⚠️ Belum bisa memuat aspirasi. Pastikan spreadsheet sudah dibagikan publik dan SHEET_ID di <code>assets/aspirasi.js</code> sudah benar.
      </div>`;
    }
  }
}

loadAspirasi();
