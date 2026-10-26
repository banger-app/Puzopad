"use strict";
// BANGERVERSE REBORN quality gate. Native Node runner, no npm dependencies.
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const read=file=>fs.readFileSync(file,"utf8");
const html=read("index.html");
const version=JSON.parse(read("version.json"));
test("all v80 production scripts & styles exist and build matches",()=>{
 assert.equal(version.build,"81");
 for(const path of ["reborn-v80.css","benny-reborn-v80.js","gym-reborn-v80.js","wardrobe-v73.js","onboarding-v69.js","three-studio-v72.js","model-sources-v77.js","exercise-visuals-v803.js","exercise-gallery-v81.js","benny-chat-v81.js","benny-v81.css"]){
  assert.ok(fs.existsSync(path),"missing "+path);
 }
 for(const ref of ["./reborn-v80.css?v=80.31","./benny-reborn-v80.js?v=80.3","./onboarding-v69.js?v=80.3","./wardrobe-v73.js?v=80.3","./three-studio-v72.js?v=80.3","./exercise-visuals-v803.js?v=80.3","./benny-food-v57.js?v=80.3"])assert.ok(html.includes(ref),"missing index ref "+ref);
 assert.ok(read("onboarding-v69.js").includes("./gym-reborn-v80.js?v=80.3"));
 assert.ok(read("interface-v61.js").includes('V81 · '));
 assert.ok(html.includes('V81 · ПУЗОПАД'));
 assert.ok(read("sw.js").includes("puzopad-v81-20261026"));
 assert.ok(html.includes('window.pzBennyContextV80?.()'));
});
test("classic JavaScript modules parse",()=>{
 for(const f of ["benny-reborn-v80.js","gym-reborn-v80.js","wardrobe-v73.js","onboarding-v69.js","interface-v61.js","arcade-v70.js","sw.js","exercise-visuals-v803.js","exercise-gallery-v81.js","benny-chat-v81.js","benny-food-v57.js"]){
  assert.doesNotThrow(()=>new vm.Script(read(f),{filename:f}));
 }
});
function fakeDocument(){
 const registry=new Map(),events=new Map();
 class Element {
  constructor(tag){this.tag=tag;this.children=[];this.textContent="";this.className="";this.value="";this.attributes={};this.style={};this.dataset={};this.hidden=false;this.classList={add(){},remove(){},contains(x){return x==="pz-unlocked"}};}
  set id(v){this._id=v;registry.set(v,this)}
  get id(){return this._id}
  append(...nodes){this.children.push(...nodes)}
  replaceChildren(...nodes){this.children=nodes}
  insertBefore(el){this.children.unshift(el)}
  setAttribute(k,v){this.attributes[k]=v}
  closest(){return {classList:{add(){}}}}
  focus(){}
 }
 const d={readyState:"loading",body:{classList:{contains(x){return x==="pz-unlocked"},remove(){},add(){}}},createElement:tag=>new Element(tag),getElementById:id=>registry.get(id)||null,addEventListener:(name,fn)=>events.set("doc:"+name,fn)};
 const w={pzActiveUserId:"banger-test",addEventListener:(name,fn)=>events.set(name,fn)};
 return {d,w,registry,events,Element};
}
const flatten=n=>[n,...(n.children||[]).flatMap(flatten)];
test("gym draft is not a logged workout and only completed exercises persist",()=>{
 const {d,w,Element,events,registry}=fakeDocument();
 for(const id of ["pz-gym-zone","pz-gym-history","pz-gym-status"]){const x=new Element("div");x.id=id}
 const data={profile:{created:true,name:"BANGER"},workouts:[]};
 let saves=0;
 vm.runInNewContext(read("gym-reborn-v80.js"),{window:w,document:d,db:data,localStorage:{getItem:()=>"ru"},setTimeout:()=>{},setInterval:()=>1,clearInterval:()=>{},confirm:()=>true,stamp:()=>({date:"2026-10-26",time:"18:20"}),persist:()=>{saves++},console});
 events.get("pz:unlocked")();
 const zone=registry.get("pz-gym-zone");
 const tap=phrase=>{const b=flatten(zone).find(n=>n.tag==="button"&&String(n.textContent).includes(phrase));assert.ok(b,"button "+phrase);b.onclick()};
 tap("Начать тренировку");
 assert.equal(data.workouts.length,0,"starting a workout must not fake exercise results");
 const actualMinutes=flatten(zone).find(n=>n.tag==="input"&&n.type==="number"&&n.value==="6");assert.ok(actualMinutes);
 actualMinutes.value="6";tap("Выполнено");
 assert.equal(data.workouts.length,0);
 assert.equal(data.gymV80.session.done.length,1);
 tap("Завершить и записать");
 assert.equal(data.workouts.length,1);
 assert.equal(data.workouts[0].completed.length,1);
 assert.equal(data.gymV80.rotation,1);
 assert.equal(data.gymV80.session,null);
 assert.ok(saves>=3);
});
test("photo scan requires quantity, does not auto-eat, respects locations and inventory units",()=>{
 const {d,w}=fakeDocument();
 const doc=d;const savedStatuses={};
 doc.getElementById=id=>id==="pz80-stock-status"?(savedStatuses[id]||={textContent:""}):id==="pz80-stock-confirm"?(savedStatuses[id]||={disabled:false}):null;
 const data={profile:{created:true},coins:17,foods:[],loot:[]};let saves=0;
 const code=read("benny-reborn-v80.js").replace(/\}\)\(\);\s*$/,"window.__qa={set:(p,id)=>{proposals=p;scanKey=id;used=false},import:confirmImport,move:moveStock,eat:consume,gameDayOf};})();");
 assert.ok(code.includes("window.__qa="));
 vm.runInNewContext(code,{window:w,document:doc,db:data,localStorage:{getItem:()=>"ru"},persist:()=>{saves++},confirm:()=>true,prompt:()=>"100",alert:()=>{},stamp:()=>({date:"2026-10-26",time:"18:20"}),console});
 const api=w.__qa;
 assert.equal(api.gameDayOf("2026-10-26","08:00"),"2026-10-25");
 assert.equal(api.gameDayOf("2026-10-26","19:00"),"2026-10-26");
 const stock=[{name:"Творог",quantity:null,unit:"g",k:102,p:18,f:3,c:2,where:"home",selected:true}];
 api.set(stock,"scan-1");api.import();assert.equal(data.loot.length,0);
 stock[0].quantity=500;api.import();assert.equal(data.loot.length,1);assert.equal(data.foods.length,0);
 api.import();assert.equal(data.loot.length,1,"duplicate scan");
 api.move(data.loot[0],"transit");assert.equal(data.loot[0].where,"transit");
 api.move(data.loot[0],"work");assert.equal(data.loot[0].where,"work");
 api.eat(data.loot[0]);assert.equal(data.foods.length,1);assert.equal(data.foods[0].k,102);assert.equal(data.loot[0].qty,400);
 api.set([{name:"Йогурт",quantity:1,unit:"pcs",k:null,p:null,f:null,c:null,where:"home",selected:true}],"scan-2");
 api.import();const before=data.foods.length;api.eat(data.loot.find(x=>x.name==="Йогурт"));assert.equal(data.foods.length,before,"unknown macros / pcs must not be silently logged");
 assert.ok(saves>=5);
});
test("wardrobe uses fixed viewer and independent scrolling inventory",()=>{
 const src=read("wardrobe-v73.js"),css=read("reborn-v80.css");
 assert.ok(src.includes("pz80-studio-shell")&&src.includes("pz80-market"));
 assert.ok(src.includes('viewPreview("species",kind)'));
 assert.ok(css.includes("overflow-y:auto")&&css.includes("pz80-showcase"));
 assert.ok(src.includes('if(!spend(x[3]))'),"purchase protection remains");
});

// Visual QA: a distinct motion diagram for each programmed exercise and explicit menu/food actions.
test("illustrated guided gym and safe diary deletion have release hooks",()=>{
 const gym=read("gym-reborn-v80.js"),visual=read("exercise-visuals-v803.js"),index=read("index.html");
 for(const exercise of ["warm","cool","incline","shoulder","triceps","pulldown","row","biceps","legpress","hinge","plank","stepper"]){
  assert.ok(visual.includes(exercise+':')||visual.includes(exercise+'[')||visual.includes(exercise+'"'),"missing illustrated pose "+exercise);
 }
 assert.ok(gym.includes("pz803-workout-art")&&gym.includes("pz803-step-thumb"));
 assert.ok(index.includes('data-pz-food-id=')&&index.includes('data-pz-refine-id='));
 assert.ok(index.includes('decodeURIComponent(remove.dataset.pzFoodId)'));
 assert.ok(read("three-studio-v72.js").includes('!PREMIUM_HERO[heroKey]'),"imported armor must not be obscured");
 assert.ok(index.includes("lastVoiceBlob")&&index.includes("retryVoice.onclick"),"recording must remain retryable");
});

test("Benny string ID: delete works; calorie clarification updates only one existing portion",()=>{
 const source=read("index.html");
 const begin=source.indexOf("function removeFood(id){");
 const end=source.indexOf("function addLoot(){",begin);
 assert.ok(begin>0&&end>begin);
 const code=source.slice(begin,end);
 const records=[
 {id:"benny_2026-10-26_cracker_1",name:"Крекеры с семечками",qty:"5 штук",k:450,p:12,f:20,c:55},
 {id:"benny_2026-10-26_cracker_2",name:"Крекеры с семечками",qty:"5 штук",k:503,p:12,f:20,c:55},
 {id:999,name:"Другая еда",qty:"1 штука",k:75}
 ];
 const d={foods:records.slice()};let saves=0,rerenders=0;
 const fn=new Function("db","persist","render","renderDiaryRange","v17RenderDiary","toast","confirm","prompt","document",code+";return {removeFood,refineFood};");
 const ops=fn(d,()=>saves++,()=>rerenders++,()=>rerenders++,()=>rerenders++,()=>{},()=>true,()=>"503",{addEventListener(){}});
 assert.equal(ops.refineFood("benny_2026-10-26_cracker_1"),true);
 assert.equal(d.foods.length,3,"clarifying food must never append new meal");
 assert.equal(d.foods[0].k,503,"calories updated in place");
 assert.equal(d.foods[0].revisions[0].oldK,450);
 assert.equal(ops.removeFood("benny_2026-10-26_cracker_1"),true);
 assert.equal(d.foods.length,2,"delete only the selected string ID");
 assert.ok(d.foods.some(x=>x.id==="benny_2026-10-26_cracker_2"),"other duplicate preserved for manual choice");
 assert.ok(d.foods.some(x=>x.id===999));
 assert.ok(saves===2&&rerenders===6,"save and all diary views refreshed");
});

test("Benny v81 accepts up to five photos and keeps user's multimodal draft",()=>{
 const src=read("benny-chat-v81.js"),index=read("index.html");
 assert.ok(index.includes('id="bai-file" type="file" accept="image/*" multiple'));
 assert.ok(index.includes('./benny-chat-v81.js?v=81.0'));
 assert.ok(index.includes('./exercise-gallery-v81.js?v=81.0'));
 assert.ok(index.includes('./benny-v81.css?v=81.0'));
 assert.ok(!index.includes('<script id="benny-photo-preview-v55">'),"old single-photo widget must be disabled");
 assert.ok(src.includes("const MAX_PHOTOS=5"));
 assert.ok(src.includes("image_data_urls:urls"),"send all selected images in one API request");
 assert.ok(src.includes('fileInput.value=""'),"allow consecutive image selections");
 assert.ok(src.includes("selection.map(compress)"),"compress photo selection");
 assert.ok(src.includes("sending=false"),"maintain retry flow");
 assert.ok(src.includes("replyVoice")&&src.includes("speechSynthesis"),"optional spoken answer");
 assert.ok(read("benny-v81.css").includes("pz81-typing span"),"animated three-dot indicator");
});
test("gym v81 uses verified photograph mappings and fallbacks are not required online",()=>{
 const s=read("exercise-gallery-v81.js");
 for(const name of ["warm","press","incline","shoulder","triceps","pulldown","row","biceps","legpress","hinge","plank","cool"]){
  assert.ok(new RegExp(name+':"').test(s),name+" missing photo mapping");
 }
 assert.ok(s.includes("f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5"),"pin source images to commit");
 assert.ok(s.includes("The Unlicense"),"retain provenance");
 const gym=read("gym-reborn-v80.js");
 assert.ok(gym.includes("window.pzExerciseVisuals.thumb"),"compact timeline uses thumbnails");
});

test("v81 local photographic bundle has all 30 licensed assets",()=>{
 const gallery=read("exercise-gallery-v81.js");
 const labels=[...gallery.matchAll(/\w+:"([A-Za-z_]+)"/g)].map(m=>m[1]);
 const unique=[...new Set(labels)];
 for(const slug of unique){
  for(const frame of ["0","1"])assert.ok(fs.existsSync("assets/exercises-v81/"+slug+"/"+frame+".jpg"),slug+" missing "+frame);
 }
 assert.ok(gallery.includes("./assets/exercises-v81/"));
 assert.ok(read("sw.js").includes('caches.open(REV+"-gym")'));
});
