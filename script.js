const KUNCI_SIMPANAN = "data_lotre_simpan";
const KUNCI_WAKTU = "data_lotre_waktu";
const BATAS_TAHUN = 3;
let TARGET_2D = 90;
let semuaData = [];
let dataProses = null;
let daftar4DTerakhir = [];

function aturModeWarna(elemenId, mode) {
  const el = document.getElementById(elemenId);
  if (!el) return;
  el.classList.remove('mode-ungu', 'mode-hijau', 'mode-kuning');
  el.classList.add('mode-' + mode);
}

const SHIO = [
  {awal:0,nama:'Tikus'},{awal:1,nama:'Kerbau'},{awal:2,nama:'Harimau'},
  {awal:3,nama:'Kelinci'},{awal:4,nama:'Naga'},{awal:5,nama:'Ular'},
  {awal:6,nama:'Kuda'},{awal:7,nama:'Kambing'},{awal:8,nama:'Monyet'},
  {awal:9,nama:'Ayam'},{awal:10,nama:'Anjing'},{awal:11,nama:'Babi'}
];

function dapatkanShio(a){const p=parseInt(a,10);return SHIO[p%12].nama}
function dapatkanHari(t){const d=new Date(t+'T00:00:00');return ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][d.getDay()]}
function segarHalaman(){location.reload(true)}

async function salinTeks(teks,el){
  if(!teks)return;
  try{await navigator.clipboard.writeText(teks)}catch(e){
    const ta=document.createElement('textarea');
    ta.value=teks;document.body.appendChild(ta);
    ta.select();document.execCommand('copy');document.body.removeChild(ta)
  }
  if(el){el.classList.add('tersalin');setTimeout(()=>el.classList.remove('tersalin'),700)}
}

function salinElemen(btn,idEl){
  const el=document.getElementById(idEl);if(!el)return;
  if(el.tagName==='TEXTAREA'){salinTeks(el.value.trim(),btn);return}
  const d=[];el.querySelectorAll('.baris-salin').forEach(x=>d.push(x.textContent.trim()));
  salinTeks(d.join('*'),btn);
}

function urai4Digit(a){const s=String(a).padStart(4,'0');return {asli:s,d2:s.slice(0,2),t2:s.slice(1,3),b2:s.slice(2,4)}}

function ambilSesuai(daftar,hindari){
  const hit={};daftar.forEach(x=>{hit[x]=(hit[x]||0)+1});
  const res=[],sudah=new Set();
  Object.entries(hit).filter(([n])=>n!==hindari).sort((a,b)=>a[1]-b[1]).forEach(([n])=>{
    if(res.length>=TARGET_2D)return;if(!sudah.has(n)){res.push(n);sudah.add(n)}
  });
  for(let i=0;i<=99;i++){
    if(res.length>=TARGET_2D)break;
    const n=String(i).padStart(2,'0');
    if(n===hindari||sudah.has(n))continue;
    res.push(n);sudah.add(n)
  }
  while(res.length>TARGET_2D)res.pop();
  return res;
}

function hitungKemunculan(daftar){
  const h={},nol=[],bawah10=[],atas10=[];
  daftar.forEach(n=>{h[n]=(h[n]||0)+1});
  for(let i=0;i<=99;i++){
    const n=String(i).padStart(2,'0');
    const j=h[n]||0;
    if(j===0)nol.push(n);
    else if(j>=1 && j<=9)bawah10.push(n);
    else if(j>=10)atas10.push(n);
  }
  return {nol, bawah10, atas10};
}

function susunWarnaBawah(arrNol, arrBawah10){
  const semua=[];
  if(arrNol.length)arrNol.forEach(n=>semua.push({teks:n,kelas:'belum-keluar-item'}));
  if(arrBawah10.length)arrBawah10.forEach(n=>semua.push({teks:n,kelas:'satu-keluar-item'}));
  if(!semua.length)return '<span class="kosong">✅ Semua angka muncul ≥10 kali</span>';
  return semua.map(x=>`<span class="baris-salin ${x.kelas}" onclick="salinTeks('${x.teks}',this)">${x.teks}</span>`).join('<span class="pemisah">*</span>');
}

function susunWarnaAtas(arrAtas10){
  if(!arrAtas10.length)return '<span class="kosong">Belum ada angka ≥10 kali</span>';
  return arrAtas10.map(n=>`<span class="baris-salin sering-keluar-item" onclick="salinTeks('${n}',this)">${n}</span>`).join('<span class="pemisah">*</span>');
}

function urutkan(a){return [...a].sort((x,y)=>x.localeCompare(y))}

function gabungJadi3D(listA, listB){
  const hasil=new Set();
  listA.forEach(a=>{
    const ekor=a[1];
    listB.forEach(b=>{
      const kepala=b[0];
      if(ekor===kepala) hasil.add(a+b[1]);
    });
  });
  return urutkan([...hasil]);
}

function setJml(id,val){document.getElementById(id).textContent=val}

function filter3Tahun(dataPasaran){
  if(!dataPasaran.length) return {data:[], terbaru:null, terlama:null};
  const terbaru = new Date(dataPasaran[0].tanggal+'T00:00:00');
  const batas = new Date(terbaru);
  batas.setFullYear(terbaru.getFullYear() - BATAS_TAHUN);
  const terfilter = dataPasaran.filter(r=>{
    const tgl = new Date(r.tanggal+'T00:00:00');
    return tgl >= batas;
  });
  const terlama = terfilter.length ? terfilter[terfilter.length-1].tanggal : null;
  return {data:terfilter, terbaru:dataPasaran[0].tanggal, terlama, batasTgl:batas.toISOString().slice(0,10)};
}

function buat3DDdariN(){
  if(!dataProses)return alert('⚠️ Data belum siap');
  const hasil=gabungJadi3D(dataProses.dd, dataProses.dt);
  document.getElementById('databet2').value=hasil.join('*');
  setJml('jmlLbl3DD',hasil.length);
  aturModeWarna('blok3DD', 'ungu');
}

function buat3DBdariN(){
  if(!dataProses)return alert('⚠️ Data belum siap');
  const hasil=gabungJadi3D(dataProses.dt, dataProses.db);
  document.getElementById('databet3').value=hasil.join('*');
  setJml('jmlLbl3DB',hasil.length);
  aturModeWarna('blok3DB', 'ungu');
}

function buat3DDdariBawah10(){
  if(!dataProses)return alert('⚠️ Data belum siap');
  const ddGabungan=[...dataProses.nolDD, ...dataProses.b10DD];
  const dtGabungan=[...dataProses.nolDT, ...dataProses.b10DT];
  const hasil=gabungJadi3D(ddGabungan, dtGabungan);
  document.getElementById('databet2').value=hasil.join('*');
  setJml('jmlLbl3DD',hasil.length);
  aturModeWarna('blok3DD', 'hijau');
}

function buat3DBdariBawah10(){
  if(!dataProses)return alert('⚠️ Data belum siap');
  const dtGabungan=[...dataProses.nolDT, ...dataProses.b10DT];
  const dbGabungan=[...dataProses.nolDB, ...dataProses.b10DB];
  const hasil=gabungJadi3D(dtGabungan, dbGabungan);
  document.getElementById('databet3').value=hasil.join('*');
  setJml('jmlLbl3DB',hasil.length);
  aturModeWarna('blok3DB', 'hijau');
}

function buat3DDdariAtas10(){
  if(!dataProses)return alert('⚠️ Data belum siap');
  const hasil=gabungJadi3D(dataProses.seringDD, dataProses.seringDT);
  document.getElementById('databet2').value=hasil.join('*');
  setJml('jmlLbl3DD',hasil.length);
  aturModeWarna('blok3DD', 'kuning');
}

function buat3DBdariAtas10(){
  if(!dataProses)return alert('⚠️ Data belum siap');
  const hasil=gabungJadi3D(dataProses.seringDT, dataProses.seringDB);
  document.getElementById('databet3').value=hasil.join('*');
  setJml('jmlLbl3DB',hasil.length);
  aturModeWarna('blok3DB', 'kuning');
}

function proses(data){
  if(data.length<3)return null;
  const d2=[],t2=[],b2=[];
  data.forEach(r=>{const u=urai4Digit(r.angka);d2.push(u.d2);t2.push(u.t2);b2.push(u.b2)});
  const ter=urai4Digit(data[0].angka),ked=data[1]?urai4Digit(data[1].angka):null,ket=data[2]?urai4Digit(data[2].angka):null;
  const hari=dapatkanHari(data[0].tanggal);
  const dd=ambilSesuai(d2,ter.d2);
  const dt=ambilSesuai(t2,ter.t2);
  const db=ambilSesuai(b2,ter.b2);
  const {nol:nolDD, bawah10:b10DD, atas10:seringDD}=hitungKemunculan(d2);
  const {nol:nolDT, bawah10:b10DT, atas10:seringDT}=hitungKemunculan(t2);
  const {nol:nolDB, bawah10:b10DB, atas10:seringDB}=hitungKemunculan(b2);
  return {
    terakhir:ter,data1:ked?ked.asli:'—',data2:ket?ket.asli:'—',hari,
    tanggal:data[0].tanggal,shio:dapatkanShio(ter.asli),jumlahBaris:data.length,
    dd,dt,db,nolDD,b10DD,nolDT,b10DT,nolDB,b10DB,seringDD,seringDT,seringDB
  };
}

function simpanKeLokal(teks){try{localStorage.setItem(KUNCI_SIMPANAN,teks);localStorage.setItem(KUNCI_WAKTU,new Date().toISOString())}catch(e){}}
function ambilDariLokal(){const t=localStorage.getItem(KUNCI_SIMPANAN),w=localStorage.getItem(KUNCI_WAKTU);return t?{teks:t,waktu:w}:null}

function parse(t){
  return t.trim().split('\n').filter(b=>b.trim()).map(b=>{
    const p=b.split('|');
    return {pasaran:p[0].trim(),tanggal:p[1].trim(),angka:String(p[2]).padStart(4,'0')};
  }).sort((a,b)=>a.tanggal.localeCompare(b.tanggal)).reverse();
}

function prosesDataTeks(teks,nm){
  if(!teks.trim())return alert('⚠️ Data kosong!');
  semuaData=parse(teks); simpanKeLokal(teks);
  document.getElementById('masukanData').value=teks;
  document.getElementById('sumberMuat').textContent=nm+' — '+new Date().toLocaleString('id-ID');
  document.getElementById('terakhirMuat').textContent='Terakhir: '+new Date().toLocaleString('id-ID');
  document.getElementById('status').style.display='none';
  document.getElementById('konten').style.display='block';
  tampilPasaran();
}

function prosesDataLokal(){prosesDataTeks(document.getElementById('masukanData').value,'Masukan Manual')}

function muatDariFolderSumber(){
  const i=document.getElementById('pilihBerkas');
  i.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=evt=>prosesDataTeks(evt.target.result,'File: '+f.name);
    r.readAsText(f)
  };
  i.click()
}

function muatSalinanLokal(){
  const i=document.getElementById('pilihSalinan');
  i.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=evt=>prosesDataTeks(evt.target.result,'Salinan: '+f.name);
    r.readAsText(f)
  };
  i.click()
}

async function mulai(paksa=false){
  if(!paksa){
    const l=ambilDariLokal();
    if(l){
      semuaData=parse(l.teks);
      document.getElementById('masukanData').value=l.teks;
      document.getElementById('sumberMuat').textContent='Tersimpan — '+l.waktu;
      document.getElementById('terakhirMuat').textContent='Terakhir: '+l.waktu;
      document.getElementById('status').style.display='none';
      document.getElementById('konten').style.display='block';
      tampilPasaran();
      return
    }
  } else {
    const t=document.getElementById('masukanData').value;
    if(t.trim())prosesDataTeks(t,'Diperbarui Manual')
  }
}

function tampilPasaran(){
  const sel = document.getElementById('pilihPasaran');
  const k = sel.value;
  const namaPanjang = sel.options[sel.selectedIndex].text;
  document.getElementById('namaPasaranTerpilih').textContent = '🎯 Pasaran: ' + namaPanjang;
  const dataPasaran = semuaData.filter(x=>x.pasaran===k);
  const {data:dataTerfilter, terbaru, terlama, batasTgl} = filter3Tahun(dataPasaran);
  dataProses=proses(dataTerfilter);
  setJml('jmlLbl3DD',0);setJml('jmlLbl3DB',0);
  document.getElementById('databet2').value='';document.getElementById('databet3').value='';
  aturModeWarna('blok3DD', 'ungu');
  aturModeWarna('blok3DB', 'ungu');
  hapus();
  if(!dataProses){
    document.getElementById('kotak2DD').innerHTML='⚠️ Data kurang — butuh ≥3 baris dalam 3 tahun terakhir';
    document.getElementById('infoBatas').textContent='';
    document.getElementById('rentangTgl').textContent='—';
    return;
  }
  document.getElementById('infoBatas').textContent=`(${dataTerfilter.length} baris · ${BATAS_TAHUN} tahun)`;
  document.getElementById('rentangTgl').textContent=`${terlama} s/d ${terbaru} (batas: ${batasTgl})`;
  tampilHasil(dataProses);
}

function perbaruiLabel(){
  setJml('jmlLblDD',TARGET_2D);setJml('jmlLblDT',TARGET_2D);setJml('jmlLblDB',TARGET_2D);
  document.getElementById('btnTxtDD').textContent=TARGET_2D;document.getElementById('btnTxtDB').textContent=TARGET_2D;
}

function tampilHasil(h){
  perbaruiLabel();
  document.getElementById('r-hari').textContent=h.hari;
  document.getElementById('r-tgl').textContent=h.tanggal;
  document.getElementById('r-shio').textContent=h.shio;
  document.getElementById('r-data1').textContent=h.data1;
  document.getElementById('r-data2').textContent=h.data2;
  document.getElementById('r-d2d').textContent=h.terakhir.d2;
  document.getElementById('r-d2t').textContent=h.terakhir.t2;
  document.getElementById('r-d2b').textContent=h.terakhir.b2;

  document.getElementById('kotak2DD').innerHTML=`<span class="baris-salin">${h.dd.join('*')}</span>`;
  document.getElementById('kotak2DT').innerHTML=`<span class="baris-salin">${h.dt.join('*')}</span>`;
  document.getElementById('kotak2DB').innerHTML=`<span class="baris-salin">${h.db.join('*')}</span>`;

  const jmlDDbawah=h.nolDD.length+h.b10DD.length;
  const jmlDTbawah=h.nolDT.length+h.b10DT.length;
  const jmlDBbawah=h.nolDB.length+h.b10DB.length;

  setJml('jmlLblDDbawah',jmlDDbawah);
  setJml('jmlLblDTbawah',jmlDTbawah);
  setJml('jmlLblDBbawah',jmlDBbawah);

  document.getElementById('kotakBawahDD').innerHTML = susunWarnaBawah(h.nolDD, h.b10DD);
  document.getElementById('kotakBawahDT').innerHTML = susunWarnaBawah(h.nolDT, h.b10DT);
  document.getElementById('kotakBawahDB').innerHTML = susunWarnaBawah(h.nolDB, h.b10DB);

  setJml('jmlLblDDatas', h.seringDD.length);
  setJml('jmlLblDTatas', h.seringDT.length);
  setJml('jmlLblDBatas', h.seringDB.length);

  document.getElementById('kotakAtasDD').innerHTML = susunWarnaAtas(h.seringDD);
  document.getElementById('kotakAtasDT').innerHTML = susunWarnaAtas(h.seringDT);
  document.getElementById('kotakAtasDB').innerHTML = susunWarnaAtas(h.seringDB);
}

function terapkanAngka(){
  const n = Math.max(1, Math.min(99, parseInt(document.getElementById('inputTarget').value) || 90));
  TARGET_2D = n;
  document.getElementById('inputTarget').value = n;
  document.getElementById('nilaiSaatIni').textContent = n;
  perbaruiLabel();
  tampilPasaran();
}

// ==== FUNGSI PENCARIAN ====
function buatKondisiPencarian(input) {
  const s = input.trim().replace(/\s+/g, '');
  if (!/^\d{1,4}$/.test(s)) return [];
  const len = s.length;
  const semuaSama = s.split('').every(c => c === s[0]);

  if (semuaSama && len === 2) {
    return [angka => angka.includes(s)];
  }
  if (semuaSama && len === 3) {
    return [angka => angka.includes(s)];
  }
  if (len === 1) {
    return [angka => angka.includes(s)];
  } else if (len === 2 || len === 3) {
    const digitWajib = [...new Set(s.split(''))];
    return [angka => digitWajib.every(d => angka.includes(d))];
  } else if (len === 4) {
    return [
      angka => angka === s,
      angka => angka.includes(s)
    ];
  }
  return [];
}

// === Gabung 3DD + 3DB → 4D LN ===
function prosesGenerate() {
  const a = document.getElementById('databet2').value.trim();
  const b = document.getElementById('databet3').value.trim();
  if (!a || !b) return alert('⚠️ Buat 3DD dan 3DB dulu sebelum Generate 4D!');

  const list3DD = a.split(/\*+/).filter(x => x.trim());
  const list3DB = b.split(/\*+/).filter(x => x.trim());
  const hasil4D = [];
  const sudahAda = new Set();

  list3DD.forEach(dd => {
    list3DB.forEach(db => {
      const ddBersih = dd.trim();
      const dbBersih = db.trim();
      if (ddBersih.length === 3 && dbBersih.length === 3) {
        const gabung = ddBersih + dbBersih[2];
        if (!sudahAda.has(gabung)) {
          sudahAda.add(gabung);
          hasil4D.push(gabung);
        }
      }
    });
  });

  hasil4D.sort((x, y) => x.localeCompare(y));
  daftar4DTerakhir = hasil4D;
  const teksHasil = hasil4D.join('*');
  document.getElementById('jumlahLN').textContent = `${hasil4D.length} LN`;
  document.getElementById('output').value = teksHasil;
  document.getElementById('inputCari').value = '';
  document.getElementById('kotakHasilCari').style.display = 'none';
}

function hapus() {
  document.getElementById('output').value = '';
  document.getElementById('jumlahLN').textContent = '0 LN';
  daftar4DTerakhir = [];
  document.getElementById('inputCari').value = '';
  document.getElementById('kotakHasilCari').style.display = 'none';
}

// === FITUR CARI ANGKA 4D ===
function cariAngka4D() {
  const kataKunci = document.getElementById('inputCari').value.trim();
  const kotakHasil = document.getElementById('kotakHasilCari');
  const labelHasil = document.getElementById('labelHasilCari');
  const daftarHasil = document.getElementById('daftarHasilCari');
  const kotakTeksHasil = document.getElementById('kotakTeksHasil');

  if (!kataKunci || daftar4DTerakhir.length === 0) {
    kotakHasil.style.display = 'none';
    return;
  }

  const kondisi = buatKondisiPencarian(kataKunci);
  if (!kondisi.length) {
    kotakHasil.style.display = 'none';
    return;
  }

  const cocok = daftar4DTerakhir.filter(angka =>
    kondisi.some(cek => cek(angka))
  );

  kotakHasil.style.display = 'block';
  if (cocok.length === 0) {
    labelHasil.innerHTML = `<span class="tidak-ditemukan">❌ Tidak ditemukan</span> untuk: <strong>${kataKunci}</strong>`;
    daftarHasil.innerHTML = '';
    kotakTeksHasil.value = '';
  } else {
    const len = kataKunci.length;
    const semuaSama = kataKunci.split('').every(c => c === kataKunci[0]);
    let tipe = '';
    if (semuaSama && len === 2) tipe = `pasangan kembar 2 digit "${kataKunci}"`;
    else if (semuaSama && len === 3) tipe = `pasangan kembar 3 digit "${kataKunci}"`;
    else if (len === 1) tipe = `digit tunggal "${kataKunci}"`;
    else if (len === 2) tipe = `2 digit (wajib ada keduanya)`;
    else if (len === 3) tipe = `3 digit (wajib ada ketiganya)`;
    else tipe = `4 digit (cocok/mengandung)`;

    labelHasil.innerHTML = `<span class="ditemukan">✅ Ditemukan ${cocok.length} angka</span> untuk <strong>${tipe}:</strong> ${kataKunci}`;
    kotakTeksHasil.value = cocok.join(' * ');
    daftarHasil.innerHTML = cocok.map(angka =>
      `<span class="angka-cocok baris-salin" onclick="salinTeks('${angka}',this)">${angka}</span>`
    ).join('');
  }
}

function salinBlokHasil() {
  const teks = document.getElementById('kotakTeksHasil').value;
  salinTeks(teks, null);
}

// === Inisialisasi saat halaman dimuat ===
document.addEventListener('DOMContentLoaded', () => {
  mulai();
});
