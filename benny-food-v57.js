/* BANGERVERSE v57 | Receipt-verified nutrition logging, staged photo estimates and safe inventory deduction. */
(()=>{
const oldFetch=window.fetch.bind(window);
const EAT=/(съел|съела|скушал|скушала|з'їв|зїв|з'їла|поїв|i ate|сожрал)/i;
const HYP=/(допустим|предположим|планирую|хочу съесть|собираюсь|завтра|если бы я съел|если бы я скушал)/i;
const CONFIRM=/(съел|скушал|з'їв|зїв|з'їла|поїв|запиши|записать|добавь|додай|внеси|сохрани|подтверждаю)/i;
const PENDING='benny_pending_food_v57';
function foodRequest(s){return CONFIRM.test(s)&&!HYP.test(s)&&!/добавь\s+(?:это\s+)?в\s+холодильник|пополни\s+холодильник|не\s+записывай/i.test(s);}
function pending(){try{const p=JSON.parse(sessionStorage.getItem(PENDING)||'null');if(!p||Date.now()-p.savedAt>12*3600*1000)return null;return p.action}catch(_){return null}}
function remember(action){try{sessionStorage.setItem(PENDING,JSON.stringify({savedAt:Date.now(),action}))}catch(_){}}
function forget(){try{sessionStorage.removeItem(PENDING)}catch(_){}}
function isRealCount(message,grams){if(!(grams>0))return false;return new RegExp('(?:^|\\s)'+grams+'\\s*(?:г|гр|грамм|мл|ml)(?:\\b|\\s|$)','i').test(message);}

function fallback(s){
 if(!foodRequest(s)||!EAT.test(s))return null;
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
 const gameDay=dayKey(t.date,t.time);
 const allPresent=items.every(x=>db.foods.some(row=>dayKey(row.date,row.time)===gameDay&&norm(row.name)===norm(x.name)&&String(row.qty||'')===x.qty&&Math.abs(Number(row.k||0)-x.k)<25));
 if(allPresent&&!/второй раз|второй прием|второй приём|новый приём|еще одну порцию|ещё одну порцию/i.test(message))return '⚠️ Похожий приём уже есть в дневнике этих игровых суток. Повторно не записываю.';
 const beforeFoods=db.foods.slice(),beforeLoot=db.loot.map(x=>({...x}));
 let spent=[],unclear=[];
 try{
  items.forEach((x,i)=>db.foods.push({id:group+'_'+i,sourceId:group+'_'+i,bennySource:group,date:t.date,time:t.time,name:x.name,qty:x.qty,k:Math.round(x.k),p:Number.isFinite(x.p)?Math.round(x.p*10)/10:null,f:Number.isFinite(x.f)?Math.round(x.f*10)/10:null,c:Number.isFinite(x.c)?Math.round(x.c*10)/10:null,note:'БЭННИ: примерная пищевая ценность, не измерение'}));
  for(const item of items){
    let matches=db.loot.filter(x=>norm(x.name)===norm(item.name));
    if(matches.length!==1)continue;
    let stock=matches[0];
    const units=item.qty.match(/(\d+)\s*шт/i);
    if(isRealCount(message,item.grams)&&Number.isFinite(stock.qty)&&stock.qty>=item.grams){
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
 const url=typeof input==='string'?input:input?.url||'';
 if(!url.includes('/functions/v1/banger-ai'))return oldFetch(input,init);
 let message='';try{message=String(JSON.parse(init?.body).message||'')}catch(_){}
 const remote=await oldFetch(input,init);
 let data;try{data=await remote.clone().json()}catch(_){return remote}
 const saving=foodRequest(message);
 if(data.action?.type==='food_estimate'&&Array.isArray(data.action.items))remember(data.action);
 if(!saving){
   if(/записал(?:а)?(?:\s+в\s+дневник)?|уже\s+сохранен[оа]|добавил(?:а)?\s+в\s+журнал/i.test(data.answer||'')){
     data.answer=String(data.answer||'').replace(/записал(?:а)?|сохранен[оа]|добавил(?:а)?/gi,'подготовил');
   }
   return new Response(JSON.stringify(data),{status:remote.status,headers:{'Content-Type':'application/json'}});
 }
 let action=data.action?.type==='food_eaten'?data.action:null;
 if(!action){
   const p=pending();
   if(p?.items?.length)action={type:'food_eaten',items:p.items};
 }
 if(!action&&!remote.ok&&[429,502,503,504].includes(remote.status))action=fallback(message);
 if(!action){
   const explanation=remote.ok?'БЭННИ обсудил блюдо, но не вернул проверяемый список продуктов. Запись НЕ сделана. Назови блюда и количества, и я повторю расчёт.':'Модель временно недоступна. Не удалось восстановить список продуктов; дневник не изменён.';
   return new Response(JSON.stringify({answer:'⚠️ '+explanation,saved:false,action_logged:false}),{status:200,headers:{'Content-Type':'application/json'}});
 }
 try{
   const receipt=commit(action,message);
   if(!receipt)throw Error('Нет проверенной энергетической оценки');
   if(!receipt.startsWith('⚠️'))forget();
   const text=receipt+'\n'+(remote.ok?'':'⚠️ Gemini недоступен: использована только прежняя оценка или текст, фото сейчас не анализировалось.');
   return new Response(JSON.stringify({answer:text,saved:!!data.saved,action_logged:!receipt.startsWith('⚠️'),verified_local:!receipt.startsWith('⚠️')}),{status:200,headers:{'Content-Type':'application/json'}});
 }catch(e){
   return new Response(JSON.stringify({answer:'⚠️ Не сохранилось: '+e.message+'. Дневник не изменён.',saved:false,action_logged:false}),{status:200,headers:{'Content-Type':'application/json'}});
 }
};
const status=document.getElementById('bai-status');
if(status){
 const indicator=document.createElement('div');indicator.id='benny-v57-ready';indicator.style.cssText='color:#73e2aa;font-size:11px;margin-top:4px';
 indicator.textContent='✓ БЭННИ v57 · запись еды проверяется по журналу';status.insertAdjacentElement('afterend',indicator);
}
const top=document.getElementById('bai-top');
if(top){
 const recover=document.createElement('button');recover.type='button';recover.id='benny-v57-recover';
 recover.textContent='🧾 Восстановить приём';recover.style.cssText='border:1px solid #6a6b91;border-radius:12px;padding:8px;background:#2c344b;color:white;font-size:12px;white-space:nowrap';
 recover.onclick=()=>{
  const field=document.getElementById('bai-input'),send=document.getElementById('bai-send');
  if(!field||!send)return;
  field.value='Я уже подтвердил, что съел последний показанный на фото приём пищи. Проверь последнюю оценку из нашей истории, верни список еды и примерные БЖУ для записи в дневник. Если данных не хватает, не выдумывай.';
  send.click();
 };
 top.insertBefore(recover,document.getElementById('bai-close'));
}
})();