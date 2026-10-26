const REV="puzopad-v851-20261027";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
 const pathname=new URL(request.url).pathname;
 if(/\/assets\/(?:exercises-v81\/.+\.jpg|art-v83\/.+\.webp|scenes-v84\/.+\.webp)$/i.test(pathname)){
  event.respondWith(
   caches.open(REV+"-gym").then(async cache=>{
    const offline=await cache.match(request);if(offline)return offline;
    const online=await fetch(request);
    if(online.ok)cache.put(request,online.clone()).catch(()=>{});
    return online;
   }).catch(()=>fetch(request))
  );return;
 }
 if(request.mode==="navigate"||/\.(?:js|webmanifest|json|html)(?:\?|$)/i.test(new URL(request.url).pathname)){
  event.respondWith(fetch(new Request(request,{cache:"no-store"})).catch(()=>fetch(request)));
 }
});