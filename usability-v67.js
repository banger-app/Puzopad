(function(){
"use strict";
const $=id=>document.getElementById(id);
const mealDay="2026-10-25";
const meal=[
 {id:"buckwheat",name:"Гречка варена",qty:"весь судочок, вага орієнтовна",k:240,p:8,f:2,c:44},
 {id:"cordon",name:"Курячий кордон-блю",qty:"2 шт.",k:570,p:38,f:36,c:34},
 {id:"eggs",name:"Варені яйця",qty:"3 шт.",k:225,p:19,f:15,c:2}
];
function gameDay(x){return typeof dayKey==="function"?dayKey(x.date,x.time):x.date}
function idFor(x){return "meal_20261026_0131_"+x.id}
function matchItem(row,item){
 if(gameDay(row)!==mealDay)return false;
 if(row.sourceId===idFor(item)||row.id===idFor(item))return true;
 const name=String(row.name||"").toLowerCase();
 const stem=item.id==="buckwheat"?/греч|гречк|buckwheat/:item.id==="cordon"?/кордон|корден|cordon/:/яйц|яйц|яйце|яйца|яєч|egg/;
 return stem.test(name)&&(item.id==="buckwheat"||Number(String(row.qty||"").match(/\d+/)?.[0]||0)===(item.id==="cordon"?2:3));
}
function restoreMeal(){
 if(typeof db==="undefined"||!Array.isArray(db.foods)||!window.pzActiveUserId){notify("Спочатку увійди в особистий акаунт.");return}
 if(typeof testMode!=="undefined"&&testMode){notify("Вимкни тестовий режим перед відновленням їжі.");return}
 const existing=meal.filter(x=>db.foods.some(f=>matchItem(f,x)));
 const missing=meal.filter(x=>!db.foods.some(f=>matchItem(f,x)));
 if(!missing.length){notify("✅ Цей прийом уже є у щоденнику; дубль не додаю.");openMealDay();return}
 const total=missing.reduce((s,x)=>s+x.k,0);
 if(!confirm("Додати "+missing.length+" відсутні позиції фактично з'їденого судочка за 26.10 01:31? Приблизно "+total+" ккал. Знайдені позиції не дублюються."))return;
 const uid=window.pzActiveUserId;
 try{
  localStorage.setItem("pz_before_meal_repair_v67_"+uid+"_"+Date.now(),JSON.stringify(db));
  for(const x of missing)db.foods.push({
    id:idFor(x),sourceId:idFor(x),date:"2026-10-26",time:"01:31",
    name:x.name,qty:x.qty,k:x.k,p:x.p,f:x.f,c:x.c,
    note:"БЕННІ: приблизна харчова цінність за фото й підтвердженням користувача, не точне зважування."
  });
  persist();
  const data=JSON.parse(localStorage.getItem(typeof KEY==="string"?KEY:"puzopad_rpg_v4")||"{}");
  if(!Array.isArray(data.foods)||!missing.every(x=>data.foods.some(y=>y.sourceId===idFor(x))))throw Error("Локальне збереження не підтверджене");
  render();
  openMealDay();
  notify("✅ Відновлено "+missing.length+" позиції, ≈"+total+" ккал. Раніше наявне не дублювали.");
 }catch(e){notify("⚠️ Не вдалось перевірити запис: "+e.message+". Попередній стан захищено резервною копією.")}
}
function openMealDay(){if(typeof selectedDiaryDay!=="undefined")selectedDiaryDay=mealDay;if(typeof go==="function")go("diary");if(typeof renderDiaryRange==="function")renderDiaryRange()}
function notify(message){const p=$("pz-fix-status");if(p)p.textContent=message;const t=$("pz-arc-status");if(t&&message.includes("Раунд"))t.textContent=message}
function makeRecovery(){
 if($("pz-repair-meal"))return;
 const target=$("diaryRange")?.parentElement||$("diary");
 if(!target)return;
 const wrap=document.createElement("div");wrap.id="pz-repair-meal";wrap.className="pz-repair-panel";
 const heading=document.createElement("strong");heading.textContent="🍽️ Відновлення обіду · 26 жовтня";
 const body=document.createElement("p");body.textContent="Гречка (весь судочок), 2 кордон-блю та 3 яйця — ≈1035 ккал. Тільки якщо запис зник, без дублів.";
 const button=document.createElement("button");button.type="button";button.textContent="↺ Повернути з'їдене в щоденник";button.onclick=restoreMeal;
 const status=document.createElement("p");status.id="pz-fix-status";status.setAttribute("role","status");
 wrap.append(heading,body,button,status);target.prepend(wrap);
}
function itemIcon(name){
 const n=String(name||"").toLowerCase();
 if(/вода|роса|водичк|water|вода питн|мінералк|минералк/.test(n))return "💧";
 if(/торт|cake|десерт|пиріг|пирог/.test(n))return "🍰";
 if(/чай|tea/.test(n))return "🍵";
 if(/сік|сок|juice/.test(n))return "🧃";
 if(/греч/.test(n))return "🌾";
 if(/кордон|корден/.test(n))return "🍗";
 if(/яйц|яєц/.test(n))return "🥚";
 return "🍱";
}
function itemType(name){return /вода|роса|water|мінералк|минералк/.test(String(name||"").toLowerCase())?"water":null}
function repairInventory(){
 const cards=$("fridgeItems")?.querySelectorAll(".lootcard")||[];
 for(const c of cards){
  const name=c.querySelector("strong")?.textContent||"";
  const icon=c.querySelector(".lootpic");
  const fixed=itemIcon(name),water=itemType(name)==="water",cake=/торт|cake|пирог|десерт/i.test(name);
  if(icon&&(water||cake)&&icon.textContent!==fixed){icon.replaceChildren(document.createTextNode(fixed));icon.style.fontSize="32px";}
  const eat=[...c.querySelectorAll("button")].find(b=>/Съесть|З'їсти|Їсти|🍴/.test(b.textContent));
  if(eat?.disabled){eat.disabled=false;eat.removeAttribute("title");eat.title="З'їсти: введи приблизну кількість; можна без БЖВ на етикетці"}
 }
}
function calories(item){
 if(Number.isFinite(Number(item.k))&&item.k!==null)return {k:Number(item.k),p:item.p,f:item.f,c:item.c,estimated:false};
 if(itemType(item.name)==="water")return {k:0,p:0,f:0,c:0,estimated:true};
 return {k:null,p:null,f:null,c:null,estimated:true};
}
window.eatLootV24=function(id){
 if(typeof db==="undefined"||!window.pzActiveUserId)return;
 const item=db.loot?.find(x=>String(x.id)===String(id));if(!item)return;
 const known=Number(item.qty),bounded=item.qty!=null&&Number.isFinite(known)&&known>0;
 const text=prompt("Скільки грамів/мл з'їв або випив: "+item.name+"?"+(bounded?" На складі "+known+".":" Маса на складі невідома."),bounded?String(Math.min(known,150)):"150");
 if(text==null)return;
 const grams=Number(String(text).replace(",","."));
 if(!Number.isFinite(grams)||grams<=0||grams>2500||(bounded&&grams>known)){alert("Введи дійсну кількість"+(bounded?" (не більше "+known+")":""));return}
 const n=calories(item),date=typeof stamp==="function"?stamp():{date:new Date().toISOString().slice(0,10),time:"?"};
 if(n.k===null&&!confirm("Калорійність для "+item.name+" невідома. Зберегти факт, а БЖВ уточнити пізніше?"))return;
 const record={id:"fromstock_"+Date.now(),date:date.date,time:date.time,name:item.name,qty:grams+" г/мл",k:n.k==null?null:Math.round(n.k*grams/100),p:n.p==null?null:Math.round(n.p*grams/100*10)/10,f:n.f==null?null:Math.round(n.f*grams/100*10)/10,c:n.c==null?null:Math.round(n.c*grams/100*10)/10,note:n.estimated?"Без точних БЖВ на етикетці; вода 0 ккал, інші продукти потребують оцінки.":"З'їдено зі складу"};
 db.foods.push(record);
 if(bounded){item.qty=Math.round((known-grams)*10)/10;if(item.qty<=0)db.loot=db.loot.filter(v=>v.id!==item.id)}
 persist();render();if(typeof selectedDiaryDay!=="undefined")selectedDiaryDay=gameDay(record);go("diary");renderDiaryRange();
 notify("✅ Факт збережено. Якщо БЖВ невідомі, не вигадуємо калорії.");
};
function navHome(){
 const header=document.querySelector("header.b29");if(!header||header.dataset.pzHome)return;
 header.dataset.pzHome="1";header.setAttribute("role","button");header.tabIndex=0;header.title="На головний екран · Штаб";
 const goHome=e=>{if(e.target.closest?.("button,#pz-topbar"))return;if(typeof go==="function"){go("home");window.scrollTo({top:0,behavior:"smooth"})}};
 header.addEventListener("click",goHome);
 header.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();goHome(e)}});
}
function settings(){
 const btn=$("pz-settings"),menu=$("pz-menu"),top=$("pz-topbar"),header=document.querySelector("header.b29");
 if(!btn||!menu||!top||!header||btn.dataset.pzFix)return;
 btn.dataset.pzFix="1";
 header.style.position="relative";header.style.overflow="visible";
 header.appendChild(top);
 top.style.cssText="position:absolute!important;top:10px!important;right:10px!important;z-index:2147482000!important;display:block!important;pointer-events:auto!important";
 btn.style.cssText="position:relative;z-index:2147482002;pointer-events:auto;cursor:pointer";
 menu.style.cssText="position:absolute;z-index:2147482005;right:0;top:48px;width:min(320px,90vw);max-height:70vh;overflow:auto";
 menu.hidden=true;menu.style.display="none";
 btn.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();const opened=menu.hidden;menu.hidden=!opened;menu.style.display=opened?"flex":"none";btn.setAttribute("aria-expanded",String(opened))},true);
}
function show3dStatus(){
 const slot=$("pz3d-stage");if(!slot)return;
 if(slot.querySelector("canvas"))return;
 if(!slot.querySelector("#pz-3d-help")){
  const hint=document.createElement("p");hint.id="pz-3d-help";hint.textContent="3D-сцена поки не завантажилася. Перевір підключення до інтернету. Старий аватар лишається видимим.";hint.style.cssText="position:absolute;bottom:8px;left:14px;right:14px;background:#22283b;padding:9px;border-radius:10px;color:#f6cce3;font-size:12px";
  slot.append(hint);
 }
}
function init(){
 if(!document.body.classList.contains("pz-unlocked"))return;
 makeRecovery();repairInventory();navHome();settings();
 const fridge=$("fridgeItems");
 if(fridge&&!fridge.dataset.pzFix){fridge.dataset.pzFix="1";new MutationObserver(()=>repairInventory()).observe(fridge,{childList:true})}
 setTimeout(show3dStatus,3500);
}
window.addEventListener("pz:unlocked",init);
document.addEventListener("DOMContentLoaded",()=>setTimeout(init,700));
if(document.readyState!=="loading")setTimeout(init,500);
})();