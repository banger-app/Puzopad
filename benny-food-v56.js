/* BANGERVERSE v56 | Benny food commit, approximate nutrition, resilient 503. */
(()=>{
const oldFetch=window.fetch.bind(window);
const EAT=/(съел|съела|скушал|скушала|з'їв|зїв|з'їла|поїв|i ate|сожрал)/i;
const HYP=/(если|допустим|предположим|планирую|хочу съесть|собираюсь|завтра)/i;
function fallback(s){
 if(!EAT.test(s)||HYP.test(s))return null;
 let items=[];
 if(/гречк|гречнев/i.test(s))items.push({name:'Гречка варёная',qty:/весь|всю|вся|целый/i.test(s)?'весь судок':'порция, вес неизвестен',k:240,p:8,f:2,c:44,grams:null});
 let c=s.match(/(\d+)\s*(?:шт(?:ук[иа])?\s*)?корд[ое]н[\s-]*бл[юуе]/i);
 if(c&&+c[1]<=8)items.push({name:'Куриный кордон-блю',qty:c[1]+' шт',k:+c[1]*285,p:+c[1]*19,f:+c[1]*18,c:+c[1]*17,grams:null});
 let e=s.match(/(\d+)\s*(?:вареных\s*|жареных\s*)?(?:яйц|яиц|яйца|яйцо|яйця|яєць)/i);
 if(e&&+e[1]<=12)items.push({name:'Яйца',qty:e[1]+' шт',k:+e[1]*75,p:+e[1]*6.3,f:+e[1]*5,c:+e[1]*0.7,grams:null});
 return items.length?{type:'food_eaten',items}:null;
}
function norm(v){return String(v||'').toLowerCase().replace(/ё/g,'е').replace(/корден/g,'кордон').replace(/[-–]/g,' ').replace(/\b(куриный|вареная|вареные|свежая|готовая|отварная)\b/g,'').replace(/\s+/g,' ').trim()}
function commit(action,message){
 if(!action||action.type!=='food_eaten'||!Array.isArray(action.items))return null;
 if(typeof db==='undefined'||!Array.isArray(db.foods)||!Array.isArray(db.loot))throw Error('Журнал не загружен');
 const t=stamp(),items=action.items.slice(0,12).map(x=>({name:String(x.name||'').trim().slice(0,100),qty:String(x.qty||'порция').slice(0,80),k:Number(x.k),p:x.p==null?null:Number(x.p),f:x.f==null?null:Number(x.f),c:x.c==null?null:Number(x.c),grams:x.grams==null?null:Number(x.grams)})).filter(x=>x.name&&Number.isFinite(x.k)&&x.k>=0&&x.k<=3000);
 if(!items.length)return null;
 const hash=Array.from(message.toLowerCase()).reduce((n,c)=>((n*31+c.charCodeAt(0))|0),7);
 const group='benny_'+t.date+'_'+(hash>>>0).toString(36);
 if(db.foods.some(x=>x.bennySource===group))return '⚠️ Такой приём уже записан сегодня; дубль не добавлен.';
 const beforeFoods=db.foods.slice(),beforeLoot=db.loot.map(x=>({...x}));
 let spent=[],unclear=[];
 try{
  items.forEach((x,i)=>db.foods.push({id:group+'_'+i,sourceId:group+'_'+i,bennySource:group,date:t.date,time:t.time,name:x.name,qty:x.qty,k:Math.round(x.k),p:Number.isFinite(x.p)?Math.round(x.p*10)/10:null,f:Number.isFinite(x.f)?Math.round(x.f*10)/10:null,c:Number.isFinite(x.c)?Math.round(x.c*10)/10:null,note:'БЭННИ: примерная пищевая ценность, не измерение'}));
  for(const item of items){
    let matches=db.loot.filter(x=>norm(x.name)===norm(item.name));
    if(matches.length!==1)continue;
    let stock=matches[0];
    const all=/весь|всю|вся|целиком|полностью|увесь|цілий/i.test(item.qty);
    const units=item.qty.match(/(\d+)\s*шт/i);
    if(all){db.loot=db.loot.filter(x=>x.id!==stock.id);spent.push(item.name+' целиком')}
    else if(item.grams>0&&Number.isFinite(stock.qty)&&stock.qty>=item.grams){
      stock.qty=Math.round((stock.qty-item.grams)*10)/10;
      if(stock.qty<=0)db.loot=db.loot.filter(x=>x.id!==stock.id);
      spent.push(item.name+' '+item.grams+' г');
    }else if(units&&stock.unit==='шт'&&stock.qty>=Number(units[1])){
      stock.qty-=Number(units[1]);if(stock.qty<=0)db.loot=db.loot.filter(x=>x.id!==stock.id);
      spent.push(item.name+' '+units[1]+' шт');
    }else unclear.push(item.name);
  }
  persist();
  const fromStorage=JSON.parse(localStorage.getItem(testMode?TESTKEY:KEY)||'{}');
  if(!fromStorage.foods?.some(x=>x.bennySource===group))throw Error('Дневник не подтвердил сохранение');
  render();if(typeof renderDiaryRange==='function'){selectedDiaryDay=dayKey(t.date,t.time);renderDiaryRange();}
 }catch(e){db.foods=beforeFoods;db.loot=beforeLoot;throw e}
 const total=items.reduce((a,x)=>a+x.k,0);
 return '✅ Еда записана в дневник: '+items.map(x=>x.name+' — '+x.qty+' (~'+Math.round(x.k)+' ккал)').join('; ')+'. Итого ~'+Math.round(total)+' ккал. Это оценка, а не измерение. 🧊 Списано со склада: '+(spent.length?spent.join(', '):'ничего, нет точного совпадения и количества.')+(unclear.length?' Не списано без граммов/штук: '+unclear.join(', '):'')+'.';
}
window.fetch=async function(input,init){
 const path=typeof input==='string'?input:input?.url||'';
 if(!path.includes('/functions/v1/banger-ai'))return oldFetch(input,init);
 const raw=init?.body;let message='';
 try{message=String(JSON.parse(raw).message||'')}catch(_){}
 const remote=await oldFetch(input,init);
 if(!EAT.test(message)||HYP.test(message))return remote;
 let result;try{result=await remote.clone().json()}catch(_){return remote}
 let action=result.action?.type==='food_eaten'?result.action:null;
 let offline=false;
 if(!action&&!remote.ok&&[429,502,503,504].includes(remote.status)){action=fallback(message);offline=!!action}
 if(!action)return remote;
 try{
   const note=commit(action,message);
   if(!note)return remote;
   const answer=remote.ok?String(result.answer||'')+'\n\n'+note:note+'\n⚠️ Gemini перегружен. Расчёт сделан только по тексту, фото не анализировалось.';
   return new Response(JSON.stringify({answer,saved:remote.ok?!!result.saved:false,action_logged:true,offline_estimate:offline}),{status:200,headers:{'Content-Type':'application/json'}});
 }catch(e){return new Response(JSON.stringify({error:'БЭННИ не смог записать в журнал: '+e.message}),{status:503,headers:{'Content-Type':'application/json'}})}
};
})();