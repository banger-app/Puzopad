(function(){
"use strict";
const $=id=>document.getElementById(id),PETS=[["dog","🐕","Пес"],["cat","🐈","Кіт"],["turtle","🐢","Черепаха"],["hamster","🐹","Хом'як"],["rabbit","🐇","Кролик"],["parrot","🦜","Папуга"],["fox","🦊","Лис"],["panda","🐼","Панда"],["crocodile","🐊","Крокодил"],["hedgehog","🦔","Їжак"],["otter","🦦","Видра"],["fish","🐟","Рибка"],["penguin","🐧","Пінгвін"],["owl","🦉","Сова"],["dragon","🐉","Дракон"],["none","✨","Без друга"]];
window.pzPetEmoji=key=>PETS.find(x=>x[0]===key)?.[1]||"🐾";
function language(){return localStorage.getItem("banger_language")||"uk"}
const T=(u,r,e)=>language()==="uk"?u:language()==="en"?e:r;
const bank=()=>typeof db==="undefined"?null:db;
function save(){if(typeof persist==="function")persist()}
function text(id,t){const el=$(id);if(el&&el.textContent!==t)el.textContent=t}
function identity(){
 const d=bank(),p=d?.profile;if(!p?.created)return;
 text("pz-account-name",p.name||"Герой");
 const where=$("v20Where");if(where)where.textContent=(window.pzPetEmoji(p.pet)||"🐾")+" "+p.name+" · "+({home:T("Вдома","Дома","At home"),work:T("На роботі","На работе","At work"),shop:T("У місті","В городе","In town"),gym:T("У залі","В зале","At gym")}[d.location||"home"]||"");
 const pett=document.querySelector(".v20-pet");if(pett){
  const label=p.petName||PETS.find(x=>x[0]===p.pet)?.[2]||"Компаньйон";
  pett.innerHTML='<span style="font-size:56px;line-height:1">'+window.pzPetEmoji(p.pet)+'</span><small></small>';
  pett.querySelector("small").textContent=label; pett.title=label;
 }
 const generic=["BANGER дома","BANGER ДОМА","BANGER на работе","BANGER в городе"];
 document.querySelectorAll(".v20-status,.v20-scene-label,#v20HeroName").forEach(el=>{let val=el.textContent||"";if(generic.some(g=>val.includes(g)))el.textContent=val.replace(/BANGER/gi,p.name)});
 const greeting=$("pz-hero-greeting");if(greeting)greeting.textContent=p.name+" · "+T("твоя пригода","твоё приключение","your adventure");
 const companion=document.querySelector("#companion h2");if(companion)companion.textContent=window.pzPetEmoji(p.pet)+" "+(p.petName||PETS.find(x=>x[0]===p.pet)?.[2]||"Компаньйон");
 const center=$("v23PetLook");if(center){center.innerHTML="<div class='pz-companion-bubble'>"+window.pzPetEmoji(p.pet)+"</div><p>"+(p.petName||"")+"</p>";}
 const input=$("pz-pet-rename");if(input&&document.activeElement!==input)input.value=p.petName||"";
}
function macro(){
 const el=$("todayMacro");if(!el)return;
 const value=el.textContent.trim();
 const result=value.match(/^([\d.,]+)\s*\/\s*([\d.,]+)\s*\/\s*([\d.,]+)\s*г?$/i);
 if(result)el.innerHTML='<span class="pz-macros"><span>'+T("Білки","Белки","Protein")+': <b>'+result[1]+' г</b></span><span>'+T("Жири","Жиры","Fat")+': <b>'+result[2]+' г</b></span><span>'+T("Вуглеводи","Углеводы","Carbs")+': <b>'+result[3]+' г</b></span></span>';
 const parent=el.parentElement;if(parent?.firstChild?.nodeType===3&&/Б\s*\/\s*Ж\s*\/\s*У/.test(parent.firstChild.textContent))parent.firstChild.textContent=T("Білки, жири та вуглеводи","Белки, жиры и углеводы","Macros");
 const entries=document.querySelectorAll("#foodRows .fooddetail");
 entries.forEach(x=>{if(x.dataset.expanded==="1")return;
 x.innerHTML=x.innerHTML.replace(/Б\s*([\d.,—]+)\s*\/\s*Ж\s*([\d.,—]+)\s*\/\s*У\s*([\d.,—]+)/g,(m,a,b,c)=>T("Білки","Белки","Protein")+" "+a+" г · "+T("Жири","Жиры","Fat")+" "+b+" г · "+T("Вуглеводи","Углеводы","Carbs")+" "+c+" г");x.dataset.expanded="1"});
}
function gamification(){
 const box=$("pz-game-explainer");if(!box)return;
 let d=bank(),xp=Number(d?.xp||0),coins=Number(d?.coins||0);
 box.innerHTML='<strong>🎮 '+T("Навіщо XP і монети?","Зачем XP и монеты?","Why XP & coins?")+'</strong><p>'+T("XP отримуєш за підтверджені дії (їжа, сон, вода, тренування). Монети — на одяг та кольори героя. Ще монети можна виграти у міні-грі. Мана та HP приховані, доки не знайдемо їм корисне місце.","XP получаешь за подтверждённые действия (еда, сон, вода, тренировки). Монеты — на одежду и цвета героя. Ещё монеты можно выиграть в мини-игре. Ману и HP пока скрыли как непонятные показатели.","XP rewards logged actions. Coins unlock outfits and colors. Earn extra coins in the mini-game. HP and mana are hidden until they have a clear purpose.")+'</p><small>XP: '+xp+' · '+T("Монети","Монеты","Coins")+': '+coins+'</small>';
}
function companionPanel(){
 const d=bank(),box=$("pz-pets-v61");if(!d?.profile?.created||!box)return;
 const chosen=d.profile.pet;
 box.innerHTML="";
 PETS.forEach(([id,emoji,name])=>{let btn=document.createElement("button");btn.type="button";btn.className="pz-pet-select"+(id===chosen?" selected":"");btn.innerHTML="<span>"+emoji+"</span><small>"+name+"</small>";
 btn.onclick=()=>{d.profile.pet=id;d.profile.petName="";save();identity();companionPanel();if(typeof render==="function")render();identity();};
 box.append(btn)});
}
function moveMenu(){
 const top=$("pz-topbar");if(!top||top.dataset.fixed==="1")return;
 top.dataset.fixed="1";document.body.append(top);
 text("pz-settings","⚙️");
 $("pz-settings")?.setAttribute("aria-label",T("Налаштування і мова","Настройки и язык","Settings and language"));
 top.style.cssText="position:fixed;top:calc(env(safe-area-inset-top, 0px) + 12px);right:12px;z-index:2147482000;pointer-events:auto";
 const menu=$("pz-menu");if(menu){
  menu.style.position="absolute";menu.style.top="48px";menu.style.right="0";menu.style.zIndex="2147483000";
  menu.hidden=true;menu.style.display="none";
 }
}
function actions(){
 const rename=$("pz-pet-save");if(rename&&!rename.dataset.ready){rename.dataset.ready="1";rename.onclick=()=>{const d=bank();if(!d?.profile)return;d.profile.petName=($("pz-pet-rename").value||"").trim().slice(0,40);save();identity();companionPanel()}}
 const renameHero=$("pz-name-save");if(renameHero&&!renameHero.dataset.ready){renameHero.dataset.ready="1";renameHero.onclick=()=>{const d=bank();if(!d?.profile)return;const val=$("pz-hero-rename").value.trim().slice(0,40);if(!val)return;d.profile.name=val;d.characterName=val;save();identity();if(typeof render==="function")render();identity();window.pz3dRefresh?.()}}
}
function tweaks(){
 const d=bank();if(!d?.profile?.created)return;
 moveMenu();identity();macro();gamification();companionPanel();actions();
 const lang=language();
 document.querySelectorAll(".v16-resource").forEach(el=>{if(el.querySelector("#v16Mana"))el.hidden=true});
 const hp=document.querySelector(".v17-hp");if(hp)hp.hidden=true;
 const moods=$("mood");if(moods){const h=moods.closest(".panel");if(h?.querySelector("h2")?.textContent.includes("Статус"))h.hidden=true;}
 const header=document.querySelector(".v16-headline");
 if(header)header.innerHTML=T("ТВОЯ ІСТОРІЯ.<br><em>ТВІЙ ГЕРОЙ.</em>","ТВОЯ ИСТОРИЯ.<br><em>ТВОЙ ГЕРОЙ.</em>","YOUR STORY.<br><em>YOUR HERO.</em>");
 const topbar=document.querySelector(".b29top b");if(topbar)topbar.textContent="V62 · "+(d.profile.name||"ПУЗОПАД");
 const named=$("pz-hero-rename");if(named&&document.activeElement!==named)named.value=d.profile.name||"";
 document.querySelectorAll("#nav button").forEach(el=>{if(el.dataset.tab==="arcade")el.onclick=()=>typeof go==="function"&&go("arcade")});
}
let active=false;
window.pzUiRefresh=()=>{if(!active)return;identity();macro();gamification()};
window.addEventListener("pz:unlocked",()=>{
 active=true;tweaks();
 const macros=$("todayMacro");if(macros&&!macros.dataset.observed){macros.dataset.observed="1";new MutationObserver(()=>{if(!macros.textContent.includes("Белки")&&!macros.textContent.includes("Білки")&&!macros.textContent.includes("Protein"))macro()}).observe(macros,{childList:true,subtree:true,characterData:true})}
});
window.addEventListener("banger:local-save",()=>{if(active){identity();gamification()}});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&active)tweaks()});
})();