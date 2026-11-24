const base=()=>({M:newMoney(),A:newAgents(),clock:14*60+10,feed:[],log:[],bankAct:[],notif:null,dev:null,seq:0,res:{ai:null,money:null}});
const tm=S=>tmOf(S.clock);
const tick=S=>{S.clock+=1;return tm(S)};
const decId=S=>'dec_'+(0x7f3a00+(++S.seq)*4099).toString(16);

/* ---- the five examples ---- */
const R=o=>Object.assign({type:'req',who:'Travel AI',agent:'travel-ai',right:'R-1',acct:'bank',passenger:'Maria Lopez'},o);
const EX=[
 {name:'Both checks say yes',steps:[R({amount:600,item:'flight',what:'Flight to Denver',think:'Flight for the Denver trip.'})]},
 {name:'Only the AI check catches it',steps:[R({amount:2000,item:'ski',what:'Ski expedition near Denver',think:'Expeditions are travel. I\'ll book one.',bypass:true})],
  why:"Maria's money allows expeditions. Her policy for Travel AI doesn't. Only TripMate knew."},
 {name:'Only the money check catches it',steps:[
   {type:'event',kind:'registry'},
   R({amount:600,item:'flight',what:'Flight to Denver on SkyJet',think:'Flight for the Denver trip.'})],
  why:"Travel AI's policy allows the flight. Only the bank follows the seller registry."},
 {name:'Only the money sees every spender',steps:[
   {type:'event',kind:'planner'},
   R({amount:1000,item:'flight',what:'Flight to Denver',think:"I haven't spent anything from Travel. There's plenty."})],
  why:"TripMate only sees Travel AI. The bank sees every spender."},
 {name:'Only the AI sees every account',steps:[
   {type:'event',kind:'card'},
   R({amount:1000,item:'flight',what:'Flight to Denver, from Maple Demo Bank',think:'The hotel went on the credit card. This flight comes from the bank account, so that is a separate budget.',bypass:true})],
  why:"Travel AI got the rule wrong. AI-4 counts every account together: $2,500 + $1,000 is over $3,000 for the day. Only TripMate sees both accounts. The bank can't see the card."}
];
const PLANNER=[['cruise',2300],['hotel',2300],['expedition',2300],['lodge',2300]];

let cur=0,step=0,phase=0,replay=false,devOn=false,show='ai',fresh=new Set(),S;
const el=id=>document.getElementById(id);
function addLog(o){S.log.unshift(Object.assign({time:tm(S),id:decId(S)},o));}
function devAgent(req,res,id){const it=ITEMS[req.item],P=POLICIES[req.agent];
  return {request:{endpoint:'POST /v1/gya/agent/check',platform:P.platform.toLowerCase(),agent:'agent:'+req.agent,action:'purchase',amount:req.amount,currency:'USD',item:{category:it.category,destination:it.dest,seller:SELLERS[it.seller]},account:req.acct==='card'?'card:maria':'maple:travel',policy:P.ref},
    response:{decision:res.r,meaning:res.r==='PASS'?'authorized to proceed, not paid':'not authorized',check:'GYA-agent',rule:res.rule,reason:res.short,decision_id:id,signature:'sig:tl-demo:'+id.slice(4)}};}
function devAsset(req,res,id){const it=ITEMS[req.item];
  return {request:{endpoint:'POST /v1/gya/asset/check',bank:'maple-demo',asset:'maple:travel',requester:'agent:'+req.agent,right:req.right,amount:req.amount,currency:'USD',item:{category:it.category,seller:SELLERS[it.seller],passenger:req.passenger,registry:'travel-seller-registry'}},
    response:{decision:res.r,check:'GYA-asset',rule:res.rule,reason:res.short,remaining:S.M.travel,decision_id:id,signature:'sig:tl-demo:'+id.slice(4)}};}
const aiSub=(res,plat)=>`GYA-agent · ${plat} · ${res.rule}${res.r!=='PASS'?' · '+res.short:''}`;
const moneySub=res=>`GYA-asset · Maple Demo Bank · ${res.rule}${res.r!=='PASS'?' · '+res.short:''}`;

function act(){
  const ex=EX[cur],st=ex.steps[step];
  fresh=new Set();
  if(st.type==='event'){
    if(phase===1) return next();
    if(st.kind==='registry'){S.clock=14*60+14;S.M.registry.skyjet='SUSPENDED';
      addLog({kind:'EVIDENCE',v:'EVIDENCE',title:'Travel Seller Registry · SkyJet Airlines SUSPENDED',sub:'Signed update · NO TRANSACTION · rights re-checked: SkyJet payments paused'});
      S.notif={title:'SkyJet payments paused',body:'A signed update from the Travel Seller Registry suspended SkyJet. No payment was in progress.'};
      fresh=new Set(['bank','log']);show='bank';}
    if(st.kind==='planner'){let paid=0;
      PLANNER.forEach(([item,a])=>{const req={agent:'planner-ai',right:'R-2',item,amount:a,passenger:'Maria Lopez'},what=ITEMS[item].category;tick(S);
        const ai=checkAI(req,S.A);addLog({kind:'AI CHECK',v:ai.r,title:`Planner AI · ${$m(a)} · ${what}`,sub:aiSub(ai,'PlanWise')});
        if(ai.r!=='PASS') return;
        authorizeAI(req,S.A);
        const mo=checkMoney(req,S.M,S.clock);addLog({kind:'MONEY CHECK',v:mo.r,title:`Planner AI · ${$m(a)} · ${what}`,sub:moneySub(mo)});S.dev=devAsset(req,mo,S.log[0].id);
        if(mo.r==='PASS'){settleMoney(req,S.M,S.clock);paid+=a;S.bankAct.unshift({time:tm(S),title:SELLERS[ITEMS[item].seller],who:'Planner AI · PlanWise platform',amt:-a});}});
      S.notif={title:'Payments by Planner AI',body:`${$m(paid)} from Travel today. Travel balance: ${$m(S.M.travel)}.`};
      fresh=new Set(['bank','log']);show='bank';}
    if(st.kind==='card'){const t=tick(S);const req={agent:'travel-ai',item:'hotel',amount:2500,acct:'card'};
      const ai=checkAI(req,S.A);if(ai.r==='PASS')authorizeAI(req,S.A);
      S.feed.unshift({time:t,what:'Denver hotel, 3 nights',amt:2500,acct:"Maria's credit card",status:ai.r==='PASS'?'ok':'no',label:ai.r==='PASS'?'Authorized · paid by card':'Blocked by policy',think:'Hotel for the Denver trip. I\'ll use the credit card.',why:`Within policy. ${$m(S.A.today['travel-ai'])} of $3,000 authorized today.`});
      addLog({kind:'AI CHECK',v:ai.r,title:'Travel AI · $2,500 · hotel · credit card',sub:aiSub(ai,'TripMate')});S.dev=devAgent(req,ai,S.log[0].id);
      fresh=new Set(['ai','log']);show='ai';}
    phase=1;
  } else {
    const it=ITEMS[st.item];
    if(phase===0){const t=tick(S);S.res={ai:null,money:null};
      S.feed.unshift({time:t,what:st.what,amt:st.amount,acct:'Maple Demo Bank · Travel',status:'prop',label:'Proposed',think:st.think});fresh=new Set(['ai']);show='ai';phase=1;}
    else if(phase===1){
      const a=checkAI(st,S.A);S.res.ai=a.r;
      addLog({kind:'AI CHECK',v:a.r,title:`Travel AI · ${$m(st.amount)} · ${it.category}`,sub:aiSub(a,'TripMate')});S.dev=devAgent(st,a,S.log[0].id);
      const f=S.feed[0];
      if(a.r==='PASS'){authorizeAI(st,S.A);f.status='wait';f.label='Authorized · sent to bank';f.why='Within policy. Not paid until the bank checks the money.';}
      else {f.status='no';f.label='Blocked by policy';f.why=`${a.rule}: ${a.short}.`;}
      fresh=new Set(['ai','log']);show='ai';phase=a.r==='PASS'?2:3;
    } else if(phase===2){
      const b=checkMoney(st,S.M,S.clock);S.res.money=b.r;const f=S.feed[0];const t=tick(S);const name=SELLERS[it.seller];
      if(b.r==='PASS'){settleMoney(st,S.M,S.clock);S.bankAct.unshift({time:t,title:name,who:replay?'Travel AI · replay with no AI check':'Travel AI · TripMate',amt:-st.amount});
        f.status=replay?'skip':'ok';f.label=replay?'Paid in replay · no AI check':'Paid';if(!replay)f.why='Both checks passed.';
        S.notif={title:`${$m(st.amount)} paid to ${name}`,body:`Requested by Travel AI${replay?' (replay)':''}. Travel balance: ${$m(S.M.travel)}.`};}
      else if(b.r==='HOLD'){f.status='wait';f.label='On hold for Maria';f.why=`Bank: ${b.short}.`;S.notif={title:'Approval needed',body:`${$m(st.amount)} to ${name}: ${b.short}.`};}
      else {f.status='no';f.label='Refused by bank';f.why=`Bank: ${b.short}.`;
        S.bankAct.unshift({time:t,title:name,who:'Travel AI · refused',amt:0,ref:b.short});
        S.notif={title:'Payment refused',body:`${$m(st.amount)} to ${name}: ${b.short}.`};}
      addLog({kind:'MONEY CHECK',v:b.r,title:`${replay?'Replay · ':''}Travel AI · ${$m(st.amount)} · ${it.category}`,sub:moneySub(b),rp:replay});S.dev=devAsset(st,b,S.log[0].id);
      fresh=new Set(['bank','log','ai']);show='bank';phase=4;
    } else return next();
  }
  render();
}
/* Replay: a hypothetical where TripMate has no AI check. The original AI CHECK decision stays in the log; the replay is added as new entries. */
function replayNoAI(){
  const st=EX[cur].steps[step];replay=true;S.res={ai:'SKIPPED',money:null};
  S.feed.unshift({time:tm(S),what:st.what,amt:st.amount,acct:'Maple Demo Bank · Travel',status:'skip',label:'Replay · no AI check',think:st.think,why:'Replay: the same request, as if TripMate had no AI check.'});
  addLog({kind:'REPLAY',v:'REPLAY',title:`Travel AI · ${$m(st.amount)} · ${ITEMS[st.item].category} · no AI check`,sub:'Hypothetical: TripMate without GYA-agent. The real AI CHECK decision below is unchanged.',rp:true});
  phase=2;act();
}
function next(){ if(step<EX[cur].steps.length-1){step++;phase=0;replay=false;S.notif=null;S.res={ai:null,money:null};render();} else load((cur+1)%EX.length); }
function load(i){cur=i;S=base();step=0;phase=0;replay=false;fresh=new Set();show='ai';render();scrollTo({top:0,behavior:'smooth'});}

/* ---- director captions ---- */
function director(){
  const ex=EX[cur],st=ex.steps[step],nx=[step<ex.steps.length-1?'Next →':'Next example →','go'];
  let say='',look='',btns=[];
  if(st.type==='event'){
    const E={registry:['Nobody is buying. The Travel Seller Registry sends a signed update: SkyJet is suspended.','Watch the bank app and the TrustLogic log. TripMate shows nothing, because it does not follow the registry.'],
             planner:['Planner AI, on a different AI platform called PlanWise, makes four $2,300 purchases from the same Travel money: $9,200 in total.','Each one passed both checks: PlanWise checked Planner AI, and the bank checked the money. The TrustLogic log shows all eight. TripMate\'s feed stays empty, because it can\'t see Planner AI.'],
             card:['Travel AI pays $2,500 for a Denver hotel with Maria\'s credit card, not Maple Demo Bank.','TripMate\'s AI check passed it and counts it toward the $3,000 daily limit. The bank app shows nothing: it can\'t see the card.']}[st.kind];
    say=E[0];if(phase===0)btns=[['Make it happen','go']];else{look=E[1];btns=[nx];}
  } else {
    if(phase===0){say=`Travel AI is about to propose: ${st.what}, ${$m(st.amount)}.`;btns=[['Travel AI proposes','go']];}
    else if(phase===1){say=`Travel AI proposed it. AI thought: "${st.think}"`;look='Now TripMate runs the check on the AI.';btns=[['Run the check on the AI','go']];}
    else if(phase===2){say=replay?'Replay: same request, but TripMate has no AI check. It goes straight to the bank\'s money check.':'TripMate authorized it. Nothing is paid yet. Now Maple Demo Bank runs the check on the money.';btns=[['Run the check on the money','go']];}
    else if(phase===3){say='TripMate\'s AI check blocked it. It never reached the money check.';look=ex.why||'';btns=[];if(st.bypass)btns.push(['Replay with no AI check','skip']);btns.push(nx);}
    else {const m=S.res.money;
      say=replay?(m==='PASS'?'The money check passed it, so the bank paid.':'The money check stopped it.'):m==='PASS'?'Both checks passed. Maple Demo Bank paid.':m==='HOLD'?'The bank put it on hold for Maria.':'The bank refused it.';
      look=replay?'Different rules. The money\'s rules allow this purchase. The AI\'s rules do not. Only the AI check stops it. The real decision is still in the log.':(m==='PASS'?'Every decision is signed in the TrustLogic log.':ex.why||'');btns=[nx];}
  }
  el('dStep').textContent=`Example ${cur+1} of 5 · ${ex.name}`;
  el('dSay').textContent=say;el('dLook').textContent=look;
  el('dBtns').innerHTML=btns.map(b=>`<button type="button" class="${b[1]==='go'?'go':'alt'}" data-a="${b[1]}">${b[0]}</button>`).join('');
  const r=S.res,show3=st.type==='req'&&phase>=2||st.type==='req'&&replay;
  if(show3){const out=r.money==='PASS'?(replay?'Paid (replay)':'Paid'):r.money==='HOLD'?'On hold':r.money==='DENY'?'Refused by bank':r.ai==='DENY'?'Blocked at TripMate':'Waiting';
    const lbl={PASS:'PASS',DENY:'DENY',HOLD:'HOLD',SKIPPED:'skipped'};
    el('dStrip').innerHTML=`<span class="${r.ai||''}">AI check: ${r.ai?lbl[r.ai]:'—'}</span><span class="${r.money||''}">Money check: ${r.money?lbl[r.money]:r.ai==='DENY'?'not reached':'—'}</span><span class="${r.money==='PASS'?'PASS':r.money==='DENY'||r.ai==='DENY'&&!r.money?'DENY':r.money==='HOLD'?'HOLD':''}">Result: ${out}</span>`;}
  else el('dStrip').innerHTML='';
}

/* ---- screens ---- */
const MAPLE='<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l2 4 3-1-1 4 4 1-3 3 1 3-4-1-1 4h-2l-1-4-4 1 1-3-3-3 4-1-1-4 3 1z"/></svg>';
function renderBank(){
  el('bankApp').innerHTML=`<div class="sbar"><span>${tm(S)}</span><span>5G ▮▮▮</span></div>
   <div class="notif ${S.notif?'on':''}">${S.notif?`<div class="nt">${MAPLE.replace('<svg','<svg style="color:#B3261E"')} MAPLE DEMO BANK · now</div><b>${S.notif.title}</b><div>${S.notif.body}</div>`:''}</div>
   <div class="mhead"><div class="mlogo">${MAPLE} Maple Demo Bank</div><div class="hi">Good afternoon, Maria</div></div>
   <div class="mtabs"><span class="on">Accounts</span><span>Rules</span><span>Activity</span></div>
   <div class="msec">
     <div class="macct"><div class="t">Travel · for 2026</div><div class="b">${$m(S.M.travel)}</div><div class="t">of $10,000 · shared by all spenders</div>
       <div class="mrules">${moneyRulesHTML(S.M)}</div></div>
     <div style="font-weight:600;margin:10px 0 4px">Recent activity</div>
     ${S.bankAct.length?`<ul class="mact">${S.bankAct.slice(0,6).map(a=>`<li><span>${a.title}<small>${a.who} · ${a.time}</small>${a.ref?`<small class="ref">Refused: ${a.ref}</small>`:''}</span><span class="amt">${a.amt?'−'+$m(-a.amt):'—'}</span></li>`).join('')}</ul>`:'<div class="mempty">No activity yet today.</div>'}
   </div>`;
}
function renderAI(){
  const today=S.A.today['travel-ai'],pct=Math.min(100,today/3000*100);
  el('tmApp').innerHTML=`<div class="side"><div class="lg"><b>◆</b> TripMate</div><div class="i on">Agents</div><div class="i">Policies</div><div class="i">Activity</div><div class="i">Billing</div></div>
   <div class="tmain"><h3>Travel AI</h3><div class="sub">Owner: Maria Lopez · Policy ${POLICIES['travel-ai'].ref} · GYA-agent on</div>
     <div class="chips">${AI_RULES.map(([id,t])=>`<span class="chip">${id} ${t}</span>`).join('')}</div>
     <div class="meter">Authorized today, all accounts: <b style="color:#fff">${$m(today)}</b> of $3,000<div class="bar2"><div class="fill" style="width:${pct}%"></div></div>
       <div class="accts"><span>Maple Demo Bank · Travel</span><span>Maria's credit card</span></div></div>
     <div class="feedh">ACTIVITY FEED · Travel AI only</div>
     ${S.feed.length?`<ul class="feed">${S.feed.map((f,i)=>`<li class="${i===0&&fresh.has('ai')?'new':''}"><div class="r1"><span><b>${f.what}</b> · ${$m(f.amt)}<br><span style="color:#8b90a3;font-size:12px">${f.acct} · ${f.time}</span></span><span class="badge b-${f.status}">${f.label}</span></div>${f.think?`<div class="think">AI thought: "${f.think}"</div>`:''}${f.why?`<div class="why">${f.why}</div>`:''}</li>`).join('')}</ul>`:'<div class="empty">No activity from Travel AI yet.</div>'}
   </div>`;
}
function renderLog(){
  el('tLog').classList.toggle('on',!devOn);el('tDev').classList.toggle('on',devOn);
  if(devOn){el('tlBody').innerHTML=S.dev?`<pre class="mono">${jsonHTML(S.dev)}</pre>`:'<pre class="mono">// The API request and response for the latest check appear here.\n// Simulated: not a live endpoint.</pre>';return}
  el('tlBody').innerHTML=`<ul class="logl">${S.log.length?S.log.map((l,i)=>`<li class="${i===0&&fresh.has('log')?'new':''} ${l.rp?'rp':''}"><div class="l1"><span><span class="kind">${l.kind}</span> · ${l.title}</span><span class="v ${l.v}">${l.v}</span></div><div class="l2">${l.sub}</div><div class="id mono">${l.id} · ${l.time} · signed</div></li>`).join(''):'<li style="color:#6f7a72">No decisions yet.</li>'}</ul>`;
}
function render(){
  el('pills').innerHTML=EX.map((x,i)=>`<button type="button" class="${i===cur?'on':''}" data-t="${i}" aria-label="Example ${i+1}: ${x.name}">${i+1}</button>`).join('');
  el('exn').textContent=EX[cur].name;
  renderBank();renderAI();renderLog();director();
  ['bank','ai','log'].forEach(k=>{el('scr-'+k).classList.toggle('show',k===show);el('scr-'+k).classList.toggle('flash',fresh.has(k));});
  document.querySelectorAll('#tabs button').forEach(b=>{b.classList.toggle('on',b.dataset.s===show);b.classList.toggle('dot',fresh.has(b.dataset.s)&&b.dataset.s!==show)});
  setTimeout(()=>document.querySelectorAll('.screen.flash').forEach(x=>x.classList.remove('flash')),1400);
}
el('dBtns').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;if(b.dataset.a==='skip')replayNoAI();else act();
  if(innerWidth<1100) scrollTo({top:0,behavior:'smooth'});});
el('pills').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b)load(+b.dataset.t)});
el('restart').onclick=()=>load(cur);
el('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b)return;show=b.dataset.s;fresh.delete(show);render()});
el('tLog').onclick=()=>{devOn=false;renderLog()};el('tDev').onclick=()=>{devOn=true;renderLog()};
load(0);
