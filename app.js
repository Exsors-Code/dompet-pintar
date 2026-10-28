const CATS={Makan:/makan|resto|cafe|kopi|warung|bakso|nasi|ayam|mie|bakery|coffee|food|minum|geprek|pizza|burger/i,
Transport:/bensin|pertamina|shell|parkir|tol|grab|gojek|ojek|kereta|transport/i,
Belanja:/indomaret|alfamart|supermarket|mart|toko|market|shop|hypermart|carrefour/i,
Tagihan:/listrik|pln|pulsa|internet|wifi|pdam|telkom|token|tagihan/i,
Kesehatan:/apotek|klinik|dokter|rumah sakit|obat|kimia farma/i,
Hiburan:/bioskop|cinema|xxi|game|netflix|spotify|wisata/i,Lainnya:/$^/};
const rp=n=>'Rp'+Math.round(n).toLocaleString('id-ID');
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S={tx:[],inc:[],set:{time:'21:00'}},NOTIF='';
const save=()=>DB.put('state',S).then(()=>{try{navigator.serviceWorker.controller.postMessage('widgets')}catch(e){}}).catch(()=>alert('Gagal menyimpan ke database. Ekspor cadangan dan coba lagi.'));
let tab='home',draft={img:null,amt:'',note:'',cat:'Makan'},ocrMsg='',viewMonth=today().slice(0,7);

function sumDay(d){const l=S.tx.filter(t=>t.d===d),by={};l.forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amt);
return{total:l.reduce((a,t)=>a+t.amt,0),by,n:l.length}}
function summaryText(){const s=sumDay(today());if(!s.n)return'Hari ini belum ada pengeluaran tercatat.';
return'Hari ini kamu keluar '+rp(s.total)+' ('+s.n+' transaksi): '+Object.entries(s.by).sort((a,b)=>b[1]-a[1]).map(([c,v])=>c+' '+rp(v)).join(', ')+'.'}

function render(){
 const nav=[['home','Hari ini'],['add','Tambah'],['month','Bulanan'],['set','Atur']];
 document.getElementById('nav').innerHTML=nav.map(([k,l])=>`<button class="${tab===k?'on':''}" onclick="go('${k}')">${l}</button>`).join('');
 document.getElementById('app').innerHTML={home,add,month,set}[tab]();
}
function go(t){tab=t;render();window.scrollTo(0,0)}

function txRow(t){return`<div class="row">${t.img?`<img src="${t.img}" alt="Struk">`:''}<div class="grow" onclick="edit(${t.id})" style="cursor:pointer"><b>${esc(t.note||t.cat)}</b><span class="mute">${t.cat}${t.d!==today()?' · '+t.d:''}</span></div><b class="out">${rp(t.amt)}</b><button class="x" onclick="del(${t.id})" aria-label="Hapus">×</button></div>`}
function del(id){if(!confirm('Hapus transaksi ini?'))return;S.tx=S.tx.filter(t=>t.id!==id);save();render()}

function home(){
 const s=sumDay(today()),l=S.tx.filter(t=>t.d===today()).sort((a,b)=>b.id-a.id);
 const late=new Date().toTimeString().slice(0,5)>=S.set.time;
 return`<h1>Hari ini</h1><p class="mute">${new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})}</p>
 ${late?`<div class="banner">${summaryText()}</div>`:''}
 <div class="card"><span class="mute">Pengeluaran hari ini</span><div class="big out">${rp(s.total)}</div></div>
 ${budgetCard()}${weekChart()}<div class="card">${l.length?l.map(txRow).join(''):'<span class="mute">Belum ada transaksi. Tap Tambah, lalu foto struk atau ketik jumlahnya.</span>'}</div>`}

function add(){
 return`<h1>${draft.editId?'Ubah':'Tambah'} pengeluaran</h1>
 <label class="scan" for="f">📷 Foto struk (kamera atau galeri)</label>
 <input id="f" type="file" accept="image/*" capture="environment" class="hide" onchange="scan(this.files[0])">
 ${draft.img?`<img id="prev" src="${draft.img}" alt="Struk">`:''}
 <p class="mute" id="ocr">${ocrMsg}</p>
 <label>Jumlah (Rp)</label><input id="a" type="number" inputmode="numeric" value="${draft.amt}" oninput="draft.amt=this.value;document.getElementById('pv').textContent=this.value?rp(this.value):''"><div class="mute" id="pv" style="margin:-6px 0 8px">${draft.amt?rp(draft.amt):''}</div>
 <label>Kategori</label><select id="c" onchange="draft.cat=this.value">${Object.keys(CATS).map(c=>`<option ${c===draft.cat?'selected':''}>${c}</option>`).join('')}</select>
 <label>Catatan</label><input id="n" value="${esc(draft.note)}" oninput="draft.note=this.value" placeholder="mis. makan siang">
 <label>Tanggal</label><input id="d" type="date" value="${draft.d||today()}" onchange="draft.d=this.value">
 <button class="b" onclick="addTx()">${draft.editId?'Simpan perubahan':'Simpan pengeluaran'}</button>${draft.editId?'<button class="b alt" onclick="cancelEdit()">Batal</button>':''}`}

function addTx(){
 const amt=+draft.amt;if(!amt||amt<=0)return alert('Isi jumlah pengeluaran.');
 const row={id:draft.editId||Date.now(),d:draft.d||today(),amt,cat:draft.cat,note:draft.note.trim(),img:draft.img};
 if(draft.editId)S.tx=S.tx.map(t=>t.id===draft.editId?row:t);else S.tx.push(row);
 save();draft={img:null,amt:'',note:'',cat:'Makan'};ocrMsg='';go('home')}

function shrink(file){return new Promise(res=>{const im=new Image(),u=URL.createObjectURL(file);
 im.onload=()=>{const k=Math.min(1,1400/Math.max(im.width,im.height)),c=document.createElement('canvas');
 c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c)};im.src=u})}

async function scan(file){
 if(!file)return;const c=await shrink(file);
 const t=document.createElement('canvas');const k=800/Math.max(c.width,c.height);t.width=c.width*k;t.height=c.height*k;t.getContext('2d').drawImage(c,0,0,t.width,t.height);
 draft.img=t.toDataURL('image/jpeg',.7);
 ocrMsg='Foto tersimpan. Membaca struk...';render();
 if(typeof Tesseract==='undefined'){ocrMsg='Pembaca struk belum termuat Isi jumlah manual, foto tetap tersimpan.';return render()}
 try{
  const r=await Tesseract.recognize(c,'ind+eng',TESS);
  const p=parseReceipt(r.data.text);
  if(p.amt)draft.amt=p.amt;draft.cat=p.cat;if(p.note&&!draft.note)draft.note=p.note;
  ocrMsg=p.amt?'Terbaca: total '+rp(p.amt)+'. Cek dulu sebelum simpan.':'Total tidak terbaca. Isi manual.';
 }catch(e){ocrMsg='Gagal membaca struk (offline atau foto buram). Isi manual, foto tetap tersimpan.'}
 render()}

function nums(line){return(line.match(/\d[\d.,]*\d|\d/g)||[]).map(x=>{
 if(/^\d{1,3}([.,]\d{3})+$/.test(x))return+x.replace(/[.,]/g,'');
 return+x.replace(/[.,]\d{1,2}$/,'').replace(/[.,]/g,'')}).filter(n=>n>=500&&n<1e8)}
function parseReceipt(text){
 const L=text.split('\n').map(s=>s.trim()).filter(Boolean);
 const mx=re=>{let b=0;L.forEach(l=>{if(re(l))nums(l).forEach(n=>{if(n>b)b=n})});return b};
 let amt=mx(l=>/total|jumlah|tagihan|grand|netto/i.test(l)&&!/item|qty|diskon|hemat|ppn|pajak|kembali|change|barang/i.test(l));
 if(!amt){const pay=mx(l=>/bayar|tunai|cash|debit|kartu|qris/i.test(l)&&!/kembali|change/i.test(l)),ch=mx(l=>/kembali|change/i.test(l));
  amt=pay&&ch&&pay>ch?pay-ch:pay}
 if(!amt)amt=mx(()=>true);
 let cat='Lainnya';for(const[k,re]of Object.entries(CATS))if(re.test(text)){cat=k;break}
 const note=(L.find(l=>/[a-z]{3}/i.test(l))||'').slice(0,40);
 return{amt,cat,note}}
function edit(id){const t=S.tx.find(x=>x.id===id);if(!t)return;draft={...t,amt:String(t.amt),editId:id};ocrMsg='';go('add')}
function cancelEdit(){draft={img:null,amt:'',note:'',cat:'Makan'};go('home')}
function monthOut(m){return S.tx.filter(t=>t.d.startsWith(m)).reduce((a,t)=>a+t.amt,0)}
function budgetCard(){const b=+S.set.budget;if(!b)return'';const o=monthOut(today().slice(0,7)),p=Math.min(100,o/b*100);
 return`<div class="card"><div class="row" style="border:0;padding:0"><span class="mute">Anggaran bulan ini</span><b>${rp(o)} / ${rp(b)}</b></div><div class="bar"><i style="width:${p}%;background:${o>b?'var(--out)':p>80?'#c98a1b':'var(--acc)'}"></i></div><span class="mute">${o>b?'Lewat '+rp(o-b):'Sisa '+rp(b-o)}</span></div>`}
function weekChart(){const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);
 const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');days.push([d.toLocaleDateString('id-ID',{weekday:'short'}),sumDay(k).total])}
 const m=Math.max(...days.map(x=>x[1]),1);
 return`<div class="card"><span class="mute">7 hari terakhir</span><div style="display:flex;gap:6px;align-items:flex-end;height:90px;margin-top:8px">${days.map(([l,v])=>`<div style="flex:1;text-align:center"><div style="height:${v/m*64}px;min-height:2px;background:var(--out);border-radius:4px"></div><div class="mute" style="font-size:11px">${l}</div></div>`).join('')}</div></div>`}
let deferred=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(tab==='set')render()});
async function installApp(){if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;render()}

function month(){
 const m=viewMonth,tx=S.tx.filter(t=>t.d.startsWith(m)),out=tx.reduce((a,t)=>a+t.amt,0),
 incs=S.inc.filter(i=>i.m===m),inn=incs.reduce((a,i)=>a+i.amt,0),by={};
 tx.forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amt);
 return`<h1>Bulanan</h1><input type="month" value="${m}" onchange="viewMonth=this.value||viewMonth;render()">
 <div class="card"><span class="mute">Pemasukan</span><div class="big inn">${rp(inn)}</div>
 <span class="mute">Pengeluaran</span><div class="big out">${rp(out)}</div>
 <span class="mute">Sisa</span><div class="big" style="font-size:28px">${rp(inn-out)}</div></div>
 <h2>Per kategori</h2><div class="card">${Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<div style="margin:8px 0"><div class="row" style="border:0;padding:0"><span>${c}</span><b>${rp(v)}</b></div><div class="bar"><i style="width:${v/out*100}%"></i></div></div>`).join('')||'<span class="mute">Belum ada data.</span>'}</div>
 <h2>Pemasukan bulan ini</h2><div class="card">${incs.map(i=>`<div class="row"><div class="grow"><b>${esc(i.note||'Pemasukan')}</b></div><b class="inn">${rp(i.amt)}</b><button class="x" onclick="delInc(${i.id})">×</button></div>`).join('')}
 <label>Jumlah pemasukan</label><input id="ia" type="number" inputmode="numeric">
 <label>Sumber</label><input id="in" placeholder="mis. gaji">
 <button class="b" onclick="addInc()">Tambah pemasukan</button></div>
 <h2>Transaksi</h2><div class="card">${tx.sort((a,b)=>b.d.localeCompare(a.d)||b.id-a.id).map(txRow).join('')||'<span class="mute">Kosong.</span>'}</div>`}
function addInc(){const a=+document.getElementById('ia').value;if(!a)return alert('Isi jumlah.');
 S.inc.push({id:Date.now(),m:viewMonth,amt:a,note:document.getElementById('in').value});save();render()}
function delInc(id){S.inc=S.inc.filter(i=>i.id!==id);save();render()}

function set(){
 const p='Notification' in window?Notification.permission:'tidak didukung';
 return`<h1>Pengaturan</h1>${deferred?'<button class="b" onclick="installApp()">Instal aplikasi</button>':''}
 <h2>Anggaran</h2><div class="card"><label>Anggaran pengeluaran per bulan (Rp)</label><input type="number" inputmode="numeric" value="${S.set.budget||''}" onchange="S.set.budget=+this.value||0;save()"></div>
 <h2>Notifikasi malam</h2><div class="card">
 <label>Jam notifikasi</label><input type="time" value="${S.set.time}" onchange="S.set.time=this.value;save()">
 <p class="mute">Izin notifikasi: <b>${p}</b></p>
 <button class="b" onclick="askNotif()">Aktifkan notifikasi</button>
 <button class="b alt" onclick="notify(true)">Tes notifikasi sekarang</button>
 <p class="mute">Pasang aplikasi (Instal / Tambahkan ke layar utama) agar Chrome Android bisa mengirim notifikasi walau aplikasi tertutup. Chrome yang menentukan waktu pengecekan, jadi notifikasi bisa telat beberapa jam. Di PC, notifikasi muncul selama browser berjalan.</p></div>
 <h2>Data</h2><div class="card">
 <button class="b alt" onclick="exportJson()">Ekspor cadangan (JSON)</button>
 <button class="b alt" onclick="exportCsv()">Ekspor CSV untuk Excel</button>
 <label>Impor cadangan</label><input type="file" accept=".json" onchange="importJson(this.files[0])"></div>
 <p class="mute" style="text-align:center"><a href="privacy.html" style="color:var(--acc)">Kebijakan privasi</a></p>`}
async function askNotif(){if(!('Notification' in window))return alert('Browser ini tidak mendukung notifikasi.');await Notification.requestPermission();bgSync();render()}
function notify(force){
 const msg=summaryText();
 if('Notification' in window&&Notification.permission==='granted'){
  try{new Notification('CatatUang: ringkasan hari ini',{body:msg})}catch(e){}
 }else if(force)alert(msg);
 if(!force){NOTIF=today();DB.put('notified',NOTIF)}}
setInterval(()=>{const n=new Date().toTimeString().slice(0,5);if(n>=S.set.time&&NOTIF!==today())notify(false)},30000);

function dl(name,txt,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click()}
function exportJson(){dl('catatuang-cadangan.json',JSON.stringify(S),'application/json')}
function exportCsv(){dl('catatuang.csv','Tanggal,Jenis,Kategori,Catatan,Jumlah\n'+S.tx.map(t=>[t.d,'Keluar',t.cat,'"'+t.note.replace(/"/g,'""')+'"',t.amt].join(',')).concat(S.inc.map(i=>[i.m,'Masuk','','"'+(i.note||'').replace(/"/g,'""')+'"',i.amt].join(','))).join('\n'),'text/csv')}
function importJson(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.tx)throw 0;S=d;if(!S.set)S.set={time:'21:00'};save();render();alert('Cadangan dipulihkan.')}catch(e){alert('File tidak valid.')}};r.readAsText(f)}

const U=p=>new URL(p,location.href).href;
const TESS={workerPath:U('lib/worker.min.js'),corePath:U('lib/'),langPath:U('lib/lang'),gzip:true};
async function bgSync(){try{const r=await navigator.serviceWorker.ready;if('periodicSync' in r)await r.periodicSync.register('daily-summary',{minInterval:6*3600*1000})}catch(e){}}
async function init(){
 try{S=await DB.get('state')||S;NOTIF=await DB.get('notified')||'';
  if(!S.tx.length&&!S.inc.length){try{const old=JSON.parse(localStorage.getItem('catatuang'));if(old&&old.tx){S=old;await save()}}catch(e){}}
 }catch(e){alert('Database tidak bisa dibuka. Data tidak akan tersimpan (mode privat?).')}
 const q=new URLSearchParams(location.search),t=q.get('tab');
 if(['home','add','month','set'].includes(t))tab=t;
 const pq=q.get('q');if(pq){try{const p=new URLSearchParams((pq.split('?')[1]||''));if(p.get('amt'))draft.amt=p.get('amt');if(p.get('note'))draft.note=p.get('note');if(CATS[p.get('cat')])draft.cat=p.get('cat');tab='add'}catch(e){}}
 render();
 if(q.get('scan')==='1')setTimeout(()=>{const f=document.getElementById('f');if(f)f.click()},300);
 if(q.get('shared')==='1'&&window.caches){try{const c=await caches.open('share'),r=await c.match('shared-receipt');if(r){await c.delete('shared-receipt');scan(await r.blob())}}catch(e){}}
 if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
 if('serviceWorker' in navigator&&window.Notification&&Notification.permission==='granted')bgSync();
 if(window.launchQueue)launchQueue.setConsumer(async p=>{for(const h of p.files||[]){if(confirm('Pulihkan cadangan dari file ini? Data saat ini akan diganti.'))importJson(await h.getFile())}});
}
init();
