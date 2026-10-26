const REV="puzopad-v80-20261026a";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
 if(request.mode==="navigate"||/\.(?:js|webmanifest|json|html)(?:\?|$)/i.test(new URL(request.url).pathname)){
  event.respondWith(fetch(new Request(request,{cache:"no-store"})).catch(()=>fetch(request)));
 }
});