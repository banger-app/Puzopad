/* BANGERVERSE REBORN v80 — Benny purchase scan, accountable inventory and contextual command dock.
   No products are logged as eaten on purchase. Every import and consumption needs user confirmation. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const api="https://wsgkqauwukykhmhtinoa.supabase.co/functions/v1/banger-inventory";
const key="sb_publishable_Aol9Igd8oRMDQHv4f3skaQ_Iql1OxXk";
const L=()=>{const v=localStorage.getItem("banger_language")||"uk";return ["uk","ru","en"].includes(v)?v:"uk"};
const words={
 ru:{scan:"📷 Бенни · распознать покупки",intro:"Фото корзины или упаковок → проверить → добавить в холодильник. Ничего не записывается само.",upload:"Сфотографируй корзину или выбери фото",analyze:"🔎 Распознать товары",review:"Проверь товары и количество",confirm:"✅ Добавить подтверждённое",home:"🏠 Дома",transit:"🚚 В дороге",work:"🏢 На работе",empty:"Пока нет покупок",qty:"Количество",unit:"Ед.",k:"ккал/100",move:"Переместить",eat:"Съесть",ai:"Спросить Бенни",gym:"Мой зал",stock:"Продукты",photo:"Фото продуктов",tips:"Бенни подскажет следующий шаг",noMacros:"БЖУ неизвестны — не выдумываем",all:"Товары",status:"Подсказки на основе твоих записей, не автоматические решения.",title:"БЕННИ · ТВОЯ ЖИЗНЬ",already:"Один и тот же ответ повторно не добавляем.",continue:"Продолжи тренировку",diary:"Показать питание сегодня",imported:"Покупки добавлены в запасы; еда не записана."},
 uk:{scan:"📷 Бенні · розпізнати покупки",intro:"Фото кошика або пакувань → перевірити → додати до холодильника. Нічого не записується автоматично.",upload:"Сфотографуй кошик або обери фото",analyze:"🔎 Розпізнати товари",review:"Перевір товари та кількість",confirm:"✅ Додати підтверджене",home:"🏠 Вдома",transit:"🚚 У дорозі",work:"🏢 На роботі",empty:"Покупок немає",qty:"Кількість",unit:"Од.",k:"ккал/100",move:"Перемістити",eat:"З'їсти",ai:"Спитати Бенні",gym:"Мій зал",stock:"Продукти",photo:"Фото продуктів",tips:"Бенні підкаже наступний крок",noMacros:"БЖВ невідомі — не вигадуємо",all:"Товари",status:"Підказки за твоїми записами, без автоматичних рішень.",title:"БЕННІ · ТВОЄ ЖИТТЯ",already:"Повторно однаковий результат не записується.",continue:"Продовжити тренування",diary:"Показати харчування сьогодні",imported:"Покупки додано до запасів, харчування не змінено."},
 en:{scan:"📷 Benny · scan purchases",intro:"Photo → review → confirm → fridge. Nothing is saved automatically.",upload:"Photograph your basket or choose a photo",analyze:"🔎 Recognize items",review:"Review names and quantities",confirm:"✅ Add confirmed items",home:"🏠 Home",transit:"🚚 In transit",work:"🏢 Work",empty:"No purchases yet",qty:"Quantity",unit:"Unit",k:"kcal/100",move:"Move",eat:"Eat",ai:"Ask Benny",gym:"My gym",stock:"Pantry",photo:"Food photo",tips:"Benny suggests the next step",noMacros:"Macros unknown — no invented values",all:"Items",status:"Suggestions use your records, not autonomous decisions.",title:"BENNY · YOUR LIFE",already:"Duplicate import is blocked.",continue:"Continue workout",diary:"Review today's food",imported:"Purchase added to inventory, not food diary."}};
const T=k=>(words[L()]||words.uk)[k]||k;
const e=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n};
const button=(name,fn,cls)=>{const n=e("button",cls||"",name);n.type="button";n.onclick=fn;return n};
const data=()=>typeof db!=="undefined"&&db?.profile?.created&&window.pzActiveUserId&&!(typeof testMode!=="undefined"&&testMode)?db:null;
const valid=num=>num!==null&&num!==""&&Number.isFinite(Number(num))&&Number(num)>=0;
const num=v=>valid(v)?Number(v):null;
const whereToName=k=>T(k==="home"?"home":k==="work"?"work":"transit");
let uid=null,proposals=[],used=false,scanKey="",busy=false,scanVisible=false;
function save(){if(typeof persist==="function")persist();if(typeof render==="function")render()}
function message(s){const t=$("pz80-stock-status");if(t)t.textContent=s}
function labelInput(title,value,type="text"){
 const wrap=e("label","pz80-input");wrap.append(e("span","",title));
 const inp=e("input");inp.type=type;if(type==="number"){inp.min="0";inp.step="any";inp.inputMode="decimal"}inp.value=value===null||value===undefined?"":String(value);wrap.append(inp);return {wrap,inp};
}
function scanUI(){
 if($("pz80-scan-overlay"))return;
 const overlay=e("div","pz80-scan-overlay");overlay.id="pz80-scan-overlay";overlay.hidden=true;
 const dialog=e("section","pz80-scan-card");dialog.setAttribute("role","dialog");dialog.setAttribute("aria-modal","true");dialog.setAttribute("aria-label",T("scan"));
 const head=e("div","pz80-scan-head");head.append(e("strong","",T("scan")),button("✕",closeScan,"pz80-close"));
 dialog.append(head,e("p","pz80-muted",T("intro")));
 const inp=e("input");inp.type="file";inp.accept="image/*";inp.id="pz80-stock-photo";inp.setAttribute("aria-label",T("upload"));dialog.append(inp);
 const note=labelInput("Названия или уточнения (необязательно)","");note.inp.id="pz80-stock-note";dialog.append(note.wrap);
 const preview=e("img","pz80-scan-image");preview.id="pz80-stock-image";preview.hidden=true;dialog.append(preview);
 const status=e("p","pz80-stock-status");status.id="pz80-stock-status";status.setAttribute("role","status");
 inp.onchange=()=>{
  proposals=[];used=false;const file=inp.files?.[0];if(!file){preview.hidden=true;return}
  const reader=new FileReader();reader.onload=()=>{preview.src=reader.result;preview.hidden=false};reader.readAsDataURL(file);
  drawReview();
 };
 const go=button(T("analyze"),analyze,"pz80-action");go.id="pz80-recognize";
 dialog.append(go,status);
 const list=e("div","pz80-stock-review");list.id="pz80-stock-review";dialog.append(list);
 const commit=button(T("confirm"),confirmImport,"pz80-action");commit.id="pz80-stock-confirm";commit.disabled=true;dialog.append(commit);
 overlay.append(dialog);document.body.append(overlay);
 overlay.onclick=event=>{if(event.target===overlay)closeScan()};
}
function openScan(){
 if(!data()){alert("Сначала войди в свой аккаунт");return}
 scanUI();const overlay=$("pz80-scan-overlay");overlay.hidden=false;scanVisible=true;
 $('pz80-stock-confirm').disabled=!proposals.length||used;
 document.body.classList.add("pz80-scan-open");
}
function closeScan(){const root=$("pz80-scan-overlay");if(root)root.hidden=true;scanVisible=false;document.body.classList.remove("pz80-scan-open")}
async function resizeImage(file){
 if(file.size>14*1024*1024)throw Error("Фото слишком большое (макс. 14 МБ до сжатия)");
 const original=await new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>ok(fr.result);fr.onerror=()=>no(Error("Фото не прочитано"));fr.readAsDataURL(file)});
 const image=new Image();await new Promise((ok,no)=>{image.onload=ok;image.onerror=()=>no(Error("Не удалось открыть изображение"));image.src=original});
 const max=1800,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
 const c=document.createElement("canvas");c.width=Math.round(image.naturalWidth*scale);c.height=Math.round(image.naturalHeight*scale);
 c.getContext("2d").drawImage(image,0,0,c.width,c.height);
 return c.toDataURL("image/jpeg",.78);
}
async function analyze(){
 if(busy)return;
 const file=$("pz80-stock-photo")?.files?.[0],note=$("pz80-stock-note")?.value?.trim()||"";
 if(!file&&!note){message("⚠️ Добавь фото или перечисли покупки.");return}
 if(!data()){message("⚠️ Войди в аккаунт.");return}
 busy=true;message("Бенни распознаёт продукты…");$("pz80-recognize").disabled=true;proposals=[];drawReview();
 const owner=window.pzActiveUserId;
 try{
  const client=window.pzSupabaseShared;if(!client?.auth)throw Error("Нет авторизации");
  const {data:auth,error}=await client.auth.getSession();if(error||!auth.session||auth.session.user.id!==owner)throw Error("Сессия не активна");
  const photo=file?await resizeImage(file):null;
  const response=await fetch(api,{method:"POST",headers:{"apikey":key,"Authorization":"Bearer "+auth.session.access_token,"Content-Type":"application/json"},body:JSON.stringify({image_data_url:photo,note})});
  const raw=await response.json();if(!response.ok)throw Error(raw.error||"AI unavailable");
  if(window.pzActiveUserId!==owner)throw Error("Аккаунт был изменён");
  proposals=(Array.isArray(raw.items)?raw.items:[]).map(x=>({name:String(x.name||"").slice(0,100),quantity:num(x.quantity),unit:["pcs","g","ml"].includes(x.unit)?x.unit:"pcs",k:num(x.k),p:num(x.p),f:num(x.f),c:num(x.c),confidence:x.confidence||"low",evidence:String(x.evidence||"").slice(0,150),where:"home",selected:true})).filter(x=>x.name);
  used=false;scanKey="b80_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8);
  message(proposals.length?T("review")+" · "+proposals.length+(raw.note?" · "+raw.note:""):"Не удалось уверенно распознать товары. Сделай фото этикеток крупнее.");
  drawReview();
 }catch(err){message("⚠️ "+(err?.message||err)+". Ничего не сохранено.")}
 finally{busy=false;if($("pz80-recognize"))$("pz80-recognize").disabled=false}
}
function drawReview(){
 const box=$("pz80-stock-review");if(!box)return;box.replaceChildren();
 proposals.forEach((x,i)=>{
  const row=e("div","pz80-review-item");
  const checked=e("input");checked.type="checkbox";checked.checked=x.selected;checked.onchange=()=>{x.selected=checked.checked};checked.setAttribute("aria-label","Сохранить этот товар");row.append(checked);
  const name=labelInput("Продукт",x.name);name.inp.oninput=()=>x.name=name.inp.value.trim();row.append(name.wrap);
  const qty=labelInput(T("qty"),x.quantity,"number");qty.inp.oninput=()=>x.quantity=qty.inp.value===""?null:num(qty.inp.value);row.append(qty.wrap);
  const unit=e("select");for(const [id,title] of [["pcs","шт"],["g","г"],["ml","мл"]]){const opt=e("option","",title);opt.value=id;opt.selected=id===x.unit;unit.append(opt)}unit.onchange=()=>x.unit=unit.value;
  const holder=e("label","pz80-input");holder.append(e("span","",T("unit")),unit);row.append(holder);
  const location=e("select");for(const at of ["home","transit","work"]){const opt=e("option","",whereToName(at));opt.value=at;opt.selected=at===x.where;location.append(opt)}location.onchange=()=>x.where=location.value;
  const wh=e("label","pz80-input");wh.append(e("span","","Куда"),location);row.append(wh);
  const macros=e("details","pz80-review-macros");macros.append(e("summary","",T("k")+" · "+(x.k===null?"?":x.k)));
  for(const k of ["k","p","f","c"]){const field=labelInput(k.toUpperCase()+" / 100",x[k],"number");field.inp.oninput=()=>x[k]=field.inp.value===""?null:num(field.inp.value);macros.append(field.wrap)}
  if(x.evidence)macros.append(e("p","pz80-muted","Фото: "+x.evidence));
  row.append(macros);box.append(row);
 });
 if($("pz80-stock-confirm"))$("pz80-stock-confirm").disabled=!proposals.length||used;
}
function confirmImport(){
 if(used){message(T("already"));return}
 const d=data();if(!d){message("⚠️ Войди в аккаунт");return}
 const selected=proposals.filter(x=>x.selected);
 if(!selected.length){message("Не выбраны товары");return}
 for(const x of selected)if(!x.name.trim()||!valid(x.quantity)||Number(x.quantity)<=0||Number(x.quantity)>10000){message("⚠️ Проверь название и количество каждого товара. Неизвестное количество нужно уточнить вручную.");return}
 if(!confirm("Добавить "+selected.length+" товар(ов) в запасы? Это НЕ запись съеденной еды."))return;
 d.loot ||= [];d.bennyV80Imports||=[];
 if(d.bennyV80Imports.includes(scanKey)){message(T("already"));return}
 const before=d.loot.length;
 selected.forEach((x,i)=>d.loot.push({id:Date.now()+i+1,name:x.name.trim(),qty:Number(x.quantity),unit:x.unit,where:x.where,k:x.k,p:x.p,f:x.f,c:x.c,source:"BENNY v80 confirmed",sourceId:scanKey+"_"+i}));
 d.bennyV80Imports.push(scanKey);if(d.bennyV80Imports.length>250)d.bennyV80Imports=d.bennyV80Imports.slice(-250);
 try{save();used=true;drawReview();message("✅ "+T("imported"));renderStocks();renderDock();closeScan()}
 catch(err){d.loot.splice(before);d.bennyV80Imports=d.bennyV80Imports.filter(x=>x!==scanKey);message("⚠️ "+err.message)}
}
function displayStock(){
 const section=$("fridge"),panel=section?.querySelector(".panel");if(!panel)return null;
 let root=$("pz80-stock-root");
 if(!root){
  root=e("div","pz80-stock-root");root.id="pz80-stock-root";panel.insertBefore(root,panel.firstChild);
  panel.classList.add("pz80-fridge-ready");
 }
 return root;
}
function consume(item){
 const d=data();if(!d)return;
 if(!["g","ml"].includes(item.unit)||!valid(item.k)){alert("Для списания в дневник нужны граммы/мл и проверенная калорийность на 100. Открой Бенни с этикеткой.");return}
 const amt=prompt("Сколько "+item.unit+" действительно съел? Доступно "+item.qty,item.qty);
 if(amt===null)return;const quantity=Number(String(amt).replace(",","."));if(!Number.isFinite(quantity)||quantity<=0||quantity>Number(item.qty)){alert("Некорректное количество");return}
 if(!confirm("Точно съел "+quantity+" "+item.unit+" "+item.name+"?"))return;
 const clock=typeof stamp==="function"?stamp():{date:new Date().toISOString().slice(0,10),time:new Date().toTimeString().slice(0,5)};
 const food={id:"bennyv80_eat_"+Date.now(),date:clock.date,time:clock.time,name:item.name,qty:quantity+" "+item.unit,k:Math.round(Number(item.k)*quantity/100),p:valid(item.p)?Math.round(item.p*quantity)/100:null,f:valid(item.f)?Math.round(item.f*quantity)/100:null,c:valid(item.c)?Math.round(item.c*quantity)/100:null,sourceId:"stock_"+item.id,note:"Подтверждено пользователем: списание со склада"};
 d.foods ||= [];d.foods.push(food);
 const idx=d.loot.findIndex(x=>x.id===item.id);if(idx<0)return;
 d.loot[idx].qty=Math.round((Number(item.qty)-quantity)*100)/100;
 if(d.loot[idx].qty<=0)d.loot.splice(idx,1);
 save();renderStocks();renderDock();
 if(typeof renderDiaryRange==="function")renderDiaryRange();
}
function correctStock(item){
 const d=data();if(!d)return;
 const stock=d.loot?.find(x=>x.id===item.id);if(!stock)return;
 const entered=prompt("Исправить количество "+item.name+" ("+(stock.unit||"g/ml")+")",stock.qty);
 if(entered===null)return;const q=Number(String(entered).replace(",","."));
 if(!Number.isFinite(q)||q<=0||q>10000){alert("Укажи корректное количество");return}
 const unit=prompt("Единицы: g / ml / pcs",stock.unit||"g");
 if(unit===null)return;
 const clean=String(unit).trim().toLowerCase();
 if(!["g","ml","pcs"].includes(clean)){alert("Выбери g, ml или pcs");return}
 stock.qty=Math.round(q*100)/100;stock.unit=clean;save();renderStocks();renderDock();
}
function moveStock(item,where){
 const d=data();if(!d||!["home","work","transit"].includes(where))return;
 const row=d.loot?.find(x=>x.id===item.id);if(!row)return;
 row.where=where;save();renderStocks();renderDock();
}
function renderStocks(){
 const root=displayStock(),d=data();if(!root)return;root.replaceChildren();
 const head=e("div","pz80-stock-head");head.append(e("h2","", "🧊 "+T("stock")),button(T("scan"),openScan,"pz80-action"));root.append(head);
 const stocks=d?.loot||[];
 for(const where of ["home","transit","work"]){
  const group=e("section","pz80-stock-group");group.append(e("h3","",whereToName(where)+" · "+stocks.filter(x=>(x.where||"home")===where).length));
  const items=stocks.filter(x=>(x.where||"home")===where);
  if(!items.length)group.append(e("p","pz80-muted",T("empty")));
  items.forEach(x=>{
   const card=e("article","pz80-stock-card");
   card.append(e("strong","",x.name),e("span","pz80-muted",(x.qty??"?")+" "+(x.unit==="pcs"?"шт":x.unit==="g"?"г":x.unit==="ml"?"мл":"г/мл")+" · "+(valid(x.k)?x.k+" ккал/100":T("noMacros"))));
   const actions=e("div","pz80-stock-actions");for(const to of ["home","transit","work"])if(where!==to)actions.append(button(whereToName(to),()=>moveStock(x,to),"pz80-quiet"));
   const consumed=button("🍽 "+T("eat"),()=>consume(x),"pz80-quiet");consumed.disabled=!["g","ml"].includes(x.unit)||!valid(x.k);
   actions.append(button("✎",()=>correctStock(x),"pz80-quiet"),consumed);card.append(actions);group.append(card);
  });root.append(group);
 }
}
function promptBenny(message){
 const open=$("bai-open"),input=$("bai-input");if(!open||!input)return;
 open.click();input.value=message;input.focus();
}
function gameDayOf(date,time){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||""))||!/^\d{1,2}:\d{2}/.test(String(time||"")))return null;
 const hour=Number(time.split(":")[0]);if(hour>23)return null;
 const midnight=new Date(date+"T12:00:00");if(Number.isNaN(midnight.getTime()))return null;
 if(hour<18)midnight.setDate(midnight.getDate()-1);
 return [midnight.getFullYear(),String(midnight.getMonth()+1).padStart(2,"0"),String(midnight.getDate()).padStart(2,"0")].join("-");
}
function currentGameDay(){
 const now=new Date();if(now.getHours()<18)now.setDate(now.getDate()-1);
 return [now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-");
}
function facts(d){
 const meals=(d.foods||[]).filter(x=>gameDayOf(x.date,x.time)===currentGameDay()&&valid(x.k));
 const kcal=meals.reduce((n,x)=>n+Number(x.k),0);
 const weights=(d.weights||[]).filter(x=>valid(x.kg)&&Number(x.kg)!==92.9&&/^\d{4}-\d{2}-\d{2}$/.test(x.date||"")).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 return {kcal:Math.round(kcal),meals:meals.length,weight:weights[0]?.kg??null,date:weights[0]?.date??""};
}
function renderDock(){
 const d=data(),home=$("home");if(!d||!home)return;
 let root=$("pz80-dock");
 if(!root){root=e("section","pz80-dock");root.id="pz80-dock";home.insertBefore(root,home.firstChild)}
 root.replaceChildren();
 const top=e("div","pz80-dock-title");const avatar=e("img","pz80-benny-icon");avatar.src="./icons/benny-180.png?v=1";avatar.alt="";
 top.append(avatar,e("div","pz80-dock-heading",T("title")));
 const balance=e("small","pz80-dock-balance","✦ "+(d.coins||0)+" 🪙");top.append(balance);root.append(top);
 const info=facts(d),stats=e("div","pz80-dock-summary");
 stats.append(e("span","","🥗 "+info.kcal+" ккал · "+info.meals+" "+(L()==="en"?"logs":"записей")));
 if(info.weight!==null)stats.append(e("span","","⚖️ "+info.weight+" кг · "+info.date));
 root.append(stats);
 const acts=e("div","pz80-dock-actions");
 acts.append(button(T("photo"),openScan,"pz80-dock-main"),button(T("ai"),()=>promptBenny("Бенни, помоги с моими сегодняшними продуктами и дневником. Не записывай ничего без моего подтверждения."),""),
 button(T("gym"),()=>{if(typeof go==="function")go("gym")},""),
 button(T("stock"),()=>{if(typeof go==="function")go("fridge")},""));
 root.append(acts);
 const advice=e("p","pz80-dock-advice"),stock=(d.loot||[]).filter(x=>x.where==="transit");
 if(stock.length)advice.textContent="🚚 "+stock.length+" · "+(L()==="ru"?"Продукты в пути: перенеси на работу после доставки":L()==="uk"?"Продукти в дорозі: перенеси на роботу після доставки":"Items in transit: move after delivery");
 else if(d.gymV80?.session)advice.textContent="🏋️ "+T("continue");
 else if((d.foods||[]).length)advice.textContent="🥗 "+T("diary");
 else advice.textContent=T("status");
 root.append(advice);
}
function init(){
 if(!data())return;
 if(window.pzActiveUserId!==uid){uid=window.pzActiveUserId;proposals=[];used=false;scanKey="";closeScan()}
 renderStocks();renderDock();scanUI();
 const body=$("bai-log");
 if(body&&!$("pz80-benny-chips")){
  const chips=e("div","pz80-benny-chips");chips.id="pz80-benny-chips";
  chips.append(button(T("scan"),()=>{closeBenny();openScan()}),button(T("stock"),()=>{closeBenny();if(typeof go==="function")go("fridge")}),button(T("gym"),()=>{closeBenny();if(typeof go==="function")go("gym")}));
  body.insertBefore(chips,body.firstChild);
 }
}
function closeBenny(){$("bai-close")?.click()}
window.pzBennyContextV80=()=>{
 const d=data();if(!d)return null;
 const weight=(d.weights||[]).filter(x=>valid(x.kg)&&Number(x.kg)!==92.9&&x.date).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,3).map(x=>({date:x.date,kg:x.kg}));
 const foods=(d.foods||[]).filter(x=>gameDayOf(x.date,x.time)===currentGameDay()).slice(-10).map(x=>({name:String(x.name||"").slice(0,65),qty:String(x.qty||"").slice(0,28),k:valid(x.k)?Number(x.k):null}));
 const stock=(d.loot||[]).slice(0,32).map(x=>({name:String(x.name||"").slice(0,65),qty:valid(x.qty)?Number(x.qty):null,unit:x.unit||"unknown",where:x.where||"home",k100:valid(x.k)?Number(x.k):null}));
 const g=d.gymV80||null;
 const plan=g?((Number(g.weekly)||3)<=2?["Full body A","Full body B"][((Number(g.rotation)||0)%2)]:["Грудь/плечи","Спина/бицепс","Ноги/корпус"][((Number(g.rotation)||0)%3)]):null;
 return {source:"authenticated-user-game-snapshot",gameDayStartHour:18,gameDay:currentGameDay(),recentOfficialWeights:weight,todayConfirmedFoods:foods,knownInventory:stock,trainer:plan?{next:plan,weekly:g.weekly,goal:g.goal,sessionActive:!!g.session}:null,coins:Math.max(0,Number(d.coins)||0),nutritionFactsOnly:true};
};
window.pz80Benny={openScan,renderStocks,renderDock,init};
window.addEventListener("pz:unlocked",init);
window.addEventListener("banger:local-save",()=>{if(data()){renderStocks();renderDock()}});
document.addEventListener("change",event=>{if(["banger-language-select","pz-language"].includes(event.target?.id))setTimeout(init,90)});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,450));
else setTimeout(init,450);
})();