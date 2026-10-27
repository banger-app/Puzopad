// Browser-level visual smoke checks. Run with: npm install --no-save playwright && node tests/mobile-visual-smoke.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const base=process.env.PZ_SMOKE_URL||"http://127.0.0.1:8765/";
const out="visual-smoke-artifacts";
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const sizes=[320,375,390,430,768];
let failures=[];
try{
 for(const width of sizes){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:"block"});
  const page=await context.newPage();
  page.on("pageerror",error=>{if(/Invalid regular expression|Unexpected token|SyntaxError/.test(error.message))failures.push(width+" app syntax: "+error.message)});
  await page.route(/^https:\/\/(?!127\.0\.0\.1).+/,route=>route.abort()).catch(()=>{});
  await page.goto(base,{waitUntil:"domcontentloaded",timeout:30000});
  const gestures=await page.evaluate(()=>{
    const sample=(type,count)=>{
      const event=new Event(type,{bubbles:true,cancelable:true});
      if(type.startsWith("touch"))Object.defineProperty(event,"touches",{value:Array.from({length:count},()=>({}))});
      document.dispatchEvent(event);
      return event.defaultPrevented;
    };
    const single=sample("touchstart",1);
    const pinch=sample("touchstart",2);
    const moving=sample("touchmove",2);
    sample("touchend",0);
    const native=sample("gesturestart",2);
    return {single,pinch,moving,native,locked:window.pzViewportLockV853?.getMultiTouch()};
  });
  console.log("Mobile gestures",width,JSON.stringify(gestures));
  if(gestures.single||!gestures.pinch||!gestures.moving||!gestures.native||gestures.locked){
    failures.push(width+"px gesture guard failed: "+JSON.stringify(gestures));
  }
  async function view(section,modal=false){
   await page.evaluate(({section,modal})=>{
    document.body.classList.remove("pz-locked","pz-checking");
    document.body.classList.add("pz-unlocked");
    const entry=document.getElementById("pz-entry");if(entry)entry.hidden=true;
    document.querySelectorAll(".section").forEach(el=>el.classList.toggle("active",el.id===section));
    const benny=document.getElementById("bai-modal");
    if(benny)benny.classList.toggle("open",modal);
   },{section,modal});
   await page.waitForTimeout(100);
   return page.evaluate(()=>{
    const viewport=document.documentElement.clientWidth;
    const scroll=document.documentElement.scrollWidth;
    const body=document.body.scrollWidth;
    const offender=[...document.querySelectorAll("body *")].filter(el=>{
      if(!el.getClientRects().length||el.closest("#pz-entry")?.hidden)return false;
      const r=el.getBoundingClientRect();
      if(!r.width)return false;
      const css=getComputedStyle(el);
      if(css.position==="fixed"&&r.right>viewport+200)return false;
      return r.right>viewport+6&&r.left>=0&&css.visibility!=="hidden";
    }).slice(0,8).map(el=>({tag:el.tagName,id:el.id,cls:String(el.className).slice(0,90),right:Math.round(el.getBoundingClientRect().right)}));
    return {viewport,scroll,body,offender};
   });
  }
  for(const [section,modal] of [["home",false],["city",false],["home",true]]){
   const result=await view(section,modal);
   console.log(JSON.stringify({width,section,modal,...result}));
   if(result.scroll>width+5||result.body>width+5){
    failures.push(width+"px "+section+(modal?" Benny":"")+" overflows by "+(Math.max(result.scroll,result.body)-width)+"px: "+JSON.stringify(result.offender));
   }
   if([390,430].includes(width))await page.screenshot({path:out+"/"+width+"-"+(modal?"benny":section)+".png",fullPage:false});
  }
  await context.close();
 }
}finally{await browser.close()}
if(failures.length){console.error("VISUAL SMOKE FAILURES:\n"+failures.join("\n"));process.exitCode=1}
else console.log("Visual smoke passed: "+sizes.length+" mobile widths, home / city / Benny each.");
