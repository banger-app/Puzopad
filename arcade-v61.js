(function(){
"use strict";
const $=id=>document.getElementById(id);
const W=400,H=520;
let cv,ctx,playing=false,balls=[],blocks=[],paddle={x:160,y:470,w:84,h:13},score=0,lives=3,anim=0,move=200;
let startTime=0;
function user(){return typeof db!=="undefined"?db:null}
function day(){return typeof currentDay==="function"?currentDay():new Date().toISOString().slice(0,10)}
function message(t){const el=$("pz-arc-status");if(el)el.textContent=t}
function setupBlocks(){
 blocks=[];for(let row=0;row<5;row++)for(let col=0;col<6;col++){
 blocks.push({x:13+col*63,y:62+row*34,w:57,h:23,hp:row===0?2:1,color:["#f94da8","#a284ff","#48c6ee","#6feaab","#f3c45b"][row]})}
}
function draw(){
 ctx.clearRect(0,0,W,H);
 const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,"#141c32");g.addColorStop(1,"#321329");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.fillStyle="#faf4fc";ctx.font="bold 18px system-ui";ctx.fillText("NEON BREAKER",14,31);
 ctx.font="13px system-ui";ctx.fillText(score+" очков   •   "+lives+" жизни",257,31);
 for(const b of blocks){if(!b.hp)continue;ctx.fillStyle=b.color;ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,6);ctx.fill();if(b.hp>1){ctx.fillStyle="#fff";ctx.fillRect(b.x+8,b.y+7,b.w-16,3)}}
 ctx.fillStyle="#fff";ctx.shadowColor="#ff2d97";ctx.shadowBlur=15;
 ctx.beginPath();ctx.roundRect(paddle.x,paddle.y,paddle.w,paddle.h,7);ctx.fill();
 for(const b of balls){ctx.fillStyle="#ff4db4";ctx.beginPath();ctx.arc(b.x,b.y,8,0,2*Math.PI);ctx.fill();}
 ctx.shadowBlur=0;
 if(!playing){
 ctx.fillStyle="#cbd5ed";ctx.font="bold 20px system-ui";ctx.textAlign="center";
 ctx.fillText(score?"Раунд завершён":"Нажми «Начать игру»",W/2,300);
 ctx.font="13px system-ui";ctx.fillText("Веди платформу пальцем",W/2,323);ctx.textAlign="left";
 }
}
function reward(victory){
 let d=user();if(!d)return;
 d.arcade||={day:"",earned:0,best:0};
 const a=d.arcade,key=day();
 if(a.day!==key){a.day=key;a.earned=0}
 a.best=Math.max(a.best||0,score);
 const target=victory?20:Math.min(10,Math.floor(score/50)*2);
 const earned=Math.max(0,Math.min(20-(a.earned||0),target));
 if(earned){a.earned+=earned;d.coins=(Number(d.coins)||0)+earned;if(typeof persist==="function")persist();}
 message((victory?"🏆 Победа!":"Раунд окончен.")+" Очки: "+score+" · Монеты за этот раунд: +"+earned+" · Суточный лимит 20 🪙");
 if(typeof updateDashboardV16==="function")updateDashboardV16();
 if(typeof pz3dRefresh==="function")pz3dRefresh();
}
function finish(win){if(!playing)return;playing=false;cancelAnimationFrame(anim);reward(win);draw()}
function step(t){
 if(!playing)return;
 const dt=Math.min((t-startTime||16)/16,2.4);startTime=t;
 paddle.x+=Math.max(-22,Math.min(22,(move-paddle.w/2-paddle.x)*.20))*dt;
 paddle.x=Math.max(5,Math.min(W-paddle.w-5,paddle.x));
 let b=balls[0];b.x+=b.vx*dt;b.y+=b.vy*dt;
 if(b.x<9||b.x>W-9){b.vx*=-1;b.x=Math.max(9,Math.min(W-9,b.x))}
 if(b.y<47){b.vy=Math.abs(b.vy)}
 if(b.y+8>=paddle.y&&b.y<paddle.y+16&&b.x>=paddle.x&&b.x<=paddle.x+paddle.w&&b.vy>0){
   b.vy=-Math.abs(b.vy);b.vx=(b.x-(paddle.x+paddle.w/2))*.18;
 }
 for(let block of blocks){if(!block.hp)continue;
  if(b.x+7>block.x&&b.x-7<block.x+block.w&&b.y+7>block.y&&b.y-7<block.y+block.h){
   block.hp--;b.vy*=-1;score+=10;break;
  }}
 if(blocks.every(q=>!q.hp)){finish(true);return}
 if(b.y>H+15){lives--;if(lives<=0){finish(false);return}
  balls=[{x:200,y:390,vx:3.8,vy:-4.4}];}
 draw();anim=requestAnimationFrame(step);
}
function begin(){
 if(playing)return;
 if(!user()){message("Сначала войди в аккаунт");return}
 score=0;lives=3;move=W/2;paddle.x=160;
 balls=[{x:200,y:390,vx:3.7,vy:-4.6}];setupBlocks();playing=true;startTime=performance.now();
 message("Разбивай блоки, зарабатывай монеты на одежду. Не больше 20 монет за игровые сутки.");
 anim=requestAnimationFrame(step);
}
function init(){
 cv=$("pz-arc-canvas");if(!cv||cv.dataset.arcReady)return;
 cv.dataset.arcReady="1";ctx=cv.getContext("2d");if(!ctx)return;
 const moveTo=e=>{const b=cv.getBoundingClientRect();move=(e.clientX-b.left)*W/b.width};
 cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);moveTo(e)});
 cv.addEventListener("pointermove",moveTo);
 $("pz-arc-start").onclick=begin;setupBlocks();draw();
 const d=user();if(d?.arcade)message("Твой рекорд: "+(d.arcade.best||0)+" · Сыграй и заработай монеты");
}
window.addEventListener("pz:unlocked",init);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,600));else setTimeout(init,600);
})();