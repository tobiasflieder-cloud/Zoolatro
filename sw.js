// Zoolatro Service Worker: macht das Spiel offline spielbar.
// Beim Neu-Hochladen holt sich die App die neue Version automatisch beim nächsten Start.
const CACHE='zoolatro-v7';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
  // Schriften: einmal laden, dann aus dem Speicher
  if(url.hostname.includes('fonts.googleapis.com')||url.hostname.includes('fonts.gstatic.com')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(res=>{c.put(req,res.clone());return res}).catch(()=>hit))));return}
  if(url.origin!==location.origin)return;
  // Spiel-Dateien: sofort aus dem Speicher, im Hintergrund aktualisieren
  e.respondWith(caches.open(CACHE).then(c=>c.match(req,{ignoreSearch:true}).then(hit=>{
    const net=fetch(req).then(res=>{if(res.ok)c.put(req,res.clone());return res}).catch(()=>hit||c.match('index.html'));
    return hit||net})))});
