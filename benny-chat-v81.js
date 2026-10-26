/* BANGERVERSE v81 — chat-first Benny with multi-image composer.
 * All existing food/cloud/garage data stays owned by the current logged-in user.
 * Photos are sent to the AI endpoint on demand; they are not written to the photo database.
 */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const modal=$("bai-modal"),panel=$("bai-panel"),log=$("bai-log"),fileInput=$("bai-file"),input=$("bai-input"),send=$("bai-send");
if(!modal||!panel||!log||!fileInput||!input||!send)return;
const API="https://wsgkqauwukykhmhtinoa.supabase.co";
const PUB="sb_publishable_Aol9Igd8oRMDQHv4f3skaQ_Iql1OxXk";
let draft=[],sending=false,uid=null,historyLoaded=false,replyVoice=false,activeReply=null;
const MAX_PHOTOS=5,MAX_ORIGINAL=14*1024*1024;
const tr={
 ru:{intro:"Привет! Я Бенни. Чем помочь?",input:"Спроси Бенни…",photos:"Фото",listen:"Озвучивать ответы",stop:"Без озвучки",clear:"Убрать фото",send:"Отправить",loading:"Разбираю сообщение",camera:"Камера",noSpeech:"Голосовой ответ недоступен на этом устройстве",limit:"Можно прикрепить до пяти изображений",oversize:"Фото слишком большое (до 14 МБ до сжатия)",tryAgain:"Повторить отправку"},
 uk:{intro:"Привіт! Я Бенні. Чим допомогти?",input:"Запитай Бенні…",photos:"Фото",listen:"Озвучувати відповіді",stop:"Без озвучування",clear:"Прибрати фото",send:"Надіслати",loading:"Аналізую повідомлення",camera:"Камера",noSpeech:"Озвучування недоступне на цьому пристрої",limit:"Можна прикріпити до п'яти зображень",oversize:"Фото завелике (до 14 МБ до стиснення)",tryAgain:"Повторити надсилання"},
 en:{intro:"Hey! I'm Benny. How can I help?",input:"Message Benny…",photos:"Photos",listen:"Speak replies",stop:"Mute replies",clear:"Remove image",send:"Send",loading:"Analyzing message",camera:"Camera",noSpeech:"Speech playback unavailable",limit:"Attach up to five images",oversize:"Image too large (14 MB maximum before resizing)",tryAgain:"Retry send"}};
const lang=()=>{const k=localStorage.getItem("banger_language")||"uk";return tr[k]?k:"uk"};
const T=k=>tr[lang()][k];
const node=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=String(txt);return x};
const button=(label,fn,cls)=>{const b=node("button",cls,label);b.type="button";b.onclick=fn;return b};
const statusBox=$("bai-status");
const title=$("bai-top")?.querySelector("div");
if(title){title.replaceChildren();const identity=node("div","pz81-brand");const avatar=node("img","pz81-avatar");avatar.src="./icons/benny-180.png?v=1";avatar.alt="";const names=node("div","pz81-identity");names.append(node("strong","","БЕННИ"),node("small","","AI · BANGERVERSE"));identity.append(avatar,names);title.append(identity)}
const top=$("bai-top");
const voiceSwitch=button("🔈",()=>{replyVoice=!replyVoice;voiceSwitch.textContent=replyVoice?"🔊":"🔈";voiceSwitch.setAttribute("aria-label",T(replyVoice?"stop":"listen"));voiceSwitch.setAttribute("aria-pressed",String(replyVoice));if(!replyVoice&&"speechSynthesis" in window)window.speechSynthesis.cancel()},"pz81-voice-toggle");
voiceSwitch.setAttribute("aria-label",T("listen"));voiceSwitch.setAttribute("aria-pressed","false");
if(!("speechSynthesis" in window)){voiceSwitch.disabled=true;voiceSwitch.title=T("noSpeech")}
top?.insertBefore(voiceSwitch,$("bai-close"));
fileInput.multiple=true;fileInput.accept="image/*";fileInput.value="";
input.placeholder=T("input");input.rows=1;input.autocomplete="off";
function sizeComposer(){input.style.height="auto";input.style.height=Math.min(input.scrollHeight||42,120)+"px"}
input.addEventListener("input",sizeComposer);
const camera=node("input");camera.type="file";camera.accept="image/*";camera.setAttribute("capture","environment");camera.className="pz81-camera-input";camera.setAttribute("aria-label",T("camera"));
const cameraButton=button("📷",()=>camera.click(),"pz81-camera-btn");cameraButton.setAttribute("aria-label",T("camera"));
$("bai-composer")?.insertBefore(cameraButton,input);$("bai-composer")?.append(camera);
const preview=node("div","pz81-draft-attachments");preview.id="pz81-attachments";
$("bai-composer")?.parentNode?.insertBefore(preview,$("bai-composer"));
const typing=node("div","bai-msg bai-assistant pz81-typing");typing.setAttribute("role","status");typing.setAttribute("aria-label",T("loading"));
typing.innerHTML='<span></span><span></span><span></span>';typing.hidden=true;
// Old single-image widget must not interfere with a multi-image draft.
$("bai-file-preview")?.remove();$("benny-v57-ready")?.remove();$("benny-v57-recover")?.remove();
const scrollEnd=()=>{log.scrollTop=log.scrollHeight};
function informative(message){const el=node("div","pz81-inline-error",message);log.append(el);scrollEnd();return el}
function clearLog(){log.replaceChildren();log.append(node("div","bai-msg bai-assistant pz81-greeting",T("intro")))}
function addMessage(role,text,images){
 const bubble=node("div","bai-msg bai-"+role);const message=node("div","pz81-message-text",text|| (images?.length?"📷 "+T("photos"):""));bubble.append(message);
 if(images?.length){const gallery=node("div","pz81-image-gallery");for(const src of images){const im=node("img","pz81-chat-photo");im.src=src;im.loading="lazy";im.alt=T("photos");gallery.append(im)}bubble.append(gallery)}
 if(role==="assistant"&&text&&"speechSynthesis" in window){
  const playback=button("🔊",()=>{try{
   window.speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance(String(text).slice(0,1300));
   u.lang=lang()==="uk"?"uk-UA":lang()==="en"?"en-US":"ru-RU";
   const voices=window.speechSynthesis.getVoices?.()||[];
   u.voice=voices.find(v=>v.lang?.toLowerCase()===u.lang.toLowerCase())||null;
   window.speechSynthesis.speak(u);
  }catch(_){} },"pz83-replay");
  playback.setAttribute("aria-label",lang()==="uk"?"Прослухати відповідь":lang()==="en"?"Play response":"Прослушать ответ");
  bubble.append(playback);
 }
 log.append(bubble);scrollEnd();return bubble;
}
function updatePreview(){
 preview.replaceChildren();
 for(const item of draft){
  const tile=node("div","pz81-image-tile");const img=node("img");img.src=item.url;img.alt=item.file.name||T("photos");
  const rm=button("×",()=>{draft=draft.filter(x=>x.id!==item.id);URL.revokeObjectURL(item.url);updatePreview()},"pz81-image-remove");
  rm.setAttribute("aria-label",T("clear"));tile.append(img,rm);preview.append(tile);
 }
 preview.hidden=!draft.length;
}
function attach(files){
 const list=Array.from(files||[]);
 let error="";
 for(const f of list){
  if(draft.length>=MAX_PHOTOS){error=T("limit");break}
  if(!f.type.startsWith("image/"))continue;
  if(f.size>MAX_ORIGINAL){error=T("oversize");continue}
  const id=Date.now()+"_"+Math.random().toString(36).slice(2,9);
  draft.push({id,file:f,url:URL.createObjectURL(f)});
 }
 updatePreview();if(error)informative("⚠️ "+error);
}
fileInput.addEventListener("change",()=>{attach(fileInput.files);fileInput.value=""});
camera.addEventListener("change",()=>{attach(camera.files);camera.value=""});
async function compress(item){
 const file=item.file;
 const img=await new Promise((resolve,reject)=>{
  const image=new Image(),url=URL.createObjectURL(file);
  image.onload=()=>{URL.revokeObjectURL(url);resolve(image)};
  image.onerror=()=>{URL.revokeObjectURL(url);reject(Error("Не удалось открыть "+file.name))};
  image.src=url;
 });
 const dimension=Math.min(1,1500/Math.max(img.naturalWidth,img.naturalHeight));
 const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.naturalWidth*dimension));canvas.height=Math.max(1,Math.round(img.naturalHeight*dimension));
 canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
 const data=canvas.toDataURL("image/jpeg",0.78);if(data.length>4900000)throw Error("Изображение слишком большое даже после сжатия");
 return data;
}
async function session(){
 if(!window.supabase?.createClient)throw Error("Библиотека входа ещё не готова");
 let sb=window.pzSupabaseShared;
 if(!sb)sb=window.pzSupabaseShared=window.supabase.createClient(API,PUB,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const {data,error}=await sb.auth.getSession();
 if(error||!data.session)throw Error("Войди в аккаунт BANGERVERSE");
 if(window.pzActiveUserId&&window.pzActiveUserId!==data.session.user.id)throw Error("Загружается другой аккаунт — открой свой Штаб");
 return {client:sb,auth:data.session};
}
async function loadHistory(){
 try{
  const {client,auth}=await session(),owner=auth.user.id;
  if(uid!==owner){uid=owner;historyLoaded=false;clearLog()}
  if(historyLoaded)return;
  const {data,error}=await client.from("ai_chat_messages").select("role,body,created_at").eq("user_id",owner).in("role",["assistant","user"]).order("created_at",{ascending:false}).limit(28);
  if(error)return;
  if(uid!==owner)return;
  clearLog();for(const m of (data||[]).reverse())addMessage(m.role==="assistant"?"assistant":"user",m.body,[]);
  historyLoaded=true;
 }catch(_){if(!log.children.length)clearLog()}
}
function loading(on){
 if(on){if(!typing.isConnected)log.append(typing);typing.hidden=false;scrollEnd()}
 else {typing.hidden=true;typing.remove()}
 send.disabled=on;input.disabled=on;cameraButton.disabled=on;
}
function voiceSpeak(text){
 if(window.pzBennyVoiceV83?.onAnswer?.(text))return;
 if(!replyVoice||!("speechSynthesis" in window)||!text)return;
 try{
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(String(text).slice(0,850));
  utterance.lang=lang()==="uk"?"uk-UA":lang()==="en"?"en-US":"ru-RU";
  utterance.rate=1;utterance.pitch=1;activeReply=utterance;
  window.speechSynthesis.speak(utterance);
 }catch(_){}
}
async function deliver(){
 if(sending)return;
 const text=input.value.trim(),selection=draft.slice();
 if(!text&&!selection.length){input.focus();return}
 sending=true;loading(true);let payload;
 try{
  const {auth}=await session(),owner=auth.user.id;
  if(uid&&uid!==owner)throw Error("Аккаунт изменился — сообщение не отправлено");
  const urls=await Promise.all(selection.map(compress));
  if(urls.reduce((n,x)=>n+x.length,0)>15500000)throw Error("Общий размер фото слишком большой");
  payload={message:text,image_data_urls:urls,context:window.pzBennyContextV80?.()||null};
  // The v57 fetch wrapper still validates and commits confirmed diary actions.
  const response=await fetch(API+"/functions/v1/banger-ai",{method:"POST",headers:{"Content-Type":"application/json","apikey":PUB,"Authorization":"Bearer "+auth.access_token},body:JSON.stringify(payload)});
  const result=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(result.error||"Сервер не ответил");
  if(window.pzActiveUserId&&window.pzActiveUserId!==owner)throw Error("Ответ другого аккаунта не показывается");
  loading(false);
  addMessage("user",text,urls);
  addMessage("assistant",result.answer||"Не удалось прочитать ответ",[]);
  voiceSpeak(result.answer);
  input.value="";sizeComposer();for(const item of selection)URL.revokeObjectURL(item.url);
  draft=draft.filter(x=>!selection.some(y=>y.id===x.id));updatePreview();
  statusBox.textContent="";
 }catch(e){
  loading(false);
  window.pzBennyVoiceV83?.onError?.(e);
  const row=informative("⚠️ "+String(e.message||e)+" · сообщение и фотографии остались в поле ввода.");
  row.append(button("↻ "+T("tryAgain"),()=>{row.remove();deliver()},"pz81-retry"));
 }finally{sending=false;send.disabled=false;input.disabled=false;cameraButton.disabled=false}
}
send.onclick=deliver;
input.addEventListener("keydown",event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();deliver()}});
$("bai-open").onclick=()=>{
 modal.classList.add("open");document.body.classList.add("pz81-benny-open");$("bai-status").textContent="";
 if(!historyLoaded){clearLog();loadHistory()}input.focus();
};
$("bai-close").onclick=()=>{modal.classList.remove("open");document.body.classList.remove("pz81-benny-open");if("speechSynthesis" in window)window.speechSynthesis.cancel()};
modal.addEventListener("click",event=>{if(event.target===modal)$("bai-close").click()});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&modal.classList.contains("open"))$("bai-close").click()});
const statusObserver=new MutationObserver(()=>{
 const st=(statusBox.textContent||"").toLowerCase();
 if(st.includes("aborted"))statusBox.textContent="";
 if(st&&!st.includes("⚠️")&&!st.includes("🔴")&&!st.includes("запись")&&!st.includes("слушаю"))statusBox.textContent="";
});
statusObserver.observe(statusBox,{childList:true,characterData:true,subtree:true});
window.addEventListener("pz:unlocked",()=>{
 const next=window.pzActiveUserId;
 if(uid&&next&&uid!==next){uid=next;historyLoaded=false;clearLog();for(const item of draft)URL.revokeObjectURL(item.url);draft=[];updatePreview()}
});
window.pzBennyV81={getAttachmentCount:()=>draft.length,open:()=>{$("bai-open").click()},
 sendText:(text)=>{if(typeof text==="string")input.value=[input.value.trim(),text.trim()].filter(Boolean).join(" ").trim();return deliver()},
 getBusy:()=>sending,readAloud:(enabled)=>{replyVoice=!!enabled}};

updatePreview();
})();
