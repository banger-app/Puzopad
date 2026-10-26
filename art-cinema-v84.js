/* BANGERVERSE v84 — curated complete scene artwork.
 * These are whole scene paintings, not scissors-cut portraits over a placeholder.
 * They are only selected for combinations actually depicted by each artwork.
 * Unmatched hero/pet/scene combinations keep the existing independent 2D engine,
 * never silently substituting a different owned companion or costume.
 */
(function(){
"use strict";
const engine=window.pzArtV82;
if(!engine)return;
const base=engine.renderScene.bind(engine);
const scenes={
 "frog|dog|city":"banger_surechka_city.webp",
 "kisyusha|cat|city":"kisyusha_masya_city.webp",
 "robot|robodog|city":"bender_robodog_city.webp"
};
const label=(state)=>{
 const pets={dog:"Суречка",cat:"Мася",robodog:"Робопёс"};
 const heroes={frog:"БАНГЕР",kisyusha:"Кисюша",robot:"Бендер"};
 return (heroes[state.hero]||state.hero)+" · "+(pets[state.pet]||state.pet);
};
const qualify=(state,opts={})=>{
 const key=[state?.hero,state?.pet,opts.scene||state?.scene].join("|");
 const file=scenes[key];if(!file)return null;
 const gear=state.heroWear||{},petGear=state.petWear||{};
 // Complete scenes portray ONE canonical outfit. Real purchases and
 // changing clothing must immediately switch back to a layered preview.
 const modifiedGear=Object.entries(gear).some(([slot,id])=>
  id&&id!=="starter"&&id!=="none"&&!(slot==="torso"&&id==="starter"));
 const modifiedPet=Object.values(petGear).some(id=>id&&id!=="none");
 if(modifiedGear||modifiedPet)return null;
 if(window.pzWardrobePreviewV73?.uid===window.pzActiveUserId)return null;
 return file;
};
function render(target,opts={}){
 if(!target)return;
 const state=engine.current();
 if(!state)return base(target,opts);
 const file=qualify(state,opts);
 if(!file)return base(target,opts);
 const url="./assets/scenes-v84/"+file;
 target.classList.add("pz84-cinematic-stage");
 target.innerHTML="";
 const picture=document.createElement("picture"),img=document.createElement("img");
 img.src=url;img.alt=label(state)+" — цельная художественная сцена";img.loading="eager";img.decoding="async";img.className="pz84-cinematic-image";
 img.onerror=()=>{if(!img.isConnected)return;target.classList.remove("pz84-cinematic-stage");base(target,opts)};
 picture.append(img);
 const overlay=document.createElement("div");overlay.className="pz84-cinematic-overlay";
 const name=document.createElement("span");name.className="pz84-cinematic-label";name.textContent=label(state);
 overlay.append(name);
 target.append(picture,overlay);target.dataset.pzArt="cinema-v84";target.dataset.hero=state.hero;target.dataset.pet=state.pet;target.dataset.scene=state.scene;
 target.setAttribute("aria-label",label(state)+" · цельная сцена");
}
engine.renderScene=render;
const repaint=()=>{
 for(const id of ["pz3d-home-stage","pz73-frame"]){
  const node=document.getElementById(id);if(node){node.classList.remove("pz84-cinematic-stage");render(node)}
 }
};
const oldSync=engine.sync;
engine.sync=function(){oldSync?.();repaint()};
window.addEventListener("pz:unlocked",()=>setTimeout(repaint,170));
window.addEventListener("pz:style-change",()=>setTimeout(repaint,80));
window.addEventListener("banger:local-save",()=>setTimeout(repaint,90));
document.addEventListener("click",e=>{if(e.target.closest?.("#pz73,nav button"))setTimeout(repaint,100)});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(repaint,500));
else setTimeout(repaint,170);
window.pzCinemaV84={render,repaint,scenes,qualify};
})();