import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const $=id=>document.getElementById(id);
const loader=new GLTFLoader();
const PET_FILES={dog:"pet-corgi-gobkit.glb",duck:"pet-duck-gobkit.glb",hippo:"pet-hippo-gobkit.glb",rhino:"pet-rhino-gobkit.glb",platypus:"pet-platypus-gobkit.glb",shark:"pet-shark-gobkit.glb",bat:"pet-bat-gobkit.glb",cat:"pet-cat.glb",hamster:"pet-hamster.glb",rabbit:"pet-rabbit.glb",fox:"pet-fox.glb",panda:"pet-panda.glb",parrot:"pet-parrot.glb",penguin:"pet-penguin.glb",fish:"pet-fish.glb"};
const COLORS=[0x56d97b,0xff349a,0x55c5f8,0xf7c45d];
const CLOTH=[0x252b49,0x496970,0xe33a91,0x7c5ff2];
const VIEWS=[
 {id:"pz3d-stage",kind:"hero"},
 {id:"pz3d-home-stage",kind:"home"},
 {id:"pz-pet3d-stage",kind:"pet"}
];
let initialized=false,framesStarted=false,renderers=[],loadCache=new Map(),lastUid=null;
const store=()=>typeof db==="undefined"?null:db;
function preview(kind){
 const p=window.pzShopPreview;
 return p&&p.account===window.pzActiveUserId&&p.kind===kind?p.key:null;
}
function src(name){return "./assets/3d/"+name+"?v=73"}
function notice(view,msg){if(!view?.host)return;const x=view.host.querySelector(".pz3d-load-status")||document.createElement("p");x.className="pz3d-load-status";x.textContent=msg;view.host.append(x)}
function clearNotice(view){view.host?.querySelector(".pz3d-load-status")?.remove()}
function makeViewer(spec){
 const host=$(spec.id);if(!host)return null;
 host.dataset.viewer="loading";
 try{
  host.textContent="";
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power",preserveDrawingBuffer:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x000000,0);
  renderer.domElement.style.touchAction="pan-y";renderer.domElement.setAttribute("aria-label","Об'ємна 3D-модель. Проведи пальцем для обертання");
  host.append(renderer.domElement);
  const scene=new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xe6f4ff,0x3a2146,3.8));
  const key=new THREE.DirectionalLight(0xffffff,3.3);key.position.set(-2,5,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0xff67bf,2.1);rim.position.set(3,3,-3);scene.add(rim);
  const camera=new THREE.PerspectiveCamera(36,1,.06,100);
  camera.position.set(0,1.3,spec.kind==="home"?7.8:6.7);camera.lookAt(0,1.18,0);
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.85,.16,48),new THREE.MeshStandardMaterial({color:0x302640,metalness:.25,roughness:.6}));
  floor.position.y=-.15;scene.add(floor);
  const stage=new THREE.Group();scene.add(stage);
  const view={...spec,host,renderer,scene,camera,stage,serial:0,key:"",drag:false,lastX:0};
  renderer.domElement.addEventListener("pointerdown",e=>{view.drag=true;view.lastX=e.clientX;try{renderer.domElement.setPointerCapture(e.pointerId)}catch(_){}});
  renderer.domElement.addEventListener("pointermove",e=>{if(!view.drag)return;stage.rotation.y+=(e.clientX-view.lastX)*.012;view.lastX=e.clientX});
  renderer.domElement.addEventListener("pointerup",()=>view.drag=false);
  renderer.domElement.addEventListener("pointercancel",()=>view.drag=false);
  const resize=()=>{
   const w=Math.max(200,host.clientWidth||300),h=Math.max(160,host.clientHeight||330);
   renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  };
  view.resize=resize;resize();
  if(typeof ResizeObserver!=="undefined")new ResizeObserver(resize).observe(host);
  host.dataset.viewer="ready";
  notice(view,"Завантажуємо 3D…");
  renderer.domElement.addEventListener("webglcontextlost",e=>{e.preventDefault();notice(view,"3D-контекст пристрою втрачено. Повторно відкрий Гардероб.");});
  return view;
 }catch(e){host.textContent="3D недоступне на цьому пристрої: "+e.message;host.dataset.viewer="error";return null}
}
function model(name){
 if(!loadCache.has(name))loadCache.set(name,loader.loadAsync(src(name)).then(r=>r.scene).catch(e=>{loadCache.delete(name);throw e}));
 return loadCache.get(name).then(x=>x.clone(true));
}
function material(col){return new THREE.MeshStandardMaterial({color:col,metalness:.12,roughness:.5})}
function ball(parent,x,y,z,rx,ry,rz,color){const g=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),material(color));g.position.set(x,y,z);g.scale.set(rx,ry,rz);parent.add(g);return g}
function placeholderPet(key){
 const root=new THREE.Group();
 const color={turtle:0x67bd76,crocodile:0x50906c,hedgehog:0xc39971,otter:0xa17b60,owl:0xb48c72,dragon:0x8c6ccb}[key]||0xaaa6c6;
 ball(root,0,.75,0,.77,.55,.47,color);
 ball(root,0,1.43,.30,.49,.47,.42,color);
 for(const s of [-1,1]){ball(root,s*.22,1.55,.67,.074,.088,.038,0x12192e);ball(root,s*.52,.37,.23,.24,.26,.24,color)}
 if(key==="turtle"){ball(root,0,.93,-.2,.74,.46,.54,0x3e865a)}
 if(key==="crocodile"){ball(root,0,1.24,.72,.36,.2,.57,0x649672)}
 if(key==="dragon"){for(const s of [-1,1])ball(root,s*.39,1.99,.12,.17,.38,.14,0xb6a2e7)}
 if(key==="owl"){for(const s of [-1,1])ball(root,s*.22,1.58,.71,.22,.24,.1,0xffe6ba)}
 return root;
}
function getPetKey(){return store()?.profile?.pet||"none"}
function getHero(){
 const d=store(),p=d?.profile||{},sp=p.species||"frog";
 return sp==="human"?"hero-human.glb":sp==="robot"?"hero-robot.glb":"hero-frog-0-0.glb";
}
function normalize(modelNode,height){
 const bounds=new THREE.Box3().setFromObject(modelNode);
 const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 const maximum=Math.max(.001,size.y,size.x*1.3,size.z*1.3);
 const scale=height/maximum;
 modelNode.scale.multiplyScalar(scale);
 modelNode.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
 return Math.max(.2,size.y*scale);
}
function addAccessories(root,style,height,type,shirt,skin){
 const pink=material(0xff65b5),gold=material(0xffd46b),white=material(0xcde8fa);
 const defaultHeight=height||2;
 if(type==="hero"){
  const torso=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),material(shirt));
  torso.position.set(0,defaultHeight*.35,.33);torso.scale.set(.5,.24,.11);root.add(torso);
  if(style==="hero"){
   const cape=new THREE.Mesh(new THREE.ConeGeometry(.56,1.15,4,1,true),material(0x7c5ff2));cape.position.set(0,defaultHeight*.43,-.34);cape.rotation.x=Math.PI;root.add(cape);
  }
  return;
 }
 if(style==="plain")return;
 const y=defaultHeight*1.04;
 if(style==="cap"||style==="crown"){
  const top=new THREE.Mesh(style==="crown"?new THREE.CylinderGeometry(.24,.39,.28,7):new THREE.CylinderGeometry(.39,.42,.20,24),style==="crown"?gold:pink);top.position.set(0,y+.02,0);root.add(top);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.05,24),style==="crown"?gold:white);brim.position.set(0,y-.09,.06);root.add(brim);
  if(style==="crown")for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const peak=new THREE.Mesh(new THREE.ConeGeometry(.09,.22,4),gold);peak.position.set(Math.sin(a)*.31,y+.28,Math.cos(a)*.31);root.add(peak)}
 }else if(style==="bow"){
  ball(root,-.18,y-.16,.42,.23,.15,.1,0xff55af);ball(root,.18,y-.16,.42,.23,.15,.1,0xff55af);ball(root,0,y-.16,.47,.11,.11,.13,0xffdf78);
 }else if(style==="scarf"){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.49,.105,10,24),pink);ring.rotation.x=Math.PI/2;ring.position.set(0,defaultHeight*.55,.05);root.add(ring);
  ball(root,.27,defaultHeight*.42,.39,.12,.25,.09,0xff58a8);
 }else if(style==="glasses"){
  for(const side of [-1,1]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.18,.04,8,22),white);ring.position.set(side*.23,defaultHeight*.73,.49);root.add(ring)}
  ball(root,0,defaultHeight*.73,.5,.11,.04,.05,0x9ed9fa);
 }else if(style==="backpack"){
  const bag=new THREE.Mesh(new THREE.BoxGeometry(.57,.64,.25),material(0x8c6bdd));bag.position.set(0,defaultHeight*.40,-.46);root.add(bag);
 }
}

function v73Gear(root,kind,h){
 const d=store(),state=d?.wardrobeV73;if(!state)return;
 const who=kind==="hero"?"hero":"pet";
 const equipped=who==="hero"?state.wear||{}:state.petWear||{};
 const p=window.pzWardrobePreviewV73;
 const shown={...equipped};
 if(p&&p.uid===window.pzActiveUserId&&p.which===who){
  const slots={cap:"head",helmet:"head",crown:"head",glasses:"face",visor:"face",sneakers:"feet",boots:"feet",cape:"back",wings:"back",halo:"aura",
   bow:"head",petcap:"head",petcrown:"head",scarf:"neck",collar:"neck",petglasses:"face",backpack:"back",petwings:"back",petaura:"aura",starter:"torso",work:"torso",gym:"torso",knight:"torso",void:"torso",royal:"torso"};
  if(slots[p.id])shown[slots[p.id]]=p.id;
 }
 const y=h||2.4;
 const mat=(col,em=0)=>new THREE.MeshStandardMaterial({color:col,metalness:.16,roughness:.42,emissive:em,emissiveIntensity:em?.30:0});
 const mag=mat(0xf549ad),gold=mat(0xffc24c),silver=mat(0xb2d6ff),dark=mat(0x242944),aura=mat(0x8e68ff,0x7e2dff);
 const geo=(shape,m,x,yy,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(shape,m);o.position.set(x,yy,z);o.scale.set(sx,sy,sz);root.add(o);return o};
 const sphere=(m,x,yy,z,sx,sy,sz)=>geo(new THREE.SphereGeometry(1,18,12),m,x,yy,z,sx,sy,sz);
 const head=shown.head,face=shown.face,feet=shown.feet,back=shown.back,glow=shown.aura,neck=shown.neck;
 const hy=who==="hero"?y*.92:y*.94;
 if(head==="cap"||head==="petcap"||head==="helmet"){
  geo(new THREE.CylinderGeometry(.36,.37,.2,20),head==="helmet"?silver:mag,0,hy,0);
  geo(new THREE.CylinderGeometry(.49,.49,.045,24),head==="helmet"?silver:dark,0,hy-.10,.12);
 }
 if(head==="crown"||head==="petcrown"){
  geo(new THREE.CylinderGeometry(.36,.46,.18,10),gold,0,hy,0);
  for(let i=0;i<7;i++){const t=i*2*Math.PI/7;geo(new THREE.ConeGeometry(.093,.25,5),gold,Math.sin(t)*.36,hy+.2,Math.cos(t)*.36)}
 }
 if(head==="bow"){sphere(mag,-.17,hy-.10,.44,.19,.14,.09);sphere(mag,.17,hy-.10,.44,.19,.14,.09);sphere(gold,0,hy-.10,.48,.1,.1,.09)}
 if(face==="glasses"||face==="petglasses"){
  for(const side of [-1,1])geo(new THREE.TorusGeometry(.18,.035,8,22),silver,side*.21,y*.67,.5);
  geo(new THREE.BoxGeometry(.15,.035,.05),dark,0,y*.67,.5);
 }
 if(face==="visor")geo(new THREE.BoxGeometry(.88,.25,.17),mat(0x30a6d4,0x1d6fcc),0,y*.7,.43);
 if(feet==="sneakers"||feet==="boots")for(const side of [-1,1])sphere(feet==="boots"?silver:mag,side*.32,.12,.23,.30,feet==="boots"?.29:.16,.32);
 if(back==="cape"||back==="wings"||back==="petwings"){
  if(back==="cape")geo(new THREE.ConeGeometry(.6,y*.55,5,1,true),mag,0,y*.38,-.46).rotation.x=Math.PI;
  else for(const side of [-1,1])geo(new THREE.ConeGeometry(.34,y*.5,4),mat(0xae80ff,0x5d20dd),side*.55,y*.54,-.29).rotation.z=side*.35;
 }
 if(back==="backpack")geo(new THREE.BoxGeometry(.61,.60,.29),mat(0x9d75ed),0,y*.40,-.49);
 if(neck==="scarf"||neck==="collar")geo(new THREE.TorusGeometry(.48,.10,9,24),neck==="collar"?gold:mag,0,y*.58,.05).rotation.x=Math.PI/2;
 if(glow==="halo"||glow==="petaura")geo(new THREE.TorusGeometry(.55,.055,11,36),aura,0,y+0.32,0).rotation.x=Math.PI/2;
 if(who==="hero"&&shown.torso){
  const variant={starter:0x252b49,work:0x496970,gym:0xe33a91,knight:0x809ac5,void:0x2e2452,royal:0xbf944c}[shown.torso]||0x252b49;
  const plate=geo(new THREE.SphereGeometry(1,18,14),mat(variant),0,y*.4,.35,.49,.27,.16);
  if(shown.torso==="royal")sphere(gold,0,y*.39,.51,.14,.14,.05);
  if(shown.torso==="void")sphere(aura,0,y*.39,.51,.14,.14,.05);
 }
}

async function put(view,kind,x=0,z=0,scale=1){
 const d=store(),p=d?.profile||{},name=kind==="hero"?getHero():PET_FILES[getPetKey()];
 if(kind==="pet"&&getPetKey()==="none")return;
 let obj;
 if(name){
  try{obj=await model(name)}catch(e){
   console.warn("3D model failed",name,e);
   if(kind==="hero")throw e;
   obj=placeholderPet(getPetKey());
  }
 }else obj=placeholderPet(getPetKey());
 const target=new THREE.Group();target.position.x=x;target.position.z=z;target.scale.setScalar(scale);
 const actual=normalize(obj,kind==="hero"?2.65:1.8);
 const rig=new THREE.Group();rig.add(obj);target.add(rig);
 v73Gear(target,kind,actual);
 if(kind==="pet")addAccessories(target,preview("pet")||p.petStyle||"plain",actual*scale,"pet");
 else addAccessories(target,preview("outfit")||d?.heroStyle?.outfit||"casual",actual,"hero",[0x252b49,0x496970,0xe33a91,0x7c5ff2][["casual","work","gym","hero"].indexOf(preview("outfit")||d?.heroStyle?.outfit||"casual")]||0x252b49);
 // Apply owned palette to frog model's green skin, while preserving eye white/black.
 if(kind==="hero"&&p.species!=="human"&&p.species!=="robot"){
  const col=COLORS[Number(preview("palette")??d?.heroStyle?.palette)||0]||COLORS[0];
  target.traverse(node=>{if(!node.isMesh||!node.material)return;
   if(["body","head","eye_bulb","hand","foot"].includes(node.name)){node.material=node.material.clone();node.material.color.setHex(col)}
  });
 }
 return target;
}
async function renderModels(view){
 if(!view?.host?.isConnected)return;
 const d=store(),p=d?.profile;
 if(!p?.created)return;
 const identity=[window.pzActiveUserId,p.species,p.pet,p.petStyle,p.petName,d.heroStyle?.palette,d.heroStyle?.outfit,JSON.stringify(d.wardrobeV73?.wear||{}),JSON.stringify(d.wardrobeV73?.petWear||{}),window.pzWardrobePreviewV73?.uid,window.pzWardrobePreviewV73?.id,preview("palette"),preview("outfit"),preview("pet"),view.kind].join("|");
 if(identity===view.key)return;
 view.key=identity;const serial=++view.serial;notice(view,"Завантажуємо справжню 3D модель…");
 try{
  const hero=view.kind!=="pet"?await put(view,"hero",view.kind==="home"?-.7:0,0,view.kind==="home"?.85:1):null;
  const pet=view.kind!=="hero"?await put(view,"pet",view.kind==="home"?.85:0,0,view.kind==="home"?.68:1):null;
  if(serial!==view.serial||window.pzActiveUserId!==identity.split("|")[0])return;
  view.stage.clear();if(hero)view.stage.add(hero);if(pet)view.stage.add(pet);
  if(view.kind==="home"&&hero){document.body.classList.add("pz-three-ready");}
  clearNotice(view);view.host.dataset.viewer="loaded";
 }catch(e){view.host.dataset.viewer="failed";notice(view,"3D поки не завантажилось: "+String(e.message||e)+". Перевір інтернет і перезавантаж сторінку.");}
}
function update(){
 if(!document.body.classList.contains("pz-unlocked")||!store()?.profile?.created)return;
 for(const spec of VIEWS){
  const host=$(spec.id);if(!host)continue;
  let v=renderers.find(x=>x.id===spec.id);
  if(!v){v=makeViewer(spec);if(v)renderers.push(v)}
  if(v)renderModels(v);
 }
 const nickname=store()?.profile?.name;if($("pz3d-name"))$("pz3d-name").textContent=nickname||"Герой";
}
function loop(t){
 requestAnimationFrame(loop);
 if(!document.body.classList.contains("pz-unlocked")||document.hidden)return;
 for(const v of renderers){
  if(!v.host.isConnected||!v.host.getClientRects().length)continue;
  if(!v.drag)v.stage.rotation.y+=.0015;
  v.renderer.render(v.scene,v.camera);
 }
}
window.pz3dRefresh=update;
window.addEventListener("pz:unlocked",()=>setTimeout(update,150));
window.addEventListener("pz:style-change",()=>setTimeout(update,30));
document.addEventListener("click",e=>{if(e.target?.closest?.("#pz-pets-v61,#pz-pet-save"))setTimeout(update,90)});
window.addEventListener("visibilitychange",()=>{if(!document.hidden)update()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(update,450));else setTimeout(update,400);
if(!framesStarted){framesStarted=true;requestAnimationFrame(loop)}
