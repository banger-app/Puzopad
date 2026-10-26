(function(){
"use strict";
if(typeof window.persist!=="function"||window.__pzPersist64)return;
const original=window.persist;
window.__pzPersist64=true;
window.persist=function(...args){
 const result=original.apply(this,args);
 try{
  const uid=window.pzActiveUserId;
  if(uid&&typeof db!=="undefined"&&typeof testMode!=="undefined"&&!testMode){
   const payload=JSON.stringify(db);
   localStorage.setItem("pz_private_v59_"+uid,payload);
   window.dispatchEvent(new Event("banger:local-save"));
  }
 }catch(e){console.warn("Account-scoped backup error",e)}
 return result;
};
})();