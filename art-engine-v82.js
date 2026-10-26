/* BANGERVERSE ART REBORN v82 — original illustrated 2D scene renderer.
 * No Three.js, no model downloads. Hero and companion are separate composited layers.
 * Cosmetic state stays in the existing per-account game save.
 */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const color={pink:"#ff4fae",cyan:"#3ef8ef",gold:"#ffd271",dark:"#101527"};
const HEROES=[
 {id:"frog",ru:"БАНГЕР",uk:"БАНГЕР",en:"BANGER",type:"frog",locked:false,desc:"Наш легендарный Пепе"},
 {id:"kisyun",ru:"Кисюн",uk:"Кісюн",en:"Kisyun",type:"catman",locked:false,desc:"Кот в уличном стиле"},
 {id:"kisyusha",ru:"Кисюша",uk:"Кісюша",en:"Kisyusha",type:"girl",locked:false,desc:"Героиня неонового города"},
 {id:"robot",ru:"Бендер",uk:"Бендер",en:"Bender",type:"robot",locked:false,desc:"Хромированный характер"},
 {id:"human",ru:"Макс",uk:"Макс",en:"Max",type:"man",locked:false,desc:"Стритвир и приключения"},
 {id:"luna",ru:"Луна",uk:"Луна",en:"Luna",type:"girl",locked:false,desc:"Ночная искра"},
 {id:"knight",ru:"Страж",uk:"Вартовий",en:"Guardian",type:"man",locked:false,desc:"Защитник города"},
 {id:"mage",ru:"Маг",uk:"Маг",en:"Mage",type:"man",locked:false,desc:"Энергия и магия"},
 {id:"rogue",ru:"Тень",uk:"Тінь",en:"Shadow",type:"man",locked:false,desc:"Тихий охотник"},
 {id:"barbarian",ru:"Титан",uk:"Титан",en:"Titan",type:"man",locked:false,desc:"Несокрушимый"}
];
const SCENES=[
 {id:"city",ru:"Неоновый город",uk:"Неонове місто",en:"Neon city",symbol:"🌃"},
 {id:"home",ru:"Квартира",uk:"Квартира",en:"Apartment",symbol:"🏠"},
 {id:"gym",ru:"Тренажёрный зал",uk:"Тренажерна зала",en:"Gym",symbol:"🏋️"},
 {id:"work",ru:"Работа",uk:"Робота",en:"Work",symbol:"🏢"},
 {id:"shop",ru:"Магазин",uk:"Крамниця",en:"Shop",symbol:"🛍️"},
 {id:"halloween",ru:"Хэллоуин",uk:"Геловін",en:"Halloween",symbol:"🎃"},
 {id:"winter",ru:"Зимний город",uk:"Зимове місто",en:"Winter city",symbol:"❄️"}
];
const PET_INFO={
 none:["Без питомца","—"],dog:["Суречка","🐩"],cat:["Мася","🐈"],hamster:["Фа","🐹"],panda:["Кунг-фу","🐼"],
 rabbit:["Кролик","🐰"],fox:["Лиса","🦊"],lion:["Лев","🦁"],tiger:["Тигр","🐯"],wolf:["Волк","🐺"],
 husky:["Хаски","🐕"],shiba:["Сиба","🐕"],dragon:["Дракон","🐲"],bat:["Летучая мышь","🦇"],
 penguin:["Пингвин","🐧"],parrot:["Попугай","🦜"],duck:["Утка","🦆"],fish:["Рыбка","🐟"],
 hippo:["Бегемот","🦛"],rhino:["Носорог","🦏"],shark:["Акула","🦈"],turtle:["Черепаха","🐢"],
 crocodile:["Крокодил","🐊"],owl:["Сова","🦉"],otter:["Выдра","🦦"],platypus:["Утконос","🦆"],
 robodog:["Робопёс","🤖"],robotcat:["Робокот","🤖"],unicorn:["Единорог","🦄"]
};
const lang=()=>{const k=localStorage.getItem("banger_language")||"uk";return ["uk","ru","en"].includes(k)?k:"ru"};
const display=x=>x?.[lang()]||x?.ru||x?.en||"";
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store=()=>typeof db!=="undefined"&&db?.profile?.created&&window.pzActiveUserId?db:null;
const svg=(content,viewBox="0 0 1000 680",cl="pz82-art")=>'<svg class="'+cl+'" xmlns="http://www.w3.org/2000/svg" viewBox="'+viewBox+'" role="img" aria-label="BANGERVERSE персонаж и питомец">'+content+'</svg>';
const defs='<defs>'+
 '<linearGradient id="pz82-night" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#070d24"/><stop offset=".45" stop-color="#242046"/><stop offset="1" stop-color="#371332"/></linearGradient>'+
 '<linearGradient id="pz82-neon" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fb63d1"/><stop offset=".5" stop-color="#af2ac1"/><stop offset="1" stop-color="#412a9d"/></linearGradient>'+
 '<linearGradient id="pz82-hood" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#3b3947"/><stop offset=".52" stop-color="#101526"/><stop offset="1" stop-color="#070810"/></linearGradient>'+
 '<linearGradient id="pz82-skin" x1="0" x2=".9" y1="0" y2="1"><stop stop-color="#aff56d"/><stop offset=".4" stop-color="#54bc59"/><stop offset="1" stop-color="#228b47"/></linearGradient>'+
 '<linearGradient id="pz82-metal" x1="0" x2=".9" y1="0" y2="1"><stop stop-color="#e6edff"/><stop offset=".45" stop-color="#627caa"/><stop offset=".8" stop-color="#223253"/><stop offset="1" stop-color="#a3bde4"/></linearGradient>'+
 '<radialGradient id="pz82-pinkglow"><stop stop-color="#fc4ca0" stop-opacity=".53"/><stop offset="1" stop-color="#fc4ca0" stop-opacity="0"/></radialGradient>'+
 '<filter id="pz82-shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="15"/></filter>'+
 '<filter id="pz82-lit" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>'+
 '<pattern id="pz82-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#f859bd" stroke-opacity=".09"/></pattern>'+
 '</defs>';
function sceneArt(scene){
 const id=SCENES.some(x=>x.id===scene)?scene:"city";
 const winter=id==="winter",halloween=id==="halloween",home=id==="home",gym=id==="gym",shop=id==="shop",work=id==="work";
 const palette=winter?["#0a3154","#345b8d","#bde9ff"]:halloween?["#170b28","#56244a","#f59032"]:home?["#14162b","#322541","#f7a1c5"]:gym?["#0c2035","#28375b","#49d1ee"]:work?["#102134","#213b53","#75d4fc"]:shop?["#240e36","#57305a","#ff70c9"]:["#090f30","#302251","#ff50b8"];
 let out='<rect width="1000" height="680" fill="'+palette[0]+'"/>';
 out+='<path d="M0 0H1000V680H0Z" fill="url(#pz82-night)" opacity=".5"/>';
 out+='<circle cx="785" cy="170" r="245" fill="url(#pz82-pinkglow)"/>';
 if(home){
  out+='<rect x="0" y="365" width="1000" height="315" fill="#292443"/><path d="M0 385H1000" stroke="#e46bb3" stroke-opacity=".6" stroke-width="5"/>';
  out+='<rect x="60" y="96" width="355" height="274" rx="18" fill="#141e35" stroke="#9b7db1" stroke-width="8"/><path d="M80 125H395V350H80Z" fill="#172b56"/>';
  out+='<path d="M240 125V350 M80 240H395" stroke="#bd87bb" stroke-width="8"/><path d="M70 280L170 225L295 293" fill="none" stroke="#fc6dc1" stroke-width="6" opacity=".55"/>';
  out+='<rect x="600" y="370" width="345" height="124" rx="35" fill="#624777" stroke="#f4a2cb" stroke-width="8"/><rect x="646" y="337" width="247" height="88" rx="31" fill="#855a90"/>';
  out+='<ellipse cx="508" cy="579" rx="395" ry="68" fill="#e44eb0" opacity=".11"/>';
 }else if(gym){
  out+='<path d="M0 345L1000 310V680H0Z" fill="#18263f"/><path d="M0 460H1000" stroke="#3c9cce" stroke-width="6" opacity=".7"/>';
  for(let i=0;i<7;i++){let x=55+i*150;out+='<rect x="'+x+'" y="110" width="14" height="285" fill="#455d79"/><rect x="'+(x-15)+'" y="117" width="43" height="15" rx="6" fill="#e69dda"/>'}
  out+='<path d="M75 465H360M100 451V320M335 451V320M650 440H915M685 460V300M875 460V300" stroke="#a7b7ce" stroke-width="19" stroke-linecap="round"/>';
  out+='<rect x="300" y="75" width="375" height="120" rx="15" fill="#0b1426" stroke="#50ddfc" stroke-width="7"/><text x="489" y="149" text-anchor="middle" fill="#fa69bb" font-size="45" font-weight="900">BANGER GYM</text>';
 }else if(shop){
  out+='<rect x="0" y="310" width="1000" height="370" fill="#302340"/>';
  for(let j=0;j<5;j++){let x=20+205*j;out+='<rect x="'+x+'" y="98" width="180" height="288" rx="12" fill="#1f1a36" stroke="#fc62b6" stroke-width="5"/><rect x="'+(x+20)+'" y="165" width="140" height="160" fill="#411d50"/><path d="M'+(x+37)+' 230L'+(x+85)+' 190L'+(x+133)+' 232" fill="none" stroke="#fec2eb" stroke-width="19"/>'}
  out+='<path d="M0 418H1000" stroke="#ff8ad3" stroke-width="9"/>';
 }else if(work){
  out+='<rect x="0" y="415" width="1000" height="265" fill="#1c2c45"/>';
  for(let j=0;j<6;j++){let x=48+j*155;out+='<rect x="'+x+'" y="96" width="125" height="310" fill="#243b56" stroke="#7297b4" stroke-width="6"/><rect x="'+(x+14)+'" y="115" width="97" height="95" fill="#63a4d8" opacity=".55"/>'}
  out+='<rect x="120" y="410" width="750" height="53" rx="12" fill="#4a536e"/><path d="M200 465V625M790 465V625" stroke="#788aab" stroke-width="20"/>';
 }else{
  for(let j=0;j<17;j++){
   const x=j*70-(j%3)*20,y=142+(j*57)%245,w=57+(j%4)*23,h=520-y;
   out+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+(j%3===0?"#22163a":j%3===1?"#172548":"#351e4b")+'" stroke="'+palette[1]+'" stroke-opacity=".75" stroke-width="3"/>';
   for(let k=0;k<4;k++)out+='<path d="M'+(x+12)+' '+(y+26+45*k)+'h'+(w-23)+'" stroke="'+(winter?"#8deeff":halloween?"#ffae64":"#ff54b5")+'" stroke-opacity="'+(.25+(j%4)*.13)+'" stroke-width="5"/>';
  }
  out+='<path d="M0 480L500 424L1000 487V680H0Z" fill="#12192e"/><path d="M0 544L500 490L1000 546" fill="none" stroke="'+palette[2]+'" stroke-opacity=".65" stroke-width="5"/>';
  out+='<rect x="725" y="118" width="220" height="77" rx="14" fill="#121328" stroke="'+(winter?"#a8e9ff":halloween?"#ffa65c":"#fa5dad")+'" stroke-width="5"/><text x="835" y="167" fill="#ffe3f6" font-size="25" font-weight="900" text-anchor="middle">'+(halloween?"NIGHT FEST":winter?"WINTER CITY":"NEON CITY")+'</text>';
 }
 if(halloween){
  for(let i=0;i<5;i++){let x=65+i*202;out+='<circle cx="'+x+'" cy="'+(525+(i%2)*42)+'" r="31" fill="#f58b22" stroke="#ffdb63" stroke-width="4"/><path d="M'+(x-13)+' '+(515+(i%2)*42)+'v10m25-10v10m-34 15q22 19 43 0" stroke="#211020" stroke-width="5" fill="none"/>'}
 }
 if(winter)for(let j=0;j<37;j++){let x=(j*173)%980+8,y=(j*117)%560;out+='<circle cx="'+x+'" cy="'+y+'" r="'+(2+j%4)+'" fill="#e5faff" opacity=".7"/>'}
 out+='<ellipse cx="495" cy="590" rx="365" ry="52" fill="#080c22" opacity=".6"/><ellipse cx="490" cy="585" rx="320" ry="37" fill="none" stroke="'+(winter?"#7ce8ff":halloween?"#ff9c50":"#fb66b8")+'" stroke-width="6" opacity=".8"/>';
 return out;
}
function outfitColors(wear,hero){
 let torso=wear?.torso||"starter";
 if(torso==="gym")return {cloth:"#197da4",trim:"#2af7ed",pants:"#263455"};
 if(torso==="work")return {cloth:"#80632f",trim:"#f6ca62",pants:"#3d3b35"};
 if(torso==="knight")return {cloth:"#525d79",trim:"#cbd8fa",pants:"#263248"};
 if(torso==="void"||torso==="phantom")return {cloth:"#41215d",trim:"#b25cff",pants:"#170f2b"};
 if(torso==="royal")return {cloth:"#482b6d",trim:"#fbd76d",pants:"#27153a"};
 if(torso==="pumpkincoat")return {cloth:"#b25d24",trim:"#ffca70",pants:"#33243f"};
 if(torso==="wintercoat")return {cloth:"#d4e5fb",trim:"#65cfff",pants:"#5077a7"};
 return {cloth:hero==="kisyusha"||hero==="luna"?"#3e183e":"#181a29",trim:"#ef4b9d",pants:"#22263a"};
}
function heroArt(id,wear={},mini=false){
 const who=HEROES.find(x=>x.id===id)||HEROES[0],type=who.type,c=outfitColors(wear,id),face=(type==="girl"?"#f4b6a8":type==="man"?"#bb8d74":"#79ba69");
 const origin=mini?0:0;
 let art='<g transform="translate(0,0)">';
 art+='<ellipse cx="235" cy="548" rx="165" ry="27" fill="#080a1c" opacity=".55"/>';
 // shoes
 art+='<path d="M117 458L199 460L207 520Q179 553 107 528L78 508Z" fill="#f8f7fb" stroke="#14182e" stroke-width="10"/><path d="M241 459L326 455L364 508Q346 549 265 535L241 513Z" fill="#eceffb" stroke="#15172c" stroke-width="10"/>';
 art+='<path d="M90 512Q149 533 208 510M256 515Q302 532 350 511" stroke="#f455b4" stroke-width="8" fill="none"/>';
 for(let k=0;k<4;k++)art+='<path d="M'+(120+k*15)+' 478l22 11M'+(278+k*14)+' 473l17 11" stroke="#818da8" stroke-width="3"/>';
 // pants
 art+='<path d="M135 320L302 323L325 473L244 490L210 411L198 495L113 477Z" fill="'+c.pants+'" stroke="#0d1124" stroke-width="13"/>';
 art+='<path d="M148 359L170 439M267 357L279 444" stroke="#6a6780" stroke-width="5" opacity=".45"/>';
 // arms and gloves
 art+='<path d="M155 194Q104 192 79 275L103 360L144 348L137 285L177 250M291 194Q360 202 376 284L350 368L312 355L325 284L265 255" fill="'+c.cloth+'" stroke="#101325" stroke-width="12"/>';
 art+='<path d="M107 339q-41-19-42 24q16 41 52 11l24-17M337 354q47-20 52 16q-14 35-58 20l-22-15" fill="'+(type==="frog"?"#54b957":type==="robot"?"#8aa5d6":face)+'" stroke="#131929" stroke-width="9"/>';
 // jacket hoodie
 art+='<path d="M165 170Q120 178 132 262L117 354Q197 389 319 348L305 247Q310 194 268 169Q225 147 165 170Z" fill="'+c.cloth+'" stroke="#0f1123" stroke-width="12"/>';
 art+='<path d="M161 175L205 234L268 176M212 228L207 354" stroke="'+c.trim+'" stroke-width="8" fill="none" opacity=".9"/>';
 art+='<path d="M138 342Q226 363 301 345" stroke="#8192a8" stroke-width="6"/>';
 art+='<path d="M148 293H190V324H146Z M240 293H280V324H241Z" fill="#0d1122" stroke="'+c.trim+'" stroke-opacity=".6" stroke-width="5"/>';
 art+='<text x="225" y="285" font-size="31" font-weight="900" text-anchor="middle" fill="#f8eaf3">BANGER</text>';
 // backpack strap
 art+='<path d="M156 179L133 329M275 177L302 338" fill="none" stroke="#916d4e" stroke-width="20" stroke-linecap="round"/><path d="M154 190L144 287" stroke="#e8ac76" stroke-width="5"/>';
 // neck and head shape
 if(type==="frog"){
  art+='<path d="M113 134Q91 84 111 48Q130 1 189 6Q259-10 310 22Q357 60 328 126Q313 180 243 185L169 184Q124 168 113 134Z" fill="url(#pz82-skin)" stroke="#163e2b" stroke-width="13"/>';
  art+='<ellipse cx="177" cy="63" rx="55" ry="45" fill="#bbef8b" stroke="#2b583a" stroke-width="8"/><ellipse cx="270" cy="59" rx="54" ry="45" fill="#bbef8b" stroke="#2b583a" stroke-width="8"/>';
  art+='<ellipse cx="178" cy="65" rx="33" ry="27" fill="#fbffff"/><ellipse cx="265" cy="65" rx="33" ry="27" fill="#fbffff"/><ellipse cx="192" cy="67" rx="14" ry="20" fill="#101626"/><ellipse cx="253" cy="67" rx="14" ry="20" fill="#101626"/>';
  art+='<path d="M130 131Q218 172 311 126Q274 182 207 179Q154 177 130 131Z" fill="#d47c49" stroke="#6d422c" stroke-width="8"/><path d="M152 130Q214 143 297 125" fill="none" stroke="#50342b" stroke-width="6"/>';
  art+='<path d="M121 100Q222 69 330 101" fill="none" stroke="#29984a" stroke-width="12" opacity=".6"/>';
 }else if(type==="robot"){
  art+='<rect x="127" y="13" width="210" height="180" rx="42" fill="url(#pz82-metal)" stroke="#1b2441" stroke-width="15"/>';
  art+='<rect x="146" y="63" width="172" height="82" rx="28" fill="#0a1f32" stroke="#86dff4" stroke-width="8"/>';
  art+='<ellipse cx="194" cy="103" rx="24" ry="15" fill="#49fff1"/><ellipse cx="271" cy="103" rx="24" ry="15" fill="#49fff1"/><path d="M208 137H255" stroke="#fda2d4" stroke-width="6"/>';
  art+='<path d="M234 12V-7" stroke="#c7d6ed" stroke-width="10"/><circle cx="234" cy="-10" r="12" fill="#fb5dc9"/><rect x="114" y="78" width="26" height="58" rx="11" fill="#5b7ca5"/>';
 }else if(type==="catman"){
  art+='<path d="M123 135L99-9L179 35Q230 9 280 35L353-17L346 123Q325 189 221 192Q140 190 123 135Z" fill="#a97868" stroke="#382a35" stroke-width="11"/>';
  art+='<path d="M129 14L151 56L117 46M322 17L290 54L335 37" fill="#eeadbb"/>';
  art+='<ellipse cx="177" cy="109" rx="32" ry="23" fill="#fff4e8"/><ellipse cx="269" cy="109" rx="32" ry="23" fill="#fff4e8"/><ellipse cx="182" cy="110" rx="11" ry="18" fill="#171922"/><ellipse cx="261" cy="110" rx="11" ry="18" fill="#171922"/><path d="M210 145L231 151L247 143Q228 174 210 145Z" fill="#da7e82"/>';
  art+='<path d="M150 149L103 143M299 145L347 136" stroke="#f7dcd1" stroke-width="5"/>';
 }else{
  art+='<path d="M136 66Q142-4 228-7Q322-3 329 74L308 137Q296 179 227 185Q158 182 148 142Z" fill="'+face+'" stroke="#36233b" stroke-width="10"/>';
  art+='<path d="M127 84Q130-22 225-24Q302-18 333 85L317 105L286 40Q220 71 152 67L138 118Z" fill="'+(id==="kisyusha"?"#e777bc":id==="luna"?"#936fe1":"#211e30")+'" stroke="#2a1b38" stroke-width="7"/>';
  if(type==="girl")art+='<path d="M139 74Q111 149 131 225L165 191L166 66M314 65Q353 149 329 245L301 199L297 53" fill="'+(id==="luna"?"#8959ca":"#e667ad")+'" stroke="#35203b" stroke-width="8"/>';
  art+='<ellipse cx="188" cy="102" rx="12" ry="18" fill="#182033"/><ellipse cx="269" cy="102" rx="12" ry="18" fill="#182033"/><path d="M200 150Q227 168 258 148" fill="none" stroke="#bb5c72" stroke-width="7" stroke-linecap="round"/>';
 }
 // black designer shades & cap (default for BANGER)
 if(type==="frog"||wear?.face==="glasses"||wear?.face==="visor"||type==="catman"){
  art+='<path d="M128 87L315 86" stroke="#0a0d1a" stroke-width="11"/><path d="M137 83Q145 68 177 73L217 81Q223 116 190 122Q151 130 137 83Z M225 81Q252 67 281 72L309 79Q305 119 270 121Q229 129 225 81Z" fill="#101424" stroke="#6a6789" stroke-width="7"/>';
  art+='<path d="M155 85L181 79 M239 85L261 80" stroke="#a9e6ff" stroke-width="5" opacity=".7"/>';
 }
 if(wear?.head==="crown")art+='<path d="M135 10L155-47L195-16L230-64L266-16L303-47L325 10Z" fill="#f2c565" stroke="#a06a2d" stroke-width="9"/>';
 if(wear?.head==="cap"||wear?.head==="witchhat"||wear?.head==="santahat")art+='<path d="M120 15Q221-66 327 10L350 31Q239 48 118 27Z" fill="'+(wear.head==="santahat"?"#d93c63":wear.head==="witchhat"?"#3e1a5b":"#202639")+'" stroke="#f059b6" stroke-width="7"/>';
 if(wear?.head==="helmet")art+='<path d="M117 63Q119-32 227-30Q328-27 337 65" fill="none" stroke="#a5b3d1" stroke-width="21"/>';
 if(wear?.back==="wings"||wear?.back==="batcape")art+='<path d="M138 231Q15 62 20 334L110 303M315 230Q442 66 443 338L340 298" fill="#8c3ed1" stroke="#ed7efb" stroke-width="10"/>';
 if(wear?.back==="cape")art+='<path d="M144 197Q47 307 101 517L169 489M309 191Q409 313 356 517L286 483" fill="#723887" stroke="#b56cb8" stroke-width="8"/>';
 if(wear?.aura==="halo")art+='<ellipse cx="224" cy="-30" rx="120" ry="29" fill="none" stroke="#fbe496" stroke-width="10"/>';
 art+='</g>';
 return art;
}
function petArt(key,wear={}){
 if(key==="none")return "";
 const id=PET_INFO[key]?key:"dog";
 const robot=id.startsWith("robo"),cat=["cat","robotcat"].includes(id),dog=["dog","husky","shiba","robodog"].includes(id);
 const panda=id==="panda",hamster=id==="hamster",fox=id==="fox",wolf=id==="wolf",dragon=id==="dragon";
 const fur=robot?"url(#pz82-metal)":panda?"#eee7e0":cat?"#b794a0":hamster?"#d5a17c":fox?"#d87a4d":wolf?"#8894a8":dragon?"#4aa996":dog?"#ddbfa8":"#bd92a2";
 let art='<g><ellipse cx="170" cy="331" rx="150" ry="18" fill="#080b1b" opacity=".5"/>';
 // body, tail and feet
 if(fox||cat||dog||wolf)art+='<path d="M271 253Q365 219 320 159Q327 273 271 294" fill="'+fur+'" stroke="#38283b" stroke-width="9"/>';
 if(dragon)art+='<path d="M240 205L344 91L304 260M116 215L24 111L67 264" fill="#46bdab" stroke="#116e70" stroke-width="10"/>';
 art+='<path d="M81 173Q169 120 249 176Q279 215 268 292Q249 325 168 317Q91 318 75 278Z" fill="'+fur+'" stroke="#342536" stroke-width="11"/>';
 art+='<ellipse cx="102" cy="299" rx="39" ry="24" fill="'+fur+'" stroke="#453347" stroke-width="7"/><ellipse cx="233" cy="297" rx="39" ry="24" fill="'+fur+'" stroke="#453347" stroke-width="7"/>';
 if(panda){
 art+='<ellipse cx="89" cy="126" rx="39" ry="42" fill="#252a35"/><ellipse cx="253" cy="124" rx="38" ry="42" fill="#252a35"/>';
 }else if(cat||fox||wolf||dog){
 art+='<path d="M81 118L46 27L133 89M221 86L295 23L273 136" fill="'+fur+'" stroke="#423246" stroke-width="11"/><path d="M79 107L70 60L117 97M245 98L280 55L260 117" fill="#e78ca2"/>';
 }else{
 art+='<ellipse cx="79" cy="127" rx="39" ry="50" fill="'+fur+'" stroke="#382a39" stroke-width="9"/><ellipse cx="264" cy="130" rx="38" ry="49" fill="'+fur+'" stroke="#382a39" stroke-width="9"/>';
 }
 art+='<ellipse cx="170" cy="160" rx="122" ry="120" fill="'+fur+'" stroke="#38283b" stroke-width="11"/>';
 if(robot){
  art+='<rect x="73" y="94" width="198" height="114" rx="33" fill="#101b30" stroke="#8399cb" stroke-width="10"/>';
  art+='<ellipse cx="122" cy="149" rx="24" ry="17" fill="#4afef1"/><ellipse cx="211" cy="149" rx="24" ry="17" fill="#4afef1"/><path d="M140 190H199" stroke="#f35da5" stroke-width="8"/>';
 }else{
 if(panda)art+='<ellipse cx="120" cy="143" rx="43" ry="53" fill="#2b303a"/><ellipse cx="218" cy="143" rx="43" ry="53" fill="#2b303a"/>';
 if(cat)art+='<path d="M91 184Q166 135 251 185" fill="#e8d4c7"/>';
 art+='<ellipse cx="121" cy="151" rx="30" ry="33" fill="#fbf5f1"/><ellipse cx="215" cy="151" rx="30" ry="33" fill="#fbf5f1"/>';
 art+='<ellipse cx="127" cy="155" rx="12" ry="19" fill="#181925"/><ellipse cx="209" cy="155" rx="12" ry="19" fill="#181925"/>';
 art+='<ellipse cx="170" cy="204" rx="69" ry="49" fill="#f7e5d6"/><path d="M151 196L171 204L190 195Q179 220 164 213Z" fill="#3e2830"/>';
 art+='<path d="M136 227Q171 241 204 227" stroke="#b46c77" stroke-width="6" fill="none"/>';
 }
 // customizable gear
 art+='<path d="M97 270Q167 299 241 269" stroke="'+(wear.neck==="collar"?"#46f5e2":wear.neck==="petwinter"?"#8bdcff":"#f169b8")+'" stroke-width="13" fill="none"/>';
 if(wear.head==="bow"||wear.head==="petpumpkin")art+='<path d="M140 76Q93 23 132 16L174 64Q223 14 244 45L187 88Z" fill="'+(wear.head==="petpumpkin"?"#ffa841":"#fc65bb")+'" stroke="#a23a83" stroke-width="7"/>';
 if(wear.head==="petcap"||wear.head==="petwitch"||wear.head==="petsanta")art+='<path d="M97 80Q170 10 254 81L271 100Q170 117 87 96Z" fill="#382343" stroke="#f765be" stroke-width="8"/>';
 if(wear.head==="petcrown")art+='<path d="M105 68L122 5L157 31L172-15L210 30L242 4L251 69Z" fill="#ffe185" stroke="#9a6f33" stroke-width="8"/>';
 if(wear.face==="petglasses"||key==="dog")art+='<path d="M84 128H248M91 124Q107 111 143 122L158 155Q148 182 111 170Z M180 126Q222 109 245 126L234 167Q194 182 181 154Z" fill="#171827" stroke="#9b8fa7" stroke-width="6"/>';
 if(wear.back==="backpack")art+='<rect x="245" y="223" width="67" height="81" rx="18" fill="#35385a" stroke="#ec75b4" stroke-width="9"/>';
 if(wear.back==="petwings")art+='<path d="M97 241L12 167L48 284M244 240L325 169L301 292" fill="#9963e8" stroke="#ff99dd" stroke-width="9"/>';
 if(wear.aura==="petaura"||wear.aura==="petghost")art+='<ellipse cx="175" cy="337" rx="151" ry="31" fill="none" stroke="#eeadf7" stroke-width="10"/>';
 return art+'</g>';
}
function current(){
 const d=store();if(!d)return null;
 d.artV82 ||= {scene:"city"};
 const state=d.artV82;
 if(!SCENES.some(x=>x.id===state.scene))state.scene="city";
 const w=d.wardrobeV73||{},p=d.profile||{};
 const prev=window.pzWardrobePreviewV73;
 const active=prev?.uid===window.pzActiveUserId?prev:null;
 let hero=p.species||"frog",pet=p.pet||"none",heroWear=w.wear||{},petWear=w.petWear||{},scenePreview=state.scene;
 if(active?.which==="species"){hero=active.id;heroWear=w.heroWardrobes?.[active.id]||{torso:"starter"}}
 else if(active?.which==="pettype"){pet=active.id;petWear=w.petWardrobes?.[active.id]||{}}
 else if(active?.which==="set"){
  const set=window.pzWardrobeV73?.SETS?.find(x=>x.id===active.id);
  if(set){heroWear={...heroWear};for(const key of set.items){const item=window.pzWardrobeV73?.HERO?.find(x=>x[0]===key);if(item)heroWear[item[1]]=key}scenePreview=set.scene}
 }
 else if(active?.which==="hero"){
  const item=window.pzWardrobeV73?.HERO?.find(x=>x[0]===active.id);if(item)heroWear={...heroWear,[item[1]]:active.id}
 }else if(active?.which==="pet"){
  const item=window.pzWardrobeV73?.PETITEMS?.find(x=>x[0]===active.id);if(item)petWear={...petWear,[item[1]]:active.id}
 }
 return {hero,pet,heroWear,petWear,scene:scenePreview,level:Math.floor((Number(d.xp)||0)/100)+1,coins:d.coins||0,owner:window.pzActiveUserId,pname:active?.which==="pettype"?(w.petNames?.[pet]||PET_INFO[pet]?.[0]||""):p.petName||w.petNames?.[pet]||PET_INFO[pet]?.[0]||""};
}
function renderScene(target,opts={}){
 if(!target)return;
 const state=current();if(!state)return;
 const scene=opts.scene||state.scene;
 let body=defs+sceneArt(scene);
 body+='<g transform="translate(130 90) scale(.83)">'+heroArt(state.hero,state.heroWear)+'</g>';
 if(state.pet!=="none")body+='<g transform="translate(630 330) scale(.72)">'+petArt(state.pet,state.petWear)+'</g>';
 body+='<rect x="20" y="20" width="390" height="66" rx="21" fill="#0b1023" fill-opacity=".87" stroke="#ff4eab" stroke-width="3"/>';
 body+='<text x="45" y="60" font-size="31" fill="#ffe9f8" font-weight="900">BANGERVERSE</text>';
 body+='<rect x="720" y="20" width="240" height="61" rx="18" fill="#0b1023" fill-opacity=".85" stroke="#94f6dc" stroke-width="3"/>';
 const title=display(HEROES.find(x=>x.id===state.hero)||HEROES[0]);
 body+='<text x="838" y="60" text-anchor="middle" font-size="28" fill="#8dfbe1" font-weight="850">'+escape(title)+'</text>';
 if(state.pet!=="none")body+='<text x="757" y="623" font-size="31" text-anchor="middle" fill="#ffe8f8" font-weight="800" paint-order="stroke" stroke="#141425" stroke-width="8">'+escape(state.pname)+'</text>';
 target.innerHTML=svg(body);
 target.dataset.pzArt="ready";
 target.setAttribute("aria-label",title+(state.pet==="none"?"":" и "+state.pname)+" · "+scene);
}
function sync(){
 const d=store();if(!d)return;
 const home=$("pz3d-home-stage");
 if(home){renderScene(home);document.body.classList.add("pz-art-ready")}
 const frame=$("pz73-frame");
 if(frame){renderScene(frame);document.body.classList.add("pz-art-ready")}
}
function chooseScene(id){
 if(!store()||!SCENES.some(x=>x.id===id))return;
 store().artV82 ||= {};store().artV82.scene=id;
 if(typeof persist==="function")persist();
 window.dispatchEvent(new Event("pz:style-change"));sync();
}
window.pzArtV82={HEROES,SCENES,PET_INFO,heroArt,petArt,sceneArt,renderScene,chooseScene,sync,current,defs};
window.addEventListener("pz:unlocked",()=>setTimeout(sync,100));
window.addEventListener("pz:style-change",()=>setTimeout(sync,20));
window.addEventListener("banger:local-save",()=>{if(document.body.classList.contains("pz-unlocked"))sync()});
document.addEventListener("click",event=>{if(event.target?.closest?.("nav button,#pz73"))setTimeout(sync,95)});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(sync,600));
else setTimeout(sync,150);
})();