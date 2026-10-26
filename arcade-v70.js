(function(){
"use strict";
const $=id=>document.getElementById(id);
const GAMES=[
 {id:"breaker",name:"NEON BREAKER",icon:"◆",tag:"Арканоїд",desc:"Рухай платформу, вибивай неонові блоки",colors:["#ff3eaa","#8f69ff"]},
 {id:"snake",name:"PIXEL SNAKE",icon:"▦",tag:"Змійка",desc:"Збирай енергію. Керуй свайпом або стрілками",colors:["#43efb4","#188cae"]},
 {id:"catch",name:"STAR CATCH",icon:"✦",tag:"Лови зорі",desc:"Лови зірки, уникай темних куль",colors:["#ffcf6f","#ff579d"]},
 {id:"hop",name:"SKY HOP",icon:"▲",tag:"Стрибки",desc:"Торкнись поля, щоб перестрибнути перешкоду",colors:["#71bfff","#a678ff"]},
 {id:"meteor",name:"METEOR RUN",icon:"☄",tag:"Реакція",desc:"Ухиляйся від метеорів",colors:["#f97b6f","#e33b9a"]},
 {id:"aim",name:"TARGET RUSH",icon:"◎",tag:"Влучність",desc:"Влучай у зелені цілі",colors:["#5be7cc","#fff092"]},
 {id:"memory",name:"MEMORY FLIP",icon:"▣",tag:"Пам'ять",desc:"Знайди всі пари карток",colors:["#b4a3ff","#ff91cc"]},
 {id:"slide",name:"MERGE 2048",icon:"▤",tag:"Логіка",desc:"З'єднай плитки до 512",colors:["#f7c674","#ff9f73"]}
];
const WIDTH=360,HEIGHT=525,DAY_CAP=50;
let game="",canvas,ctx,run=false,finished=false,af=0,lastT=0,ticks=0,score=0,life=3,objects=[],pad=180,keys=[],dir={x:1,y:0},nextDir={x:1,y:0},snake=[],food=null,player={},spawns=0,coinAward=0,scrollBefore="",finger=null,downX=0,downY=0,aux={},scrollRootBefore="";
function dbx(){return typeof db!=="undefined"?db:null}
function nowDay(){return typeof currentDay==="function"?currentDay():new Date().toISOString().slice(0,10)}
function accountReady(){return !!(window.pzActiveUserId&&dbx()?.profile?.created)}
function bank(){
 const d=dbx();if(!d)return null;
 if(!d.arcadeBank||typeof d.arcadeBank!=="object")d.arcadeBank={day:"",earned:0,best:{}};
 const b=d.arcadeBank,day=nowDay();
 if(b.day!==day){b.day=day;b.earned=(d.arcade?.day===day?Number(d.arcade.earned||0):0)}
 b.best||={};
 b.earned=Math.max(0,Math.min(DAY_CAP,Number(b.earned)||0));
 return b;
}
function setText(id,txt){const x=$(id);if(x)x.textContent=txt}
function dashboard(){
 const b=bank(),d=dbx();if(!b||!d)return;
 setText("pz-arc-wallet","🪙 "+Math.max(0,Number(d.coins)||0)+" монет");
 setText("pz-arc-daily","Сьогодні отримано "+b.earned+" / "+DAY_CAP+" монет");
 GAMES.forEach(g=>{const v=$("pz-game-best-"+g.id);if(v)v.textContent="Рекорд: "+(b.best[g.id]||0)});
}
function hub(){
 const root=$("arcade");if(!root||root.dataset.arcV70)return;
 root.dataset.arcV70="1";
 const panel=root.querySelector(".panel");if(!panel)return;
 panel.replaceChildren();
 const title=document.createElement("div");title.className="pz-arc-top";
 title.innerHTML='<div><small>ПУЗОПАД · ARCADE</small><h2>🕹️ Ігровий зал</h2></div><div id="pz-arc-wallet">🪙 0 монет</div>';
 const intro=document.createElement("p");intro.className="pz-arc-muted";intro.textContent="Вісім ігор без реклами. Заробляй очки та монети для Гардероба. Прогрес зберігається у твоєму профілі.";
 const progress=document.createElement("p");progress.className="pz-arc-daily";progress.id="pz-arc-daily";
 const grid=document.createElement("div");grid.className="pz-arc-grid";
 for(const g of GAMES){
  const card=document.createElement("button");card.type="button";card.className="pz-arc-card";
  card.style.setProperty("--game-color",g.colors[0]);
  const img=document.createElement("div");img.className="pz-arc-illustration";img.textContent=g.icon;
  const heading=document.createElement("strong");heading.textContent=g.name;
  const small=document.createElement("span");small.textContent=g.tag+" · "+g.desc;
  const best=document.createElement("small");best.id="pz-game-best-"+g.id;best.textContent="Рекорд: 0";
  card.append(img,heading,small,best);card.onclick=()=>open(g.id);grid.append(card);
 }
 panel.append(title,intro,progress,grid);
 const overlay=document.createElement("div");overlay.id="pz-arc-overlay";overlay.hidden=true;overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-label","Мінігра");
 overlay.innerHTML='<div class="pz-arc-shell"><header class="pz-arc-shell-head"><button type="button" id="pz-arc-back" aria-label="Повернутись до вибору ігор">‹ Ігри</button><strong id="pz-arc-title">ARCADE</strong><button id="pz-arc-close" type="button" aria-label="Закрити гру">✕</button></header><div class="pz-arc-hud"><span id="pz-arc-score">Очки: 0</span><span id="pz-arc-lives">❤ 3</span></div><div class="pz-arc-playfield"><canvas id="pz-arc-board" width="360" height="525" aria-label="Ігрове поле"></canvas><div id="pz-arc-result" hidden><div id="pz-arc-result-body"></div><button type="button" id="pz-arc-again">↻ Грати ще</button><button type="button" id="pz-arc-results-close">Вибрати іншу гру</button></div></div><div id="pz-arc-controls"><div class="pz-arc-arrow-wrap"><button data-step="up">↑</button><div><button data-step="left">←</button><button data-step="down">↓</button><button data-step="right">→</button></div></div><button type="button" id="pz-arc-action">СТРИБОК ▲</button><p id="pz-arc-help">Керуй пальцем без прокручування сторінки</p></div></div>';
 document.body.append(overlay);
 canvas=$("pz-arc-board");ctx=canvas.getContext("2d");
 for(const node of [$("pz-arc-back"),$("pz-arc-close"),$("pz-arc-results-close")])node.onclick=exit;
 $("pz-arc-again").onclick=()=>open(game);
 $("pz-arc-action").onclick=()=>{if(game==="hop"&&run)jump()};
 canvas.addEventListener("pointerdown",e=>{
  e.preventDefault();canvas.setPointerCapture(e.pointerId);
  const loc=position(e);finger={x:loc.x,y:loc.y};downX=loc.x;downY=loc.y;
  if(game==="hop")jump();else if(game==="breaker"||game==="catch"||game==="meteor")pad=loc.x;else if(game==="aim")tapTarget(loc);else if(game==="memory")flipCard(loc);
 },{passive:false});
 canvas.addEventListener("pointermove",e=>{if(!run)return;e.preventDefault();const loc=position(e);
  if(game==="breaker"||game==="catch"||game==="meteor")pad=loc.x;
  else if(game==="snake"&&finger){
    const dx=loc.x-finger.x,dy=loc.y-finger.y;
    if(Math.abs(dx)>28||Math.abs(dy)>28){turn(Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up"));finger=loc;}
  }
 },{passive:false});
 canvas.addEventListener("pointerup",e=>{if(!run)return;e.preventDefault();if((game==="snake"||game==="slide")&&finger){const loc=position(e),dx=loc.x-downX,dy=loc.y-downY;if(Math.abs(dx)>18||Math.abs(dy)>18){const direction=Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up");if(game==="slide")slide(direction);else turn(direction)}}finger=null;},{passive:false});
 canvas.addEventListener("pointercancel",()=>{finger=null});
 overlay.addEventListener("touchmove",e=>e.preventDefault(),{passive:false});
 overlay.querySelectorAll("[data-step]").forEach(b=>b.onclick=()=>{if(game==="slide")slide(b.dataset.step);else turn(b.dataset.step)});
 document.addEventListener("keydown",keyDown);
 document.addEventListener("visibilitychange",()=>{if(document.hidden&&run)pause()});
 dashboard();
}
function position(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*WIDTH/r.width,y:(e.clientY-r.top)*HEIGHT/r.height}}
function keyDown(e){if(!run)return;if(e.key==="Escape"){e.preventDefault();exit();return}const k={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"}[e.key];if(k){e.preventDefault();if(game==="slide")slide(k);else turn(k)}if((e.key===" "||e.key==="Enter")&&game==="hop"){e.preventDefault();jump()}}
function turn(where){if(game!=="snake")return;const v={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}}[where];if(v&&!(v.x===-dir.x&&v.y===-dir.y))nextDir=v}
function reset(type){
 game=type;score=0;life=3;ticks=0;finished=false;lastT=0;spawns=0;objects=[];pad=180;coinAward=0;keys=[];finger=null;aux={};
 if(type==="breaker"){for(let row=0;row<5;row++)for(let col=0;col<6;col++)objects.push({type:"brick",x:9+col*58,y:65+row*30,w:52,h:19,hp:row===0?2:1,c:["#f85aa8","#ac89ff","#55baf2","#5cf1c0","#ffd26e"][row]});player={x:180,y:415,vx:3.1,vy:-4.3}}
 if(type==="snake"){snake=[{x:6,y:11},{x:5,y:11},{x:4,y:11}];dir={x:1,y:0};nextDir={x:1,y:0};foodSnake()}
 if(type==="catch"){player={x:180};life=4}
 if(type==="hop"){player={y:432,vy:0,jumps:0};life=1}
 if(type==="meteor"){life=3;objects=[]}
 if(type==="aim"){life=3;aux={next:0,targets:[]}}
 if(type==="memory"){life=1;aux={cards:[0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7].sort(()=>Math.random()-.5),open:[],matched:[],locked:false,moves:0,turnAt:0}}
 if(type==="slide"){life=1;aux={tiles:Array(16).fill(0),moves:0};spawnTile();spawnTile()}
}
function foodSnake(){const used=new Set(snake.map(x=>x.x+","+x.y));for(let i=0;i<250;i++){let x=1+Math.floor(Math.random()*16),y=3+Math.floor(Math.random()*19);if(!used.has(x+","+y)){food={x,y};break}}}
function open(which){
 if(!accountReady()){alert("Спочатку увійди в свій акаунт");return}
 if(!GAMES.some(g=>g.id===which))return;
 if(run)exit();
 reset(which);
 const stage=$("pz-arc-overlay");if(!stage)return;stage.hidden=false;
 $("pz-arc-result").hidden=true;
 $("pz-arc-title").textContent=GAMES.find(g=>g.id===game).name;
 $("pz-arc-controls").dataset.game=game;
 setText("pz-arc-help",game==="snake"?"Свайп або стрілки":game==="slide"?"Свайп або кнопки зі стрілками":game==="memory"?"Знайди пари, торкаючись карток":game==="aim"?"Тисни зелені цілі":game==="meteor"?"Веди корабель пальцем":game==="hop"?"Натискай для стрибка":"Рухай платформу пальцем, сторінка не прокручується.");
 scrollBefore=document.body.style.overflow;scrollRootBefore=document.documentElement.style.overflow;document.body.style.overflow="hidden";document.documentElement.style.overflow="hidden";document.body.classList.add("pz-arc-playing");
 run=true;lastT=performance.now();paint();af=requestAnimationFrame(tick);
}
function pause(){if(!run)return;run=false;cancelAnimationFrame(af);$("pz-arc-result").hidden=false;
 $("pz-arc-result-body").textContent="Гра призупинена. Можеш зіграти знову або повернутися до вибору ігор.";
}
function exit(){
 run=false;cancelAnimationFrame(af);
 const stage=$("pz-arc-overlay");if(stage)stage.hidden=true;
 document.body.classList.remove("pz-arc-playing");document.body.style.overflow=scrollBefore;document.documentElement.style.overflow=scrollRootBefore;
 dashboard();
}
function award(type){
 const d=dbx(),b=bank();if(!d||!b)return 0;
 b.best[type]=Math.max(b.best[type]||0,score);
 const rates={breaker:55,snake:2,catch:35,hop:35,meteor:25,aim:22,memory:12,slide:48};const units=Math.min(16,Math.max(0,Math.floor(score/(rates[type]||40))));
 const given=Math.max(0,Math.min(DAY_CAP-b.earned,units));
 if(given>0){b.earned+=given;d.coins=Math.max(0,Number(d.coins)||0)+given}
 if(typeof persist==="function")persist();
 if(typeof updateDashboardV16==="function")updateDashboardV16();
 if(typeof pzUiRefresh==="function")pzUiRefresh();
 dashboard();return given;
}
function finish(win,aborted){
 if(!run)return;
 run=false;cancelAnimationFrame(af);finished=true;
 coinAward=aborted?0:award(game);
 paint();
 const node=$("pz-arc-result");if(node)node.hidden=false;
 const body=$("pz-arc-result-body");
 if(body)body.innerHTML='<div class="pz-arc-trophy">'+(aborted?"⏸":win?"🏆":"✦")+'</div><h3>'+(aborted?"Раунд зупинено":win?"Перемога!":"Раунд завершено")+'</h3><p>Очки: <strong>'+score+'</strong></p><p>Монети: <strong>+'+coinAward+' 🪙</strong></p><p>Загальний баланс: '+Math.max(0,Number(dbx()?.coins)||0)+' 🪙</p><small>Ліміт на всі ігри: '+DAY_CAP+' монет за ігрові сутки</small>';
}
function jump(){if(!run||game!=="hop")return;if(player.jumps<2){player.vy=-10.6;player.jumps++}}
function tick(ts){
 if(!run)return;
 const dt=Math.min(2.1,Math.max(.1,(ts-lastT)/16.667));lastT=ts;ticks+=dt;
 if(game==="breaker")tickBreaker(dt);
 else if(game==="snake")tickSnake(dt);
 else if(game==="catch")tickCatch(dt);
 else if(game==="hop")tickHop(dt);
 else if(game==="meteor")tickMeteor(dt);
 else if(game==="aim")tickAim(dt);
 else if(game==="memory")tickMemory(dt);
 else if(game==="slide")tickSlide(dt);
 if(run){paint();af=requestAnimationFrame(tick)}
}
function tickBreaker(dt){
 const p=player;p.x+=p.vx*dt;p.y+=p.vy*dt;
 if(p.x<9||p.x>WIDTH-9){p.vx*=-1;p.x=Math.max(9,Math.min(WIDTH-9,p.x))}
 if(p.y<48)p.vy=Math.abs(p.vy);
 if(p.vy>0&&p.y>=478&&p.y<=498&&p.x>=pad-46&&p.x<=pad+46){p.vy=-Math.max(4.1,Math.abs(p.vy));p.vx+=(p.x-pad)*.06}
 for(const b of objects){if(!b.hp)continue;if(p.x+7>b.x&&p.x-7<b.x+b.w&&p.y+7>b.y&&p.y-7<b.y+b.h){b.hp--;score+=10;p.vy*=-1;break}}
 if(objects.every(x=>!x.hp)){finish(true,false);return}
 if(p.y>535){life--;if(life<=0){finish(false,false);return}player={x:180,y:415,vx:2.7+Math.random()*.8,vy:-4.3}}
}
function tickSnake(dt){
 spawns+=dt;
 const rate=8.8-Math.min(4,Math.floor(score/8)*.4);
 if(spawns<rate)return;spawns=0;
 dir=nextDir;const n={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
 const eat=food&&n.x===food.x&&n.y===food.y;
 if(n.x<0||n.y<2||n.x>17||n.y>24||snake.slice(0,eat?snake.length:snake.length-1).some(q=>q.x===n.x&&q.y===n.y)){finish(false,false);return}
 snake.unshift(n);if(eat){score+=2;foodSnake()}else snake.pop();
}
function tickCatch(dt){
 spawns+=dt;if(spawns>Math.max(8,22-score*.06)){spawns=0;objects.push({x:16+Math.random()*(WIDTH-32),y:45,s:Math.random()>.22?"star":"bad",v:2.9+Math.random()*1.7})}
 for(const a of objects){
  a.y+=a.v*dt;
  if(a.y>468&&a.y<506&&Math.abs(a.x-pad)<39){a.dead=true;if(a.s==="star")score+=10;else{life--;if(life<=0){finish(false,false);return}}}
  if(a.y>HEIGHT+20){a.dead=true;if(a.s==="star"){life--;if(life<=0){finish(false,false);return}}}
 }
 objects=objects.filter(x=>!x.dead);
 if(ticks>60*45)finish(true,false);
}
function tickHop(dt){
 player.vy+=.56*dt;player.y+=player.vy*dt;
 if(player.y>=432){player.y=432;player.vy=0;player.jumps=0}
 spawns+=dt;if(spawns>Math.max(32,86-score*.1)){
  spawns=0;objects.push({x:385,y:444,w:20+Math.random()*17,h:25+Math.random()*20})}
 for(const a of objects){
  a.x-=(4.1+score*.005)*dt;
  if(!a.counted&&a.x<62){score+=10;a.counted=true}
  if(a.x<85&&a.x+a.w>51&&player.y+24>a.y-a.h){finish(false,false);return}
 }
 objects=objects.filter(x=>x.x>-45);
 if(ticks>60*65)finish(true,false);
}
function paint(){
 if(!ctx)return;ctx.clearRect(0,0,WIDTH,HEIGHT);
 const g=ctx.createLinearGradient(0,0,0,HEIGHT);g.addColorStop(0,"#1b1e3c");g.addColorStop(1,"#101325");ctx.fillStyle=g;ctx.fillRect(0,0,WIDTH,HEIGHT);
 ctx.strokeStyle="#ffffff0b";for(let y=0;y<HEIGHT;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WIDTH,y);ctx.stroke()}
 ctx.textAlign="left";ctx.font="bold 16px system-ui";ctx.fillStyle="#f5d6fa";ctx.fillText(GAMES.find(x=>x.id===game)?.name||"ARCADE",12,27);
 if(game==="breaker")drawBreaker();
 if(game==="snake")drawSnake();
 if(game==="catch")drawCatch();
 if(game==="hop")drawHop();
 if(game==="meteor")drawMeteor();
 if(game==="aim")drawAim();
 if(game==="memory")drawMemory();
 if(game==="slide")drawSlide();
 setText("pz-arc-score","Очки: "+score);
 setText("pz-arc-lives",game==="snake"?"Змійка: "+snake.length:game==="hop"?"▲":game==="memory"?"Пар: "+(aux.matched?.length||0)+"/8":game==="slide"?"Ходи: "+(aux.moves||0):("❤ "+life));
}
function rect(x,y,w,h,c,r=0){ctx.fillStyle=c;ctx.beginPath();if(r)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);ctx.fill()}
function orb(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function drawBreaker(){
 for(const b of objects){if(!b.hp)continue;rect(b.x,b.y,b.w,b.h,b.c,5);if(b.hp>1)rect(b.x+10,b.y+7,b.w-20,3,"#ffffffaa",1)}
 rect(Math.max(4,Math.min(310,pad-45)),488,90,13,"#fff",7);orb(player.x,player.y,8,"#ff49a8");
}
function drawSnake(){
 rect(0,44,WIDTH,481,"#111b2f");
 for(let x=0;x<18;x++)for(let y=2;y<25;y++){if((x+y)%2)rect(x*20,y*20,19,19,"#1e2a43")}
 if(food)orb(food.x*20+10,food.y*20+10,8,"#ffd47b");
 snake.forEach((p,i)=>rect(p.x*20+1,p.y*20+1,18,18,i===0?"#c3ffe8":"#60d8b0",5));
}
function drawCatch(){
 for(const a of objects){ctx.font=a.s==="star"?"25px system-ui":"21px system-ui";ctx.fillText(a.s==="star"?"✦":"●",a.x-8,a.y);ctx.fillStyle=a.s==="star"?"#ffdd7f":"#a75ae3"}
 rect(Math.max(5,Math.min(305,pad-38)),475,76,24,"#ff47ac",12);
}
function drawHop(){
 rect(0,467,WIDTH,58,"#31445e");for(let x=0;x<WIDTH;x+=36)rect(x,472,20,3,"#80f2bd");
 orb(66,player.y,22,"#ff5aa9");orb(59,player.y-4,4,"#fff");
 for(const a of objects){rect(a.x,a.y-a.h,a.w,a.h,"#8e8af7",6)}
}

function tickMeteor(dt){
 spawns+=dt;if(spawns>Math.max(9,25-ticks/360)){spawns=0;objects.push({x:20+Math.random()*320,y:-20,r:12+Math.random()*12,v:3.2+Math.random()*2.5})}
 for(const a of objects){
  a.y+=a.v*dt;
  if(a.y>450&&a.y<502&&Math.abs(a.x-pad)<a.r+20){a.dead=true;life--;if(life<=0){finish(false,false);return}}
  if(a.y>HEIGHT+25){a.dead=true;score+=10}
 }
 objects=objects.filter(a=>!a.dead);if(ticks>=60*45)finish(true,false);
}
function drawMeteor(){
 for(const a of objects){orb(a.x,a.y,a.r,"#fb8776");orb(a.x-4,a.y-3,a.r*.4,"#ffdcc5")}
 ctx.fillStyle="#69f1df";ctx.beginPath();ctx.moveTo(pad,451);ctx.lineTo(pad-20,494);ctx.lineTo(pad+20,494);ctx.closePath();ctx.fill();
 ctx.font="14px system-ui";ctx.fillStyle="#c8eaf2";ctx.fillText("УХИЛЯЙСЯ · "+Math.max(0,Math.ceil(45-ticks/60))+" с",13,55);
}
function tickAim(dt){
 aux.next+=dt;
 if(aux.next>34){aux.next=0;aux.targets.push({x:30+Math.random()*300,y:85+Math.random()*335,r:18+Math.random()*8,bad:Math.random()<.28,ttl:125})}
 for(const t of aux.targets){t.ttl-=dt;if(t.ttl<0){t.dead=true;if(!t.bad)life--}}
 aux.targets=aux.targets.filter(t=>!t.dead);
 if(life<=0){finish(false,false);return}if(ticks>=60*30)finish(true,false);
}
function tapTarget(pt){
 if(!run||game!=="aim")return;
 for(let i=aux.targets.length-1;i>=0;i--){
  const t=aux.targets[i];
  if(Math.hypot(pt.x-t.x,pt.y-t.y)<=t.r+9){
   t.dead=true;if(t.bad){life--;score=Math.max(0,score-5)}else score+=12;
   break;
  }
 }
 aux.targets=aux.targets.filter(t=>!t.dead);if(life<=0)finish(false,false);
}
function drawAim(){
 ctx.font="15px system-ui";ctx.fillStyle="#d5effb";ctx.fillText("Натискай ЗЕЛЕНІ цілі",15,54);
 for(const t of aux.targets){orb(t.x,t.y,t.r,t.bad?"#f54b85":"#51efb2");orb(t.x,t.y,t.r*.56,t.bad?"#ffbad0":"#a3ffe1");orb(t.x,t.y,t.r*.25,t.bad?"#c52b62":"#146e5b")}
}
const CARD_GLYPHS=["◆","✦","♣","●","▲","☀","★","♥"];
function memoryRect(i){return{x:15+(i%4)*86,y:100+Math.floor(i/4)*91,w:72,h:76}}
function flipCard(pt){
 if(!run||game!=="memory"||aux.locked)return;
 const idx=aux.cards.findIndex((_,i)=>{const r=memoryRect(i);return pt.x>=r.x&&pt.x<=r.x+r.w&&pt.y>=r.y&&pt.y<=r.y+r.h});
 if(idx<0||aux.open.includes(idx)||aux.matched.includes(aux.cards[idx]))return;
 aux.open.push(idx);
 if(aux.open.length===2){
  aux.moves++;
  if(aux.cards[aux.open[0]]===aux.cards[aux.open[1]]){
   aux.matched.push(aux.cards[idx]);score+=16;aux.open=[];
   if(aux.matched.length===8){finish(true,false);return}
  }else{aux.locked=true;aux.turnAt=ticks+50}
 }paint();
}
function tickMemory(dt){
 if(aux.locked&&ticks>=aux.turnAt){aux.locked=false;aux.open=[]}
 if(ticks>=60*90)finish(false,false);
}
function drawMemory(){
 ctx.fillStyle="#cbbcfb";ctx.font="15px system-ui";ctx.fillText("Знайди 8 пар · "+Math.max(0,Math.ceil(90-ticks/60))+" с",15,62);
 aux.cards.forEach((v,i)=>{
  const r=memoryRect(i),front=aux.open.includes(i)||aux.matched.includes(v);
  rect(r.x,r.y,r.w,r.h,front?"#d4befa":"#44305b",11);
  ctx.font="bold 34px system-ui";ctx.textAlign="center";ctx.fillStyle=front?"#27133d":"#b38bfa";
  ctx.fillText(front?CARD_GLYPHS[v]:"?",r.x+r.w/2,r.y+49);ctx.textAlign="left";
 });
}
function spawnTile(){
 const cells=aux.tiles?.map((n,i)=>n===0?i:-1).filter(x=>x>=0)||[];
 if(!cells.length)return;
 const at=cells[Math.floor(Math.random()*cells.length)];
 aux.tiles[at]=Math.random()<.9?2:4;
}
function slide(where){
 if(!run||game!=="slide")return;
 const v=aux.tiles,next=Array(16).fill(0);let gained=0;
 for(let line=0;line<4;line++){
  let indices=[];
  for(let i=0;i<4;i++){
   const r=where==="left"||where==="right"?line:i,c=where==="left"||where==="right"?i:line;
   indices.push(r*4+c);
  }
  if(where==="right"||where==="down")indices.reverse();
  const arr=indices.map(i=>v[i]).filter(Boolean),merged=[];
  for(let k=0;k<arr.length;k++){
   if(k+1<arr.length&&arr[k]===arr[k+1]){const n=arr[k]*2;merged.push(n);gained+=n;k++}
   else merged.push(arr[k]);
  }
  merged.forEach((x,j)=>{next[indices[j]]=x});
 }
 if(v.every((x,i)=>x===next[i]))return;
 aux.tiles=next;aux.moves++;score+=gained;spawnTile();
 if(aux.tiles.some(x=>x>=512)){finish(true,false);return}
 if(!canSlide()){finish(false,false);return}
 paint();
}
function canSlide(){
 if(aux.tiles.some(x=>!x))return true;
 for(let y=0;y<4;y++)for(let x=0;x<4;x++){
  const i=y*4+x;
  if(x<3&&aux.tiles[i]===aux.tiles[i+1])return true;
  if(y<3&&aux.tiles[i]===aux.tiles[i+4])return true;
 }return false;
}
function tickSlide(dt){}
function drawSlide(){
 ctx.font="15px system-ui";ctx.fillStyle="#ffe3b8";ctx.fillText("З'єднуй плитки до 512",17,75);
 aux.tiles.forEach((n,i)=>{
  const x=16+(i%4)*83,y=115+Math.floor(i/4)*87;
  const colors={0:"#28304d",2:"#e9dfc4",4:"#e8c79e",8:"#f3a86e",16:"#f58376",32:"#fb6579",64:"#f950a2",128:"#b785f5",256:"#7addd2",512:"#f3d769"};
  rect(x,y,76,78,colors[n]||"#eee",9);
  if(n){ctx.font="bold "+(n>=128?23:29)+"px system-ui";ctx.textAlign="center";ctx.fillStyle=n>=16?"#fff":"#433243";ctx.fillText(String(n),x+38,y+48);ctx.textAlign="left"}
 });
}

function start(){if(!document.body.classList.contains("pz-unlocked"))return;hub();dashboard()}
window.addEventListener("pz:unlocked",start);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&document.body.classList.contains("pz-unlocked"))dashboard()});
if(document.readyState!=="loading")setTimeout(start,300);
else document.addEventListener("DOMContentLoaded",()=>setTimeout(start,400),{once:true});
})();