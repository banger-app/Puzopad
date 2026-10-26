(function(){
"use strict";
const $=id=>document.getElementById(id);
const URL="https://wsgkqauwukykhmhtinoa.supabase.co";
const KEY="sb_publishable_Aol9Igd8oRMDQHv4f3skaQ_Iql1OxXk";
const SHARED="puzopad_rpg_v4";
const OWNER="pz_owner_v59", PREFIX="pz_private_v59_";
const EMPTY=()=>({weights:[],foods:[],loot:[],quests:{},xp:0,pets:0,location:"home",profile:null,drinks:[],sleeps:[]});
const state={client:null,user:null,ready:false,hydrated:null,busy:false};
const say=t=>{const el=$("pz-auth-status");if(el)el.textContent=t};
function show(stage){
 document.body.classList.remove("pz-unlocked");document.body.classList.add("pz-locked");
 $("pz-entry").hidden=false;
 ["pz-login","pz-import","pz-create"].forEach(id=>$(id).hidden=id!=="pz-"+stage);
 if(stage==="login")$("pz-email")?.focus();
}

function applyGameUi(){
 if(typeof db==="undefined")return;
 const hero=db.profile||null;
 const weight=document.getElementById("currentWeight");
 if(weight?.parentElement){
  const label=weight.parentElement.querySelector("small");
  if(label)label.textContent=db.weights?.length?"Старт "+db.weights[0].kg+" кг · цель 90 → 85 кг":"Вес ещё не записан — начни с первого взвешивания";
 }
 const home=document.getElementById("home");
 const summary=home?.querySelector(".v17-home-summary");
 if(home&&summary&&!summary.dataset.pzMoved){home.insertBefore(summary,home.firstElementChild);summary.dataset.pzMoved="1"}
 home?.querySelectorAll(".actionrow").forEach(el=>{if(el.querySelector("button[onclick*='store']"))el.classList.add("pz-hide-technical")});
 home?.querySelectorAll(".v22-timeline").forEach(el=>el.classList.add("pz-hide-technical"));
 const archive=document.getElementById("pz-archive");
 if(archive)archive.onclick=()=>{const fn=typeof v20ExportAll==="function"?v20ExportAll:null;if(fn)fn();else alert("Архив пока недоступен — используй раздел «Сохранения»")};
 if(!hero?.created)return;
 const petLabel={dog:"🐩 Собака",cat:"🐈 Кот",turtle:"🐢 Черепаха",crocodile:"🐊 Крокодил",none:"✨ Без компаньона"}[hero.pet]||"🐾 Компаньон";
 const comp=document.querySelector("#companion h2");if(comp)comp.textContent=petLabel+" · компаньон";
 const petButtons=home?.querySelectorAll("button");
 petButtons?.forEach(el=>{if(el.textContent.includes("Суречка"))el.textContent=petLabel});
 const title=home?.querySelector(".v16-eyebrow");
 if(title)title.textContent=(hero.name||"ГЕРОЙ").toUpperCase()+" / ШТАБ";
 const avatar=document.getElementById("v20AvatarSlot");
 if(avatar&&hero.species!=="frog"){
  avatar.innerHTML='<div class="pz-avatar-standin" aria-label="Прототип персонажа">'+(hero.species==="robot"?"🤖":"🧑")+'<small>3D-модель в разработке</small></div>';
 }
}
function unlock(){
 state.ready=true;document.body.classList.remove("pz-locked");document.body.classList.add("pz-unlocked");
 $("pz-entry").hidden=true;
 const who=$("pz-account-email");if(who)who.textContent=state.user?.email||"Аккаунт";
 const profile=typeof db!=="undefined"?db.profile:null;
 const nickname=$("pz-account-name");if(nickname)nickname.textContent=profile?.name||"Игрок";
 const pets=document.querySelectorAll(".v20-pet");
 if(profile?.pet&&profile.pet!=="dog"){pets.forEach(el=>{el.title=profile.pet;el.innerHTML="<span style='font-size:60px'>"+({cat:"🐈",turtle:"🐢",crocodile:"🐊",none:"✨"}[profile.pet]||"🐾")+"</span>"})}
 try{render();if(typeof renderDiaryRange==="function")renderDiaryRange();applyGameUi();}catch(err){console.warn("pz render",err)}
}
function snapshot(value){try{return JSON.stringify(value)}catch(_){return null}}
function load(value,accountId){
 const data=value&&typeof value==="object"?value:EMPTY();
 data.weights=Array.isArray(data.weights)?data.weights:[];
 data.foods=Array.isArray(data.foods)?data.foods:[];
 data.loot=Array.isArray(data.loot)?data.loot:[];
 data.quests=data.quests&&typeof data.quests==="object"?data.quests:{};
 if(typeof db!=="undefined")db=data;
 if(typeof realDb!=="undefined")realDb=data;
 localStorage.setItem(SHARED,JSON.stringify(data));
 localStorage.setItem(PREFIX+accountId,JSON.stringify(data));
 localStorage.setItem(OWNER,accountId);
 window.pzActiveUserId=accountId;
}
async function cloudSaveFor(uid){
 try{
 const {data,error}=await state.client.from("journal_entries").select("details")
 .eq("user_id",uid).eq("external_id","bangerverse_full_save_v1").limit(1).maybeSingle();
 if(error)throw error;
 return data?.details?.data||null;
 }catch(e){say("Облако не отвечает: "+e.message+". Сначала проверим локальные данные.");return null}
}
async function signedIn(user){
 if(!user?.id){state.user=null;state.hydrated=null;window.pzActiveUserId=null;show("login");return}
 state.user=user;
 if(state.hydrated===user.id&&state.ready){unlock();return}
 const uid=user.id;
 const existing=localStorage.getItem(PREFIX+uid);
 if(existing){
  try{load(JSON.parse(existing),uid);state.hydrated=uid;
  if(db.profile?.created||db.weights?.length||db.foods?.length||db.b36garage?.cars?.length)unlock();
  else show("create");return;
  }catch(e){console.warn("Invalid local profile",e)}
 }
 say("Проверяю сохранение аккаунта...");
 const cloud=await cloudSaveFor(uid);
 if(state.user?.id!==uid)return;
 if(cloud){
  load(cloud,uid);state.hydrated=uid;
  if(db.profile?.created||db.weights?.length||db.foods?.length||db.b36garage?.cars?.length)unlock();
  else show("create");
  return;
 }
 const previous=localStorage.getItem(SHARED);
 const assigned=localStorage.getItem(OWNER);
 const old=previous&&previous.length>80;
 if(old&&(!assigned||assigned===uid)&&!localStorage.getItem(PREFIX+uid)){
  try{
   const backup="pz_legacy_backup_v59";
   if(!localStorage.getItem(backup))localStorage.setItem(backup,previous);
  }catch(_){}
  $("pz-import-desc").textContent="На этом iPhone найден прежний локальный прогресс. Он может содержать твой вес, еду, автомобиль и питомца. Привязать именно его к "+(user.email||"этому аккаунту")+"?";
  show("import");return;
 }
 load(EMPTY(),uid);state.hydrated=uid;show("create");
}
function fromOld(){
 if(!state.user)return;
 const legacy=localStorage.getItem("pz_legacy_backup_v59")||localStorage.getItem(SHARED);
 if(!legacy){say("Предыдущий прогресс не найден.");return}
 try{load(JSON.parse(legacy),state.user.id);state.hydrated=state.user.id;unlock()}
 catch(e){say("Не удалось импортировать прогресс: "+e.message)}
}
function newGame(){
 if(!state.user)return;
 const uid=state.user.id;
 if(!localStorage.getItem("pz_legacy_backup_v59")){
  const old=localStorage.getItem(SHARED);
  if(old&&old.length>80)localStorage.setItem("pz_legacy_backup_v59",old);
 }
 load(EMPTY(),uid);state.hydrated=uid;show("create");
}
function profileMade(){
 if(!state.user)return;
 const name=($("pz-hero-name").value||"Герой").trim().slice(0,40);
 const pet=$("pz-pet-choice").value;
 const species=$("pz-species").value;
 if(!name){say("Выбери имя персонажа");return}
 const profile={created:true,name,species,pet,location:"home",outfit:"casual"};
 db.profile=profile;
 if(species==="frog")db.characterName=name;
 if(typeof persist==="function")persist();
 state.hydrated=state.user.id;unlock();
}
async function signIn(email,password,signup){
 if(state.busy)return;
 if(!email||!email.includes("@")||password.length<6){say("Укажи почту и пароль от 6 символов.");return}
 state.busy=true;
 say("Подключаюсь...");
 try{
 const method=signup?"signUp":"signInWithPassword";
 const {data,error}=await state.client.auth[method]({email,password});
 if(error)throw error;
 if(signup&&!data.session){say("Проверь почту и подтверди регистрацию. Затем войди.");return}
 if(data.session?.user)await signedIn(data.session.user);
 }catch(e){say("Ошибка входа: "+e.message)}finally{state.busy=false}
}
async function signInGoogle(){
 try{
  if(!state.client)throw Error("Авторизация не загрузилась");
  say("Открываю Google...");
  const {error}=await state.client.auth.signInWithOAuth({provider:"google",options:{redirectTo:"https://banger-app.github.io/Puzopad/"}});
  if(error)throw error;
 }catch(e){say("Google-вход пока недоступен: "+e.message+". Используй вход по почте.")}
}
function menu(open){$("pz-menu").hidden=!open}
function setLangNav(){
 const lang=localStorage.getItem("banger_language")||"uk";
 const byid={home:["Штаб","Штаб","Home"],city:["Місто","Город","City"],diary:["Їжа","Еда","Food"],fridge:["Холодильник","Холодильник","Fridge"],drinks:["Напої","Напитки","Drinks"],sleep:["Сон","Сон","Sleep"],weight:["Вага","Вес","Weight"],charts:["Графіки","Графики","Charts"],fuel:["Гараж","Гараж","Garage"],gym:["Зал","Зал","Gym"],companion:["Компаньйон","Компаньон","Companion"],quests:["Завдання","Задания","Quests"],wardrobe:["Гардероб","Гардероб","Wardrobe"]};
 const index=lang==="uk"?0:lang==="ru"?1:2;
 document.querySelectorAll("nav#nav button").forEach(el=>{const tab=el.dataset.tab;if(byid[tab]&&!el.dataset.pzEmoji)el.dataset.pzEmoji=(el.textContent.match(/^\s*\S+/)||[""])[0];if(byid[tab]){const next=(el.dataset.pzEmoji||"")+" "+byid[tab][index];if(el.textContent!==next)el.textContent=next}});
 const headline=document.querySelector(".v16-eyebrow");if(headline)headline.textContent=lang==="uk"?"ШТАБ ПЕРСОНАЖА":lang==="en"?"CHARACTER HQ":"ШТАБ ПЕРСОНАЖА";
 const slogan=document.querySelector(".v16-headline");if(slogan)slogan.innerHTML=lang==="uk"?"ТВОЯ ІСТОРІЯ.<br><em>ТВІЙ ГЕРОЙ.</em>":lang==="en"?"YOUR STORY.<br><em>YOUR HERO.</em>":"ТВОЯ ИСТОРИЯ.<br><em>ТВОЙ ГЕРОЙ.</em>";
 const intro=document.querySelector(".v16-intro");if(intro)intro.textContent=lang==="uk"?"Тут живе твій герой. Їжа, сон, тренування та прогрес — реальні. Пригоди та нагороди — ігрові.":lang==="en"?"Your hero lives here. Meals, sleep and training are real; quests and rewards are a game.":"Здесь живёт твой герой. Питание, сон и тренировки — настоящие; задания и награды — игровые.";
 const clean={store:true,loot:true,save:true};
 document.querySelectorAll("nav#nav button").forEach(el=>{if(clean[el.dataset.tab])el.hidden=true});
 const h=document.querySelector('nav#nav button[data-tab="fridge"]');
 if(h)h.title="Продукты дома и на работе; можно записать съеденное";
}
function setup(){
 $("pz-email-signin").onclick=()=>signIn($("pz-email").value.trim(),$("pz-pass").value,false);
 $("pz-email-signup").onclick=()=>signIn($("pz-email").value.trim(),$("pz-pass").value,true);
 $("pz-google").onclick=signInGoogle;
 $("pz-old-import").onclick=fromOld;
 $("pz-old-new").onclick=newGame;
 $("pz-new-create").onclick=profileMade;
 $("pz-settings").onclick=()=>menu(!$("pz-menu").hidden);
 $("pz-archive").onclick=()=>{if(typeof v20ExportAll==="function")v20ExportAll();else alert("Перейди в настройки резервных копий");};
 $("pz-settings-close").onclick=()=>menu(false);
 $("pz-open-account").onclick=()=>{menu(false);$("cloud31open")?.click()};
 $("pz-signout").onclick=async()=>{
  try{
   if(state.user?.id&&typeof db!=="undefined")localStorage.setItem(PREFIX+state.user.id,JSON.stringify(db));
   const {error}=await state.client.auth.signOut();
   if(error)throw error;
   window.pzActiveUserId=null;state.ready=false;state.user=null;state.hydrated=null;menu(false);show("login");
  }catch(e){say("Ошибка выхода: "+e.message)}
 };
 $("pz-language").value=localStorage.getItem("banger_language")||"uk";
 $("pz-language").onchange=e=>{localStorage.setItem("banger_language",e.target.value);
  const orig=document.getElementById("banger-language-select");if(orig){orig.value=e.target.value;orig.dispatchEvent(new Event("change",{bubbles:true}))}
  setLangNav();
 };
 const observer=new MutationObserver(()=>{clearTimeout(setup.t);setup.t=setTimeout(setLangNav,250)});
 const nav=$("nav");if(nav)observer.observe(nav,{childList:true,subtree:true,characterData:true});
 setLangNav();
}
async function boot(){
 show("login");setup();
 if(!window.supabase?.createClient){say("Не удалось загрузить систему входа. Проверь интернет и открой сайт ещё раз.");return}
 try{
 state.client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 state.client.auth.onAuthStateChange((event,session)=>{
  if(event==="SIGNED_OUT"){if(state.user?.id&&typeof db!=="undefined"){try{localStorage.setItem(PREFIX+state.user.id,JSON.stringify(db))}catch(_){}}state.ready=false;state.user=null;state.hydrated=null;window.pzActiveUserId=null;show("login");}
  else if(event==="SIGNED_IN"||event==="INITIAL_SESSION"){Promise.resolve().then(()=>signedIn(session?.user||null));}
 });
 const {data,error}=await state.client.auth.getSession();if(error)throw error;
 await signedIn(data?.session?.user||null);
 }catch(e){say("Не удалось проверить аккаунт: "+e.message)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();