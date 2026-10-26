(function(){
"use strict";
const Q=id=>document.getElementById(id);
const PALETTES=[["Лісовий",0],["Неоновий",20],["Океан",20],["Золотий",40]];
const OUTFITS=[["casual","Повсякденний",0],["work","Робочий",25],["gym","Спортивний",20],["hero","Легендарний",60]];
const PET_STYLES=[["plain","Без аксесуара",0],["bow","Бант",10],["cap","Кепка",15],["scarf","Шарф",20],["crown","Корона",50],["glasses","Окуляри",25],["backpack","Рюкзачок",35]];
const PETS=["dog","cat","turtle","hamster","rabbit","parrot","fox","panda","crocodile","hedgehog","otter","fish","penguin","owl","dragon","none"];
const t=(uk,ru,en)=>{const lang=Q("pz-language")?.value||localStorage.getItem("banger_language")||"uk";return lang==="uk"?uk:lang==="ru"?ru:en};
function data(){return typeof db==="undefined"?null:db}
function profile(){return data()?.profile||null}
function allowed(){const d=data();return !!(window.pzActiveUserId&&d?.profile?.created&&typeof testMode!=="undefined"&&!testMode)}
function ensure(){
 const d=data(),p=d?.profile;if(!p)return null;
 d.heroStyle||={palette:0,outfit:"casual",owned:["casual"],ownedPalettes:[0]};
 d.heroStyle.owned ||= ["casual"];d.heroStyle.ownedPalettes ||= [0];
 if(!d.heroStyle.owned.includes("casual"))d.heroStyle.owned.push("casual");
 if(!d.heroStyle.ownedPalettes.includes(0))d.heroStyle.ownedPalettes.push(0);
 p.petOwned ||= ["plain"];p.petStyle||="plain";
 if(!p.petOwned.includes("plain"))p.petOwned.push("plain");
 return d;
}
function notify(msg){let e=Q("pz-shop-message");if(e)e.textContent=msg}
function saved(){
 if(!allowed())return;
 const d=ensure();if(!d)return;
 if(typeof persist==="function")persist();
 if(typeof updateDashboardV16==="function")updateDashboardV16();
 refresh();
 window.dispatchEvent(new CustomEvent("pz:style-change",{detail:{account:window.pzActiveUserId}}));
}
function buy(kind,key,cost,owned,choose){
 const d=ensure();if(!d||!allowed())return notify("Спочатку увійди у свій акаунт.");
 if(!owned.includes(key)){
  if((Number(d.coins)||0)<cost)return notify("Потрібно "+cost+" 🪙. Зіграйте в Аркаді, щоб заробити монети.");
  d.coins=Math.max(0,Number(d.coins)||0)-cost;owned.push(key);
  notify("✅ Куплено за "+cost+" 🪙. Предмет одягнено.");
 }else notify("✅ Одягнено. Вже придбані речі безкоштовні.");
 choose();saved();
}
function makeItems(root,items,kind){
 if(!root)return;
 root.replaceChildren();
 items.forEach(({key,label,cost,owned,active,icon,action})=>{
  const row=document.createElement("button");row.type="button";row.className="pz-shop-item"+(active?" active":"");
  const sample=document.createElement("span");sample.className="pz-shop-swatch";
  if(kind==="palette")sample.style.background=["#56d97b","#ff349a","#55c5f8","#f7c45d"][Number(key)]||"#eee";
  else sample.textContent=icon||"✦";
  const name=document.createElement("span");name.className="pz-shop-item-name";name.textContent=label;
  const price=document.createElement("small");price.textContent=active?"✓ Одягнено":owned?"Одягти":cost+" 🪙";
  row.append(sample,name,price);
  row.onclick=action;root.append(row);
 });
}
function showCatalog(){
 const d=ensure(),p=d?.profile;if(!p)return;
 const ownColor=d.heroStyle.ownedPalettes,ownOutfit=d.heroStyle.owned,ownPet=p.petOwned;
 const opts=(set,isOwned,getCurrent,action)=>set.map(([key,label,cost])=>({
  key,label,cost,owned:isOwned.includes(key),active:getCurrent===key,
  icon:{casual:"👕",work:"🦺",gym:"🎽",hero:"🛡️",plain:"✨",bow:"🎀",cap:"🧢",scarf:"🧣",crown:"👑",glasses:"🕶️",backpack:"🎒"}[key],
  action:()=>buy("shop",key,cost,isOwned,()=>action(key))
 }));
 makeItems(Q("pz-shop-colors"),opts(PALETTES,ownColor,Number(d.heroStyle.palette||0),v=>d.heroStyle.palette=v),"palette");
 makeItems(Q("pz-shop-clothes"),opts(OUTFITS,ownOutfit,d.heroStyle.outfit||"casual",v=>d.heroStyle.outfit=v),"outfit");
 makeItems(Q("pz-shop-petwear"),opts(PET_STYLES,ownPet,p.petStyle||"plain",v=>p.petStyle=v),"pet");
 const petKey=p.pet||"none",label=p.petName||({"dog":"Пес","cat":"Кіт","hamster":"Хом'як","rabbit":"Кролик","fox":"Лис","panda":"Панда","parrot":"Папуга","penguin":"Пінгвін","fish":"Рибка"}[petKey]||"Компаньйон");
 const wallet="🪙 "+(Number(d.coins)||0)+" монет";for(const id of ["pz-shop-wallet","pz-pet-shop-wallet"])if(Q(id))Q(id).textContent=wallet;
 if(Q("pz-current-pet"))Q("pz-current-pet").textContent="🐾 "+label+" · "+t("Екіпірування компаньйона","Экипировка питомца","Companion gear");
 if(Q("pz3d-name"))Q("pz3d-name").textContent=p.name||"Герой";
 if(Q("pz-pet3d-name"))Q("pz-pet3d-name").textContent=label;
}
function title(text){const el=document.createElement("h3");el.textContent=text;return el}
function initUI(){
 if(!document.body.classList.contains("pz-unlocked")||!data()?.profile?.created)return;
 const wardrobe=Q("pz3d-shop"),companion=Q("pz-pets-v61");if(!wardrobe||!companion)return;
 if(!Q("pz-shop-root")){
  const wrapper=document.createElement("div");wrapper.id="pz-shop-root";
  wrapper.append(title("🛍️ Магазин героя"));
  const wallet=document.createElement("strong");wallet.id="pz-shop-wallet";wrapper.append(wallet);
  wrapper.append(title("🎨 Кольори героя"));
  const colors=document.createElement("div");colors.id="pz-shop-colors";colors.className="pz-shop-grid";wrapper.append(colors);
  wrapper.append(title("🧥 Одяг героя"));
  const outfits=document.createElement("div");outfits.id="pz-shop-clothes";outfits.className="pz-shop-grid";wrapper.append(outfits);
  const note=document.createElement("p");note.id="pz-shop-message";note.setAttribute("role","status");wrapper.append(note);
  wardrobe.replaceChildren(wrapper);
 }
 if(!Q("pz-pet-shop-root")){
  const wrapper=document.createElement("div");wrapper.id="pz-pet-shop-root";
  const name=document.createElement("h3");name.id="pz-current-pet";wrapper.append(name);
  const wallet=document.createElement("strong");wallet.id="pz-pet-shop-wallet";wrapper.append(wallet);
  const stage=document.createElement("div");stage.id="pz-pet3d-stage";stage.textContent="Завантажуємо 3D компаньйона…";wrapper.append(stage);
  const label=document.createElement("strong");label.id="pz-pet3d-name";wrapper.append(label);
  wrapper.append(title("🎒 Аксесуари"));
  const list=document.createElement("div");list.id="pz-shop-petwear";list.className="pz-shop-grid";wrapper.append(list);
  const note=document.createElement("p");note.textContent="Вибір улюбленця — вище. Куплені речі зберігаються у твоєму акаунті.";wrapper.append(note);
  companion.insertAdjacentElement("afterend",wrapper);
 }
 showCatalog();
}
function refresh(){if(!document.body.classList.contains("pz-unlocked"))return;initUI();showCatalog()}
window.pzShopRefresh=refresh;
window.addEventListener("pz:unlocked",()=>setTimeout(refresh,0));
window.addEventListener("pz:style-change",()=>{if(document.body.classList.contains("pz-unlocked"))showCatalog()});
document.addEventListener("click",event=>{
 const target=event.target;
 if(target?.closest?.("#pz-pets-v61 .pz-pet-select,#pz-pet-save"))setTimeout(()=>{refresh();window.dispatchEvent(new Event("pz:style-change"))},60);
});
window.addEventListener("banger:local-save",()=>{const d=data();if(!d?.profile?.created)return;const w=Q("pz-shop-wallet");if(w)w.textContent="🪙 "+(Number(d.coins)||0)+" монет";const p=Q("pz-pet-shop-wallet");if(p)p.textContent="🪙 "+(Number(d.coins)||0)+" монет"});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(refresh,500));else setTimeout(refresh,200);
})();