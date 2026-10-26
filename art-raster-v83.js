/* BANGERVERSE ART REBORN v83 — raster character and companion compositor.
 * Uses real 2D WebP artwork shipped with the application. All artwork has its own
 * transparent canvas. Composition happens at render time: no hero-pet pair binding.
 * Original v82 engine is preserved as fallback for yet-undrawn characters.
 */
(function(){
"use strict";
const original=window.pzArtV82;if(!original)return;
const artRoot="./assets/art-v83/";
const sprites=Object.freeze({
 hero:Object.freeze({frog:"pepe.webp",kisyusha:"kisyusha.webp",robot:"bender.webp"}),
 pet:Object.freeze({dog:"surechka.webp",cat:"masya.webp",robodog:"robodog.webp"})
});
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const attrs=(obj)=>Object.entries(obj).map(([k,v])=>" "+k+'="'+escape(v)+'"').join("");
const images=(type,id,w,x,y,width,height)=>{
 const source=sprites[type][id];
 if(source)return '<image href="'+artRoot+source+'" x="'+x+'" y="'+y+'" width="'+width+'" height="'+height+'" preserveAspectRatio="xMidYMax meet" class="pz83-'+type+'-sprite" />';
 if(type==="hero")return '<g transform="translate(115 90) scale(.86)">'+original.heroArt(id,w)+'</g>';
 return '<g transform="translate(642 360) scale(.62)">'+original.petArt(id,w)+'</g>';
};
const themes={
 city:{glow:"#fd4bcb",sky:"#100b29",heading:"NEON CITY"},
 home:{glow:"#f7bcac",sky:"#19243a",heading:"HOME"},
 gym:{glow:"#39ecf4",sky:"#071b35",heading:"BANGER GYM"},
 work:{glow:"#7fcaf1",sky:"#182b46",heading:"WORK"},
 shop:{glow:"#fc68bd",sky:"#291536",heading:"SHOP"},
 halloween:{glow:"#ff9a49",sky:"#20102d",heading:"HALLOWEEN"},
 winter:{glow:"#8eddfb",sky:"#10223b",heading:"WINTER"}};
function full(target,options={}){
 if(!target)return;
 const state=original.current();if(!state)return;
 const theme=themes[options.scene||state.scene]||themes.city;
 const hero=state.hero||"frog",pet=state.pet||"none";
 const srcHero=sprites.hero[hero],srcPet=sprites.pet[pet];
 const cn=original.HEROES.find(x=>x.id===hero);
 const lng=localStorage.getItem("banger_language")||"uk";
 const name=cn?.[lng]||cn?.ru||"BANGER";
 const outfit=state.heroWear?.torso||"starter";
 const scene=options.scene||state.scene;
 const gearLabel={
  starter:"STREET",gym:"TRAINING",work:"WORK",knight:"GUARDIAN",
  void:"VOID",phantom:"PHANTOM",royal:"ROYAL",pumpkincoat:"HALLOWEEN"
 }[outfit]||"COLLECTION";
 let content=original.defs+
 '<defs><radialGradient id="pz83-light"><stop stop-color="'+theme.glow+'" stop-opacity=".65"/><stop offset="1" stop-color="'+theme.glow+'" stop-opacity="0"/></radialGradient></defs>'+
 original.sceneArt(scene)+
 '<circle cx="310" cy="385" r="335" fill="url(#pz83-light)" opacity=".4"/>'+
 '<circle cx="770" cy="457" r="210" fill="url(#pz83-light)" opacity=".3"/>'+
 '<ellipse cx="399" cy="605" rx="232" ry="35" fill="#060b1c" opacity=".65"/>'+
 '<ellipse cx="759" cy="608" rx="126" ry="26" fill="#060b1c" opacity=".5"/>';
 // Separate independent layers — the same Surachka works with every selected hero.
 content+=images("hero",hero,state.heroWear,120,80,520,532);
 if(pet!=="none")content+=images("pet",pet,state.petWear,648,329,244,292);
 const frameColor=theme.glow;
 content+='<rect x="19" y="18" width="330" height="62" rx="18" fill="#111527" opacity=".93" stroke="'+frameColor+'" stroke-width="3"/>'+
  '<text x="39" y="58" font-size="30" font-weight="900" fill="#fff">BANGERVERSE</text>'+
  '<rect x="726" y="20" width="252" height="57" rx="17" fill="#111527" opacity=".9" stroke="#74faf2" stroke-width="2"/>'+
  '<text x="852" y="57" text-anchor="middle" font-size="26" font-weight="900" fill="#b8fff0">'+escape(name)+'</text>';
 if(pet!=="none")content+='<text x="777" y="648" text-anchor="middle" paint-order="stroke" stroke="#171323" stroke-width="7" font-size="28" fill="#fff6fb" font-weight="800">'+escape(state.pname||pet)+'</text>';
 if(outfit!=="starter")content+='<rect x="30" y="596" width="215" height="54" rx="15" fill="#1c1937" stroke="'+frameColor+'" stroke-width="2"/><text x="137" y="630" text-anchor="middle" font-size="21" font-weight="800" fill="#fce9fa">'+escape(gearLabel)+'</text>';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" class="pz83-art-scene" viewBox="0 0 1000 680" aria-label="'+escape(name+' и '+(state.pname||pet))+'" role="img">'+content+'</svg>';
 target.innerHTML=svg;
 target.dataset.pzArt="raster-v83";
 target.dataset.hero=hero;target.dataset.pet=pet;target.dataset.scene=scene;
 target.dataset.rasterHero=String(!!srcHero);target.dataset.rasterPet=String(!!srcPet);
 target.setAttribute("aria-label",name+(pet==="none"?"":" и "+state.pname)+" · "+scene);
}
original.renderScene=full;
original.raster=Object.freeze({sprites,root:artRoot,render:full});
function thumbs(root=document){
 try{
  const heroIds=original.HEROES.map(x=>x.id);
  const heroCards=root.querySelectorAll?.(".pz82-hero-mini")||[];
  for(let i=0;i<heroCards.length;i++){
   const element=heroCards[i],src=sprites.hero[heroIds[i]];
   if(src&&element.dataset.pz83Ready!==src){
    element.replaceChildren();
    const img=document.createElement("img");img.src=artRoot+src;img.alt=heroIds[i];img.loading="lazy";img.decoding="async";
    element.appendChild(img);element.dataset.pz83Ready=src;
   }
  }
  const petTiles=root.querySelectorAll?.(".pz82-shop-thumbnail")||[];
  for(const tile of petTiles){
   const label=tile.closest?.(".pz73-card")?.textContent?.toLowerCase()||"";
   const key=label.includes("сур")||label.includes("суреч")?"dog":label.includes("мася")?"cat":label.includes("робоп")?"robodog":null;
   if(!key||!sprites.pet[key])continue;
   const uri=artRoot+sprites.pet[key];
   if(tile.dataset.pz83Ready===uri)continue;
   const img=document.createElement("img");img.src=uri;img.alt=key;img.loading="lazy";img.decoding="async";
   tile.replaceChildren(img);tile.dataset.pz83Ready=uri;
  }
 }catch(err){console.warn("v83 thumbnails:",err)}
}
const previousSync=original.sync;
original.sync=function(){previousSync?.();thumbs()};
const prevRender=window.pzWardrobeV73?.render;
if(typeof prevRender==="function"){
 window.pzWardrobeV73.render=function(...args){
  const r=prevRender(...args);
  full(document.getElementById("pz73-frame"));
  thumbs();
  return r;
 };
}
const refresh=()=>{const a=document.getElementById("pz3d-home-stage"),b=document.getElementById("pz73-frame");if(a)full(a);if(b)full(b);thumbs()};
window.addEventListener("pz:unlocked",()=>setTimeout(refresh,120));
window.addEventListener("pz:style-change",()=>setTimeout(refresh,80));
document.addEventListener("click",e=>{
 if(e.target?.closest?.("#pz73,nav button"))setTimeout(refresh,90);
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(refresh,450));
else setTimeout(refresh,150);
window.pzArtV83={sprites,renderScene:full,refresh};
})();