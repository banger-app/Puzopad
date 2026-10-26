(function(){
"use strict";
const $=id=>document.getElementById(id);
const plans=[
 {id:"stepper",emoji:"🪜",name:"Степпер",desc:"Кардіо • 30 хвилин",min:30,steps:["Тримай помірний темп","Контролюй дихання","Завершуй без різкого ривка"]},
 {id:"fulla",emoji:"🏋️",name:"Силова A",desc:"Все тіло • 3 вправи",min:35,steps:["Присідання • 3 × 8–12","Жим гантелей • 3 × 8–12","Тяга верхнього блока • 3 × 8–12"]},
 {id:"fullb",emoji:"💪",name:"Силова B",desc:"Все тіло • 3 вправи",min:35,steps:["Випади • 3 × 8–10","Тяга гантелі • 3 × 8–12","Планка • 3 × 30 с"]},
 {id:"stretch",emoji:"🧘",name:"Відновлення",desc:"Мобільність • 10 хвилин",min:10,steps:["Розминка шиї і плечей","Рухливість спини й тазу","М'яке завершення"]}
];
let active=null,interval=0;
const fmt=n=>String(n).padStart(2,"0");
function ui(){const zone=$("pz-gym-zone");if(!zone)return;
 zone.innerHTML="";
 let title=document.createElement("h3");title.textContent="Вибери тренування";zone.append(title);
 let grid=document.createElement("div");grid.className="pz-gym-grid";
 plans.forEach(p=>{
  let c=document.createElement("button");c.type="button";c.className="pz-gym-card"+(active?.id===p.id?" selected":"");
  let emoji=document.createElement("span");emoji.className="pz-gym-emoji";emoji.textContent=p.emoji;
  let name=document.createElement("strong");name.textContent=p.name;
  let desc=document.createElement("small");desc.textContent=p.desc;c.append(emoji,name,desc);
  c.onclick=()=>{if(active&&active.started)if(!confirm("Завершити поточний таймер без запису?"))return;clearInterval(interval);active={...p,started:false,start:0,finished:new Set()};ui()};
  grid.append(c);
 });zone.append(grid);
 if(active){
  let panel=document.createElement("div");panel.className="pz-gym-active";
  let h=document.createElement("strong");h.textContent=active.emoji+" "+active.name;panel.append(h);
  const list=document.createElement("div");list.className="pz-gym-steps";
  active.steps.forEach((step,i)=>{
    let button=document.createElement("button");button.type="button";button.textContent=(active.finished.has(i)?"✅ ":"◯ ")+step;
    button.onclick=()=>{if(!active.started)return;active.finished.has(i)?active.finished.delete(i):active.finished.add(i);ui()};
    list.append(button)});
  panel.append(list);
  let timer=document.createElement("div");timer.id="pz-gym-clock";timer.className="pz-gym-clock";panel.append(timer);
  let controls=document.createElement("div");controls.className="pz-controlrow";
  let btn=document.createElement("button");btn.type="button";btn.className="primary";btn.textContent=active.started?"✅ Завершив тренування":"▶ Почати таймер";
  btn.onclick=()=>{if(!active.started){active.started=true;active.start=Date.now();loopClock();ui();loopClock();return}
    if(!confirm("Ти справді виконав це тренування? У щоденник запишемо тільки фактичний час і відмічені вправи."))return;
    let d=typeof db!=="undefined"?db:null;if(!d)return;
    let duration=Math.max(1,Math.round((Date.now()-active.start)/60000));
    d.workouts ||= [];
    const stampData=typeof stamp==="function"?stamp():{date:new Date().toISOString().slice(0,10),time:""};
    d.workouts.push({id:"gymv62_"+Date.now(),date:stampData.date,time:stampData.time,name:active.name,sets:active.finished.size,reps:duration,kg:0,kind:active.id,completed:active.steps.filter((_,i)=>active.finished.has(i)),note:"Реально виконане тренування, час за таймером"});
    if(typeof persist==="function")persist();
    clearInterval(interval);active=null;ui();history();status("✅ Тренування записано — "+duration+" хв. Нічого не було додано до натискання «Завершив».")};
  let cancel=document.createElement("button");cancel.type="button";cancel.textContent="Скасувати";
  cancel.onclick=()=>{if(active.started&&!confirm("Скасувати без збереження?"))return;clearInterval(interval);active=null;ui();status("Не записано.")};
  controls.append(btn,cancel);panel.append(controls);zone.append(panel);loopClock();
 }
}
function status(t){const el=$("pz-gym-status");if(el)el.textContent=t}
function loopClock(){clearInterval(interval);const update=()=>{const el=$("pz-gym-clock");if(!el)return;
const secs=active?.started?Math.max(0,Math.floor((Date.now()-active.start)/1000)):0;
el.textContent=fmt(Math.floor(secs/3600))+":"+fmt(Math.floor(secs%3600/60))+":"+fmt(secs%60)};
update();if(active?.started)interval=setInterval(update,1000)}
function history(){
 const box=$("pz-gym-history");if(!box)return;
 const all=typeof db!=="undefined"?db.workouts||[]:[];
 box.innerHTML="";let p=document.createElement("strong");p.textContent="Історія тренувань · "+all.length;box.append(p);
 all.slice(-5).reverse().forEach(x=>{let row=document.createElement("p");row.className="pz-gym-history-row";row.textContent="✅ "+(x.date||"")+" · "+(x.name||"Тренування")+" · "+(x.reps||"—")+" хв";box.append(row)});
}
function init(){
 if(!document.body.classList.contains("pz-unlocked"))return;const c=$("pz-gym-zone");if(!c)return;
 ui();history();status("Тренування не записується автоматично. Обери план, запусти таймер, відзнач виконане.");
}
window.addEventListener("pz:unlocked",init);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&active?.started)loopClock()});
})();