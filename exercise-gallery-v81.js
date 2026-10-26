/* BANGERVERSE v81 — photographic exercise guide, two real positions per move.
 * Source: yuhonas/free-exercise-db, The Unlicense (public domain).
 * Commit pinned, no scraped or proprietary Gymvisual exercise media.
 */
(function(){
"use strict";
const rev="f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5";
const root="https://raw.githubusercontent.com/yuhonas/free-exercise-db/"+rev+"/exercises/";
const PHOTO=Object.freeze({
 warm:"Walking_Treadmill",stepper:"Stairmaster",cool:"Chair_Upper_Body_Stretch",
 press:"Dumbbell_Bench_Press",chest:"Dumbbell_Bench_Press",
 incline:"Incline_Dumbbell_Press",shoulder:"Seated_Dumbbell_Press",
 triceps:"Triceps_Pushdown",pulldown:"Wide-Grip_Lat_Pulldown",
 row:"Seated_Cable_Rows",rear:"Cable_Rear_Delt_Fly",biceps:"Dumbbell_Bicep_Curl",
 squat:"Leg_Press",legpress:"Leg_Press",hinge:"Romanian_Deadlift",
 calves:"Standing_Calf_Raises",plank:"Plank"
});
const source=(id,n)=>"./assets/exercises-v81/"+(PHOTO[id]||PHOTO.warm)+"/"+(n===1?"1":"0")+".jpg";
const remote=(id,n)=>root+(PHOTO[id]||PHOTO.warm)+"/"+(n===1?"1":"0")+".jpg";
const previous=window.pzExerciseVisuals;
if(!previous)return;
function render(id){
 const title=previous.meta[id]?.[0]||"Упражнение";
 const one=source(id,0),two=source(id,1);
 return '<div class="pz81-exercise-photo-stage" role="group" aria-label="'+title+'">'+
  '<div class="pz81-exercise-pose"><img loading="lazy" decoding="async" src="'+one+'" alt="'+title+' · исходное положение"><span>01 · НАЧАЛО</span></div>'+
  '<div class="pz81-exercise-pose"><img loading="lazy" decoding="async" src="'+two+'" alt="'+title+' · конечное положение"><span>02 · ДВИЖЕНИЕ</span></div>'+
  '<div class="pz81-exercise-brand">BANGERVERSE · TRAINING</div></div>';
}
function thumb(id){
 return '<img src="'+source(id,0)+'" loading="lazy" decoding="async" alt="'+(previous.meta[id]?.[0]||"Упражнение")+'">';
}
previous.render=render;previous.thumb=thumb;
// If the local asset download hasn't deployed yet, use the pinned upstream image.
 document.addEventListener("error",event=>{
   const im=event.target;
   if(!(im instanceof HTMLImageElement)||im.dataset.pzRemoteTried)return;
   const name=im.getAttribute("src")||"";
   if(!name.startsWith("./assets/exercises-v81/"))return;
   im.dataset.pzRemoteTried="1";
   im.src=root+name.slice("./assets/exercises-v81/".length);
 },true);
 window.pzExerciseGalleryV81={source,remote,photoIds:PHOTO,thumb};
})();
