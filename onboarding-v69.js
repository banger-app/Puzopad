(function(){
"use strict";
const $=id=>document.getElementById(id);
const URL="https://wsgkqauwukykhmhtinoa.supabase.co";
const KEY="sb_publishable_Aol9Igd8oRMDQHv4f3skaQ_Iql1OxXk";
const SHARED="puzopad_rpg_v4";
const OWNER="pz_owner_v59", PREFIX="pz_private_v59_";
const EMPTY=()=>({weights:[],foods:[],loot:[],quests:{},xp:0,pets:0,location:"home",profile:null,drinks:[],sleeps:[]});
const state={client:null,user:null,ready:false,hydrated:null,busy:false,syncing:false,syncTimer:0,knownRemote:null,recoveryInfo:"",authTransition:0,loadingUid:null,loadingPromise:null,switching:false};
const say=t=>{const el=$("pz-auth-status");if(el)el.textContent=t};
function show(stage){
 document.body.classList.remove("pz-unlocked");document.body.classList.add("pz-locked");document.body.classList.toggle("pz-checking",stage==="loading");
 $("pz-entry").hidden=false;
 ["pz-login","pz-import","pz-create","pz-recover"].forEach(id=>{const node=$(id);if(node)node.hidden=id!=="pz-"+stage});
 if(stage==="create")say("Створення нового героя. Існуючий профіль не буде видалено.");
 if(stage==="recover"){
  const email=$("pz-recover-email");if(email)email.textContent=state.user?.email||"Акаунт увійшов";
  const more=$("pz-recover-more");if(more)more.hidden=true;
  say("Можеш увійти з іншою поштою або перевірити збереження персонажа.");
 }
 if(stage==="create"||stage==="import"){
  const email=$(stage==="create"?"pz-create-email":"pz-import-email");
  if(email)email.textContent=state.user?.email||"";
 }
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
 const petLabel=(hero.petName||({dog:"Собака",cat:"Кіт",turtle:"Черепаха",crocodile:"Крокодил",none:"Без компаньйона"}[hero.pet]||"Компаньйон"));
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
 state.ready=true;document.body.classList.remove("pz-locked","pz-checking");document.body.classList.add("pz-unlocked");
 $("pz-entry").hidden=true;
 const who=$("pz-account-email");if(who)who.textContent=state.user?.email||"Аккаунт";
 const profile=typeof db!=="undefined"?db.profile:null;
 const nickname=$("pz-account-name");if(nickname)nickname.textContent=profile?.name||"Игрок";
 const pets=document.querySelectorAll(".v20-pet");
 if(profile?.pet){pets.forEach(el=>{el.title=profile.petName||profile.pet;el.innerHTML="<span class='pz-personal-pet' style='font-size:57px'>"+(window.pzPetEmoji?.(profile.pet)||"🐾")+"</span>"+"<small>"+(profile.petName||"")+"</small>"})}
 try{render();if(typeof renderDiaryRange==="function")renderDiaryRange();applyGameUi();}catch(err){console.warn("pz render",err)}
 if(!document.getElementById("pz-gym-main")){
  const legacy=document.querySelector("#gym>.panel");
  if(legacy){
   const root=document.createElement("div");root.id="pz-gym-main";
   root.innerHTML='<h2>🏋️ Тренувальний зал</h2><p>Візуальні тренування: обери план, почни таймер та підтверди фактично зроблене.</p><div id="pz-gym-zone"></div><p id="pz-gym-status" role="status"></p><div id="pz-gym-history"></div>';
   legacy.insertBefore(root,legacy.firstChild);
   const style=document.createElement("style");style.id="pz-gym-v62-css";
   style.textContent='#gym>.panel>:not(#pz-gym-main){display:none!important}.pz-gym-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}.pz-gym-card{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;min-height:155px;padding:16px!important;border:1px solid #845b8b!important;border-radius:19px!important;background:linear-gradient(155deg,#2b2541,#131b2d)!important}.pz-gym-card.selected{border-color:#fb53b0!important;background:linear-gradient(140deg,#6b2456,#2c2139)!important}.pz-gym-emoji{font-size:52px}.pz-gym-card strong{font-size:17px}.pz-gym-card small{font-size:12px;color:#c5c6da}.pz-gym-steps{display:grid;gap:8px;margin:13px 0}.pz-gym-steps button{text-align:left;white-space:normal}.pz-gym-active{padding:14px;border:1px solid #d45aa6;background:#1d2438;border-radius:19px;margin:12px 0}.pz-gym-clock{font-size:41px;text-align:center;font-weight:900;letter-spacing:2px;margin:15px}.pz-gym-history-row{padding:9px;background:#252b3e;border-radius:9px;font-size:13px}#pz-gym-status{color:#c2bbd9;font-size:13px}';
   document.head.appendChild(style);
   const script=document.createElement("script");script.id="pz-gym-v62-loader";script.src="./gym-reborn-v80.js?v=80.2";document.body.append(script);
  }
 }
 window.dispatchEvent(new CustomEvent("pz:unlocked",{detail:{userId:state.user?.id||null}}));
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

const remoteKey=()=>state.user?"pz_cloud_version_v64_"+state.user.id:null;
function localCandidate(uid){
 const values=[
  localStorage.getItem(PREFIX+uid),
  localStorage.getItem(OWNER)===uid?localStorage.getItem(SHARED):null
 ];
 for(const raw of values){
  if(!raw)continue;
  try{const value=JSON.parse(raw);if(value?.profile?.created&&value.profile?.name)return value}catch(_){}
 }
 return null;
}
async function getCloudRow(uid){
 const r=await state.client.from("journal_entries").select("id,details,created_at")
  .eq("user_id",uid).eq("external_id","bangerverse_full_save_v1").limit(1).maybeSingle();
 if(r.error)throw r.error;
 return r.data||null;
}
function cloudCandidate(row){
 const d=row?.details?.data;
 return d&&typeof d==="object"&&d.profile?.created&&d.profile?.name?d:null;
}
function hasLegacyProgress(data){
 if(!data||typeof data!=="object"||data.profile?.created)return false;
 return ["weights","foods","loot","water","sleep","workouts","drinks"].some(key=>Array.isArray(data[key])&&data[key].length>0)
   ||!!data.b36garage?.cars?.length||!!data.garage?.cars?.length;
}
function scopedLegacy(uid){
 const keys=[PREFIX+uid];
 if(localStorage.getItem(OWNER)===uid)keys.push(SHARED);
 for(const k of keys){try{const p=JSON.parse(localStorage.getItem(k)||"null");if(hasLegacyProgress(p))return p}catch(_){}}
 return null;
}
function continueLegacy(uid,value,isCloud,row){
 if(!confirm("Знайдено СТАРИЙ журнал цього акаунта без оформленого профілю. Зберегти його і підтвердити ім'я героя? Нічого не очищається."))return;
 try{
  const older=localStorage.getItem(PREFIX+uid);
  if(older)localStorage.setItem("pz_legacy_before_migration_v65_"+uid+"_"+Date.now(),older);
  if(isCloud&&row?.details){
   localStorage.setItem("pz_cloud_before_migration_v65_"+uid,JSON.stringify(row.details));
   localStorage.setItem(remoteKey(),row.details.saved_at||"migration_user_approved");
  }
  load(value,uid);state.hydrated=uid;
  show("create");
  const oldName=typeof value.characterName==="string"&&value.characterName!=="Игрок"?value.characterName:"";
  $("pz-hero-name").value=oldName;
  say("✅ Відновлено стару історію. Укажи ім'я та компаньйона; їжа, вага й речі залишаться.");
 }catch(err){say("Відновлення не вдалось: "+err.message)}
}
function snapshotCloudData(){
 return JSON.parse(JSON.stringify(db));
}
async function pushCloud(profileCreation=false){
 const uid=state.user?.id;
 if(!uid||window.pzActiveUserId!==uid||state.hydrated!==uid||state.syncing||!db?.profile?.created||db.profile.provisional)return false;
 state.syncing=true;
 try{
  const local=snapshotCloudData(),row=await getCloudRow(uid);
  if(state.user?.id!==uid)return false;
  const prior=cloudCandidate(row);
  const remoteVersion=row?.details?.saved_at||null;
  const known=localStorage.getItem(remoteKey())||null;
  if(row?.details?.data&&!prior&&!known){
   say("⚠️ У хмарі є давній журнал без профілю. Автоматично його не перезаписуємо — відкрий налаштування збережень.");
   return false;
  }
  if(prior&&(!known||known!==remoteVersion)){
   const conflicts=JSON.stringify(prior)!==JSON.stringify(local);
   if(conflicts){say("⚠️ У хмарі є інша версія героя. Нічого не перезаписано; відкрий налаштування збережень.");return false}
   localStorage.setItem(remoteKey(),remoteVersion||"");
   return true;
  }
  const now=new Date().toISOString();
  const details={schema:2,saved_at:now,data:local};
  let result;
  if(row){
   let query=state.client.from("journal_entries").update({details}).eq("id",row.id).eq("user_id",uid);
   if(remoteVersion)query=query.eq("details->>saved_at",remoteVersion);
   result=await query.select("id");
   if(!result.error&&result.data?.length!==1)throw Error("Хмарний запис змінився на іншому пристрої");
  }else{
   result=await state.client.from("journal_entries").insert({user_id:uid,entry_type:"cloud_save",title:"ПУЗОПАД — особисте збереження",external_id:"bangerverse_full_save_v1",details}).select("id");
  }
  if(result.error)throw result.error;
  localStorage.setItem(remoteKey(),now);
  state.knownRemote=now;
  if(profileCreation)say("✅ Героя створено та збережено в акаунті.");
  return true;
 }catch(e){
  say("⚠️ Герой збережений на пристрої, але хмара поки недоступна: "+(e.message||e));
  return false;
 }finally{state.syncing=false}
}
function scheduleCloud(){
 if(!state.user||state.hydrated!==state.user.id||!window.pzActiveUserId||!db?.profile?.created||db.profile.provisional)return;
 if(localStorage.getItem("bangerverse_autosync32_"+state.user.id)==="1")return;
 clearTimeout(state.syncTimer);state.syncTimer=setTimeout(()=>pushCloud(false),3500);
}
function recoverReason(message){
 state.recoveryInfo=message;
 show("recover");
}

const playable=(data)=>{
 const v=data&&typeof data==="object"?JSON.parse(JSON.stringify(data)):EMPTY();
 if(!v.profile?.created){const p=v.profile||{};v.profile={...p,created:true,provisional:true,name:p.name||v.characterName||"Мій герой",species:p.species||"frog",pet:p.pet||"none",petName:p.petName||""}}
 return v;
};
function note(message){
 const el=$("pz-save-banner");if(!el)return;
 el.hidden=!message;el.replaceChildren();if(!message)return;
 const p=document.createElement("p");p.textContent=message;el.append(p);
 const action=document.createElement("button");action.type="button";action.textContent="Збереження";action.onclick=()=>{show("recover");const back=$("pz-recover-back");if(back)back.hidden=false};el.append(action);
}
async function signedIn(user){
 if(!user?.id){if(!state.switching){state.user=null;state.hydrated=null;state.ready=false;window.pzActiveUserId=null;show("login")}return}
 const uid=user.id;if(state.ready&&state.hydrated===uid)return;
 if(state.loadingUid===uid&&state.loadingPromise)return state.loadingPromise;
 state.user=user;const ticket=++state.authTransition;
 const job=(async()=>{
  const local=localCandidate(uid)||scopedLegacy(uid);
  if(local){load(playable(local),uid);state.hydrated=uid;unlock();note("")}
  let row=null,remote=null,err=null;
  try{row=await getCloudRow(uid);remote=row?.details?.data||null}catch(e){err=e}
  if(state.user?.id!==uid||ticket!==state.authTransition)return;
  if(!local){
   const game=playable(remote);if(row?.details?.saved_at)try{localStorage.setItem(remoteKey(),row.details.saved_at)}catch(_){}
   if(remote&&!remote.profile?.created)try{localStorage.setItem("pz_cloud_legacy_safety_v69_"+uid,JSON.stringify(row.details))}catch(_){}
   load(game,uid);state.hydrated=uid;unlock();
   if(!remote)note(err?"Хмарне збереження зараз недоступне. Локальні записи не видалялися.":"Щоденник порожній. Налаштувати героя можна в Гардеробі.");
   else if(game.profile.provisional)note("Старий щоденник відкрито. Ім'я та зовнішність налаштовуються у Гардеробі.");
  }else if(remote){
   if(JSON.stringify(remote)!==JSON.stringify(local)){
    try{localStorage.setItem("pz_cloud_review_v69_"+uid,JSON.stringify(row.details))}catch(_){}
    note("У хмарі є ще одна версія. Локальний прогрес відкрито без перезапису.");
   }else if(row?.details?.saved_at){try{localStorage.setItem(remoteKey(),row.details.saved_at)}catch(_){}}
  }else if(!err&&!local.profile?.provisional){scheduleCloud()}
 })();
 state.loadingUid=uid;state.loadingPromise=job;
 try{await job}finally{if(state.loadingUid===uid){state.loadingUid=null;state.loadingPromise=null}}
}
async function restoreCloud(){
 if(!state.user)return;
 const uid=state.user.id;
 try{
  const row=await getCloudRow(uid),found=cloudCandidate(row);
  if(!found&&hasLegacyProgress(row?.details?.data)){continueLegacy(uid,row.details.data,true,row);return}
  if(!found){say("⚠️ У хмарі поки немає героя цього акаунта. Нічого не замінювали.");return}
  const local=localCandidate(uid);
  if(local&&JSON.stringify(local)!==JSON.stringify(found)){
    const backupKey="pz_recovery_backup_v64_"+uid+"_"+Date.now();
    localStorage.setItem(backupKey,JSON.stringify(local));
    if(!confirm("Знайдено різне локальне збереження. Ми зробили його резервну копію. Відкрити хмарну версію?"))return;
  }
  load(found,uid);state.hydrated=uid;
  if(row?.details?.saved_at)localStorage.setItem(remoteKey(),row.details.saved_at);
  unlock();
 }catch(e){say("Помилка відновлення: "+(e.message||e))}
}
function restoreLocal(){
 const uid=state.user?.id;
 if(!uid)return;
 const local=localCandidate(uid);
 if(!local){
  const old=scopedLegacy(uid);
  if(old){continueLegacy(uid,old,false,null);return}
  say("Локального героя цього акаунта не знайдено.");return;
 }
 load(local,uid);state.hydrated=uid;unlock();
}
async function restoreFile(file){
 if(!state.user||!file)return;
 if(file.size>15*1024*1024){say("Файл завеликий. Максимум 15 МБ.");return}
 try{
  const parsed=JSON.parse(await file.text());
  const payload=parsed?.entries?.puzopad_rpg_v4||parsed?.details?.data||parsed?.data||parsed?.real||parsed?.save?.real||parsed?.backup?.data||parsed;
  if(!payload?.profile?.created||!payload.profile.name||!Array.isArray(payload.foods)||!Array.isArray(payload.weights))throw Error("Потрібен JSON-запис ПУЗОПАДА з героєм і журналами");
  if(!confirm("Імпортувати персонажа «"+payload.profile.name+"» в цей акаунт? Збереження на цьому пристрої буде скопійоване перед заміною."))return;
  const old=localStorage.getItem(SHARED);
  if(old)localStorage.setItem("pz_recovery_backup_v64_"+Date.now(),old);
  load(payload,state.user.id);state.hydrated=state.user.id;unlock();
  await pushCloud(true);
 }catch(e){say("Не вдалося відновити файл: "+(e.message||e))}
}

function fromOld(){
 const uid=state.user?.id;if(!uid)return;
 const oldOwner=localStorage.getItem(OWNER);
 if(oldOwner&&oldOwner!==uid){say("Це збереження належить іншому акаунту. Скористайся імпортом JSON, якщо це твій герой.");return}
 const backup=localStorage.getItem("pz_legacy_backup_v59");
 const raw=(oldOwner===uid?localStorage.getItem(SHARED):null)||(!oldOwner?backup:null);
 if(!raw){say("Попереднє збереження на цьому екрані не знайдене.");return}
 try{
  const data=JSON.parse(raw);
  if(!confirm("Прив'язати попередній локальний прогрес до цього акаунта?"))return;
  load(data,uid);state.hydrated=uid;
  if(!db.profile?.created){state.recoveryInfo="Історію знайдено, але герой ще не мав профілю. Можеш створити ім'я, історію збережемо.";show("create")}
  else{unlock();pushCloud(true)}
 }catch(e){say("Не вдалося імпортувати: "+e.message)}
}
function newGame(){
 const uid=state.user?.id;if(!uid)return;
 if(!confirm("Створити НОВОГО героя для поточного акаунта? Переконайся, що старий герой не лишився в іншій установленій версії ПУЗОПАДА."))return;
 const local=localCandidate(uid);
 if(local)localStorage.setItem("pz_recovery_backup_v64_"+uid+"_"+Date.now(),JSON.stringify(local));
 load(EMPTY(),uid);state.hydrated=uid;show("create");
}
async function profileMade(){
 if(!state.user)return;
 const name=($("pz-hero-name").value||"Герой").trim().slice(0,40);
 const pet=$("pz-pet-choice").value;
 const species=$("pz-species").value;
 if(!name){say("Выбери имя персонажа");return}
 const profile={created:true,name,species,pet,petName:($("pz-pet-name")?.value||"").trim().slice(0,40),location:"home",outfit:"casual"};
 db.profile=profile;
 if(species==="frog")db.characterName=name;
 if(typeof persist==="function")persist();
 state.hydrated=state.user.id;unlock();
 await pushCloud(true);
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
let googleEnabled=false;
async function checkGoogleProvider(){
 const btn=$("pz-google"),note=$("pz-google-note"),label=$("pz-google-label");
 if(!btn)return;
 googleEnabled=false;
 btn.disabled=true;btn.setAttribute("aria-disabled","true");
 if(label)label.textContent="Проверяю вход Google...";
 if(note)note.textContent="Проверяю настройку Google-входа.";
 try{
  const response=await fetch(URL+"/auth/v1/settings",{headers:{"apikey":KEY},cache:"no-store"});
  if(!response.ok)throw Error("Настройки входа недоступны");
  const data=await response.json();
  googleEnabled=data?.external?.google===true;
  btn.disabled=!googleEnabled;
  btn.setAttribute("aria-disabled",String(!googleEnabled));
  if(label)label.textContent=googleEnabled?"Продолжить с Google":"Google — пока недоступен";
  if(note)note.textContent=googleEnabled?"Войди одним нажатием с Google-аккаунтом.":"Вход Google пока не подключён. Используй регистрацию по email и отдельному паролю ПУЗОПАДА.";
 }catch(_err){
  if(label)label.textContent="Google — пока недоступен";
  if(note)note.textContent="Не удалось проверить Google-вход. Вход по email остаётся доступен.";
 }
}
async function signInGoogle(){
 if(!googleEnabled){say("Google-вход пока не подключён в Supabase. Используй email и отдельный пароль ПУЗОПАДА.");return}
 try{
  if(!state.client)throw Error("Авторизация не загрузилась");
  const response=await fetch(URL+"/auth/v1/settings",{headers:{"apikey":KEY},cache:"no-store"});
  const providers=response.ok?await response.json():null;
  if(!providers?.external?.google){googleEnabled=false;await checkGoogleProvider();say("Google-вход ещё не подключён. Используй email и пароль.");return}
  say("Открываю Google...");
  const {error}=await state.client.auth.signInWithOAuth({provider:"google",options:{redirectTo:"https://banger-app.github.io/Puzopad/"}});
  if(error)throw error;
 }catch(e){say("Не удалось начать вход через Google: "+e.message)}
}

function snapshotBeforeSwitch(){
 const uid=state.user?.id;
 if(!uid||window.pzActiveUserId!==uid||state.hydrated!==uid||typeof db==="undefined")return;
 const payload=JSON.stringify(db);
 if(db?.profile?.created&&db.profile?.name){
  localStorage.setItem(PREFIX+uid,payload);
  if(!localStorage.getItem("pz_switch_backup_v65_"+uid))localStorage.setItem("pz_switch_backup_v65_"+uid,payload);
 }
}
async function switchAccount(){
 if(state.busy)return;
 if(!state.client?.auth){say("Система входу ще не готова.");return}
 state.busy=true;state.switching=true;
 try{
  snapshotBeforeSwitch();
  clearTimeout(state.syncTimer);
  const {error}=await state.client.auth.signOut({scope:"local"});
  if(error)throw error;
  state.authTransition++;
  state.user=null;state.hydrated=null;state.ready=false;
  window.pzActiveUserId=null;
  const email=$("pz-email"),password=$("pz-pass");
  if(email)email.value="";
  if(password)password.value="";
  menu(false);
  show("login");
  say("Вибери іншу пошту та увійди. Старі профілі збережено окремо.");
 }catch(err){say("Не вдалося змінити акаунт: "+(err.message||err))}
 finally{state.busy=false;state.switching=false}
}
function toggleRecovery(){
 const box=$("pz-recover-more");if(!box)return;
 box.hidden=!box.hidden;
 const button=$("pz-recover-expand");
 if(button)button.setAttribute("aria-expanded",String(!box.hidden));
}
function menu(open){const el=$("pz-menu");if(!el)return;el.hidden=!open;el.style.display=open?"flex":"none";$("pz-settings")?.setAttribute("aria-expanded",String(open));}
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
 $("pz-recover-refresh").onclick=()=>{if(!state.user)return;state.hydrated=null;state.ready=false;signedIn(state.user)};
 $("pz-recover-switch").onclick=switchAccount;
 $("pz-recover-back").onclick=()=>{if(state.ready)unlock();else show("login")};
 $("pz-create-switch").onclick=switchAccount;
 $("pz-import-switch").onclick=switchAccount;
 $("pz-recover-expand").onclick=toggleRecovery;
 $("pz-switch-account").onclick=switchAccount;
 $("pz-recover-cloud").onclick=restoreCloud;
 $("pz-recover-local").onclick=restoreLocal;
 $("pz-recover-import").onclick=()=>$("pz-recover-file").click();
 $("pz-recover-file").onchange=e=>{const file=e.target.files?.[0];if(file)restoreFile(file)};
 $("pz-recover-new").onclick=newGame;
 $("pz-settings").onclick=e=>{e.preventDefault();e.stopPropagation();menu(!$("pz-menu").hidden)};
 $("pz-archive").onclick=()=>{if(typeof v20ExportAll==="function")v20ExportAll();else alert("Перейди в настройки резервных копий");};
 $("pz-settings-close").onclick=()=>menu(false);
 $("pz-open-account").onclick=()=>{menu(false);$("cloud31open")?.click()};
 // One visible switch-account action; no duplicate sign-out buttons.
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
 show("loading");setup();
 window.addEventListener("banger:local-save",scheduleCloud);
 window.addEventListener("pagehide",()=>clearTimeout(state.syncTimer));
 if(!window.supabase?.createClient){show("login");say("Не вдалося підключити вхід. Перевір інтернет.");return}
 try{
  state.client=window.pzSupabaseShared||(window.pzSupabaseShared=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
  state.client.auth.onAuthStateChange((event,session)=>{
   if(event==="SIGNED_OUT"){
    if(state.switching)return;
    if(state.user?.id&&window.pzActiveUserId===state.user.id&&state.hydrated===state.user.id&&db?.profile?.created)try{localStorage.setItem(PREFIX+state.user.id,JSON.stringify(db))}catch(_){}
    state.user=null;state.hydrated=null;state.ready=false;window.pzActiveUserId=null;show("login");
   }else if((event==="SIGNED_IN"||event==="INITIAL_SESSION")&&session?.user){
    Promise.resolve().then(()=>signedIn(session.user));
   }
  });
  const {data,error}=await state.client.auth.getSession();if(error)throw error;
  if(data?.session?.user)await signedIn(data.session.user);
  else if(!state.ready)show("login");
  checkGoogleProvider();
 }catch(e){if(!state.ready){show("login");say("Не вдалося відновити вхід: "+e.message)}}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
