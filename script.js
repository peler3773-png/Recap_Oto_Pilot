// Data global
let dataMentah = [];
let pasaranTerpilih = '';
let batasJumlah = 90;
let hasil3DD = [];
let hasil3DB = [];
let hasil4D = [];
let sumberMuat = '—';

const SHIO = {
  0: 'Monyet', 1: 'Ayam', 2: 'Anjing', 3: 'Babi',
  4: 'Tikus', 5: 'Kerbau', 6: 'Harimau', 7: 'Kelinci',
  8: 'Naga', 9: 'Ular'
};

// === Inisialisasi ===
document.addEventListener('DOMContentLoaded', () => {
  pasaranTerpilih = document.getElementById('pilihPasaran').value;
  document.getElementById('inputTarget').value = batasJumlah;
  document.getElementById('nilaiSaatIni').textContent = batasJumlah;
  
  // Kaitkan input file
  document.getElementById('pilihBerkas').addEventListener('change', bacaBerkas);
  document.getElementById('pilihSalinan').addEventListener('change', bacaSalinan);
  
  perbaruiStatus('⏳ Siap — tempel data atau pilih file .txt');
});

function perbaruiStatus(pesan) {
  document.getElementById('status').textContent = pesan;
}

// === Muat Data ===
function muatDariFolderSumber() {
  document.getElementById('pilihBerkas').click();
}

function muatSalinanLokal() {
  document.getElementById('pilihSalinan').click();
}

function bacaBerkas(e) {
  const file = e.target.files[0];
  if (!file) return;
  sumberMuat = file.name;
  const reader = new FileReader();
  reader.onload = evt => {
    document.getElementById('masukanData').value = evt.target.result;
    perbaruiStatus(`✅ Dimuat dari ${file.name} — klik "Pakai Data Di Atas"`);
  };
  reader.readAsText(file);
}

function bacaSalinan(e) {
  const file = e.target.files[0];
  if (!file) return;
  sumberMuat = file.name;
  const reader = new FileReader();
  reader.onload = evt => {
    prosesTeks(evt.target.result);
  };
  reader.readAsText(file);
}

function prosesDataLokal() {
  const teks = document.getElementById('masukanData').value.trim();
  if (!teks) {
    perbaruiStatus('⚠️ Kolom data masih kosong!');
    return;
  }
  sumberMuat = 'Ditempel';
  prosesTeks(teks);
}

function prosesTeks(teks) {
  const baris = teks.split('\n').filter(b => b.trim());
  dataMentah = [];
  const sekarang = new Date();
  const tigaTahunLalu = new Date(sekarang.setFullYear(sekarang.getFullYear() - 3));
  
  let minTgl = null, maxTgl = null;
  
  for (const b of baris) {
    const bagian = b.split('|');
    if (bagian.length < 3) continue;
    const [pasaran, tglStr, angka] = bagian;
    const tgl = new Date(tglStr);
    if (isNaN(tgl.getTime())) continue;
    if (tgl < tigaTahunLalu) continue; // Lewati lebih dari 3 tahun
    
    if (!minTgl || tgl < minTgl) minTgl = tgl;
    if (!maxTgl || tgl > maxTgl) maxTgl = tgl;
    
    dataMentah.push({
      pasaran,
      tanggal: tgl,
      tglStr,
      angka: angka.padStart(4, '0'),
      d2: angka.slice(-2),
      d3: angka.slice(-3),
      d4: angka
    });
  }
  
  if (!dataMentah.length) {
    perbaruiStatus('❌ Tidak ada data valid dalam 3 tahun terakhir');
    return;
  }
  
  document.getElementById('rentangTgl').textContent = 
    `${formatTglSingkat(minTgl)} s/d ${formatTglSingkat(maxTgl)}`;
  
  mulai(false);
}

function formatTglSingkat(tgl) {
  return tgl.toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric'});
}

// === Kontrol Utama ===
function mulai(ulang) {
  if (!dataMentah.length) {
    perbaruiStatus('⚠️ Silakan masukkan data dulu!');
    return;
  }
  
  pasaranTerpilih = document.getElementById('pilihPasaran').value;
  const namaOpt = document.getElementById('pilihPasaran').selectedOptions[0].text;
  document.getElementById('namaPasaranTerpilih').textContent = namaOpt;
  
  const dataPasaran = dataMentah.filter(d => d.pasaran === pasaranTerpilih);
  if (!dataPasaran.length) {
    perbaruiStatus(`❌ Tidak ada data untuk ${namaOpt}`);
    return;
  }
  
  // Urutkan terbaru di atas
  dataPasaran.sort((a, b) => b.tanggal - a.tanggal);
  
  // Hitung frekuensi 2D
  const hitungDD = {}, hitungDT = {}, hitungDB = {};
  dataPasaran.forEach(d => {
    const dDepan = d.angka.slice(0, 2);
    const dBelakang = d.angka.slice(-2);
    const dTengah = d.angka.slice(1, 3);
    hitungDD[dBelakang] = (hitungDD[dBelakang] || 0) + 1;
    hitungDT[dTengah] = (hitungDT[dTengah] || 0) + 1;
    hitungDB[dDepan] = (hitungDB[dDepan] || 0) + 1;
  });
  
  // Bagi kelompok
  const urut = (obj, batas) => {
    const semua = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    return {
      semua,
      atas: semua.filter(x => x[1] >= batas),
      bawah: semua.filter(x => x[1] < batas)
    };
  };
  
  const DD = urut(hitungDD, 10);
  const DT = urut(hitungDT, 10);
  const DB = urut(hitungDB, 10);
  
  // Tampil ringkasan terbaru
  const tr = dataPasaran[0];
  tampilRingkasan(tr);
  
  // Isi kotak
  isiKotak('kotak2DD', DD.semua, 'semua');
  isiKotak('kotak2DT', DT.semua, 'semua');
  isiKotak('kotak2DB', DB.semua, 'semua');
  
  isiKotak('kotakBawahDD', DD.bawah, 'bawah');
  isiKotak('kotakBawahDT', DT.bawah, 'bawah');
  isiKotak('kotakBawahDB', DB.bawah, 'bawah');
  
  isiKotak('kotakAtasDD', DD.atas, 'atas');
  isiKotak('kotakAtasDT', DT.atas, 'atas');
  isiKotak('kotakAtasDB', DB.atas, 'atas');
  
  // Perbarui jumlah
  document.getElementById('jmlLblDD').textContent = DD.semua.length;
  document.getElementById('jmlLblDT').textContent = DT.semua.length;
  document.getElementById('jmlLblDB').textContent = DB.semua.length;
  
  document.getElementById('jmlLblDDbawah').textContent = DD.bawah.length;
  document.getElementById('jmlLblDTbawah').textContent = DT.bawah.length;
  document.getElementById('jmlLblDBbawah').textContent = DB.bawah.length;
  
  document.getElementById('jmlLblDDatas').textContent = DD.atas.length;
  document.getElementById('jmlLblDTatas').textContent = DT.atas.length;
  document.getElementById('jmlLblDBatas').textContent = DB.atas.length;
  
  // Simpan untuk pembuatan 3D
  window.DD_list = DD.semua.map(x => x[0]);
  window.DT_list = DT.semua.map(x => x[0]);
  window.DB_list = DB.semua.map(x => x[0]);
  
  window.DD_bawah = DD.bawah.map(x => x[0]);
  window.DT_bawah = DT.bawah.map(x => x[0]);
  window.DB_bawah = DB.bawah.map(x => x[0]);
  
  window.DD_atas = DD.atas.map(x => x[0]);
  window.DT_atas = DT.atas.map(x => x[0]);
  window.DB_atas = DB.atas.map(x => x[0]);
  
  // Tampilkan konten
  document.getElementById('konten').style.display = 'block';
  document.getElementById('sumberMuat').textContent = sumberMuat;
  document.getElementById('terakhirMuat').textContent = 
    `Terakhir: ${new Date().toLocaleTimeString('id-ID')}`;
  document.getElementById('infoBatas').textContent = 
    `(Batas: ${batasJumlah} pasang)`;
  
  perbaruiStatus(`✅ ${namaOpt}: ${dataPasaran.length} baris data siap`);
}

function tampilPasaran() {
  // Siap pilih, tunggu klik Muat Ulang
}

function terapkanAngka() {
  batasJumlah = parseInt(document.getElementById('inputTarget').value) || 90;
  batasJumlah = Math.max(1, Math.min(99, batasJumlah));
  document.getElementById('inputTarget').value = batasJumlah;
  document.getElementById('nilaiSaatIni').textContent = batasJumlah;
  document.getElementById('btnTxtDD').textContent = batasJumlah;
  document.getElementById('btnTxtDB').textContent = batasJumlah;
  mulai(true);
}

function tampilRingkasan(d) {
  const hari = d.tanggal.toLocaleDateString('id-ID', {weekday:'long'});
  const tgl = d.tglStr;
  const shio = SHIO[parseInt(d.angka.slice(-1)) % 10];
  
  document.getElementById('r-hari').textContent = hari;
  document.getElementById('r-tgl').textContent = tgl;
  document.getElementById('r-shio').textContent = shio;
  document.getElementById('r-data1').textContent = d.angka;
  document.getElementById('r-data2').textContent = d.angka;
  document.getElementById('r-d2d').textContent = d.d2;
  document.getElementById('r-d2t').textContent = d.d3.slice(1);
  document.getElementById('r-d2b').textContent = d.angka.slice(0, 2);
}

function isiKotak(id, daftar, jenis) {
  const el = document.getElementById(id);
  if (!daftar.length) {
    el.innerHTML = '<span class="kosong">Tidak ada data</span>';
    return;
  }
  el.innerHTML = daftar.map(x => {
    let warna = '#fff';
    if (jenis === 'bawah') warna = '#90ee90';
    if (jenis === 'atas') warna = '#ffd700';
    return `<span style="color:${warna}">${x[0]}(${x[1]})</span>`;
  }).join(' ');
}

// === Buat 3D ===
function buat3DDdariN() {
  const dd = window.DD_list?.slice(0, batasJumlah) || [];
  const dt = window.DT_list?.slice(0, batasJumlah) || [];
  hasil3DD = gabung2D(dd, dt);
  tampil3D('databet2', hasil3DD, 'jmlLbl3DD');
}

function buat3DBdariN() {
  const dt = window.DT_list?.slice(0, batasJumlah) || [];
  const db = window.DB_list?.slice(0, batasJumlah) || [];
  hasil3DB = gabung2D(dt, db);
  tampil3D('databet3', hasil3DB, 'jmlLbl3DB');
}

function buat3DDdariBawah10() {
  hasil3DD = gabung2D(window.DD_bawah || [], window.DT_bawah || []);
  tampil3D('databet2', hasil3DD, 'jmlLbl3DD');
}

function buat3DBdariBawah10() {
  hasil3DB = gabung2D(window.DT_bawah || [], window.DB_bawah || []);
  tampil3D('databet3', hasil3DB, 'jmlLbl3DB');
}

function buat3DDdariAtas10() {
  hasil3DD = gabung2D(window.DD_atas || [], window.DT_atas || []);
  tampil3D('databet2', hasil3DD, 'jmlLbl3DD');
}

function buat3DBdariAtas10() {
  hasil3DB = gabung2D(window.DT_atas || [], window.DB_atas || []);
  tampil3D('databet3', hasil3DB, 'jmlLbl3DB');
}

function gabung2D(arr1, arr2) {
  const hasil = [];
  for (const a of arr1) {
    for (const b of arr2) {
      hasil.push(a[0] + b[1]);
    }
  }
  return [...new Set(hasil)];
}

function tampil3D(id, daftar, idJml) {
  document.getElementById(id).value = daftar.join('\n');
  document.getElementById(idJml).textContent = daftar.length;
}

// === Generate 4D ===
function prosesGenerate() {
  if (!hasil3DD.length || !hasil3DB.length) {
    alert('Buat 3DD dan 3DB terlebih dahulu!');
    return;
  }
  hasil4D = [];
  for (const a of hasil3DD) {
    for (const b of hasil3DB) {
      hasil4D.push(a + b.slice(-1));
    }
  }
  hasil4D = [...new Set(hasil4D)].sort();
  document.getElementById('output').value = hasil4D.join('\n');
  document.getElementById('jumlahLN').textContent = `${hasil4D.length} LN`;
}

function hapus() {
  hasil3DD = [];
  hasil3DB = [];
  hasil4D = [];
  document.getElementById('databet2').value = '';
  document.getElementById('databet3').value = '';
  document.getElementById('output').value = '';
  document.getElementById('jumlahLN').textContent = '0 LN';
  document.getElementById('jmlLbl3DD').textContent = '0';
  document.getElementById('jmlLbl3DB').textContent = '0';
  document.getElementById('inputCari').value = '';
  document.getElementById('kotakHasilCari').style.display = 'none';
}

// === Salin ===
function salinElemen(btn, idTarget) {
  const teks = document.getElementById(idTarget).value || document.getElementById(idTarget).innerText;
  navigator.clipboard.writeText(teks).then(() => {
    btn.textContent = '✅ Disalin!';
    setTimeout(() => { btn.textContent = btn.textContent.replace('✅ ', ''); }, 1500);
  });
}

function salinBlokHasil() {
  const teks = document.getElementById('kotakTeksHasil').value;
  navigator.clipboard.writeText(teks).then(() => alert('Disalin!'));
}

// === Cari ===
function cariAngka4D() {
  const pola = document.getElementById('inputCari').value.trim();
  if (!pola || !hasil4D.length) {
    document.getElementById('kotakHasilCari').style.display = 'none';
    return;
  }
  
  const regex = new RegExp(pola.replace(/\*/g, '.'), 'g');
  const cocok = hasil4D.filter(n => regex.test(n));
  
  document.getElementById('kotakHasilCari').style.display = 'block';
  document.getElementById('labelHasilCari').textContent = 
    `Ditemukan: ${cocok.length} nomor cocok "${pola}"`;
  document.getElementById('kotakTeksHasil').value = cocok.join('\n');
}

function segarHalaman() {
  location.reload();
}
