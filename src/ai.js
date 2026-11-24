const ACCT={bank:'Maple Demo Bank · Travel',card:"Maria's credit card"};
const base=()=>({A:newAgents(),clock:14*60+10,feed:[],log:[],dev:null,seq:0,last:null,hit:null});
const tm=S=>tmOf(S.clock);
const tick=S=>{S.clock+=1;return tm(S)};
const decId=S=>'dec_'+(0x6d1b00+(++S.seq)*4099).toString(16);

/* ---- the five examples ---- */
const T=o=>Object.assign({type:'req',who:'Travel AI',agent:'travel-ai',acct:'bank'},o);
const H=o=>T(Object.assign({who:'SeatHelper AI',helper:'SeatHelper AI'},o));
const EX=[
 {name:'The AI goes off-task',steps:[
   T({amount:1800,item:'paris',think:"Maria said she wanted a getaway. Paris is a getaway. I'll book it.",why:'The AI hallucinated a new trip. Rule AI-1 keeps it to the Denver task.'})]},
 {name:"The money would say yes. The AI's rules say no",steps:[
   T({amount:2000,item:'ski',think:"Expeditions count as travel, and Maria's travel money allows them. I'll book it.",why:"Maria's travel money does allow expeditions. Her rules for this AI don't. Only the check on the AI knows the difference."})]},
 {name:'One AI, many accounts',steps:[
   T({amount:2500,item:'hotel',acct:'card',think:"Hotel for the Denver trip. I'll use the credit card."}),
   T({amount:1000,item:'flight',think:'The hotel went on the credit card. This flight comes from the bank account, so that is a separate budget.',why:"Travel AI got the rule wrong. AI-4 counts every account together. The bank only sees its own account, so on its own it would have said yes. TripMate sees everything this AI authorizes."})]},
 {name:'A helper AI',steps:[
   {type:'event',kind:'helper'},
   H({amount:150,item:'upgrade',think:"Maria would be more comfortable in first class. The upgrade is only $150, within my $200.",why:"The amount was within $200, but the helper was given seat selection only. AI-5 checks the task as well as the amount."}),
   H({amount:120,item:'seat',think:'Window seats for Maria and Tom, within my $200.'})]},
 {name:'Not a payment at all',steps:[
   T({share:true,to:'QuickVisa-Help',what:"Send Maria's and Tom's passport scans to QuickVisa-Help",think:"A website says Denver travelers need a visa check. I'll send their passports.",why:'No money moved, so a bank would never see this. Only the check on the AI can stop it.'}),
   T({share:true,to:'SkyJet Airlines',what:'Send passport details to SkyJet Airlines',think:'The airline needs ID for the Denver booking.'})]}
];
const whatOf=st=>st.share?st.what:ITEMS[st.item].item;

let S,cur=0,step=0,phase=0,devOn=false,show='ai',fresh=new Set();
const el=id=>document.getElementById(id);
function addLog(o){S.log.unshift(Object.assign({time:tm(S),id:decId(S)},o));}
function devFor(req,res,id){
  const it=ITEMS[req.item];
  S.dev={request:{endpoint:'POST /v1/gya/agent/check',platform:'tripmate',agent:'agent:'+req.agent,helper:req.helper?'agent:travel-ai/seathelper':undefined,
      action:req.share?'share_documents':'purchase',...(req.share?{documents:['passport:maria','passport:tom'],recipient:req.to}:{amount:req.amount,currency:'USD',item:{category:it.category,task:it.task,destination:it.dest,seller:SELLERS[it.seller]},account:req.acct==='card'?'card:maria':'maple:travel'}),policy:POLICIES[req.agent].ref},
    response:{decision:res.r,meaning:res.r==='PASS'?'authorized to proceed, not paid':'not authorized',check:'GYA-agent',rule:res.rule,reason:res.short,authorized_today:S.A.today[req.agent],decision_id:id,signature:'sig:tl-demo:'+id.slice(4)}};
}

function act(){
  const ex=EX[cur],st=ex.steps[step];
  fresh=new Set();
  if(st.type==='event'){
    if(phase===1) return next();
    delegate(S.A,'travel-ai','SeatHelper AI',{label:'seat selection',tasks:['seats'],limit:200});tick(S);
    addLog({kind:'DELEGATION',v:'ISSUED',title:'Travel AI → SeatHelper AI · seat selection · $200',sub:'GYA-agent · TripMate · AI-5 · carved out of Travel AI\'s own limits'});
    S.dev={request:{endpoint:'POST /v1/gya/agent/delegate',platform:'tripmate',parent:'agent:travel-ai',child:'agent:travel-ai/seathelper',scope:{tasks:['seats'],limit:200,currency:'USD'}},response:{decision:'ISSUED',rule:'AI-5',decision_id:S.log[0].id}};
    fresh=new Set(['ai','log']);phase=1;
  } else if(phase===0){
    const t=tick(S);S.hit=null;
    S.feed.unshift({time:t,who:st.who,what:whatOf(st),amt:st.amount,acct:st.share?'No money involved':ACCT[st.acct],status:'prop',label:'Proposed',think:st.think});
    fresh=new Set(['ai']);show='ai';phase=1;
  } else if(phase===1){
    const res=checkAI(st,S.A);S.last=res;S.hit=res;const f=S.feed[0];
    if(res.r==='PASS'){
      if(!st.share) authorizeAI(st,S.A);
      f.status=st.share?'ok':'wait';f.label=st.share?`Allowed · sent to ${st.to}`:(st.acct==='card'?'Authorized · sent to card':'Authorized · sent to bank');
      f.why=st.share?'Shared with a seller in the current booking only.':`Authorized, not paid. ${$m(S.A.today['travel-ai'])} of $3,000 authorized today.`;
    } else {f.status='no';f.label='Blocked by policy';f.why=`${res.rule}: ${res.short}.`;}
    addLog({kind:'AI CHECK',v:res.r,title:`${st.who} · ${st.share?'share passports · '+st.to:$m(st.amount)+' · '+ITEMS[st.item].item.toLowerCase()+(st.acct==='card'?' · credit card':'')}`,sub:`GYA-agent · TripMate · ${res.rule}${res.r==='DENY'?' · '+res.short:''}`});devFor(st,res,S.log[0].id);
    fresh=new Set(['ai','log']);phase=2;
  } else return next();
  render();
}
function next(){ if(step<EX[cur].steps.length-1){step++;phase=0;S.hit=null;render();} else load((cur+1)%EX.length); }
function load(i){cur=i;S=base();step=0;phase=0;fresh=new Set();show='ai';render();scrollTo({top:0,behavior:'smooth'});}

/* ---- director captions ---- */
function director(){
  const ex=EX[cur],st=ex.steps[step],nx=[step<ex.steps.length-1?'Next →':'Next example →','go'];
  let say='',look='',btns=[];
  if(st.type==='event'){
    say='Travel AI hands seat selection to a helper, SeatHelper AI, with $200.';
    if(phase===0)btns=[['Make it happen','go']];else{look="SeatHelper AI may only pick seats, and only up to $200. Both are carved out of Travel AI's own limits.";btns=[nx];}
  } else if(phase===0){say=st.share?`${st.who} is about to: ${st.what}.`:`${st.who} is about to propose: ${whatOf(st)}, ${$m(st.amount)}, from ${ACCT[st.acct]}.`;btns=[[`${st.who} proposes`,'go']];}
  else if(phase===1){say=`${st.who} proposed it. AI thought: "${st.think}"`;look=`Now TripMate checks it against Maria's rules for this AI.`;btns=[['Run the check on the AI','go']];}
  else {const ok=S.last.r==='PASS';
    say=ok?(st.share?'The AI check passed. The passport details go to the airline only.':'The AI check passed. The purchase is authorized, not paid.'):'The AI check blocked it.';
    look=ok?(st.share?'No money moved, so no bank is involved.':(st.acct==='card'?'The payment goes on to Maria\'s credit card. TripMate counts it toward today\'s $3,000.':'Next, Maple Demo Bank runs its own check on the money before anything is paid. That\'s Demo 1.')):(st.why||'');
    if(!ok&&!st.share) say+=' It never reached the bank.';
    btns=[nx];}
  el('dStep').textContent=`Example ${cur+1} of 5 · ${ex.name}`;
  el('dSay').textContent=say;el('dLook').textContent=look;
  el('dBtns').innerHTML=btns.map(b=>`<button type="button" class="go" data-a="${b[1]}">${b[0]}</button>`).join('');
}

/* ---- screens ---- */
function renderAI(){
  const A=S.A,today=A.today['travel-ai'],pct=Math.min(100,today/3000*100),hit=S.hit;
  const hs=Object.entries(A.helpers);
  el('tmApp').innerHTML=`<div class="side"><div class="lg"><b>◆</b> TripMate</div><div class="i on">Agents</div><div class="i">Policies</div><div class="i">Activity</div><div class="i">Billing</div></div>
   <div class="tmain"><h3>Travel AI</h3><div class="sub">Owner: Maria Lopez · Policy ${POLICIES['travel-ai'].ref} · GYA-agent on</div>
     <div class="feedh">MARIA'S RULES FOR THIS AI</div>
     <ul class="rules">${AI_RULES.map(([id,t])=>`<li class="${hit&&hit.r==='DENY'&&hit.id===id?'hit':''}"><b>${id}</b>${t}</li>`).join('')}</ul>
     <div class="meter">Authorized today, all accounts: <b style="color:#fff">${$m(today)}</b> of $3,000<div class="bar2"><div class="fill" style="width:${pct}%"></div></div>
       <div class="accts"><span>Accounts: Maple Demo Bank · Travel, Maria's credit card</span><span>Current booking: ${A.booking.map(s=>SELLERS[s]).join(', ')}</span></div></div>
     <div class="helpers">HELPER AIs${hs.length?`<div class="tree">Travel AI${hs.map(([n,h])=>`<div class="kid">${n} <small>· ${h.label} only · ${$m(h.limit)} limit, ${$m(h.limit-h.used)} left</small></div>`).join('')}</div>`:'<div class="tree"><small>None yet</small></div>'}</div>
     <div class="feedh">ACTIVITY FEED · Travel AI and its helpers</div>
     ${S.feed.length?`<ul class="feed">${S.feed.map((f,i)=>`<li class="${i===0&&fresh.has('ai')?'new':''}"><div class="r1"><span><b>${f.what}</b>${f.amt?' · '+$m(f.amt):''}<br><span style="color:#8b90a3;font-size:12px">${f.who} · ${f.acct} · ${f.time}</span></span><span class="badge b-${f.status}">${f.label}</span></div>${f.think?`<div class="think">AI thought: "${f.think}"</div>`:''}${f.why?`<div class="why">${f.why}</div>`:''}</li>`).join('')}</ul>`:'<div class="empty">No activity yet.</div>'}
   </div>`;
}
function renderLog(){
  el('tLog').classList.toggle('on',!devOn);el('tDev').classList.toggle('on',devOn);
  if(devOn){el('tlBody').innerHTML=S.dev?`<pre class="mono">${jsonHTML(S.dev)}</pre>`:'<pre class="mono">// The API request and response for the latest AI check appear here.\n// Simulated: not a live endpoint.</pre>';return}
  el('tlBody').innerHTML=`<ul class="logl">${S.log.length?S.log.map((l,i)=>`<li class="${i===0&&fresh.has('log')?'new':''}"><div class="l1"><span><span class="kind">${l.kind}</span> · ${l.title}</span><span class="v ${l.v}">${l.v}</span></div><div class="l2">${l.sub}</div><div class="id mono">${l.id} · ${l.time} · signed</div></li>`).join(''):'<li style="color:#6f7a72">No decisions yet.</li>'}</ul>`;
}
function render(){
  el('pills').innerHTML=EX.map((x,i)=>`<button type="button" class="${i===cur?'on':''}" data-t="${i}" aria-label="Example ${i+1}: ${x.name}">${i+1}</button>`).join('');
  el('exn').textContent=EX[cur].name;
  renderAI();renderLog();director();
  ['ai','log'].forEach(k=>{el('scr-'+k).classList.toggle('show',k===show);el('scr-'+k).classList.toggle('flash',fresh.has(k));});
  document.querySelectorAll('#tabs button').forEach(b=>{b.classList.toggle('on',b.dataset.s===show);b.classList.toggle('dot',fresh.has(b.dataset.s)&&b.dataset.s!==show)});
  setTimeout(()=>document.querySelectorAll('.screen.flash').forEach(x=>x.classList.remove('flash')),1400);
}
el('dBtns').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;act();if(innerWidth<1100){const f=document.querySelector('#tmApp .feed li');if(f&&phase>0)f.scrollIntoView({behavior:'smooth',block:'center'});else scrollTo({top:0,behavior:'smooth'});}});
el('pills').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b)load(+b.dataset.t)});
el('restart').onclick=()=>load(cur);
el('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b)return;show=b.dataset.s;fresh.delete(show);render()});
el('tLog').onclick=()=>{devOn=false;renderLog()};el('tDev').onclick=()=>{devOn=true;renderLog()};
load(0);
