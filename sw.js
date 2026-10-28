importScripts('db.js');
const V='catatuang-v5';
const CORE=['./','index.html','privacy.html','style.css','app.js','db.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png',
'screenshots/narrow.png','screenshots/wide.png','screenshots/widget.png','widgets/today-template.json','widgets/today-data.json'];
const LIB=['lib/tesseract.min.js','lib/worker.min.js','lib/tesseract-core-simd-lstm.wasm.js','lib/tesseract-core-lstm.wasm.js','lib/lang/ind.traineddata.gz','lib/lang/eng.traineddata.gz'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
 const c=await caches.open(V);
 try{await c.addAll(CORE)}catch(x){await Promise.all(CORE.map(f=>c.add(f).catch(()=>{})))}
 await Promise.all(LIB.map(f=>c.add(f).catch(()=>{})));
 await self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
 for(const k of await caches.keys())if(k!==V&&k!=='share')await caches.delete(k);
 await self.clients.claim()})())});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
 if(e.request.method==='POST'&&u.pathname.endsWith('/share-receipt')){
  e.respondWith((async()=>{try{const f=(await e.request.formData()).get('receipt');if(f)await (await caches.open('share')).put('shared-receipt',new Response(f))}catch(x){}
   return Response.redirect(new URL('./?tab=add&shared=1',self.registration.scope).href,303)})());return}
 if(e.request.method!=='GET')return;
 e.respondWith((async()=>{
  const c=await caches.open(V),hit=await c.match(e.request,{ignoreSearch:true});
  if(hit)return hit;
  try{const res=await fetch(e.request);if(res.status===200&&u.origin===location.origin)c.put(e.request,res.clone());return res}
  catch(x){if(e.request.mode==='navigate'){const f=(await c.match('index.html'))||(await c.match('./'));if(f)return f}
   return new Response('Offline',{status:503})}
 })())});
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
self.addEventListener('periodicsync',e=>{if(e.tag==='daily-summary')e.waitUntil(Promise.all([daily(),updateWidgets()]))});
self.addEventListener('sync',e=>{if(e.tag==='daily-summary')e.waitUntil(daily())});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){}
 e.waitUntil(self.registration.showNotification(d.title||'CatatUang',{body:d.body||'Jangan lupa catat pengeluaranmu hari ini.',icon:'icons/icon-192.png'}))});
async function updateWidgets(){
 if(!self.widgets)return;
 const S=(await DB.get('state'))||{tx:[]},t=ymd(),l=(S.tx||[]).filter(x=>x.d===t),by={};
 l.forEach(x=>by[x.cat]=(by[x.cat]||0)+x.amt);
 const data={total:rp(l.reduce((a,x)=>a+x.amt,0)),detail:l.length?Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c,v])=>c+' '+rp(v)).join(' · '):'Belum ada pengeluaran'};
 const tpl=await (await fetch('widgets/today-template.json')).text();
 await self.widgets.updateByTag('today',{template:tpl,data:JSON.stringify(data)});
}
self.addEventListener('widgetinstall',e=>e.waitUntil(updateWidgets()));
self.addEventListener('widgetresume',e=>e.waitUntil(updateWidgets()));
self.addEventListener('widgetclick',e=>e.waitUntil(clients.openWindow('./?tab=add')));
self.addEventListener('message',e=>{if(e.data==='widgets')e.waitUntil(updateWidgets())});
self.addEventListener('notificationclick',e=>{e.notification.close();
 e.waitUntil(clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():clients.openWindow('./')))});
