/* BANGERVERSE v85.3 — prevent accidental whole-page pinch zoom on iOS.
 * Only multi-touch zoom gestures are cancelled. Single-finger scrolling,
 * horizontal navigation carousels, text selection and controls stay enabled.
 * No user-scalable=no: browser accessibility settings remain available.
 */
(function(){
 "use strict";
 let multiple=false;
 const prevent=e=>{if(e.cancelable)e.preventDefault()};
 const gestures=["gesturestart","gesturechange"];
 gestures.forEach(type=>document.addEventListener(type,prevent,{capture:true,passive:false}));
 document.addEventListener("touchstart",function(e){
  if(e.touches&&e.touches.length>1){multiple=true;prevent(e)}
 },{capture:true,passive:false});
 document.addEventListener("touchmove",function(e){
  if(multiple||(e.touches&&e.touches.length>1)){multiple=true;prevent(e)}
 },{capture:true,passive:false});
 const done=e=>{if(!e.touches||e.touches.length<2)multiple=false};
 document.addEventListener("touchend",done,{capture:true,passive:true});
 document.addEventListener("touchcancel",done,{capture:true,passive:true});
 document.addEventListener("gestureend",()=>{multiple=false},{capture:true,passive:true});
 // Prevent layout width changing on focus: iOS text input should be at least 16px (see CSS).
 // Do not manipulate window.visualViewport.scale: browsers do not expose a reliable reset API.
 window.pzViewportLockV853={getMultiTouch:()=>multiple};
})();