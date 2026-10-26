import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {makeHero,makeHamster} from "./premium-models-v76.js";
import {PREMIUM_HERO,PREMIUM_PET} from "./model-sources-v77.js";
import {clone as cloneRig} from "three/addons/utils/SkeletonUtils.js";
const $=id=>document.getElementById(id);
const loader=new GLTFLoader();
const PET_FILES={dog:"pet-dog.glb",duck:"pet-duck-gobkit.glb",hippo:"pet-hippo-gobkit.glb",rhino:"pet-rhino-gobkit.glb",platypus:"pet-platypus-gobkit.glb",shark:"pet-shark-gobkit.glb",bat:"pet-bat-gobkit.glb",cat:"pet-cat.glb",hamster:"pet-hamster.glb",rabbit:"pet-rabbit.glb",fox:"pet-fox.glb",panda:"pet-panda.glb",parrot:"pet-parrot.glb",penguin:"pet-penguin.glb",fish:"pet-fish.glb",lion:"pet-lion.glb",tiger:"pet-tiger.glb"};
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
function src(name){return /^https:\/\//.test(name)?name:"./assets/3d/"+name+"?v=78"}
function notice(view,msg){if(!view?.host)return;const x=view.host.querySelector(".pz3d-load-status")||document.createElement("p");x.className="pz3d-load-status";x.textContent=msg;view.host.append(x)}
function clearNotice(view){view.host?.querySelector(".pz3d-load-status")?.remove()}
function makeViewer(spec){
 const host=$(spec.id);if(!host)return null;
 host.dataset.viewer="loading";
 try{
  host.textContent="";
  const isHome=spec.kind==="home";
  const renderer=new THREE.WebGLRenderer({alpha:isHome,antialias:true,powerPreference:"low-power",preserveDrawingBuffer:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x101326,isHome?0:1);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=isHome?1.02:1.15;
  renderer.domElement.style.touchAction="pan-y";renderer.domElement.setAttribute("aria-label","Об'ємна 3D-модель. Проведи пальцем для обертання");
  host.append(renderer.domElement);
  const scene=new THREE.Scene();scene.background=isHome?null:new THREE.Color(0x101326);
  scene.add(new THREE.HemisphereLight(0xe6f4ff,0x3a2146,2.2));
  const key=new THREE.DirectionalLight(0xffffff,3.0);key.position.set(-2,5,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0xff67bf,1.4);rim.position.set(3,3,-3);scene.add(rim);
  const camera=new THREE.PerspectiveCamera(36,1,.06,100);
  camera.position.set(0,1.36,spec.kind==="home"?5.25:4.75);camera.lookAt(0,1.22,0);
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(1.67,1.73,.23,64),new THREE.MeshStandardMaterial({color:0x292444,metalness:.45,roughness:.38}));
  floor.position.y=-.18;scene.add(floor);
  const edge=new THREE.Mesh(new THREE.TorusGeometry(1.67,.025,8,64),new THREE.MeshStandardMaterial({color:0xff8bc1,emissive:0x85265a,emissiveIntensity:.35}));
  edge.rotation.x=Math.PI/2;edge.position.y=-.055;scene.add(edge);
  const fillPink=new THREE.PointLight(0xffa8db,13,6);fillPink.position.set(-1.2,2.4,2);scene.add(fillPink);
  const fillBlue=new THREE.PointLight(0x97cafa,9,6);fillBlue.position.set(1.5,2.3,-1.5);scene.add(fillBlue);
  const stage=new THREE.Group();scene.add(stage);
  const view={...spec,host,renderer,scene,camera,stage,serial:0,key:"",drag:false,lastX:0,lastFrame:0,mixers:[]};
  renderer.domElement.addEventListener("pointerdown",e=>{view.drag=true;view.lastX=e.clientX;try{renderer.domElement.setPointerCapture(e.pointerId)}catch(_){}});
  renderer.domElement.addEventListener("pointermove",e=>{if(!view.drag)return;stage.rotation.y+=(e.clientX-view.lastX)*.012;view.lastX=e.clientX});
  renderer.domElement.addEventListener("pointerup",()=>view.drag=false);
  renderer.domElement.addEventListener("pointercancel",()=>view.drag=false);
  const resize=()=>{
   const w=Math.max(200,host.clientWidth||300),h=Math.max(160,host.clientHeight||330);
   renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(stage.children.length)fitCamera(view);
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
 if(!loadCache.has(name))loadCache.set(name,loader.loadAsync(src(name)).catch(e=>{loadCache.delete(name);throw e}));
 return loadCache.get(name).then(g=>({object:cloneRig(g.scene),animations:g.animations||[]}));
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
function getPetKey(){
 const p=window.pzWardrobePreviewV73;
 return p?.uid===window.pzActiveUserId&&p.which==="pettype"?p.id:(store()?.profile?.pet||"none");
}
function getHero(){
 const d=store(),p=d?.profile||{},sp=p.species||"frog";
 const palette=Math.max(0,Math.min(3,Number(preview("palette")??d?.heroStyle?.palette)||0));
 return sp==="human"?"hero-human.glb":sp==="robot"?"hero-robot.glb":"hero-frog-0-"+palette+".glb";
}
// Fit geometry without changing animated glTF roots. The root may be animated by its clips.
function normalize(modelNode,wantedHeight){
 modelNode.updateMatrixWorld(true);
 const bounds=new THREE.Box3();
 modelNode.traverse(node=>{
  if((node.isMesh||node.isSkinnedMesh)&&node.visible!==false){
   const b=new THREE.Box3().setFromObject(node);
   if(!b.isEmpty())bounds.union(b);
  }
 });
 if(bounds.isEmpty())bounds.setFromObject(modelNode);
 const size=bounds.getSize(new THREE.Vector3());
 const center=bounds.getCenter(new THREE.Vector3());
 const longSide=Math.max(.001,size.y,size.x*1.16,size.z*1.16);
 const factor=wantedHeight/longSide;
 const aligner=new THREE.Group();
 aligner.add(modelNode);
 // Translate a parent, not the animated model itself. This avoids overriding glTF bones/root tracks.
 aligner.position.set(-center.x,-bounds.min.y,-center.z);
 const normalizer=new THREE.Group();
 normalizer.scale.setScalar(factor);
 normalizer.add(aligner);
 return {root:normalizer,actualHeight:Math.max(.2,size.y*factor)};
}
// Reframe camera from the combined *visible* hero/pet geometry so neither looks tiny or floats outside shot.
function fitCamera(view){
 if(!view?.stage?.children?.length)return;
 view.stage.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(view.stage);
 if(bounds.isEmpty())return;
 const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 if(!Number.isFinite(size.y)||!Number.isFinite(center.y))return;
 const half=Math.tan(THREE.MathUtils.degToRad(view.camera.fov)/2);
 const a=Math.max(.50,view.camera.aspect||1);
 const fitV=Math.max(1.9,size.y)/(2*half);
 const fitH=Math.max(1.25,size.x)/(2*half*a);
 const distance=THREE.MathUtils.clamp(Math.max(fitV,fitH)*1.28,3.45,8.4);
 view.camera.position.set(center.x,center.y+.17,center.z+distance);
 view.camera.lookAt(center.x,center.y+.04,center.z);
 view.camera.near=.05;view.camera.far=80;view.camera.updateProjectionMatrix();
}
function safeIdle(animations){
 return animations.find(c=>/^(idle|stand|rest|breath|sit)(?:[\\s_.-]|$)/i.test(c.name))
  ||animations.find(c=>/idle|standing|breathing/i.test(c.name)&&!/attack|die|death|jump|run|walk|hit|hurt/i.test(c.name))
  ||null;
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
   bow:"head",petcap:"head",petcrown:"head",scarf:"neck",collar:"neck",petglasses:"face",backpack:"back",petwings:"back",petaura:"aura",petpumpkin:"head",petwitch:"head",petghost:"aura",witchhat:"head",pumpkincoat:"torso",phantom:"torso",batcape:"back",halloweenmask:"face",starter:"torso",work:"torso",gym:"torso",knight:"torso",void:"torso",royal:"torso"};
  if(slots[p.id])shown[slots[p.id]]=p.id;
 }
 const y=h||2.4;
 const mat=(col,em=0)=>new THREE.MeshStandardMaterial({color:col,metalness:.16,roughness:.42,emissive:em,emissiveIntensity:em?.30:0});
 const mag=mat(0xf549ad),gold=mat(0xffc24c),silver=mat(0xb2d6ff),dark=mat(0x242944),aura=mat(0x8e68ff,0x7e2dff);
 const geo=(shape,m,x,yy,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(shape,m);o.position.set(x,yy,z);o.scale.set(sx,sy,sz);root.add(o);return o};
 const sphere=(m,x,yy,z,sx,sy,sz)=>geo(new THREE.SphereGeometry(1,18,12),m,x,yy,z,sx,sy,sz);
 const head=shown.head,face=shown.face,feet=shown.feet,back=shown.back,glow=shown.aura,neck=shown.neck;
 const hy=who==="hero"?y*.94:y*.78;
 if(head==="cap"||head==="petcap"||head==="helmet"){
  geo(new THREE.CylinderGeometry(.36,.37,.2,20),head==="helmet"?silver:mag,0,hy,0);
  geo(new THREE.CylinderGeometry(.49,.49,.045,24),head==="helmet"?silver:dark,0,hy-.10,.12);
 }
 if(head==="crown"||head==="petcrown"){
  geo(new THREE.CylinderGeometry(.36,.46,.18,10),gold,0,hy,0);
  for(let i=0;i<7;i++){const t=i*2*Math.PI/7;geo(new THREE.ConeGeometry(.093,.25,5),gold,Math.sin(t)*.36,hy+.2,Math.cos(t)*.36)}
 }
 if(head==="bow"){sphere(mag,-.17,hy-.10,.44,.19,.14,.09);sphere(mag,.17,hy-.10,.44,.19,.14,.09);sphere(gold,0,hy-.10,.48,.1,.1,.09)}
 if(head==="witchhat"||head==="petwitch"){
  const size=head==="petwitch"?.7:1;
  geo(new THREE.CylinderGeometry(.46*size,.46*size,.055,24),dark,0,hy+.1,0);
  geo(new THREE.ConeGeometry(.40*size,.75*size,24),mat(0x3c235b),0,hy+.49*size,0);
  geo(new THREE.CylinderGeometry(.30*size,.33*size,.075,24),mag,0,hy+.23*size,0);
 }
 if(head==="petpumpkin"){
  sphere(mat(0xf19a3a),0,hy+.18,0,.37,.30,.30);
  geo(new THREE.CylinderGeometry(.05,.08,.14,8),mat(0x528849),0,hy+.51,0);
 }
 if(face==="glasses"||face==="petglasses"){
  for(const side of [-1,1])geo(new THREE.TorusGeometry(.18,.035,8,22),silver,side*.21,y*.67,.5);
  geo(new THREE.BoxGeometry(.15,.035,.05),dark,0,y*.67,.5);
 }
 if(face==="visor")geo(new THREE.BoxGeometry(.88,.25,.17),mat(0x30a6d4,0x1d6fcc),0,y*.7,.43);
 if(face==="halloweenmask"){
  sphere(mat(0xe4e4d9),0,y*.77,.49,.34,.28,.09);
  for(const side of [-1,1])sphere(dark,side*.14,y*.80,.58,.09,.08,.03);
 }
 if(feet==="sneakers"||feet==="boots")for(const side of [-1,1])sphere(feet==="boots"?silver:mag,side*.32,.12,.23,.30,feet==="boots"?.29:.16,.32);
 if(back==="cape"||back==="wings"||back==="petwings"||back==="batcape"){
  if(back==="cape")geo(new THREE.ConeGeometry(.6,y*.55,5,1,true),mag,0,y*.38,-.46).rotation.x=Math.PI;
  else if(back==="batcape")for(const side of [-1,1])geo(new THREE.ConeGeometry(.49,y*.58,3),mat(0x1d2136),side*.48,y*.48,-.32).rotation.z=side*.58;
  else for(const side of [-1,1])geo(new THREE.ConeGeometry(.34,y*.5,4),mat(0xae80ff,0x5d20dd),side*.55,y*.54,-.29).rotation.z=side*.35;
 }
 if(back==="backpack")geo(new THREE.BoxGeometry(.61,.60,.29),mat(0x9d75ed),0,y*.40,-.49);
 if(neck==="scarf"||neck==="collar")geo(new THREE.TorusGeometry(.48,.10,9,24),neck==="collar"?gold:mag,0,y*.58,.05).rotation.x=Math.PI/2;
 if(glow==="halo"||glow==="petaura"||glow==="petghost")geo(new THREE.TorusGeometry(.55,.055,11,36),glow==="petghost"?mat(0xc7ecff,0x7f9edd):aura,0,y+.25,0).rotation.x=Math.PI/2;
 if(who==="hero"&&shown.torso&&shown.torso!=="starter"){
  const variant={starter:0x252b49,work:0x496970,gym:0xe33a91,knight:0x809ac5,void:0x2e2452,royal:0xbf944c,pumpkincoat:0xd88635,phantom:0x7485ae}[shown.torso]||0x252b49;
  // Wearable upper-body coat wraps the mannequin instead of floating as a chest orb.
  const coat=geo(new THREE.CylinderGeometry(.42,.38,.76,24),mat(variant),0,y*.48,.02);
  coat.scale.z=.85;
  for(const side of [-1,1]){
   const shoulder=geo(new THREE.SphereGeometry(1,18,12),mat(variant),side*.41,y*.56,.03,.21,.19,.27);
   const seam=geo(new THREE.BoxGeometry(.028,.52,.025),mat(0xe7c6ad),side*.24,y*.46,.36);
  }
  geo(new THREE.BoxGeometry(.16,.09,.045),shown.torso==="royal"?gold:silver,0,y*.55,.37);
  if(shown.torso==="royal")sphere(gold,0,y*.42,.38,.13,.13,.045);
  if(shown.torso==="void")sphere(aura,0,y*.42,.38,.13,.13,.045);
  if(shown.torso==="pumpkincoat")sphere(mat(0x182533),0,y*.42,.38,.13,.13,.04);
  if(shown.torso==="phantom")sphere(mat(0xc2d3ee),0,y*.42,.38,.13,.15,.04);
 }
}

async function put(view,kind,x=0,z=0,scale=1){
 const d=store(),p=d?.profile||{},petKey=view.kind==="home"?(p.pet||"none"):getPetKey();
 const pv=window.pzWardrobePreviewV73;
 const heroKey=view.kind==="home"?(p.species||"frog"):(pv?.uid===window.pzActiveUserId&&pv.which==="species"?pv.id:(p.species||"frog"));
 let anims=[];
 if(kind==="pet"&&petKey==="none")return;
 let obj;
 if(kind==="hero"){
  const previewState=window.pzWardrobePreviewV73;
  const hue=previewState?.uid===window.pzActiveUserId&&previewState.which==="palette"?Number(previewState.id):Number(preview("palette")??d?.heroStyle?.palette)||0;
  if(PREMIUM_HERO[heroKey]){
   try{const imported=await model(PREMIUM_HERO[heroKey]);obj=imported.object;anims=imported.animations}
   catch(e){console.warn("KayKit model unavailable, local hero fallback",heroKey,e);obj=makeHero("human",hue)}
  }else obj=makeHero(heroKey,hue);
 }else if(petKey==="hamster"){
  obj=makeHamster();
 }else{
  const filename=PREMIUM_PET[petKey]||PET_FILES[petKey];
  if(filename){
   try{const imported=await model(filename);obj=imported.object;anims=imported.animations}
   catch(e){
    console.warn("Imported pet unavailable, local backup",petKey,e);
    try{const local=await model(PET_FILES[petKey]||"pet-dog.glb");obj=local.object;anims=local.animations}
    catch(_){obj=placeholderPet(petKey)}
   }
  }else obj=placeholderPet(petKey);
 }
 const target=new THREE.Group();target.position.set(x,0,z);target.scale.setScalar(scale);
 const fitted=normalize(obj,kind==="hero"?2.75:2.05);
 const actual=fitted.actualHeight;target.add(fitted.root);
 const idle=safeIdle(anims);
 if(idle){
  const mixer=new THREE.AnimationMixer(obj);mixer.clipAction(idle).play();target.userData.mixer=mixer;
 }
 if(d?.wardrobeV73){
  // No legacy layers: independently equipped pieces, preview is non-destructive.
  const activePet=store()?.profile?.pet||"none";
  if((kind==="hero"&&!PREMIUM_HERO[heroKey])||(kind==="pet"&&petKey===activePet))v73Gear(target,kind,actual);
 }else if(kind==="pet"){
  addAccessories(target,preview("pet")||p.petStyle||"plain",actual,"pet");
 }else addAccessories(target,preview("outfit")||d?.heroStyle?.outfit||"casual",actual,"hero",0x252b49);
 return target;
}

async function renderModels(view){
 if(!view?.host?.isConnected)return;
 const d=store(),p=d?.profile;
 if(!p?.created)return;
 const identity=[window.pzActiveUserId,p.species,p.pet,p.petStyle,p.petName,d.heroStyle?.palette,d.heroStyle?.outfit,JSON.stringify(d.wardrobeV73?.wear||{}),JSON.stringify(d.wardrobeV73?.petWear||{}),window.pzWardrobePreviewV73?.uid,window.pzWardrobePreviewV73?.which,window.pzWardrobePreviewV73?.id,preview("palette"),preview("outfit"),preview("pet"),view.kind].join("|");
 if(identity===view.key)return;
 view.key=identity;const serial=++view.serial;notice(view,"Завантажуємо справжню 3D модель…");
 try{
  const hero=view.kind!=="pet"?await put(view,"hero",view.kind==="home"?-.72:0,0,view.kind==="home"?.95:1):null;
  const pet=view.kind!=="hero"?await put(view,"pet",view.kind==="home"?.90:0,0,view.kind==="home"?.78:1):null;
  if(serial!==view.serial||window.pzActiveUserId!==identity.split("|")[0])return;
  view.mixers=[];for(const old of view.stage.children.slice())view.stage.remove(old);if(hero){view.stage.add(hero);if(hero.userData.mixer)view.mixers.push(hero.userData.mixer)}if(pet){view.stage.add(pet);if(pet.userData.mixer)view.mixers.push(pet.userData.mixer)}
  fitCamera(view);
  if(view.kind==="home"&&hero){document.body.classList.add("pz-three-ready");}
  clearNotice(view);view.host.dataset.viewer="loaded";
 }catch(e){view.key="";view.host.dataset.viewer="failed";notice(view,"3D поки не завантажилось: "+String(e.message||e)+". Перевір інтернет і перезавантаж сторінку.");}
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
  const delta=Math.min(.06,Math.max(0,(t-(v.lastFrame||t))/1000));v.lastFrame=t;
  for(const mixer of v.mixers||[])mixer.update(delta);
  if(!v.drag)v.stage.rotation.y+=.0015;
  v.renderer.render(v.scene,v.camera);
 }
}
window.pz3dZoom=(kind,direction)=>{
 const id=kind==="pet"?"pz-pet3d-stage":"pz3d-stage";
 const v=renderers.find(x=>x.id===id);if(!v)return;
 v.camera.zoom=THREE.MathUtils.clamp(v.camera.zoom*(direction>0?1.2:1/1.2),.75,2.6);
 v.camera.updateProjectionMatrix();
};
window.pz3dReset=(kind)=>{
 const id=kind==="pet"?"pz-pet3d-stage":"pz3d-stage";
 const v=renderers.find(x=>x.id===id);if(!v)return;
 v.stage.rotation.set(0,0,0);v.camera.zoom=1;fitCamera(v);
};
window.pz3dRefresh=update;
window.addEventListener("pz:unlocked",()=>setTimeout(update,150));
window.addEventListener("pz:style-change",()=>setTimeout(update,30));
document.addEventListener("click",e=>{if(e.target?.closest?.("#pz-pets-v61,#pz-pet-save"))setTimeout(update,90)});
window.addEventListener("visibilitychange",()=>{if(!document.hidden)update()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(update,450));else setTimeout(update,400);
if(!framesStarted){framesStarted=true;requestAnimationFrame(loop)}
