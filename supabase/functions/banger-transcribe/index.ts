import { createClient } from "npm:@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json"};
const response=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:cors});
// Warm edge instances remember a working transcription model to avoid a model-list fetch on every voice message.
let cachedModels:string[]|null=null;let lastDiscovery=0;
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return response({ok:true});
 if(req.method!=="POST")return response({error:"Method not allowed"},405);
 try{
  const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
  const supa=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!);
  const {data:{user},error}=await supa.auth.getUser(token);
  if(error||!user)return response({error:"Войди в BANGERVERSE ID"},401);
  const form=await req.formData();const audio=form.get("audio");
  if(!(audio instanceof File)||audio.size<900||audio.size>12*1024*1024)return response({error:"Нужна голосовая запись размером до 12 МБ"},400);
  const key=Deno.env.get("GEMINI_API_KEY");if(!key)return response({error:"Сервис голоса не настроен"},503);
  const mime=(audio.type||"audio/mp4").split(";")[0];
  const bytes=new Uint8Array(await audio.arrayBuffer());let binary="";
  for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  const encoded=btoa(binary);
  // Prefer stable Flash models, not an arbitrary top-ranked model from the discovery endpoint.
  const preferred=["models/gemini-3.1-flash-lite","models/gemini-3.5-flash-lite","models/gemini-3.8-flash","models/gemini-3.6-flash"];
  let available:string[]=cachedModels&&Date.now()-lastDiscovery<1800000?cachedModels:preferred;
  if(!cachedModels||Date.now()-lastDiscovery>=1800000)try{
   const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=100",{headers:{"x-goog-api-key":key}});
   if(r.ok){const d=await r.json();const supported=(d.models||[]).filter((m:any)=>m.supportedGenerationMethods?.includes("generateContent")&&/flash/i.test(m.name)&&!/live|image|tts|preview|embedding/i.test(m.name)).map((m:any)=>m.name);
    if(supported.length)available=[...preferred.filter(m=>supported.includes(m)),...supported.filter((m:string)=>!preferred.includes(m))];
   }
  }catch(_){}
  cachedModels=available;lastDiscovery=Date.now();
  const problems:string[]=[];
  for(const model of available.slice(0,2)){
   try{
    const upstream=await fetch("https://generativelanguage.googleapis.com/v1beta/"+model+":generateContent",{method:"POST",signal:AbortSignal.timeout(14000),headers:{"x-goog-api-key":key,"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:"Transcribe exactly what is spoken. Ukrainian/Russian/English. No explanations or translation. If speech is unintelligible, return an empty string."},{inline_data:{mime_type:mime,data:encoded}}]}],generationConfig:{temperature:0,maxOutputTokens:700}})});
    if(!upstream.ok){const result=await upstream.json().catch(()=>({}));problems.push(model+":"+upstream.status+":"+String(result.error?.message||"").slice(0,70));if([400,401,403].includes(upstream.status))continue;continue}
    const parsed=await upstream.json();const text=(parsed.candidates||[]).flatMap((x:any)=>x.content?.parts||[]).map((x:any)=>x.text||"").join(" ").trim();
    if(text){cachedModels=[model,...available.filter(x=>x!==model)];return response({text,provider:model,retryable:false})}
    problems.push(model+":empty");
   }catch(e){problems.push(model+":"+String((e as Error).message).slice(0,65))}
  }
  // Accurate failure signal, so browser can keep the original recorded blob and offer retry.
  return response({error:"Сервисы распознавания временно перегружены. Запись сохранена в этом окне, нажми повторить.",retryable:true,details:problems.slice(0,2)},503);
 }catch(e){return response({error:"Голос не распознан: "+String((e as Error).message||e)},500)}
});