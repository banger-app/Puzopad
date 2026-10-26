import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";
const Q=id=>document.getElementById(id);
let root,renderer,homeRenderer,scene,camera,homeCamera,figure,last=0,drag=false,oldX=0,parts={};
const PALETTES=[
 {name:"Лісовий / Лесной",color:0x56d97b,cost:0},
 {name:"Неоновий / Неоновый",color:0xff349a,cost:20},
 {name:"Океан / Океан",color:0x55c5f8,cost:20},
 {name:"Золотий / Золотой",color:0xf7c45d,cost:40}
];
const OUTFITS=[
 {name:"Повсякденний / Домашний",key:"casual",color:0x252b49,cost:0,icon:"👕"},
 {name:"Робота / Рабочий",key:"work",color:0x496970,cost:25,icon:"🦺"},
 {name:"Спорт / Спорт",key:"gym",color:0xe33a91,cost:20,icon:"🏋️"},
 {name:"Легендарний / Легендарный",key:"hero",color:0x7c5ff2,cost:60,icon:"🛡️"}
];
const state=()=>typeof db==="undefined"?null:db;
function mat(col,metal=0){return new THREE.MeshStandardMaterial({color:col,roughness:.44,metalness:metal});}
function ball(parent,x,y,z,w,h,d,col){const g=new THREE.SphereGeometry(1,24,16),m=new THREE.Mesh(g,mat(col));m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
function cube(parent,x,y,z,w,h,d,col){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(col));m.position.set(x,y,z);parent.add(m);return m;}
function group(x=0,y=0,z=0){let g=new THREE.Group();g.position.set(x,y,z);return g;}
function build(){
 if(figure){scene.remove(figure);parts={}}
 let data=state(),species=data?.profile?.species||"frog";
 let color=PALETTES[data?.heroStyle?.palette||0]?.color||0x56d97b;
 let outfit=OUTFITS.find(x=>x.key===(data?.heroStyle?.outfit||"casual"))||OUTFITS[0];
 let character=group(0,-.24,0);figure=character;scene.add(character);
 const eye=0xffffff,pupil=0x111525;
 if(species==="robot"){
  ball(character,0,.7,0,.58,.72,.35,0x637ea6);
  cube(character,0,1.73,0,1.1,.95,.85,0xe5eaf9);
  cube(character,0,1.74,.44,.87,.53,.09,0x161e39);
  ball(character,-.21,1.8,.5,.10,.11,.05,0xff3da5);
  ball(character,.21,1.8,.5,.10,.11,.05,0xff3da5);
  cube(character,0,2.34,0,.08,.29,.08,0x8dffe0);
  ball(character,0,2.52,0,.12,.12,.12,0xff58a9);
  parts.torso=cube(character,0,.65,.35,1.1,.9,.18,outfit.color);
 }else if(species==="human"){
  ball(character,0,1.83,0,.53,.63,.47,0xe9b48d);
  ball(character,-.2,1.9,.44,.1,.08,.07,eye);ball(character,.2,1.9,.44,.1,.08,.07,eye);
  ball(character,-.2,1.9,.51,.035,.05,.03,pupil);ball(character,.2,1.9,.51,.035,.05,.03,pupil);
  ball(character,0,.8,0,.64,.78,.44,0xe9b48d);
  parts.torso=ball(character,0,.78,.24,.65,.72,.43,outfit.color);
 }else{
  ball(character,0,.78,0,.75,.80,.56,color);
  ball(character,0,1.67,0,.79,.69,.59,color);
  ball(character,-.4,2.15,.1,.28,.31,.27,color);
  ball(character,.4,2.15,.1,.28,.31,.27,color);
  ball(character,-.40,2.20,.31,.16,.18,.12,eye);
  ball(character,.40,2.20,.31,.16,.18,.12,eye);
  ball(character,-.40,2.20,.425,.070,.10,.035,pupil);
  ball(character,.40,2.20,.425,.070,.10,.035,pupil);
  ball(character,0,1.42,.56,.38,.065,.055,0x1a3740);
  ball(character,0,.76,.35,.56,.5,.32,0xd3e6ab);
  parts.torso=ball(character,0,.88,.32,.74,.53,.48,outfit.color);
 }
 [-1,1].forEach(side=>{
  const skin=species==="human"?0xe9b48d:species==="robot"?0x94a7ca:color;
  const a=ball(character,side*.75,.92,0,.26,.47,.29,skin);a.rotation.z=side*-.32;
  ball(character,side*.39,-.01,.07,.32,.55,.33,skin);
  ball(character,side*.40,-.49,.35,.43,.18,.39,skin);
 });
 cube(character,0,.66,.83,.20,.20,.07,outfit.key==="hero"?0xf9cd5b:0x56e8bc);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(1.44,60),new THREE.MeshBasicMaterial({color:0x56254d,transparent:true,opacity:.27}));floor.rotation.x=-Math.PI/2;floor.position.y=-.64;character.add(floor);
}
function sceneStart(){
 const container=Q("pz3d-stage");if(!container||container.dataset.ready==="1")return;
 container.dataset.ready="1";container.innerHTML="";
 try{
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(0,1.0,7.9);camera.lookAt(0,.95,0);
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;container.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xcedfff,0x392b4d,3.3));
  let key=new THREE.DirectionalLight(0xffffff,3.1);key.position.set(2,6,4);scene.add(key);
  let rim=new THREE.DirectionalLight(0xff48b6,2.5);rim.position.set(-3,2,-4);scene.add(rim);
  build();
  function resize(){const w=container.clientWidth||320,h=container.clientHeight||380;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  new ResizeObserver(resize).observe(container);resize();
  const homeHost=Q("pz3d-home-stage");
  if(homeHost){
    try{
      homeRenderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
      homeRenderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
      homeRenderer.outputColorSpace=THREE.SRGBColorSpace;
      homeHost.appendChild(homeRenderer.domElement);
      homeCamera=camera.clone();
      homeCamera.position.set(0,1.0,8.0);homeCamera.lookAt(0,.95,0);
      const sizeHome=()=>{const w=homeHost.clientWidth||290,h=homeHost.clientHeight||260;homeRenderer.setSize(w,h,false);homeCamera.aspect=w/h;homeCamera.updateProjectionMatrix()};
      new ResizeObserver(sizeHome).observe(homeHost);sizeHome();
      homeRenderer.domElement.style.touchAction="pan-y";
      homeRenderer.domElement.addEventListener("pointerdown",e=>{drag=true;oldX=e.clientX;homeRenderer.domElement.setPointerCapture(e.pointerId)});
      homeRenderer.domElement.addEventListener("pointerup",()=>drag=false);
      homeRenderer.domElement.addEventListener("pointercancel",()=>drag=false);
      homeRenderer.domElement.addEventListener("pointermove",e=>{if(!drag)return;figure.rotation.y+=(e.clientX-oldX)*.012;oldX=e.clientX});
      document.body.classList.add("pz-three-ready");
    }catch(e){console.warn("Home 3D unavailable",e)}
  }
  renderer.domElement.style.touchAction="pan-y";
  renderer.domElement.addEventListener("pointerdown",e=>{drag=true;oldX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)});
  renderer.domElement.addEventListener("pointerup",()=>drag=false);
  renderer.domElement.addEventListener("pointercancel",()=>drag=false);
  renderer.domElement.addEventListener("pointermove",e=>{if(!drag)return;figure.rotation.y+=(e.clientX-oldX)*.012;oldX=e.clientX});
  const loop=t=>{requestAnimationFrame(loop);if(!document.body.classList.contains("pz-unlocked")||document.hidden)return;
   if(figure){figure.position.y=-.24+Math.sin(t/700)*.035;if(!drag)figure.rotation.y+=.0025;}
   renderer.render(scene,camera);if(homeRenderer&&homeCamera)homeRenderer.render(scene,homeCamera);};requestAnimationFrame(loop);
 }catch(err){container.dataset.ready="0";container.textContent="3D недоступно на этом устройстве: "+err.message}
}
function persistStyle(){const d=state();if(!d)return;if(typeof persist==="function")persist();renderOptions();build();}
function wardrobe(){
 const d=state(),target=Q("pz3d-shop");if(!d||!target)return;
 d.heroStyle||={palette:0,outfit:"casual",owned:["casual"],ownedPalettes:[0]};
 target.innerHTML="";
 const section=(title,items,render)=>{let box=document.createElement("div");box.className="pz3d-shop-row";
  const h=document.createElement("h3");h.textContent=title;box.append(h);
  items.forEach((item,index)=>{const button=document.createElement("button");button.type="button";button.className="pz3d-item";
   render(button,item,index);box.append(button);});target.append(box);};
 section("🎨 Колір героя / Цвет героя",PALETTES,(button,item,i)=>{
  const own=d.heroStyle.ownedPalettes.includes(i),selected=d.heroStyle.palette===i;
  button.textContent=(selected?"✓ ":"")+item.name+(own?"":" · "+item.cost+" 🪙");
  button.onclick=()=>{if(!own){if((d.coins||0)<item.cost){alert("Не хватает игровых монет");return}d.coins-=item.cost;d.heroStyle.ownedPalettes.push(i)}d.heroStyle.palette=i;persistStyle();}
 });
 section("🧥 Одяг / Одежда",OUTFITS,(button,item)=>{
  const own=d.heroStyle.owned.includes(item.key),selected=d.heroStyle.outfit===item.key;
  button.textContent=item.icon+" "+(selected?"✓ ":"")+item.name+(own?"":" · "+item.cost+" 🪙");
  button.onclick=()=>{if(!own){if((d.coins||0)<item.cost){alert("Сначала заработай монеты в заданиях или мини-игре");return}d.coins-=item.cost;d.heroStyle.owned.push(item.key)}d.heroStyle.outfit=item.key;persistStyle()}
 });
 const footer=document.createElement("p");footer.className="pz3d-small";
 footer.textContent="Монет: "+(d.coins||0)+" · Поворот персонажа пальцем · Покупки косметические, на здоровье не влияют.";
 target.append(footer);
}
function renderOptions(){wardrobe();const name=Q("pz3d-name");const d=state();if(name&&d)name.textContent=d.profile?.name||"Мой герой";}
function init(){
 if(!document.body.classList.contains("pz-unlocked"))return;
 const d=state();if(!d?.profile?.created)return;
 const area=Q("pz3d-area");if(!area)return;
 const old=Q("v20AvatarSlot");if(old&&document.body.classList.contains("pz-three-ready"))old.style.visibility="hidden";
 const hero=Q("pz3d-home");if(hero){hero.hidden=false;hero.textContent="🎮 "+(d.profile.name||"Герой")+" · 3D студія";hero.onclick=()=>{if(typeof go==="function")go("wardrobe");area.scrollIntoView({behavior:"smooth",block:"start"})};}
 sceneStart();renderOptions();build();
}
window.pz3dRefresh=init;
window.addEventListener("pz:unlocked",init);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,700));else setTimeout(init,200);
