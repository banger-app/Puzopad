/* BANGERVERSE v85 · UI-only world shell. Saves untouched. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const text=(n,t)=>{if(n)n.textContent=t};
const lang=()=>{const s=localStorage.getItem("banger_language")||"uk";return ["uk","en","ru"].includes(s)?s:"ru"};
const t={
 ru:{world:"NEONHAVEN · Карта приключений",guide:"Выбирай локацию прямо на карте",arcs:"Монеты за мини-игры · открыть аркады",store:"Коллекции и редкие образы",more:"В гардероб",halloween:"СЕЗОН · НОЧНОЙ ГОРОД",event:"Открывай события, собирай коллекционные образы"},
 uk:{world:"NEONHAVEN · Мапа пригод",guide:"Обирай локацію просто на мапі",arcs:"Монети за мініігри · відкрити аркади",store:"Колекції та рідкісні образи",more:"До гардероба",halloween:"СЕЗОН · НІЧНЕ МІСТО",event:"Відкривай події, збирай колекційні образи"},
 en:{world:"NEONHAVEN · Adventure map",guide:"Choose a location right on the map",arcs:"Coins from mini games · open arcades",store:"Collections and rare outfits",more:"Wardrobe",halloween:"SEASON · NEON NIGHTS",event:"Discover events and collect unique outfits"}
};
const T=k=>t[lang()][k];
function goTo(section){
 const nav=document.querySelector('#nav button[data-tab="'+section+'"]');
 if(nav){nav.click();return}
 if(typeof window.go==="function")window.go(section);
}
function decorate(){
 const city=$("city"),home=$("home");
 if(!city||!home)return;
 text(city.querySelector(".panel>h2"),"🗺️ "+T("world"));
 const status=$("travelStatus");
 if(status&&!status.dataset.pz85Clicked){
  status.dataset.pz85Clicked="1";
  if(/выбери|обери|choose/i.test(status.textContent||""))text(status,"✦ "+T("guide"));
 }
 const map=city.querySelector(".bang-map");
 if(map&&!map.querySelector(".pz85-map-heading")){
  const cap=document.createElement("div");cap.className="pz85-map-heading";
  const em=document.createElement("strong");em.textContent="NEONHAVEN";
  const sub=document.createElement("small");sub.textContent="BANGERVERSE · WORLD";
  cap.append(em,sub);map.prepend(cap);
 }
 for(const pin of city.querySelectorAll("button.bang-pin")){
  if(pin.dataset.pz85Ready)continue;
  pin.dataset.pz85Ready="1";
  pin.setAttribute("aria-label",(pin.querySelector("small")?.textContent||pin.dataset.destination)+" — перейти");
 }
 const card=home.querySelector(".v16-resource:has(#v16Coins)");
 if(card&&!card.dataset.pz85Ready){
  card.dataset.pz85Ready="1";card.setAttribute("role","button");card.setAttribute("tabindex","0");
  card.setAttribute("aria-label",T("arcs"));card.title=T("arcs");
  text(card.querySelector("small"),T("arcs"));
  const action=()=>goTo("arcade");
  card.addEventListener("click",action);
  card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();action()}});
  card.classList.add("pz85-coin-button");
 }
 const dest=$("store");
 if(dest&&!dest.querySelector(".pz85-season-card")){
  const panel=dest.querySelector(".panel");
  if(panel){
   const banner=document.createElement("div");banner.className="pz85-season-card";
   const inner=document.createElement("div");inner.className="pz85-season-copy";
   const kicker=document.createElement("small");kicker.textContent=T("halloween");
   const title=document.createElement("strong");title.textContent=T("store");
   const sub=document.createElement("span");sub.textContent=T("event");
   const btn=document.createElement("button");btn.type="button";btn.textContent=T("more");
   btn.addEventListener("click",()=>goTo("wardrobe"));
   inner.append(kicker,title,sub,btn);banner.append(inner);panel.prepend(banner);
  }
 }
}
window.addEventListener("pz:unlocked",()=>setTimeout(decorate,60));
window.addEventListener("pz:style-change",()=>setTimeout(decorate,100));
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",decorate,{once:true});else decorate();
window.pzUiV85={decorate};
})();