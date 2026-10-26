/* BANGERVERSE REBORN v80 — per-account workout program, one guided session at a time.
   No invented exercise results. Drafts are saved with game state; workouts only on Finish. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const DAY=[
 {id:"push",uk:"Груди · плечі · трицепс",ru:"Грудь · плечи · трицепс",en:"Push · chest / shoulders",e:[
 ["warm","Розминка / Разминка / Warm-up",6,"min"],["press","Жим гантелей / Dumbbell press",3,"8–12"],["incline","Жим под углом / Incline press",3,"8–12"],["shoulder","Жим плеч / Shoulder press",3,"8–12"],["triceps","Разгибание рук / Triceps pushdown",3,"10–15"],["cool","Заминка / Cooldown",5,"min"]]},
 {id:"pull",uk:"Спина · біцепс",ru:"Спина · бицепс",en:"Pull · back / biceps",e:[
 ["warm","Розминка / Разминка / Warm-up",6,"min"],["pulldown","Тяга верхнего блока / Lat pulldown",3,"8–12"],["row","Тяга горизонтального блока / Seated row",3,"8–12"],["rear","Разведения на заднюю дельту / Rear delt",3,"12–15"],["biceps","Сгибания рук / Biceps curl",3,"10–12"],["cool","Заминка / Cooldown",5,"min"]]},
 {id:"legs",uk:"Ноги · корпус",ru:"Ноги · корпус",en:"Legs · core",e:[
 ["warm","Степпер / Stepper warm-up",8,"min"],["squat","Жим ногами / Leg press",3,"8–12"],["hinge","Румынская тяга / Romanian deadlift",3,"8–12"],["calves","Подъём на носки / Calf raises",3,"12–15"],["plank","Планка / Plank",3,"20–40 s"],["cool","Заминка / Cooldown",5,"min"]]}
];
const FULL=[
 {id:"fullA",uk:"Усе тіло · A",ru:"Всё тело · A",en:"Full body · A",e:[["warm","Разминка / Warm-up",7,"min"],["legpress","Жим ногами / Leg press",3,"8–12"],["chest","Жим гантелей / Dumbbell press",3,"8–12"],["row","Тяга блока / Seated row",3,"8–12"],["stepper","Степпер / Stepper",15,"min"],["cool","Заминка / Cooldown",5,"min"]]},
 {id:"fullB",uk:"Усе тіло · B",ru:"Всё тело · B",en:"Full body · B",e:[["warm","Степпер / Stepper warm-up",8,"min"],["hinge","Румынская тяга / Romanian deadlift",3,"8–12"],["shoulder","Жим гантелей вверх / Shoulder press",3,"8–12"],["pulldown","Тяга верхнего блока / Lat pulldown",3,"8–12"],["plank","Планка / Plank",3,"20–40 s"],["cool","Заминка / Cooldown",5,"min"]]}
];
const rec={uk:{ready:"Сьогодні твій план",start:"▶ Почати тренування",finish:"✅ Завершити й записати",cancel:"Скасувати без запису",done:"Зроблено",skip:"Пропустити",next:"Далі",tune:"Налаштування",save:"Зберегти програму",sets:"Підходи",weight:"Вага, кг",time:"Хвилини",log:"Історія",empty:"Тренування не записувалися",recorded:"Записано лише підтверджені вправи",question:"Записати виконану частину тренування?",warning:"Потрібно підтвердити хоча б одну вправу.",goal:"Ціль",days:"Тренувань на тиждень"},
ru:{ready:"Твоя тренировка сегодня",start:"▶ Начать тренировку",finish:"✅ Завершить и записать",cancel:"Отменить без записи",done:"Выполнено",skip:"Пропустить",next:"Далее",tune:"Настроить программу",save:"Сохранить программу",sets:"Подходы",weight:"Вес, кг",time:"Минуты",log:"История",empty:"Записей пока нет",recorded:"Записаны только подтверждённые упражнения",question:"Записать выполненную часть тренировки?",warning:"Подтверди хотя бы одно упражнение.",goal:"Цель",days:"Тренировок в неделю"},
en:{ready:"Your workout today",start:"▶ Start workout",finish:"✅ Finish and log",cancel:"Cancel without logging",done:"Completed",skip:"Skip",next:"Next",tune:"Customize program",save:"Save program",sets:"Sets",weight:"Weight, kg",time:"Minutes",log:"History",empty:"No workouts logged yet",recorded:"Only completed exercises were logged",question:"Log the exercises you completed?",warning:"Complete at least one exercise first.",goal:"Goal",days:"Sessions per week"}};
const L=()=>{let x=localStorage.getItem("banger_language")||"uk";return rec[x]?x:"uk"};
const T=k=>rec[L()][k];
let lastUid=null,interval=null,detailsOpen=false;
const el=(tag,cl,text)=>{let n=document.createElement(tag);if(cl)n.className=cl;if(text!==undefined)n.textContent=String(text);return n};
const btn=(label,fn,cl)=>{let n=el("button",cl||"",label);n.type="button";n.onclick=fn;return n};
const data=()=>typeof db!=="undefined"&&db?.profile?.created&&window.pzActiveUserId?db:null;
const state=()=>{
 const d=data();if(!d)return null;
 // All state belongs to active Supabase account's game snapshot.
 d.gymV80||={rotation:0,weekly:3,goal:"strength",done:[],session:null};
 const g=d.gymV80;g.done ||= [];g.weekly=Math.min(6,Math.max(1,Number(g.weekly)||3));g.rotation=Math.max(0,Number(g.rotation)||0);
 return g;
};
function store(){if(typeof persist==="function")persist()}
function clock(){
 const x=$("pz80-gym-clock"),g=state();if(!x||!g?.session)return;
 const s=g.session;let duration=Math.max(0,Math.floor((Date.now()-Number(s.startedAt||Date.now()))/1000));
 if(!Number.isFinite(duration)||duration<0)duration=0;
 x.textContent=[Math.floor(duration/3600),Math.floor(duration/60)%60,duration%60].map(v=>String(v).padStart(2,"0")).join(":");
}
function stopTicker(){if(interval){clearInterval(interval);interval=null}}
function ticker(){stopTicker();clock();interval=setInterval(clock,1000)}
function stampNow(){
 if(typeof stamp==="function")return stamp();
 const x=new Date();return {date:x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"),time:String(x.getHours()).padStart(2,"0")+":"+String(x.getMinutes()).padStart(2,"0")};
}
const plansFor=g=>g.weekly<=2?FULL:DAY;
const planFor=g=>{const arr=plansFor(g);return arr[g.rotation%arr.length]};
function adjustedSteps(g,plan){
 const items=plan.e.map(x=>[...x]);
 if(g.goal==="conditioning"&&!items.some(x=>x[0]==="stepper"))items.splice(Math.max(1,items.length-1),0,["stepper","Степпер / Stepper cardio",15,"min"]);
 return items;
}
function make(g){
 const root=$("pz-gym-zone");if(!root)return;
 root.replaceChildren();if(!g)return;
 const plan=planFor(g),lang=L(),session=g.session;
 const top=el("div","pz80-gym-title");top.append(el("div","pz80-gym-eyebrow","BANGERVERSE · PERSONAL TRAINER"),el("h3","",session?plan[lang]:T("ready")),el("p","pz80-muted",session?plan[lang]:"🗓️ "+plan[lang]+" · "+g.weekly+" × / week"));
 root.append(top);
 if(!session){
  const start=btn(T("start"),()=>{g.session={plan:plan.id,startedAt:Date.now(),index:0,done:[],skipped:[]};store();make(g);ticker()},"pz80-main");
  root.append(start);
  const next=el("div","pz80-gym-next");
  next.append(el("small","",T("ready")),el("strong","",plan[lang]));
  root.append(next);
  const show=btn("⚙ "+T("tune"),()=>{detailsOpen=!detailsOpen;make(g)},"pz80-quiet");
  root.append(show);
  if(detailsOpen){
   const editor=el("div","pz80-gym-settings");
   editor.append(el("label","",T("days")));
   const weekly=el("select");for(const n of [2,3,4,5]){const option=el("option","",n);option.value=n;option.selected=n===g.weekly;weekly.append(option)}editor.append(weekly);
   editor.append(el("label","",T("goal")));
   const goal=el("select");for(const [id,name] of [["strength","Сила + выносливость"],["health","Здоровье / Health"],["conditioning","Выносливость / Cardio"]]){const o=el("option","",name);o.value=id;o.selected=id===g.goal;goal.append(o)}editor.append(goal);
   editor.append(btn(T("save"),()=>{g.weekly=Number(weekly.value);g.goal=goal.value;detailsOpen=false;store();make(g)},"pz80-main"));
   root.append(editor);
  }
 }else{
  const workout=[...DAY,...FULL].find(x=>x.id===session.plan)||plan;
  const exerciseList=adjustedSteps(g,workout);
  const stepIndex=Math.min(exerciseList.length-1,Math.max(0,session.index||0));
  const [id,label,sets,rep]=exerciseList[stepIndex];
  const card=el("div","pz80-gym-current");
  card.append(el("span","pz80-progress",""+(stepIndex+1)+" / "+exerciseList.length),el("h3","",label));
  const guide=window.pzExerciseVisuals?.meta?.[id];
  if(guide){
    const art=el("div","pz803-workout-art");art.innerHTML=window.pzExerciseVisuals.render(id);card.append(art);
    card.append(el("strong","pz803-target",guide[2]),el("p","pz803-cue",guide[1]));
  }
  card.append(el("p","pz80-muted",sets+(rep==="min"?" мин":" × "+rep)));
  const timer=el("div","pz80-gym-timer","00:00:00");timer.id="pz80-gym-clock";card.append(timer);
  const inputs=el("div","pz80-gym-fields");
  const count=el("input");count.type="number";count.min="0";count.max="15";count.value=String(sets);count.inputMode="numeric";
  const mass=el("input");mass.type="number";mass.min="0";mass.max="500";mass.step=".5";mass.value="0";mass.inputMode="decimal";
  const repetitions=el("input");repetitions.type="text";repetitions.maxLength=26;repetitions.value=rep==="min"?"min":rep;
  for(const [label,input] of (rep==="min"?[[T("time"),count]]:[[T("sets"),count],["Повторы",repetitions],[T("weight"),mass]])){const wrapper=el("label","pz80-gym-field");wrapper.append(el("span","",label),input);inputs.append(wrapper)}card.append(inputs);
  const row=el("div","pz80-gym-actions");
  row.append(btn("✓ "+T("done"),()=>{
    const n=Number(count.value),kg=Number(mass.value);
    if(!Number.isFinite(n)||n<=0||n>15||!Number.isFinite(kg)||kg<0||kg>500){status("⚠️ Укажи фактические подходы/минуты и корректный вес.");return}
    if(!session.done.some(x=>x.id===id))session.done.push({id,label,sets:n,reps:repetitions.value.slice(0,26),kg,at:Date.now()});
    session.index=Math.min(exerciseList.length-1,stepIndex+1);
    store();make(g);
  },"pz80-main"),
  btn("↷ "+T("skip"),()=>{if(!session.skipped.includes(id))session.skipped.push(id);session.index=Math.min(exerciseList.length-1,stepIndex+1);store();make(g)},"pz80-quiet"));
  card.append(row);root.append(card);
  const done=el("div","pz80-gym-checklist");
  exerciseList.forEach((st,i)=>{
   const yes=session.done.some(x=>x.id===st[0]),no=session.skipped.includes(st[0]);
   const stepButton=btn((yes?"✓ ":no?"– ":"○ ")+st[1],()=>{
    session.index=i;store();make(g);
   },i===stepIndex?"pz80-step-current":yes?"pz80-step-done":"pz80-step");
   if(window.pzExerciseVisuals?.meta?.[st[0]]){
     const thumb=el("span","pz803-step-thumb");thumb.innerHTML=window.pzExerciseVisuals.thumb?window.pzExerciseVisuals.thumb(st[0]):window.pzExerciseVisuals.render(st[0]);
     stepButton.insertBefore(thumb,stepButton.firstChild);
   }
   done.append(stepButton);
  });root.append(done);
  const finish=btn(T("finish"),()=>{
   if(!session.done.length){status("⚠️ "+T("warning"));return}
   if(!confirm(T("question")))return;
   const t=stampNow(),duration=Math.max(1,Math.round((Date.now()-session.startedAt)/60000));
   const d=data();if(!d)return;
   d.workouts||=[];const entry={id:"gymv80_"+Date.now(),date:t.date,time:t.time,kind:workout.id,name:workout[lang],reps:duration,sets:session.done.length,kg:0,completed:session.done.map(x=>x.label),exercises:session.done.map(x=>({...x})),note:"BANGER Trainer v80 · confirmed exercises only"};
   if(d.workouts.some(x=>x.id===entry.id))return;
   d.workouts.push(entry);g.rotation++;g.done.push(entry.id);g.session=null;store();stopTicker();make(g);history();status("✅ "+T("recorded"));
  },"pz80-finish");
  const cancel=btn("✕ "+T("cancel"),()=>{if(!confirm(T("cancel")+"?"))return;g.session=null;store();stopTicker();make(g);status(T("cancel"))},"pz80-quiet");
  root.append(finish,cancel);ticker();
 }
}
function status(s){let node=$("pz-gym-status");if(node)node.textContent=s}
function photoCredit(){
 const root=$("pz-gym-zone");if(!root||!window.pzExerciseGalleryV81||root.querySelector(".pz81-attribution"))return;
 const credit=el("p","pz81-attribution");const link=el("a","", "Exercise photos · free-exercise-db (Unlicense)");
 link.href="https://github.com/yuhonas/free-exercise-db";link.target="_blank";link.rel="noopener noreferrer";credit.append(link);root.append(credit);
}
function history(){
 const box=$("pz-gym-history"),d=data();if(!box)return;box.replaceChildren();
 box.append(el("h3","",T("log")));
 const workouts=(d?.workouts||[]).filter(x=>x&&x.date);
 if(!workouts.length){box.append(el("p","pz80-muted",T("empty")));return}
 workouts.slice(-6).reverse().forEach(x=>box.append(el("div","pz80-gym-history-row",x.date+" · "+x.name+" · "+x.sets+" ✓ · "+x.reps+" min")));
}
function boot(){
 if(!document.body?.classList.contains("pz-unlocked"))return;
 const uid=window.pzActiveUserId;if(!uid||!data())return;
 if(uid!==lastUid){lastUid=uid;stopTicker();detailsOpen=false}
 const root=$("pz-gym-zone");if(!root)return;
 root.closest("#pz-gym-main")?.classList.add("pz80-gym-main");
 const g=state();
 if(g?.session&&Date.now()-Number(g.session.startedAt)>16*3600*1000){g.session=null;store()}
 make(g);photoCredit();history();status(T("recorded"));
}
window.addEventListener("pz:unlocked",boot);
window.addEventListener("banger:local-save",()=>{if(data()&&window.pzActiveUserId!==lastUid)boot()});
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopTicker();else if(data()?.gymV80?.session)ticker()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,150));
else setTimeout(boot,150);
})();