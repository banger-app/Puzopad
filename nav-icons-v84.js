/* BANGERVERSE v84 — monochrome, unified custom neon SVG icon set. */
(function(){
"use strict";
const paths={
home:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
city:'<path d="M3 21V9l6-3v15M9 21V3l6 3v15M15 21v-9l6-3v12"/><path d="M5 12h1M11 9h1M11 13h1M17 15h1"/>',
diary:'<path d="M7 3v8M11 3v8M7 7h4M9 11v10M17 3v18M17 3c3 2 4 6 0 10"/>',
fridge:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M6 12h12M10 7v3M10 15v3"/>',
store:'<path d="M3 6h18l-2 6H5Z"/><path d="M7 12v9h10v-9M9 6V3h6v3M8 16h8"/>',
sleep:'<path d="M20 15.5A8 8 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z"/><path d="m18 3 .4 1.6L20 5l-1.6.4L18 7l-.4-1.6L16 5l1.6-.4Z"/>',
loot:'<path d="M4 8h16v13H4Z M4 8l3-5h10l3 5M4 13h16 M10 8v9h4V8"/>',
drinks:'<path d="M6 3h12l-1 18H7Z M6 9h12M12 3l3-2"/><path d="M10 14h4"/>',
quests:'<path d="m4 4 16 16M20 4 4 20"/><path d="m3 7 4-4M17 3l4 4M3 17l4 4M17 21l4-4"/>',
gym:'<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/><path d="M10 4h4"/>',
weight:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 9a4 4 0 0 1 8 0l-4 3Z M7 17h10"/>',
charts:'<path d="M3 3v18h18"/><path d="m6 16 4-5 4 2 5-7"/><path d="M16 6h3v3"/>',
save:'<path d="M4 3h14l3 3v15H3V3Z"/><path d="M7 3v6h10V3 M7 21v-8h10v8 M10 5h4"/>',
fuel:'<path d="M4 21V6l2-3h10l2 3v15M4 12h14"/><path d="M7 6h8v4H7Z M18 9l3 3v6h-3"/>',
wardrobe:'<path d="M8 6c0-2 1-3 4-3s4 1 4 3l5 4-3 4-3-2v9H9v-9l-3 2-3-4Z"/><path d="M10 7h4"/>',
companion:'<circle cx="8" cy="6" r="1.5"/><circle cx="15.5" cy="6" r="1.5"/><circle cx="5" cy="11" r="1.5"/><circle cx="19" cy="11" r="1.5"/><path d="M12 11c-3-1-7 3-7 6 0 4 3 5 7 3 4 2 7 1 7-3 0-3-4-7-7-6Z"/>',
arcades:'<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M7 11v6M4 14h6M16 12h.1M19 15h.1"/>'
};
const ico=p=>'<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const rebuild=()=>{
 for(const b of document.querySelectorAll("#nav button[data-tab]")){
  const key=b.dataset.tab,art=paths[key];
  if(!art||b.querySelector(".pz84-nav-ico"))continue;
  const label=b.textContent.trim().replace(/^\S+\s+/u,"").trim()||b.textContent.trim();
  b.replaceChildren();
  const figure=document.createElement("span");figure.className="pz84-nav-ico";figure.innerHTML=ico(art);
  const text=document.createElement("span");text.className="pz84-nav-label";text.textContent=label;
  b.append(figure,text);
 }
};
let scheduled=false;
const observer=new MutationObserver(()=>{
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;rebuild()});
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{
 rebuild();const n=document.getElementById("nav");if(n)observer.observe(n,{childList:true,subtree:true,characterData:true});
});
else{rebuild();const n=document.getElementById("nav");if(n)observer.observe(n,{childList:true,subtree:true,characterData:true})}
window.pzNavIconsV84={rebuild};
})();