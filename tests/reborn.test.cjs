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
 assert.equal(version.build,"85.1");
 for(const path of ["reborn-v80.css","benny-reborn-v80.js","gym-reborn-v80.js","wardrobe-v73.js","onboarding-v69.js","three-studio-v72.js","model-sources-v77.js","exercise-visuals-v803.js","exercise-gallery-v81.js","benny-chat-v81.js","benny-v81.css","art-engine-v82.js","art-v82.css","art-raster-v83.js","art-v83.css","benny-voice-v83.js","benny-v83.css","art-cinema-v84.js","reborn-v84.css","nav-icons-v84.js","reborn-v85.js","reborn-v85.css"]){
  assert.ok(fs.existsSync(path),"missing "+path);
 }
 for(const ref of ["./reborn-v80.css?v=80.31","./benny-reborn-v80.js?v=80.3","./onboarding-v69.js?v=80.3","./wardrobe-v73.js?v=82.1","./art-engine-v82.js?v=82.1","./art-v82.css?v=82.1","./art-raster-v83.js?v=84.0","./art-v83.css?v=83.0","./benny-voice-v83.js?v=85.1","./benny-v83.css?v=83.0","./art-cinema-v84.js?v=84.0","./reborn-v84.css?v=84.0","./nav-icons-v84.js?v=84.0","./reborn-v85.js?v=85.0","./reborn-v85.css?v=85.1","./exercise-visuals-v803.js?v=80.3","./benny-food-v57.js?v=80.3"])assert.ok(html.includes(ref),"missing index ref "+ref);
 assert.ok(read("onboarding-v69.js").includes("./gym-reborn-v80.js?v=80.3"));
 assert.ok(read("interface-v61.js").includes('V85.1 · '));
 assert.ok(html.includes('V85.1 · ПУЗОПАД'));
 assert.ok(read("sw.js").includes("puzopad-v851-20261027"));
 assert.ok(html.includes('window.pzBennyContextV80?.()'));
});
test("classic JavaScript modules parse",()=>{
 for(const f of ["benny-reborn-v80.js","gym-reborn-v80.js","wardrobe-v73.js","onboarding-v69.js","interface-v61.js","arcade-v70.js","sw.js","exercise-visuals-v803.js","exercise-gallery-v81.js","benny-chat-v81.js","benny-food-v57.js","art-engine-v82.js","art-raster-v83.js","benny-voice-v83.js","art-cinema-v84.js","nav-icons-v84.js","reborn-v85.js"]){
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
 assert.ok(src.includes('viewPreview("species",hero.id)'));
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
 assert.ok(!index.includes('type="module" src="./three-studio-v72.js'),"3D engine must be disabled");
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
 assert.ok(index.includes('./benny-chat-v81.js?v=83.0'));
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

test("ART REBORN: all hero/pet pairs render independently, switching scenes preserves profile",()=>{
 const events=new Map();
 const data={profile:{created:true,name:"BANGER",species:"frog",pet:"dog",petName:"Суречка"},coins:30,foods:[{k:503}],sleep:[1],wardrobeV73:{wear:{torso:"starter"},petWear:{head:"bow"}}};
 const window={pzActiveUserId:"acct-A",addEventListener:(event,fn)=>events.set(event,fn),dispatchEvent:()=>{}};
 const document={readyState:"loading",addEventListener(){},getElementById:()=>null,body:{classList:{contains:()=>true}}};
 let saves=0;
 vm.runInNewContext(read("art-engine-v82.js"),{window,document,db:data,localStorage:{getItem:()=>"ru"},setTimeout:()=>{},persist:()=>saves++,Event:class Event{},console});
 const art=window.pzArtV82;
 const pairs=[["frog","dog"],["robot","dog"],["kisyusha","panda"],["kisyun","cat"],["robot","dragon"],["luna","robodog"]];
 for(const [hero,pet] of pairs){
  data.profile.species=hero;data.profile.pet=pet;data.profile.petName=pet;
  const host={dataset:{},setAttribute(name,value){this[name]=value}};
  art.renderScene(host);
  assert.ok(host.innerHTML.startsWith('<svg '),"must render full SVG");
  assert.ok(host.innerHTML.includes("BANGERVERSE"));
  assert.ok(host.innerHTML.includes(pet));
  assert.ok(host.innerHTML.length>5000);
 }
 const first=JSON.stringify({profile:data.profile,coins:data.coins,foods:data.foods,sleep:data.sleep});
 art.chooseScene("halloween");assert.equal(data.artV82.scene,"halloween");
 assert.equal(JSON.stringify({profile:data.profile,coins:data.coins,foods:data.foods,sleep:data.sleep}),first,"scenes must not touch user records");
 assert.equal(saves,1);
 assert.ok(art.HEROES.length>=8);
 assert.ok(Object.keys(art.PET_INFO).length>=20);
 assert.equal(art.SCENES.length,7);
});
test("ART REBORN wardrobe switching never locks a companion to a hero",()=>{
 const data={coins:300,profile:{created:true,name:"BANGER",species:"frog",pet:"dog",petName:"Суречка"},foods:[{id:"food1",k:100}],wardrobeV73:{owned:["starter"],wear:{torso:"starter"},petItems:["bow","scarf"],pets:["none","dog","cat","hamster"],petNames:{dog:"Суречка"},petWardrobes:{dog:{head:"bow"},cat:{neck:"scarf"}}}};
 const window={pzActiveUserId:"acct-A",addEventListener(){},dispatchEvent(){},pzArtV82:{HEROES:[{id:"frog"},{id:"robot"},{id:"kisyusha"},{id:"kisyun"}]}};
 const document={readyState:"loading",addEventListener(){},getElementById:()=>null};
 let saves=0;
 const code=read("wardrobe-v73.js").replace('function render(){','function render(){return;');
 vm.runInNewContext(code,{db:data,document,window,localStorage:{getItem:()=>"ru"},Event:class Event{},persist:()=>saves++,updateDashboardV16:()=>{},console});
 const api=window.pzWardrobeV73;api.setup();
 api.chooseHero("robot");
 assert.equal(data.profile.pet,"dog","robot keeps same Surachka");
 assert.equal(data.profile.species,"robot");
 const cat=api.PETS.find(x=>x[0]==="cat");
 api.choosePet(cat);
 assert.equal(data.profile.species,"robot","pet switching must not replace robot");
 assert.equal(data.profile.pet,"cat");
 assert.equal(data.wardrobeV73.petWear.neck,"scarf","cat has own outfit");
 const dog=api.PETS.find(x=>x[0]==="dog");
 api.choosePet(dog);
 assert.equal(data.profile.pet,"dog");
 assert.equal(data.wardrobeV73.petWear.head,"bow","Surachka's own clothes survived");
 api.chooseHero("frog");
 assert.equal(data.profile.pet,"dog");
 assert.deepEqual(data.foods,[{id:"food1",k:100}]);
 assert.equal(data.coins,300);
 assert.ok(saves>=4);
});

test("v82 complete outfit sets: paid once, try-on never charges, other hero keeps clothes",()=>{
 const data={coins:320,profile:{created:true,name:"BANGER",species:"frog",pet:"dog",petName:"Суречка"},artV82:{scene:"city"},foods:[{id:"verified",k:503}],wardrobeV73:{owned:["starter"],wear:{torso:"starter"},petItems:[],pets:["none","dog","cat","hamster"]}};
 const window={pzActiveUserId:"account-1",addEventListener(){},dispatchEvent(){},pzArtV82:{HEROES:[{id:"frog"},{id:"robot"}]}};
 const document={readyState:"loading",addEventListener(){},getElementById:()=>null};
 let persists=0;
 const code=read("wardrobe-v73.js").replace("function render(){","function render(){return;");
 vm.runInNewContext(code,{db:data,window,document,localStorage:{getItem:()=>"ru"},Event:class Event{},persist:()=>persists++,updateDashboardV16:()=>{}});
 const api=window.pzWardrobeV73;api.setup();
 const street=api.SETS.find(x=>x.id==="street");
 api.chooseSet(street);
 assert.equal(data.coins,280);
 assert.ok(data.wardrobeV73.owned.includes("sneakers"));
 api.chooseSet(street);
 assert.equal(data.coins,280,"re-equipping an owned set never charges again");
 assert.equal(data.profile.pet,"dog");
 assert.equal(data.profile.petName,"Суречка");
 api.chooseHero("robot");
 assert.equal(data.wardrobeV73.wear.torso,"starter");
 data.coins=12;const previous=JSON.stringify(data.wardrobeV73.wear);
 api.chooseSet(api.SETS.find(x=>x.id==="cyber"));
 assert.equal(data.coins,12,"insufficient balance never charges");
 assert.equal(JSON.stringify(data.wardrobeV73.wear),previous,"insufficient balance never equips");
 assert.deepEqual(data.foods,[{id:"verified",k:503}]);
 assert.ok(persists>=3);
});
test("v82 full-set preview changes composed appearance but not wallet or saved scene",()=>{
 const d={coins:17,profile:{created:true,species:"frog",pet:"cat",petName:"Мася"},artV82:{scene:"city"},wardrobeV73:{wear:{torso:"starter"},petWear:{}}};
 const w={pzActiveUserId:"acct-A",pzWardrobePreviewV73:{uid:"acct-A",which:"set",id:"halloween"},pzWardrobeV73:{HERO:[["pumpkincoat","torso"],["witchhat","head"],["batcape","back"],["halloweenmask","face"]],SETS:[{id:"halloween",items:["pumpkincoat","witchhat","batcape","halloweenmask"],scene:"halloween"}]},addEventListener(){}};
 vm.runInNewContext(read("art-engine-v82.js"),{window:w,db:d,document:{readyState:"loading",addEventListener(){},getElementById:()=>null},localStorage:{getItem:()=>"ru"},setTimeout:()=>{},console});
 const composed=w.pzArtV82.current();
 assert.equal(composed.heroWear.torso,"pumpkincoat");
 assert.equal(composed.scene,"halloween");
 assert.equal(d.artV82.scene,"city");
 assert.equal(d.wardrobeV73.wear.torso,"starter");
 assert.equal(d.coins,17);
});
test("v82 interactive art gallery is safe and includes all combinable heroes and pets",()=>{
 const p=read("gallery/v82-preview.html"),art=read("art-engine-v82.js");
 assert.ok(p.includes("art-engine-v82.js"));
 assert.ok(p.includes('id="chooseHero"')&&p.includes('id="choosePet"')&&p.includes('id="chooseScene"'));
 assert.ok(art.includes("function heroArt(")&&art.includes("function petArt(")&&art.includes("function sceneArt("));
 assert.ok(!read("index.html").includes('type="module" src="./three-studio-v72.js'));
});

test("v82 preview pet shows selected species name and its own gear without changing active pet",()=>{
 const saved={coins:50,profile:{created:true,species:"robot",pet:"dog",petName:"Суречка"},artV82:{scene:"city"},wardrobeV73:{wear:{torso:"starter"},heroWardrobes:{robot:{torso:"starter"},frog:{torso:"royal"}},petWear:{head:"bow"},petWardrobes:{dog:{head:"bow"},cat:{neck:"scarf"}},petNames:{cat:"Мася"}}};
 const window={pzActiveUserId:"acct",pzWardrobePreviewV73:{uid:"acct",which:"pettype",id:"cat"},addEventListener(){}};
 vm.runInNewContext(read("art-engine-v82.js"),{window,db:saved,document:{readyState:"loading",addEventListener(){},getElementById:()=>null},localStorage:{getItem:()=>"ru"},setTimeout:()=>{}});
 let state=window.pzArtV82.current();
 assert.equal(state.hero,"robot");
 assert.equal(state.pet,"cat");
 assert.equal(state.pname,"Мася");
 assert.equal(state.petWear.neck,"scarf");
 assert.equal(saved.profile.pet,"dog");
 assert.equal(saved.profile.petName,"Суречка");
 window.pzWardrobePreviewV73={uid:"acct",which:"species",id:"frog"};
 state=window.pzArtV82.current();
 assert.equal(state.heroWear.torso,"royal");
 assert.equal(saved.profile.species,"robot");
 assert.equal(saved.coins,50);
});

test("v83: original raster image assets are checked into the app and used as independently selectable sprites",()=>{
 for(const id of ["pepe","surechka","kisyusha","masya","bender","robodog"]){
  const p="assets/art-v83/"+id+".webp";
  assert.ok(fs.existsSync(p),p+" missing");
  assert.ok(fs.statSync(p).size>8000,p+" empty");
 }
 const source=read("art-raster-v83.js"),voice=read("benny-voice-v83.js");
 for(const s of ["frog:","robot:","dog:","cat:","robodog:","original.current()","images(\"hero\"","images(\"pet\""]){
  assert.ok(source.includes(s),s+" is not combined independently");
 }
 for(const s of ["MediaRecorder","rec.pause()","rec.resume()","banger-transcribe","sendText(words)","synth.speak(speech)","stopCall","speech.onend"]){
  assert.ok(voice.includes(s),s+" missing in voice module");
 }
 assert.ok(html.includes('./art-raster-v83.js?v=84.0'));
 assert.ok(html.includes('./benny-voice-v83.js?v=85.1'));
 assert.ok(read("sw.js").includes('art-v83'));
});

test("v84 premium scenes are limited to exact paired looks and artwork is checked in",()=>{
 const assets=["banger_surechka_city","kisyusha_masya_city","bender_robodog_city","banger_surechka_winter"];
 for(const filename of assets){
  const p="assets/scenes-v84/"+filename+".webp";
  assert.ok(fs.existsSync(p),p+" missing");
  assert.ok(fs.statSync(p).size>30000,p+" must have real painted pixels");
 }
 const script=read("art-cinema-v84.js");
 assert.ok(script.includes("qualify"),"match and wardrobe integrity guard");
 assert.ok(script.includes('frog|dog|city'),"Suri and Pepe scene");
 assert.ok(script.includes('kisyusha|cat|city'),"Kisyusha Masya scene");
 assert.ok(script.includes('robot|robodog|city'),"Bender robot scene");
 assert.ok(script.includes('frog|dog|winter'),"winter look and Surachka must map to full seasonal artwork");
 assert.ok(script.includes("if(!file)"),"all other pairs fall back to independent composer");
 assert.ok(read("nav-icons-v84.js").includes("data-tab"),"unified UI icon source");
 assert.ok(read("benny-voice-v83.js").includes('mic.onclick=()=>{if(rec||blob){sendRecording();return}begin(false)}'),"one tap starts, second sends");
 assert.ok(read("benny-voice-v83.js").includes("begin(true);"),"call opens microphone without second tap");
});

test("v85: auth startup, iPhone width safety and playable illustrated city",()=>{
 const index=read("index.html"),css=read("reborn-v85.css"),js=read("reborn-v85.js");
 assert.ok(index.includes('class="pz-locked pz-checking"'),"initial app must not flash login");
 assert.ok(index.includes('id="pz-login" hidden'),"login hidden until auth check");
 assert.ok(index.includes('viewport-fit=cover')&&!index.includes("user-scalable=no"),"safe area without disabling pinch accessibility");
 assert.ok(css.includes("#home .v16-resource:has(#v16Mana)"));
 assert.ok(css.includes("#home .v17-hp"));
 assert.ok(css.includes("input,select,textarea{font-size:16px"),"avoid iOS input zoom");
 assert.ok(css.includes("#city .bang-map .bang-pin"),"map pins stay actionable");
 for(const loc of ["home","work","shop","gym","fuel"])assert.ok(index.includes('data-destination="'+loc+'"'));
 assert.ok(js.includes('goTo("arcade")'),"coins link to arcades");
 assert.ok(js.includes('goTo("wardrobe")'),"shop promotional button enters wardrobe");
 assert.ok(css.includes("banger_surechka_city.webp"),"existing curated cinematic artwork");
});

test("v85.1 Benny voice uses actual microphone waveform with safe AudioContext fallback",()=>{
 const src=read("benny-voice-v83.js"),css=read("reborn-v85.css");
 for(const line of ["createAnalyser()","getByteFrequencyData","startSoundMeter(stream)","stopSoundMeter();","pz85-call-wave","requestAnimationFrame"]){
  assert.ok(src.includes(line),line+" missing");
 }
 assert.ok(css.includes(".pz85-call-wavebar"));
 assert.ok(css.includes("font-size:16px!important"),"prevent iOS input zoom");
});
