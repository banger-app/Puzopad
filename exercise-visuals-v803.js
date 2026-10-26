/* BANGERVERSE v80.3 · Original self-contained workout vector scenes.
   Each exercise has a distinct, scalable, labeled 2D motion diagram; no third-party image requests. */
(function(){
"use strict";
const meta={
 warm:["Динамическая разминка","Шагай легко 5–8 минут. Начинай медленно.","Пульс · суставы","walk"],
 stepper:["Степпер","Ровный темп, устойчивый корпус. Дыши свободно.","Кардио · ноги","steps"],
 cool:["Заминка","3–5 минут спокойного шага и мягких движений.","Восстановление","stretch"],
 press:["Жим гантелей лёжа","Спина на скамье, плавно жми гантели вверх.","Грудь · трицепс","bench"],
 chest:["Жим гантелей лёжа","Спина на скамье, плавно жми гантели вверх.","Грудь · трицепс","bench"],
 incline:["Наклонный жим","Скамья 20–35°, жми вверх без рывков.","Верх груди","incline"],
 shoulder:["Жим гантелей над головой","Из положения сидя выжимай гантели вверх.","Плечи · трицепс","overhead"],
 triceps:["Разгибание рук на блоке","Локти рядом с корпусом, разгибай руки вниз.","Трицепс","cable"],
 pulldown:["Тяга верхнего блока","Тяни рукоять к верхней части груди без рывка.","Широчайшие · спина","pulldown"],
 row:["Горизонтальная тяга","Тяни рукоять к поясу, плечи не поднимай.","Спина · лопатки","row"],
 rear:["Разведения на заднюю дельту","Плавно разведи руки в стороны с малым весом.","Задние дельты","fly"],
 biceps:["Сгибания рук","Подними гантели к плечам без раскачивания.","Бицепс","curl"],
 squat:["Жим ногами","Толкай платформу ногами, не выпрямляя колени рывком.","Квадрицепс · ягодицы","legpress"],
 legpress:["Жим ногами","Толкай платформу ногами, не выпрямляя колени рывком.","Ноги · ягодицы","legpress"],
 hinge:["Румынская тяга","Уводи таз назад, сохраняй нейтральную спину.","Задняя поверхность бедра","hinge"],
 calves:["Подъёмы на носки","Поднимись на носки и плавно опустись.","Икроножные","calves"],
 plank:["Планка","Прямая линия корпуса, дыши без задержки.","Корпус · стабилизация","plank"]
};
const stroke=(d,color="#d8e6fa",width=13)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot=(x,y,r,color)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const box=(x,y,w,h,color,rx=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${color}"/>`;
const weight=(x,y)=>`${stroke(`M${x-19} ${y} H${x+19}`,"#e9e8f2",6)}${box(x-24,y-18,10,36,"#a4b3ce",4)}${box(x+14,y-18,10,36,"#a4b3ce",4)}`;
const head=(x,y)=>`${dot(x,y,16,"#ffd8bc")}${stroke(`M${x-12} ${y-12} Q${x} ${y-21} ${x+12} ${y-12}`,"#423b67",6)}`;
const mark=(x,y,t)=>`<g>${dot(x,y,20,"#e969ae")}<text x="${x}" y="${y+6}" font-size="15" font-weight="900" text-anchor="middle" fill="#fff">${t}</text></g>`;
const person=(pose="stand")=>{
 if(pose==="stand")return `${head(220,68)}${stroke("M220 90 L219 153","#65d0c8",28)}${stroke("M218 100 L178 135 L164 169","#ffd8bc",12)}${stroke("M222 100 L260 133 L278 172","#ffd8bc",12)}${stroke("M214 164 L192 198 L187 223","#93a9e9",18)}${stroke("M224 164 L253 197 L262 222","#93a9e9",18)}`;
 if(pose==="press")return `${head(148,123)}${stroke("M166 137 L255 170","#65d0c8",29)}${stroke("M251 173 L285 180 L296 213","#93a9e9",17)}${stroke("M245 174 L258 205 L261 221","#93a9e9",17)}${stroke("M183 142 L190 100 L198 66","#ffd8bc",13)}${stroke("M222 156 L245 106 L254 73","#ffd8bc",13)}`;
 if(pose==="incline")return `${head(157,83)}${stroke("M175 99 L241 164","#65d0c8",28)}${stroke("M241 169 L288 191 L289 222","#93a9e9",17)}${stroke("M240 169 L255 202 L252 223","#93a9e9",17)}${stroke("M185 114 L194 72 L199 47","#ffd8bc",13)}${stroke("M208 140 L242 85 L248 47","#ffd8bc",13)}`;
 if(pose==="seat")return `${head(221,72)}${stroke("M220 96 L220 153","#65d0c8",28)}${stroke("M210 160 L264 172 L290 207","#93a9e9",17)}${stroke("M222 165 L241 205 L248 223","#93a9e9",17)}`;
 if(pose==="plank")return `${head(112,130)}${stroke("M134 143 L285 163","#65d0c8",25)}${stroke("M140 148 L132 183 L115 211","#ffd8bc",13)}${stroke("M285 166 L334 197 L352 210","#93a9e9",17)}`;
 if(pose==="hinge")return `${head(153,132)}${stroke("M173 142 L255 161","#65d0c8",26)}${stroke("M257 164 L252 201 L260 222","#93a9e9",18)}${stroke("M250 162 L276 204 L288 223","#93a9e9",18)}${stroke("M192 152 L177 178 L180 194","#ffd8bc",13)}${stroke("M226 161 L211 181 L214 195","#ffd8bc",13)}`;
 return person("stand");
};
function render(id){
 const info=meta[id]||meta.warm,kind=info[3],C="#ffd8bc";
 let equipment="",figure="",fx="";
 if(["walk","steps","stretch","curl","fly","overhead","cable","calves"].includes(kind))figure=person();
 if(kind==="walk"){equipment=stroke("M75 228 H355","#50627f",6);fx=stroke("M306 103 L324 87 M315 130 L335 130","#f1bc8e",4)}
 if(kind==="steps"){equipment=box(160,204,120,16,"#677eb2",3)+box(182,218,158,12,"#364663",3);fx=stroke("M306 108 L326 88 M312 124 L331 117","#f7bc83",4)}
 if(kind==="stretch"){fx=stroke("M180 137 L141 101 M262 138 L310 95","#ffd8bc",13)+stroke("M144 101 L128 87 M309 95 L327 79","#f69ccf",4)}
 if(kind==="curl"){equipment=weight(163,143)+weight(278,143);fx=stroke("M177 133 L193 113 M263 135 L249 115",C,12)}
 if(kind==="fly"){figure=person("hinge");equipment=weight(123,167)+weight(324,168);fx=stroke("M171 150 L125 164 M221 160 L325 166",C,12)}
 if(kind==="overhead"){figure=person("seat");equipment=box(193,155,105,11,"#6c7fa3",4)+box(188,159,12,63,"#657697",3)+weight(163,42)+weight(278,42);fx=stroke("M211 109 L174 80 L163 53 M232 109 L268 81 L278 53",C,12)}
 if(kind==="bench"||kind==="incline"){
  figure=person(kind==="bench"?"press":"incline");
  equipment=kind==="bench"?stroke("M114 172 H280 M135 174 L136 215 M272 174 L278 215","#8b9dbe",9):stroke("M133 202 L249 145 M140 205 L144 226 M248 146 L265 217","#8b9dbe",9);
  equipment+=weight(kind==="bench"?198:199,kind==="bench"?61:39)+weight(kind==="bench"?254:248,kind==="bench"?68:41);
 }
 if(kind==="cable"){equipment=stroke("M345 43 V216 M310 44 H362 M310 45 L284 116","#8a9dbd",7)+box(332,48,13,70,"#52637f",4);fx=stroke("M219 102 L252 133 L276 169 M218 102 L234 138 L257 178",C,12)+weight(267,178)}
 if(kind==="pulldown"){
  figure=person("seat");equipment=stroke("M150 34 H322 M150 36 L150 222 M322 36 L322 223 M174 58 H288 M221 177 L221 223","#8292b6",8);
  fx=stroke("M209 106 L180 83 L178 58 M233 106 L269 82 L287 58",C,12);
 }
 if(kind==="row"){
  figure=person("seat");equipment=box(190,169,108,11,"#7a8aa8")+stroke("M343 41 V215 M291 132 L341 112","#8495b4",6);
  fx=stroke("M218 113 L280 135 L299 131",C,12)+weight(297,132);
 }
 if(kind==="legpress"){
  figure=person("press");equipment=stroke("M304 43 L355 132 M306 52 L364 113 M176 180 L306 89","#8b9dbe",12)+box(301,70,55,13,"#8ca0c2",3);fx=stroke("M255 169 L290 131 L317 108","#93a9e9",18)+stroke("M245 172 L275 136 L308 116","#93a9e9",18);
 }
 if(kind==="hinge"){figure=person("hinge");equipment=stroke("M120 199 H276","#a4b3ce",7)+weight(115,197)+weight(276,197)}
 if(kind==="calves"){equipment=box(163,223,116,10,"#788aaa",4);fx=stroke("M191 222 L199 207 M263 222 L273 207","#f2be83",5)}
 if(kind==="plank"){figure=person("plank");equipment=box(74,218,314,8,"#4a577b",4);fx=stroke("M150 107 L287 132","#ec77b9",5)}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 250" role="img" aria-label="${info[0]}: схема упражнения">
  <defs><linearGradient id="pzex-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#283653"/><stop offset="1" stop-color="#131d33"/></linearGradient>
   <linearGradient id="pzex-floor" x1="0" x2="1"><stop stop-color="#314268"/><stop offset="1" stop-color="#1d2842"/></linearGradient></defs>
  <rect width="440" height="250" rx="23" fill="url(#pzex-bg)"/>
  <circle cx="325" cy="80" r="106" fill="#b3579c" opacity=".10"/>
  <circle cx="116" cy="171" r="92" fill="#53ccbd" opacity=".07"/>
  <path d="M22 227 H418" stroke="#6a779c" stroke-width="2" stroke-dasharray="5 9" opacity=".46"/>
  <g>${equipment}${figure}${fx}</g>
  <rect x="12" y="13" width="125" height="29" rx="14" fill="#121d31" stroke="#637597"/>
  <text x="74" y="32" font-size="12" font-weight="750" text-anchor="middle" fill="#f0c2df">${info[2]}</text>
  <text x="420" y="234" font-size="11" text-anchor="end" fill="#afbdd4">BANGERVERSE · FORM</text>
 </svg>`;
}
window.pzExerciseVisuals={meta,render};
})();