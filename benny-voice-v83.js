/* BANGERVERSE v83 · Benny Voice — one microphone flow on iPhone.
 * Normal: record → pause/resume → cancel or send.
 * Dialogue: push-to-talk turns, native spoken answers, opt-in next turn.
 * Captured audio is sent only on 'send'; no autonomous diary writes.
 */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const panel=$("bai-panel"),modal=$("bai-modal"),mic=$("bai-mic"),composer=$("bai-composer"),input=$("bai-input");
if(!panel||!mic||!composer||!input||!window.pzBennyV81)return;
const API="https://wsgkqauwukykhmhtinoa.supabase.co",PUB="sb_publishable_Aol9Igd8oRMDQHv4f3skaQ_Iql1OxXk";
const t={ru:{call:"Голосовой разговор",record:"Запись голоса",listen:"Нажми, чтобы говорить",stop:"Закончить запись",pause:"Пауза",resume:"Продолжить",cancel:"Отменить",send:"Отправить голос",again:"Повторить",trans:"Распознаю голос…",waiting:"Бенни отвечает…",ready:"Запись готова",denied:"Нет доступа к микрофону",error:"Не получилось распознать голос. Запись сохранена.",newTurn:"Говори, я слушаю",touch:"Коснись микрофона, чтобы продолжить",live:"Голосовой режим",close:"Закрыть разговор",tooShort:"Запись слишком короткая."},
uk:{call:"Голосова розмова",record:"Запис голосу",listen:"Натисни, щоб говорити",stop:"Закінчити запис",pause:"Пауза",resume:"Продовжити",cancel:"Скасувати",send:"Надіслати голос",again:"Повторити",trans:"Розпізнаю голос…",waiting:"Бенні відповідає…",ready:"Запис готовий",denied:"Немає доступу до мікрофона",error:"Не вдалося розпізнати голос. Запис збережено.",newTurn:"Говори, я слухаю",touch:"Торкнися мікрофона, щоб продовжити",live:"Голосовий режим",close:"Закрити розмову",tooShort:"Запис надто короткий."},
en:{call:"Voice conversation",record:"Voice recording",listen:"Tap to speak",stop:"Finish recording",pause:"Pause",resume:"Resume",cancel:"Cancel",send:"Send voice",again:"Retry",trans:"Transcribing…",waiting:"Benny is replying…",ready:"Ready to send",denied:"Microphone access unavailable",error:"Couldn't transcribe. Recording kept for retry.",newTurn:"I'm listening",touch:"Tap the microphone to continue",live:"Voice mode",close:"Close conversation",tooShort:"Recording is too short."}};
const L=()=>{const x=localStorage.getItem("banger_language")||"uk";return t[x]?x:"uk"},T=k=>t[L()][k];
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
const button=(text,cls,cb)=>{const b=make("button",cls,text);b.type="button";b.onclick=cb;return b};
let rec=null,stream=null,chunks=[],blob=null,busy=false,cancelled=false,mode=false,expectAnswer=false,reading=false,cycle=0;
let createdAt=0,pausedAt=0,pausedTotal=0;
const status=make("div","pz83-voice-status"),tray=make("div","pz83-record-tray");tray.id="pz83-record-tray";tray.hidden=true;
const chip=make("div","pz83-record-label"),time=make("span","pz83-time","00:00");
const waveform=make("span","pz83-wave");waveform.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i><i></i>';
const controls=make("div","pz83-rec-controls");
const cancelButton=button("✕","pz83-rec-cancel",cancel);
const pauseButton=button("Ⅱ","pz83-rec-pause",pauseToggle);
const finishButton=button("✓","pz83-rec-finish",finish);
const sendButton=button("↑","pz83-rec-send",()=>sendRecording());
controls.append(cancelButton,pauseButton,finishButton,sendButton);
tray.append(chip,time,waveform,controls,status);
$("bai-form")?.insertBefore(tray,composer);
const callButton=button("◉","pz83-call-launch",startCall);
callButton.setAttribute("aria-label",T("call"));
callButton.title=T("call");
composer.append(callButton);
const overlay=make("section","pz83-call-overlay");overlay.id="pz83-call-overlay";overlay.hidden=true;
const callTop=make("header","pz83-call-header");
const closeCallButton=button("✕","pz83-call-close",stopCall);
callTop.append(make("span","", "БЕННИ · "+T("live")),closeCallButton);
const ring=button("🎙","pz83-call-orb",()=>{if(!rec&&!busy)begin(true);else if(rec)sendRecording()});
ring.setAttribute("aria-label",T("listen"));
const callMessage=make("div","pz83-call-caption",T("touch"));
const callControls=make("div","pz83-call-buttons");
const callPause=button("Ⅱ","pz83-call-pause",pauseToggle);
const callSend=button("↑","pz83-call-send",()=>sendRecording());
const callCancel=button("✕","pz83-call-cancel",cancel);
callControls.append(callCancel,callPause,callSend);
overlay.append(callTop,ring,callMessage,callControls);
panel.append(overlay);
const oldActions=$("pz803-voice-actions");if(oldActions)oldActions.remove();
const oldVoiceToggle=document.querySelector("#bai-top .pz81-voice-toggle");
if(oldVoiceToggle){oldVoiceToggle.hidden=true;oldVoiceToggle.style.display="none"}
const oldStatus=$("bai-status");if(oldStatus)oldStatus.textContent="";
function message(text){status.textContent=text;callMessage.textContent=text}
function elapsed(){
 if(!rec)return;
 const duration=Math.max(0,Date.now()-createdAt-pausedTotal-(pausedAt?Date.now()-pausedAt:0));
 const s=Math.floor(duration/1000);
 time.textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
}
let tick=null;
function refresh(){
 const state=rec?.state||"idle";const recording=state==="recording",paused=state==="paused",ready=!!blob&&!rec;
 const expanded=!!rec||ready||busy;
 tray.hidden=!expanded;
 tray.classList.toggle("paused",paused);
 chip.textContent=busy?T("trans"):ready?T("ready"):recording?T("record"):T("pause");
 pauseButton.textContent=paused?"▶":"Ⅱ";callPause.textContent=paused?"▶":"Ⅱ";
 pauseButton.setAttribute("aria-label",T(paused?"resume":"pause"));
 callPause.setAttribute("aria-label",T(paused?"resume":"pause"));
 pauseButton.disabled=!rec||busy;callPause.disabled=!rec||busy;
 finishButton.disabled=!rec||busy;
 sendButton.disabled=busy||(!rec&&!blob);callSend.disabled=sendButton.disabled;
 ring.classList.toggle("recording",recording);ring.classList.toggle("paused",paused);
 ring.textContent=recording?"▣":paused?"▶":busy?"⋯":"🎙";
 mic.classList.toggle("pz83-recording",recording);
 mic.setAttribute("aria-label",recording?T("stop"):T("record"));
 if(mode)callMessage.textContent=busy?T("trans"):reading?T("waiting"):recording?T("newTurn"):paused?T("pause"):ready?T("ready"):T("touch");
 if(rec&&tick===null)tick=setInterval(elapsed,250);
 if(!rec&&tick!==null){clearInterval(tick);tick=null}
}
function release(){
 try{stream?.getTracks?.().forEach(x=>x.stop())}catch(_){}
 stream=null;rec=null;chunks=[];pausedAt=0;
}
async function begin(call=false){
 if(rec||busy)return;
 if(call&&!mode){mode=true;overlay.hidden=false}
 blob=null;cancelled=false;const seq=++cycle;
 try{
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw Error(T("denied"));
  stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  if(seq!==cycle||!modal.classList.contains("open")){release();return}
  const mime=["audio/mp4","audio/webm;codecs=opus","audio/webm"].find(x=>MediaRecorder.isTypeSupported(x));
  rec=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);
  const r=rec;chunks=[];
  r.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  r.onerror=e=>{message(e.error?.message||T("denied"))};
  r.onstop=()=>{const bytes=new Blob(chunks,{type:r.mimeType||mime||"audio/mp4"});release();if(!cancelled&&bytes.size>=900)blob=bytes;else if(!cancelled)message(T("tooShort"));refresh()};
  createdAt=Date.now();pausedAt=0;pausedTotal=0;r.start(250);message(T("record"));refresh();
 }catch(e){release();message(e?.message||T("denied"));refresh()}
}
function pauseToggle(){
 if(!rec||busy)return;
 try{
  if(rec.state==="recording"){rec.pause();pausedAt=Date.now()}
  else if(rec.state==="paused"){rec.resume();pausedTotal+=Date.now()-pausedAt;pausedAt=0}
  refresh();
 }catch(e){message(e?.message||T("error"))}
}
function stopToBlob(){
 return new Promise(resolve=>{
  if(!rec){resolve(blob);return}
  const r=rec;
  const original=r.onstop;
  r.onstop=ev=>{original?.(ev);resolve(blob)};
  try{if(r.state!=="inactive")r.stop();else {release();resolve(blob)}}catch(_){release();resolve(blob)}
 });
}
function finish(){if(rec)stopToBlob().then(()=>{message(T("ready"));refresh()})}
function cancel(){
 cycle++;cancelled=true;busy=false;
 if(rec){try{rec.stop()}catch(_){}release()}
 blob=null;chunks=[];message("");refresh();
}
async function getAuth(){
 const client=window.pzSupabaseShared;
 if(!client?.auth)throw Error("Войди в BANGERVERSE ID");
 const {data,error}=await client.auth.getSession();
 if(error||!data?.session)throw Error("Нужно войти в аккаунт");
 if(window.pzActiveUserId&&data.session.user.id!==window.pzActiveUserId)throw Error("Аккаунт изменился");
 return data.session;
}
async function sendRecording(){
 if(busy)return;
 const voice=rec?await stopToBlob():blob;if(!voice){message(T("tooShort"));return}
 busy=true;refresh();message(T("trans"));const seq=cycle;
 try{
  const auth=await getAuth();
  const form=new FormData();
  const type=voice.type||"audio/mp4",ext=type.includes("webm")?"webm":type.includes("mp4")?"m4a":"audio";
  form.append("audio",voice,"voice."+ext);
  const resp=await fetch(API+"/functions/v1/banger-transcribe",{
   method:"POST",headers:{apikey:PUB,Authorization:"Bearer "+auth.access_token},body:form});
  const json=await resp.json().catch(()=>({}));
  if(!resp.ok||!json.text?.trim())throw Error(json.error||T("error"));
  if(seq!==cycle)return;
  const words=json.text.trim();
  // The main Benny client sends the same message as the text composer. No duplicate transcript.
  busy=false;blob=null;refresh();expectAnswer=mode;
  if(mode){message(T("waiting"));overlay.classList.add("waiting")}
  await window.pzBennyV81.sendText(words);
 }catch(e){
  if(seq!==cycle)return;
  busy=false;blob=voice;refresh();message(String(e?.message||T("error")));
 }
}
function speakAnswer(text){
 if(!mode||!expectAnswer)return false;
 expectAnswer=false;overlay.classList.remove("waiting");
 if(!("speechSynthesis" in window)){message(T("touch"));return true}
 reading=true;refresh();
 try{
  const synth=window.speechSynthesis;synth.cancel();
  const speech=new SpeechSynthesisUtterance(String(text||"").slice(0,1000));
  speech.lang=L()==="uk"?"uk-UA":L()==="en"?"en-US":"ru-RU";
  speech.rate=1;speech.pitch=1;
  const voices=synth.getVoices?.()||[];
  speech.voice=voices.find(v=>v.lang?.toLowerCase()===speech.lang.toLowerCase())||voices.find(v=>v.lang?.startsWith(speech.lang.slice(0,2)))||null;
  const seq=cycle;
  speech.onend=()=>{if(seq!==cycle)return;reading=false;refresh();message(T("touch")); /* Never activate the microphone secretly. */};
  speech.onerror=()=>{if(seq!==cycle)return;reading=false;refresh();message(T("touch"))};
  synth.speak(speech);
 }catch(_){reading=false;message(T("touch"));refresh()}
 return true;
}
function startCall(){
 if(!modal.classList.contains("open"))window.pzBennyV81.open();
 mode=true;overlay.hidden=false;cycle++;
 if("speechSynthesis" in window)window.speechSynthesis.cancel();
 message(T("touch"));refresh();
}
function stopCall(){
 mode=false;expectAnswer=false;reading=false;overlay.hidden=true;overlay.classList.remove("waiting");cancel();
 if("speechSynthesis" in window)window.speechSynthesis.cancel();
}
mic.onclick=()=>{if(rec){finish();return}if(blob){sendRecording();return}begin(false)};
$("bai-close")?.addEventListener("click",stopCall);
document.addEventListener("visibilitychange",()=>{if(document.hidden){if(rec)finish();if(reading&&"speechSynthesis" in window)window.speechSynthesis.cancel()}});
window.addEventListener("pz:unlocked",()=>{if(!window.pzActiveUserId){stopCall()}});
window.pzBennyVoiceV83={begin,finish,pauseToggle,cancel,sendRecording,startCall,stopCall,onAnswer:speakAnswer,onError:()=>{expectAnswer=false;overlay.classList.remove("waiting");message(T("touch"))},getState:()=>({mode,recording:rec?.state||"idle",busy,hasBlob:!!blob})};
refresh();
})();