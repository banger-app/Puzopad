import * as THREE from "three";
/* Original BANGERVERSE v76 3D figures. No third-party model assets. */
const mat=(c,metalness=0,roughness=.63)=>new THREE.MeshStandardMaterial({color:c,metalness,roughness});
const mesh=(p,g,m,x,y,z,a=1,b=1,c=1)=>{const s=new THREE.Mesh(g,m);s.position.set(x,y,z);s.scale.set(a,b,c);s.castShadow=true;s.receiveShadow=true;p.add(s);return s};
const sph=(p,m,x,y,z,a,b,c)=>mesh(p,new THREE.SphereGeometry(1,32,24),m,x,y,z,a,b,c);
const curve=(p,pts,color,r=.014)=>mesh(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(t=>new THREE.Vector3(...t))),24,r,6,false),mat(color),0,0,0);
export function makeHero(species="frog",palette=0){
 const p=new THREE.Group();p.name="BANGER_original_figure";
 const color=[0x55cb80,0xf75fa3,0x66c6f1,0xe9c46c][Math.max(0,Math.min(3,Number(palette)||0))];
 const skin=mat(species==="human"?0xcd946c:species==="robot"?0xadcde3:color);
 const jacket=mat(species==="robot"?0x3e4a63:0x28334a,.16,.45),trim=mat(0xe6bc70,.7,.35),black=mat(0x121927,.14,.2);
 for(const s of [-1,1]){
  const leg=mesh(p,new THREE.CapsuleGeometry(.17,.53,5,12),jacket,s*.27,.56,0);
  leg.rotation.z=s*.06;
  sph(p,black,s*.27,.14,.23,.25,.15,.35);
  const arm=mesh(p,new THREE.CapsuleGeometry(.16,.51,5,12),jacket,s*.60,1.28,0);
  arm.rotation.z=s*.19;
  sph(p,skin,s*.69,.94,.09,.18,.18,.18);
  for(let i=0;i<3;i++)sph(p,skin,s*(.62+i*.05),.86,.18,.045,.10,.07);
 }
 mesh(p,new THREE.CapsuleGeometry(.43,.65,7,24),jacket,0,1.27,0,1,.98,.90);
 sph(p,mat(0x475a6d),0,1.24,.36,.28,.38,.08);
 mesh(p,new THREE.BoxGeometry(.75,.10,.55),black,0,.72,0);
 mesh(p,new THREE.BoxGeometry(.17,.14,.08),trim,0,.73,.33);
 if(species==="robot"){
  mesh(p,new THREE.BoxGeometry(.88,.83,.73),skin,0,2.04,.04);
  mesh(p,new THREE.BoxGeometry(.69,.29,.08),black,0,2.08,.44);
  for(const s of [-1,1])sph(p,mat(0x6beeff,.4,.22),s*.20,2.08,.49,.09,.11,.05);
  mesh(p,new THREE.CylinderGeometry(.07,.07,.23,12),trim,0,2.58,0);
  sph(p,mat(0xff55b8),0,2.75,0,.12,.12,.12);
 }else if(species==="human"){
  mesh(p,new THREE.CylinderGeometry(.20,.21,.19,20),skin,0,1.72,0);
  sph(p,skin,0,2.08,.05,.43,.46,.38);
  sph(p,mat(0x30282b),0,2.47,-.02,.45,.16,.38);
  for(const s of [-1,1])sph(p,mat(0x30282b),s*.4,2.24,.08,.095,.26,.25);
  sph(p,mat(0xa85932),0,1.82,.42,.25,.23,.12);
  sph(p,skin,0,2.06,.47,.08,.14,.09);
 }else{
  mesh(p,new THREE.CylinderGeometry(.22,.21,.18,20),skin,0,1.74,0);
  sph(p,skin,0,2.05,.06,.54,.41,.45);
  for(const s of [-1,1]){
   sph(p,skin,s*.35,2.39,.01,.20,.23,.22);
   sph(p,mat(0xf5f3eb),s*.35,2.42,.17,.14,.14,.10);
   sph(p,black,s*.35,2.42,.263,.055,.066,.045);
  }
  curve(p,[[-.27,1.88,.48],[-.12,1.845,.51],[.13,1.845,.51],[.28,1.88,.47]],0x2d5d43,.016);
  sph(p,mat(0x985630),0,1.76,.45,.18,.16,.10);
 }
 if(species!=="robot"){
  for(const s of [-1,1]){
   sph(p,black,s*.21,2.10,.48,.20,.13,.05);
   curve(p,[[s*.37,2.16,.47],[s*.51,2.18,.31]],0xcbb47f,.017);
  }
  mesh(p,new THREE.BoxGeometry(.14,.035,.06),trim,0,2.13,.53);
 }
 sph(p,trim,0,1.34,.445,.12,.12,.025);
 return p;
}
export function makeHamster(){
 const p=new THREE.Group();p.name="FA_original_hamster";
 const fur=mat(0xc98e59),cream=mat(0xf1e5c9),dark=mat(0x221b23,.1,.25),pink=mat(0xeaabaf),patch=mat(0xb87948);
 sph(p,fur,0,.78,-.09,.69,.71,.60);
 sph(p,cream,0,.67,.35,.54,.55,.32);
 sph(p,fur,0,1.38,.12,.63,.55,.50);
 for(const s of [-1,1]){
  sph(p,patch,s*.47,1.87,.00,.27,.30,.17);
  sph(p,pink,s*.48,1.88,.16,.18,.21,.065);
  sph(p,cream,s*.38,1.21,.52,.28,.24,.20);
  sph(p,dark,s*.27,1.49,.58,.11,.14,.08);
  sph(p,mat(0xffffff),s*.30,1.54,.65,.035,.04,.02);
  sph(p,pink,s*.46,.23,.21,.18,.14,.27);
  sph(p,pink,s*.55,.72,.25,.13,.22,.14);
  for(let i=0;i<3;i++)curve(p,[[s*.2,1.14,.69],[s*(.42+i*.08),1.20+(i-1)*.06,.83]],0xffe8cf,.011);
 }
 sph(p,cream,0,1.15,.53,.40,.29,.19);
 sph(p,pink,0,1.17,.73,.10,.079,.075);
 curve(p,[[-.08,1.055,.75],[0,1.02,.77],[.08,1.055,.75]],0x644942,.015);
 for(let i=0;i<4;i++)sph(p,patch,Math.sin(i*1.7)*.27,.90,-.63,.16,.09,.065);
 return p;
}
