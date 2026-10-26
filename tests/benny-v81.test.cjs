"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const vm=require("node:vm");
const fs=require("node:fs");
const source=fs.readFileSync("benny-chat-v81.js","utf8");
function boot(){
 const registry=new Map(),events=new Map(),revoked=[];
 class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.parentNode=null;this.textContent="";this.innerHTML="";this.style={};this.dataset={};this.attributes={};this.value="";this.files=[];this.hidden=false;this.isConnected=false;this.focus=()=>{};
    const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)};}
  set id(x){this._id=x;registry.set(x,this)}
  get id(){return this._id}
  append(...items){for(const x of items){if(x&&typeof x==="object"){x.parentNode=this;x.isConnected=true}this.children.push(x)}}
  replaceChildren(...items){this.children=[];this.append(...items)}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);this.isConnected=false}
  insertBefore(x,y){const index=this.children.indexOf(y);if(index<0)this.append(x);else {this.children.splice(index,0,x);x.parentNode=this}}
  setAttribute(k,v){this.attributes[k]=v}
  getAttribute(k){return this.attributes[k]}
  addEventListener(k,fn){this.events||={};this.events[k]=fn}
  insertAdjacentElement(_,x){this.parentNode?.append(x)}
  querySelector(t){return t==="div"?this.children.find(x=>x.tagName==="div")||null:null}
  click(){return this.onclick?.()}
 }
 const mk=id=>{const x=new Element("div");x.id=id;return x};
 const modal=mk("bai-modal"),panel=mk("bai-panel"),log=mk("bai-log"),file=mk("bai-file"),input=mk("bai-input"),send=mk("bai-send");
 const status=mk("bai-status"),top=mk("bai-top"),close=mk("bai-close"),composer=mk("bai-composer"),open=mk("bai-open");
 const header=new Element("div");top.append(header,close);const form=new Element("div");form.append(composer,status);composer.append(file,input,send);
 modal.append(panel);panel.append(top,log,form);
 const cameraFiles=[];
 const d={getElementById:id=>registry.get(id)||null,createElement:x=>new Element(x),addEventListener:(e,fn)=>events.set("doc:"+e,fn),body:{classList:{add(){},remove(){}}}};
 const urls={createObjectURL:()=> "blob:preview-"+Math.random(),revokeObjectURL:u=>revoked.push(u)};
 const sent=[];
 const sb={
  auth:{getSession:async()=>({data:{session:{user:{id:"ownerA"},access_token:"mockjwt"}},error:null})},
  from:()=>({select:()=>({eq:()=>({in:()=>({order:()=>({limit:async()=>({data:[],error:null})})})})})})
 };
 const w={pzActiveUserId:"ownerA",pzSupabaseShared:sb,supabase:{createClient:()=>sb},addEventListener:(e,fn)=>events.set("win:"+e,fn)};
 class Img{constructor(){this.naturalWidth=1200;this.naturalHeight=900}set src(_){this.onload?.()}}
 class Mutation{observe(){}}
 const doc=d;
 const originalFetch=async(url,opts)=>{sent.push({url,body:JSON.parse(opts.body)});return {ok:true,json:async()=>({answer:"Я понял, печенье можно оценить после проверки веса",saved:true})}};
 const context={window:w,document:doc,localStorage:{getItem:()=>"ru"},URL:urls,Image:Img,MutationObserver:Mutation,
   fetch:originalFetch,confirm:()=>true,console,Math,Date,Promise,HTMLImageElement:Img};
 const createCanvas=()=>{const x=new Element("canvas");x.getContext=()=>({drawImage(){}});x.toDataURL=()=> "data:image/jpeg;base64,"+"Y".repeat(512);return x};
 const create=d.createElement;d.createElement=tag=>tag==="canvas"?createCanvas():create(tag);
 vm.runInNewContext(source,context,{filename:"benny-chat-v81.js"});
 return {registry,events,sent,w,revoked,file,input,send,log};
}
const photo=name=>({type:"image/jpeg",size:10000,name,lastModified:1234});
test("sequential album selections are combined into one Benny request",async()=>{
 const x=boot(),upload=x.file.events?.change;assert.equal(typeof upload,"function");
 x.file.files=[photo("cookie.jpg")];upload();
 assert.equal(x.w.pzBennyV81.getAttachmentCount(),1);
 x.file.files=[photo("nutrition.jpg")];upload();
 assert.equal(x.w.pzBennyV81.getAttachmentCount(),2);
 x.input.value="Съел пять штук с упаковки, посчитай по этикетке";
 await x.send.onclick();
 assert.equal(x.sent.length,1,"one request containing both photos");
 assert.equal(x.sent[0].body.message,x.input.value||"Съел пять штук с упаковки, посчитай по этикетке");
 assert.equal(x.sent[0].body.image_data_urls.length,2);
 assert.equal(x.w.pzBennyV81.getAttachmentCount(),0);
 assert.ok(x.log.children.length>=2);
});
test("attachment cap is five and removing thumbnails never changes the diary",()=>{
 const x=boot(),upload=x.file.events.change;
 for(let i=0;i<7;i++){x.file.files=[photo("file"+i+".jpg")];upload()}
 assert.equal(x.w.pzBennyV81.getAttachmentCount(),5);
 const strip=x.registry.get("pz81-attachments");
 assert.ok(strip.children.length===5);
 const remove=strip.children[0].children.find(x=>x.tagName==="button");
 assert.ok(remove?.onclick);remove.onclick();
 assert.equal(x.w.pzBennyV81.getAttachmentCount(),4);
 assert.equal(x.sent.length,0);
});
