importScripts('db.js');
const V='catatuang-v1';
const FILES=['./','index.html','style.css','app.js','db.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png',
'lib/tesseract.min.js','lib/worker.min.js','lib/tesseract-core-simd-lstm.wasm.js','lib/tesseract-core-lstm.wasm.js',
'lib/lang/ind.traineddata.gz','lib/lang/eng.traineddata.gz'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});
const rp=n=>'Rp'+Math.round(n).toLocaleString('id-ID');
const ymd=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
async function daily(){
 const S=await DB.get('state');if(!S)return;const t=ymd();
 if((await DB.get('notified'))===t)return;
 if(new Date().toTimeString().slice(0,5)<(S.set&&S.set.time||'21:00'))return;
 const l=S.tx.filter(x=>x.d===t),by={};l.forEach(x=>by[x.cat]=(by[x.cat]||0)+x.amt);
 const body=l.length?'Hari ini kamu keluar '+rp(l.reduce((a,x)=>a+x.amt,0))+' ('+l.length+' transaksi): '+Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([c,v])=>c+' '+rp(v)).join(', ')+'.':'Hari ini belum ada pengeluaran tercatat.';
 await self.registration.showNotification('CatatUang: ringkasan hari ini',{body,icon:'icons/icon-192.png',tag:'daily'});
 await DB.put('notified',t);
}
self.addEventListener('periodicsync',e=>{if(e.tag==='daily-summary')e.waitUntil(daily())});
self.addEventListener('notificationclick',e=>{e.notification.close();
 e.waitUntil(clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():clients.openWindow('./')))});
