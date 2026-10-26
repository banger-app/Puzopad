(function(){
"use strict";
const el=id=>document.getElementById(id);
const TEXT={
uk:["Гардероб 2.0","Герой","Компаньйон","Магазин","Інвентар","Звичайний","Незвичайний","Рідкісний","Епічний","Легендарний","Всі","Купити","Одягнути","Одягнено","Приміряти","Куплено","Монети","Недостатньо монет. Зіграй в Аркаді.","Компаньйони","Відкрити","Обрано","Ім'я","Зберегти","Скинути примірку","Це лише косметичні речі. Записи здоров'я не змінюються.","Немає придбаних речей","Відкрито!","Збережено!","3D-модель скоро","Аксесуари","Зняти","Відкритих компаньйонів ще немає"],
ru:["Гардероб 2.0","Герой","Компаньон","Магазин","Инвентарь","Обычный","Необычный","Редкий","Эпический","Легендарный","Все","Купить","Надеть","Надето","Примерить","Куплено","Монеты","Не хватает монет. Играй в Аркадах.","Питомцы","Открыть","Выбрано","Имя","Сохранить","Сбросить примерку","Это косметические вещи. Данные здоровья не меняются.","Нет купленных вещей","Открыто!","Сохранено!","3D-модель скоро","Аксессуары","Снять","Открытых питомцев пока нет"],
en:["Wardrobe 2.0","Hero","Companion","Shop","Inventory","Common","Uncommon","Rare","Epic","Legendary","All","Buy","Equip","Equipped","Try on","Owned","Coins","Not enough coins. Play Arcade.","Companions","Unlock","Selected","Name","Save","Reset try-on","Cosmetics only. No impact on health data.","No purchased items","Unlocked!","Saved!","3D model coming","Accessories","Unequip","No unlocked companions yet"]
};
const RAR=["common","uncommon","rare","epic","legend"];
const RARN={common:5,uncommon:6,rare:7,epic:8,legend:9};
const HERO=[
["starter","torso","common",0,"Стартовий костюм","Базовый костюм","Starter outfit","◆"],
["work","torso","uncommon",25,"Робочий комбінезон","Рабочий комбинезон","Work overall","▣"],
["gym","torso","uncommon",30,"Спортивний сет","Спортивный сет","Training outfit","◉"],
["knight","torso","rare",65,"Обладунок стража","Доспех стража","Guardian armor","⬡"],
["void","torso","epic",110,"Темний мандрівник","Тёмный странник","Void traveler","◈"],
["royal","torso","legend",200,"Астральний король","Астральный король","Astral monarch","✦"],
["cap","head","common",15,"Кепка","Кепка","Cap","▱"],
["helmet","head","rare",65,"Бойовий шолом","Боевой шлем","Battle helmet","⬟"],
["crown","head","legend",160,"Золота корона","Золотая корона","Golden crown","♛"],
["glasses","face","uncommon",25,"Окуляри","Очки","Glasses","◎"],
["visor","face","epic",110,"Кібер-візор","Кибер-визор","Cyber visor","▣"],
["sneakers","feet","common",20,"Кросівки","Кроссовки","Sneakers","▱"],
["boots","feet","rare",75,"Бронечоботи","Бронесапоги","Armor boots","◆"],
["cape","back","rare",80,"Плащ","Плащ","Cape","◭"],
["wings","back","legend",210,"Неонові крила","Неоновые крылья","Neon wings","✧"],
["halo","aura","epic",130,"Магічна аура","Магическая аура","Magic aura","◌"]
];
const COLORS=[
[0,0,"Лісовий","Лесной","Forest","#56d97b"],
[1,25,"Неоновий","Неоновый","Neon","#ff349a"],
[2,40,"Океан","Океан","Ocean","#55c5f8"],
[3,70,"Золотий","Золотой","Golden","#f7c45d"]
];
const PETITEMS=[
["bow","head","common",10,"Бант","Бант","Bow","∞"],
["petcap","head","uncommon",25,"Кепка","Кепка","Cap","▱"],
["petcrown","head","legend",150,"Корона","Корона","Crown","♛"],
["scarf","neck","common",20,"Шарф","Шарф","Scarf","⌁"],
["collar","neck","rare",65,"Світний нашийник","Светящийся ошейник","Glow collar","◉"],
["petglasses","face","uncommon",30,"Окуляри","Очки","Glasses","◎"],
["backpack","back","rare",75,"Рюкзак","Рюкзак","Backpack","▣"],
["petwings","back","epic",125,"Малі крила","Малые крылья","Tiny wings","✧"],
["petaura","aura","legend",180,"Зоряна аура","Звёздная аура","Star aura","✦"]
];
const PETS=[
["none","common",0,"Без компаньйона","Без питомца","No pet","—",1],
["dog","common",0,"Пес","Собака","Dog","🐕",1],
["cat","common",0,"Кіт","Кот","Cat","🐈",1],
["hamster","common",0,"Хом'як","Хомяк","Hamster","🐹",1],
["rabbit","uncommon",70,"Кролик","Кролик","Rabbit","🐇",1],
["parrot","uncommon",80,"Папуга","Попугай","Parrot","🦜",1],
["fox","rare",130,"Лис","Лис","Fox","🦊",1],
["panda","rare",175,"Панда","Панда","Panda","🐼",1],
["penguin","rare",145,"Пінгвін","Пингвин","Penguin","🐧",1],
["fish","rare",115,"Рибка","Рыбка","Fish","🐟",1],
["duck","uncommon",90,"Качка","Утка","Duck","🦆",1],
["platypus","rare",165,"Качкодзьоб","Утконос","Platypus","🦆",1],
["bat","rare",155,"Кажан","Летучая мышь","Bat","🦇",1],
["hippo","epic",270,"Бегемот","Бегемот","Hippo","🦛",1],
["rhino","epic",285,"Носоріг","Носорог","Rhino","🦏",1],
["shark","epic",265,"Акула","Акула","Shark","🦈",1],
["turtle","uncommon",100,"Черепаха","Черепаха","Turtle","🐢",0],
["crocodile","epic",250,"Крокодил","Крокодил","Crocodile","🐊",0],
["owl","epic",225,"Сова","Сова","Owl","🦉",0],
["otter","epic",225,"Видра","Выдра","Otter","🦦",0],
["dragon","legend",500,"Дракон","Дракон","Dragon","🐉",0],
["lion","legend",450,"Лев","Лев","Lion","🦁",1],
["tiger","legend",450,"Тигр","Тигр","Tiger","🐅",1]
];
let tab="hero",mode="shop",filter="all",preview=null,message="",uid=null;
const lang=()=>{const x=el("banger-language-select")?.value||el("pz-language")?.value||localStorage.getItem("banger_language")||"uk";return TEXT[x]?x:"uk"};
const T=i=>TEXT[lang()][i];
const itemName=x=>x[lang()==="uk"?4:lang()==="ru"?5:6];
const petName=x=>x[lang()==="uk"?3:lang()==="ru"?4:5];
const d=()=>typeof db==="undefined"?null:db;
const can=()=>!!(window.pzActiveUserId&&d()?.profile?.created&&!(typeof testMode!=="undefined"&&testMode));
const $node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||"";if(text!=null)n.textContent=text;return n};
const $btn=(txt,fn,cls)=>{const n=$node("button",cls,txt);n.type="button";n.onclick=fn;return n};
function setup(){
 if(!can())return null;
 const data=d();
 if(!data.wardrobeV73)data.wardrobeV73={owned:["starter"],wear:{torso:"starter"},petItems:[],petWear:{},pets:["none","dog","cat","hamster"],petNames:{},petWardrobes:{}};
 const w=data.wardrobeV73;w.owned ||= ["starter"];w.colors ||= [0];w.wear ||= {torso:"starter"};w.petItems ||= [];w.petWear ||= {};w.pets ||= ["none","dog","cat","hamster"];w.petNames ||= {};w.petWardrobes||={};
 const activePet=data.profile.pet||"none";
 if(!w.petWardrobes[activePet])w.petWardrobes[activePet]={...w.petWear};
 w.petWear=w.petWardrobes[activePet];
 const legacy=data.heroStyle||{};
 if(!w.owned.includes("starter"))w.owned.push("starter");
 if(data.profile.pet&&data.profile.petName&&!w.petNames[data.profile.pet])w.petNames[data.profile.pet]=data.profile.petName;
 for(const c of legacy.ownedPalettes||[]){const n=Number(c);if(Number.isInteger(n)&&n>=0&&n<=3&&!w.colors.includes(n))w.colors.push(n)}
 for(const p of ["none","dog","cat","hamster",data.profile.pet||"none"])if(!w.pets.includes(p))w.pets.push(p);

 for(const [old,converted] of [["casual","starter"],["work","work"],["gym","gym"],["hero","knight"]])if(legacy.owned?.includes(old)&&!w.owned.includes(converted))w.owned.push(converted);
 for(const [old,converted] of [["bow","bow"],["cap","petcap"],["crown","petcrown"],["scarf","scarf"],["glasses","petglasses"],["backpack","backpack"]])if(data.profile.petOwned?.includes(old)&&!w.petItems.includes(converted))w.petItems.push(converted);
 return w;
}
function save(){
 if(!can())return;
 if(typeof persist==="function")persist();
 if(typeof updateDashboardV16==="function")updateDashboardV16();
 preview=null;window.pzWardrobePreviewV73=null;
 window.dispatchEvent(new Event("pz:style-change"));render();
}
function spend(cost){
 if(!can()||!Number.isSafeInteger(cost)||cost<0)return false;
 const balance=Number(d().coins)||0;if(balance<cost)return false;
 d().coins=balance-cost;return true;
}
function viewPreview(which,id){preview={which,id,uid:window.pzActiveUserId};window.pzWardrobePreviewV73=preview;message=T(14);window.dispatchEvent(new Event("pz:style-change"));render()}
function chooseItem(x,kind){
 const w=setup();if(!w)return;
 const list=kind==="hero"?w.owned:w.petItems,wear=kind==="hero"?w.wear:w.petWear;
 const removing=wear[x[1]]===x[0];
 if(removing){
  delete wear[x[1]];
 }else{
  if(!list.includes(x[0])){
   if(!spend(x[3])){viewPreview(kind,x[0]);message=T(17);render();return}
   list.push(x[0]);
  }
  wear[x[1]]=x[0];
 }
 message=removing?T(30):T(27);
 if(kind==="hero"&&x[1]==="torso"){
  d().heroStyle ||= {};
  d().heroStyle.outfit=removing?"casual":({starter:"casual",work:"work",gym:"gym",knight:"hero",void:"hero",royal:"hero"}[x[0]]||"casual");
 }
 if(kind==="pet"){
  const style={bow:"bow",petcap:"cap",petcrown:"crown",scarf:"scarf",petglasses:"glasses",backpack:"backpack"}[x[0]];
  d().profile.petStyle=removing?"plain":(style||"plain");
 }
 save();
}
function chooseColor(x){
 const w=setup();if(!w)return;
 if(!w.colors.includes(x[0])){
  if(!spend(x[1])){message=T(17);render();return}
  w.colors.push(x[0]);
 }
 d().heroStyle ||= {};d().heroStyle.palette=x[0];message=T(26);save();
}
function choosePet(x){
 const w=setup();if(!w)return;
 if(!w.pets.includes(x[0])){if(!spend(x[2])){message=T(17);render();return}w.pets.push(x[0])}
 const current=d().profile.pet||"none";
 w.petNames[current]=d().profile.petName||w.petNames[current]||"";
 w.petWardrobes[current]={...w.petWear};
 d().profile.pet=x[0];d().profile.petName=x[0]==="none"?"":(w.petNames[x[0]]||petName(x));
 w.petWardrobes[x[0]]||={};w.petWear=w.petWardrobes[x[0]];
 message=T(26);save();
}
function root(){
 const heroHost=el("wardrobe")?.querySelector(".panel"),petHost=el("companion")?.querySelector(".panel");
 if(!heroHost||!petHost)return null;
 function conceal(host){
  if(host.querySelector(".pz73-legacy"))return;
  const keep=$node("div","pz73-legacy");keep.hidden=true;keep.setAttribute("aria-hidden","true");
  while(host.firstChild)keep.append(host.firstChild);
  host.append(keep);
 }
 conceal(heroHost);conceal(petHost);
 const host=tab==="pet"?petHost:heroHost;
 let ui=el("pz73");
 if(ui){if(ui.parentElement!==host)host.append(ui);return ui;}
 let hero=el("pz3d-stage");if(hero)hero.remove();
 let pet=el("pz-pet3d-stage");if(pet)pet.remove();
 // Legacy IDs remain in concealed original panels for the main diary renderer.
 ui=$node("div","pz73-app");ui.id="pz73";
 const header=$node("header","pz73-head");header.append($node("small","","PUZOPAD / CHARACTER UNIVERSE"),$node("h2","pz73-heading"));const wallet=$node("strong","pz73-wallet");wallet.id="pz73-wallet";header.append(wallet);ui.append(header);
 const tabs=$node("div","pz73-tabs");tabs.id="pz73-tabs";ui.append(tabs);
 const frame=$node("div","pz73-frame");frame.id="pz73-frame";
 hero ||= $node("div","","");hero.id="pz3d-stage";
 pet ||= $node("div","","");pet.id="pz-pet3d-stage";
 const hidden=$node("div","");hidden.hidden=true;hidden.id="pz73-hidden";hidden.append(hero,pet);
 ui.append(frame,hidden);ui._hero=hero;ui._pet=pet;
 const content=$node("div","pz73-content");content.id="pz73-content";ui.append(content);
 const note=$node("p","pz73-notice");note.id="pz73-notice";note.setAttribute("role","status");ui.append(note);host.append(ui);
 return ui;
}
function card(x,kind,w){
 const key=x[0],rar=x[kind==="pettype"?1:2],cost=x[kind==="pettype"?2:3];
 const owned=kind==="pettype"?w.pets.includes(key):kind==="hero"?w.owned.includes(key):w.petItems.includes(key);
 const worn=kind==="pettype"?d().profile.pet===key:(kind==="hero"?w.wear[x[1]]===key:w.petWear[x[1]]===key);
 const n=$node("article","pz73-card rarity-"+rar);
 n.append($node("div","pz73-icon",kind==="pettype"?x[6]:x[7]),$node("small","pz73-rarity",T(RARN[rar])), $node("strong","pz73-title",kind==="pettype"?petName(x):itemName(x)));
 if(kind==="pettype"&&!x[7])n.append($node("small","pz73-model-note",T(28)));
 const info=$node("div","pz73-price",worn?T(13):owned?T(15):(cost+" 🪙"));n.append(info);
 const row=$node("div","pz73-card-buttons");
 const main=$btn(worn?(kind==="pettype"?T(20):T(30)):owned?T(12):kind==="pettype"?T(19):T(11),()=>{if(kind==="pettype")choosePet(x);else chooseItem(x,kind)},"pz73-primary");
 if(kind==="pettype"&&!x[7]&&!owned){main.disabled=true;main.title=T(28)}
 row.append(main);
 if(kind!=="pettype"&&!owned)row.append($btn(T(14),()=>viewPreview(kind,key),"pz73-secondary"));
 n.append(row);return n;
}
function render(){
 if(!can())return;
 const w=setup();if(!w)return;
 if(uid!==window.pzActiveUserId){uid=window.pzActiveUserId;preview=null;tab="hero";mode="shop";filter="all"}
 const ui=root();if(!ui)return;
 ui.querySelector(".pz73-heading").textContent=T(0);
 el("pz73-wallet").textContent=T(16)+": "+(Number(d().coins)||0)+" 🪙";
 const tabs=el("pz73-tabs");tabs.replaceChildren();for(const kind of ["hero","pet"])tabs.append($btn((kind==="hero"?"◈ ":"🐾 ")+T(kind==="hero"?1:2),()=>{tab=kind;filter="all";mode="shop";preview=null;window.pzWardrobePreviewV73=null;if(typeof go==="function")go(kind==="pet"?"companion":"wardrobe");render()},"pz73-tab"+(tab===kind?" selected":"")));
 const stage=tab==="hero"?ui._hero:ui._pet,other=tab==="hero"?ui._pet:ui._hero,frame=el("pz73-frame");
 if(stage.parentElement!==frame){frame.replaceChildren(stage);el("pz73-hidden").append(other);window.pz3dRefresh?.()}
 const content=el("pz73-content");content.replaceChildren();
 if(tab==="hero"){
  const species=$node("div","pz73-species");
  const names={frog:["🐸 Жабка","🐸 Лягушка","🐸 Frog"],human:["🧑 Людина","🧑 Человек","🧑 Human"],robot:["🤖 Робот","🤖 Робот","🤖 Robot"]};
  for(const [kind,words] of Object.entries(names)){species.append($btn(words[lang()==="uk"?0:lang()==="ru"?1:2],()=>{d().profile.species=kind;message=T(27);save()},"pz73-chip"+((d().profile.species||"frog")===kind?" selected":"")))}
  content.append(species);
 }
 const nav=$node("div","pz73-switch");for(const a of ["shop","bag"])nav.append($btn(a==="shop"?"🛒 "+T(3):"🎒 "+T(4),()=>{mode=a;render()},"pz73-tab"+(mode===a?" selected":"")));content.append(nav);
 if(tab==="pet"){
  content.append($node("h3","pz73-subtitle",T(18)));
  const chooser=$node("div","pz73-grid");for(const x of PETS)if((mode==="shop"||w.pets.includes(x[0]))&&(filter==="all"||x[1]===filter))chooser.append(card(x,"pettype",w));if(!chooser.childElementCount)chooser.append($node("p","pz73-empty",T(31)));content.append(chooser);
 }
 const rarityBar=$node("div","pz73-filters");for(const r of ["all",...RAR])rarityBar.append($btn(T(r==="all"?10:RARN[r]),()=>{filter=r;render()},"pz73-chip"+(filter===r?" selected":"")));content.append(rarityBar);
 content.append($node("h3","pz73-subtitle",tab==="hero"?T(1):T(29)));
 if(tab==="hero"){
  content.append($node("h3","pz73-subtitle",lang()==="en"?"Character colors":lang()==="ru"?"Расцветки персонажа":"Кольори персонажа"));
  const colorList=$node("div","pz73-colors");
  for(const col of COLORS){
   const color=$node("button","pz73-color"+(Number(d().heroStyle?.palette||0)===col[0]?" selected":""));
   color.type="button";
   const dot=$node("span","pz73-color-dot");dot.style.background=col[5];
   const title=$node("span","",col[lang()==="uk"?2:lang()==="ru"?3:4]);
   const price=$node("small","",w.colors.includes(col[0])?T(15):col[1]+" 🪙");
   color.append(dot,title,price);color.onclick=()=>chooseColor(col);colorList.append(color);
  }
  content.append(colorList);
 }
 const list=tab==="hero"?HERO:PETITEMS,owned=tab==="hero"?w.owned:w.petItems;
 const filtered=list.filter(x=>(filter==="all"||x[2]===filter)&&(mode==="shop"||owned.includes(x[0])));
 const grid=$node("div","pz73-grid");for(const x of filtered)grid.append(card(x,tab,w));if(!filtered.length)grid.append($node("p","",T(25)));content.append(grid);
 if(preview?.uid===window.pzActiveUserId)content.prepend($btn("✕ "+T(23),()=>{preview=null;window.pzWardrobePreviewV73=null;window.dispatchEvent(new Event("pz:style-change"));render()},"pz73-secondary"));
 const label=$node("label","pz73-name",T(21)),input=$node("input","pz73-input");input.maxLength=40;input.value=tab==="hero"?d().profile.name||"":d().profile.petName||"";
 content.append(label,input,$btn(T(22),()=>{const name=input.value.trim().slice(0,40);if(!name)return;if(tab==="hero"){d().profile.name=name;d().characterName=name;d().profile.provisional=false}else {d().profile.petName=name;w.petNames[d().profile.pet]=name}message=T(27);save()},"pz73-primary"));
 content.append($node("p","pz73-tip",T(24)));el("pz73-notice").textContent=message;
}
let lastPoop=0;
function poop(){
 if(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)return;
 if(Date.now()-lastPoop<1200)return;lastPoop=Date.now();
 const layer=$node("div","pz73-poop-overlay");layer.setAttribute("aria-hidden","true");
 for(let i=0;i<18;i++){const a=$node("span","pz73-splat","💩");a.style.left=(Math.random()*90+4)+"%";a.style.setProperty("--y",(Math.random()*65+18)+"vh");a.style.setProperty("--delay",(i*28)+"ms");layer.append(a)}
 document.body.append(layer);setTimeout(()=>layer.remove(),1500);
}
document.addEventListener("change",e=>{if(e.target?.id!=="pz-language"&&e.target?.id!=="banger-language-select")return;if(e.target.value==="ru")poop();setTimeout(render,80)},true);
document.addEventListener("click",e=>{const nav=e.target?.closest?.('nav button[data-tab="wardrobe"],nav button[data-tab="companion"]');if(nav)setTimeout(()=>{tab=nav.dataset.tab==="companion"?"pet":"hero";render()},45)});
function watchSections(){
 for(const [id,value] of [["wardrobe","hero"],["companion","pet"]]){
  const section=el(id);if(!section)return;
  new MutationObserver(()=>{
   if(section.classList.contains("active")&&tab!==value){
    tab=value;mode="shop";filter="all";preview=null;window.pzWardrobePreviewV73=null;render();
   }
  }).observe(section,{attributes:true,attributeFilter:["class"]});
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",watchSections,{once:true});else watchSections();
window.addEventListener("pz:unlocked",()=>setTimeout(render,40));
window.addEventListener("banger:local-save",()=>{if(can()&&el("pz73-wallet"))el("pz73-wallet").textContent=T(16)+": "+(Number(d().coins)||0)+" 🪙"});
window.pzWardrobeV73={render,setup,HERO,PETITEMS,PETS};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(render,700));else setTimeout(render,120);
})();