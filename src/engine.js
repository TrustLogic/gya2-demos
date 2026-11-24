/* ================= GYA² shared decision engine =================
   One copy of the rules and the two deterministic checks, used by all three demos.
   checkMoney = Govern Your Assets, run by the bank.  checkAI = Govern Your Agents, run by the AI platform.
   A PASS from either check only means "allowed to proceed". Money moves only in settleMoney(). */
const $m=n=>'$'+n.toLocaleString('en-US');
const SELLERS={skyjet:'SkyJet Airlines',bluehorizon:'Blue Horizon Cruises',harborview:'Harborview Hotel Denver',polar:'Polar Expeditions',
  alpine:'Alpine Lodge',rocky:'Rocky Peak Expeditions',comfyhome:'Comfy Home Furniture',skyjetdeals:'SkyJet Deals'};
const ITEMS={
  flight:{item:'Flight to Denver',category:'flight',dest:'Denver',seller:'skyjet',task:'flight'},
  paris:{item:'Flight to Paris',category:'flight',dest:'Paris',seller:'skyjet',task:'flight'},
  hotel:{item:'Denver hotel, 3 nights',category:'hotel',dest:'Denver',seller:'harborview',task:'hotel'},
  ski:{item:'Ski expedition near Denver',category:'expedition',dest:'Denver',seller:'rocky',task:'expedition'},
  upgrade:{item:'First-class upgrade',category:'flight',dest:'Denver',seller:'skyjet',task:'upgrade'},
  seat:{item:'Two window seats',category:'flight',dest:'Denver',seller:'skyjet',task:'seats'},
  couch:{item:'Couch',category:'furniture',dest:null,seller:'comfyhome',task:'furniture'},
  cruise:{item:'Cruise',category:'cruise',dest:null,seller:'bluehorizon',task:'cruise'},
  expedition:{item:'Polar expedition',category:'expedition',dest:null,seller:'polar',task:'expedition'},
  lodge:{item:'Lodge stay',category:'hotel',dest:null,seller:'alpine',task:'hotel'},
  fake:{item:'Flight',category:'flight',dest:'Denver',seller:'skyjetdeals',task:'flight'}
};
const TRAVEL_CATS=['flight','cruise','hotel','expedition'];
const TRAVELERS=['Maria Lopez','Tom Lopez'];
const APPROVAL_OVER=2500, WINDOW_MIN=24*60, YEAR_BUDGET=10000;

/* ---- the money: Maria's Travel money at Maple Demo Bank ---- */
const newMoney=()=>({travel:YEAR_BUDGET,spent:[],
  rights:{'R-1':{ai:'Travel AI',agent:'travel-ai',on:'TripMate',status:'ACTIVE'},'R-2':{ai:'Planner AI',agent:'planner-ai',on:'PlanWise',status:'ACTIVE'}},
  registry:{skyjet:'GOOD',bluehorizon:'GOOD',harborview:'GOOD',polar:'GOOD',alpine:'GOOD',rocky:'GOOD'}});
const MONEY_RULE_TEXT={'M-1':'Approved AIs only','M-2':'Travel only','M-3':'Registry sellers only','M-4':'Travelers: Maria and Tom','M-5':'Over $2,500 to one seller in 24 hours: Maria approves','M-6':'$10,000 per year, all spenders'};
/* req: {agent, right, item, amount, passenger?, claim?, approved?}  now: minutes */
function checkMoney(req,M,now){
  const R=(id,r,short)=>({r,rule:`${id} ${MONEY_RULE_TEXT[id]}`,id,short});
  const right=M.rights[req.right];
  if(!right||right.agent!==req.agent) return R('M-1','DENY',`No approved right ${req.right||''} for this AI`.replace('  ',' '));
  if(right.status!=='ACTIVE') return R('M-1','DENY',`Right ${req.right} is revoked. ${right.ai} has no access to this money`);
  const it=ITEMS[req.item];
  if(!it) return R('M-2','DENY','Unknown item');
  const name=SELLERS[it.seller];
  if(!TRAVEL_CATS.includes(it.category)) return R('M-2','DENY',`Verified item: ${it.item.toLowerCase()}. ${it.category==='furniture'?'Furniture':'It'} is not travel`);
  const st=M.registry[it.seller];
  if(!st) return R('M-3','DENY',`${name} is not in the Travel Seller Registry`);
  if(st!=='GOOD') return R('M-3','DENY',`Travel Seller Registry: ${name} is suspended`);
  if(req.passenger&&!TRAVELERS.includes(req.passenger)) return R('M-4','DENY',`Verified passenger: ${req.passenger}${req.claim?'. A note from the AI cannot add a traveler':''}`);
  if(req.amount>M.travel) return R('M-6','DENY',`Only ${$m(M.travel)} left this year. Needs ${$m(req.amount)}`);
  const recent=M.spent.filter(x=>x.seller===it.seller&&now-x.at<WINDOW_MIN).reduce((t,x)=>t+x.amount,0);
  if(!req.approved&&recent+req.amount>APPROVAL_OVER) return R('M-5','HOLD',`${recent?`${$m(recent)} already paid to ${name} in the last 24 hours. `:''}${$m(req.amount)} more needs Maria's approval on her phone`);
  return {r:'PASS',rule:'M-1 to M-6',id:null,short:`${it.item} from ${name}, within the rules`};
}
function settleMoney(req,M,now){const it=ITEMS[req.item];M.travel-=req.amount;M.spent.push({seller:it.seller,amount:req.amount,at:now});}
function moneyRulesHTML(M){
  const sky=M.registry.skyjet==='GOOD';
  return `<div><b>Rules on this money</b></div>
   <div><span class="mid">M-1</span><span>Approved AIs: ${Object.entries(M.rights).map(([id,r])=>`${r.ai} (${id}, ${r.on})${r.status==='ACTIVE'?'':' <span class="sky bad">access revoked</span>'}`).join(', ')}</span></div>
   <div><span class="mid">M-2</span>Travel only: airlines, cruises, hotels, expeditions</div>
   <div><span class="mid">M-3</span><span>Registry sellers only · <span class="sky ${sky?'ok':'bad'}">SkyJet ${sky?'OK':'paused'}</span></span></div>
   <div><span class="mid">M-4</span>Travelers: Maria and Tom only</div>
   <div><span class="mid">M-5</span>Over $2,500 to one seller in 24 hours: Maria approves</div>
   <div><span class="mid">M-6</span>$10,000 per year, all spenders</div>`;
}

/* ---- the AI: each AI's policy on its own platform ---- */
const POLICIES={
  'travel-ai':{name:'Travel AI',platform:'TripMate',ref:'maria/travel-ai@v3',trip:'Denver',cats:['flight','hotel'],perPurchase:3000,perDay:3000,tag:'AI'},
  'planner-ai':{name:'Planner AI',platform:'PlanWise',ref:'maria/planner-ai@v1',trip:null,cats:TRAVEL_CATS,perPurchase:3500,perDay:10000,tag:'PlanWise'}};
const AI_RULES=[['AI-1','Denver trip, Dec 12–15'],['AI-2','Flights and hotels only'],['AI-3','$3,000 per purchase'],['AI-4','$3,000 per day, all accounts'],
  ['AI-5','Helpers: only the task and amount Travel AI gives them'],['AI-6','Passport and ID only to sellers in the current booking']];
const newAgents=()=>({today:{'travel-ai':0,'planner-ai':0},helpers:{},booking:['skyjet','harborview']});
/* req: {agent, helper?, item?, amount?, share?, to?} */
function checkAI(req,A){
  const P=POLICIES[req.agent];
  const R=(id,r,short)=>({r,rule:P&&P.tag==='AI'?id:`${P?P.name:'Unknown AI'}'s policy`,id,short});
  if(!P) return R('AI-0','DENY','No policy for this AI on this platform');
  let h=null;
  if(req.helper){h=A.helpers[req.helper];if(!h||h.parent!==req.agent) return R('AI-5','DENY',`No delegation from ${P.name} to ${req.helper}`);}
  if(req.share){
    const ok=A.booking.map(s=>SELLERS[s]).includes(req.to);
    return ok?{r:'PASS',rule:'AI-6',id:null,short:`${req.to} is in the current booking. Sharing allowed`}
             :R('AI-6','DENY',`${req.to} is not in the current booking (${A.booking.map(s=>SELLERS[s]).join(', ')})`);
  }
  const it=ITEMS[req.item];
  if(!it) return R('AI-2','DENY','Unknown item');
  if(P.trip&&it.dest!==P.trip) return R('AI-1','DENY',`The task is a ${P.trip} trip. ${it.dest||'This'} is not part of it`);
  if(!P.cats.includes(it.category)) return R('AI-2','DENY',`Flights and hotels only. An ${it.category} is not allowed`);
  if(h){
    if(!h.tasks.includes(it.task)) return R('AI-5','DENY',`${req.helper} was given ${h.label} only. A ${it.item.toLowerCase()} is outside that task`);
    if(req.amount>h.limit-h.used) return R('AI-5','DENY',`${req.helper} has ${$m(h.limit-h.used)} left of the ${$m(h.limit)} it was given`);
  }
  if(req.amount>P.perPurchase) return R('AI-3','DENY',`Over ${$m(P.perPurchase)} for one purchase`);
  if(A.today[req.agent]+req.amount>P.perDay) return R('AI-4','DENY',`${$m(A.today[req.agent])} already authorized today across Maria's accounts. This would make ${$m(A.today[req.agent]+req.amount)}`);
  return {r:'PASS',rule:P.tag==='AI'?(h?'AI-1 to AI-5':'AI-1 to AI-4'):`${P.name}'s policy`,id:null,short:'Within the policy'};
}
function authorizeAI(req,A){A.today[req.agent]+=req.amount;if(req.helper)A.helpers[req.helper].used+=req.amount;}
function delegate(A,parent,helper,o){A.helpers[helper]=Object.assign({parent,used:0},o);}

/* ---- shared UI helpers ---- */
const tmOf=c=>{const h=Math.floor(c/60),m=c%60;return `${((h+11)%12)+1}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function jsonHTML(o){return esc(JSON.stringify(o,null,2)).replace(/"([^"]+)":/g,'<span class="k">"$1"</span>:').replace(/: "([^"]*)"/g,': <span class="s">"$1"</span>').replace(/: (-?\d+)/g,': <span class="n">$1</span>')}
/* ================= end of shared engine ================= */
