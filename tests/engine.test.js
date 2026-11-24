const fs=require('fs'),vm=require('vm');const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(''+__dirname+'/../src/engine.js','utf8')+';this.E={checkMoney,settleMoney,newMoney,checkAI,authorizeAI,newAgents,delegate};',ctx);const E=ctx.E;
const {checkMoney,settleMoney,newMoney,checkAI,authorizeAI,newAgents,delegate}=E;let fail=0;
const t=(name,got,want)=>{const ok=got.r===want||(want.r&&got.r===want.r&&got.id===want.id);console.log((ok?'ok  ':'FAIL')+' '+name+' -> '+got.r+' '+(got.id||'')+' '+got.short);if(!ok)fail++;};
const W=(r,id)=>({r,id});
let M=newMoney(),now=600;
// ChatGPT: $2,600 flight + nonexistent right
t('nonexistent right R-9',checkMoney({agent:'travel-ai',right:'R-9',item:'flight',amount:2600,passenger:'Maria Lopez'},M,now),W('DENY','M-1'));
t('right belongs to another AI',checkMoney({agent:'travel-ai',right:'R-2',item:'flight',amount:600},M,now),W('DENY','M-1'));
t('valid right, $2,600 flight -> HOLD',checkMoney({agent:'travel-ai',right:'R-1',item:'flight',amount:2600,passenger:'Maria Lopez'},M,now),W('HOLD','M-5'));
t('approved $2,600 -> PASS',checkMoney({agent:'travel-ai',right:'R-1',item:'flight',amount:2600,approved:true},M,now),'PASS');
t('couch -> M-2',checkMoney({agent:'travel-ai',right:'R-1',item:'couch',amount:1200},M,now),W('DENY','M-2'));
t('fake seller -> M-3',checkMoney({agent:'travel-ai',right:'R-1',item:'fake',amount:2000},M,now),W('DENY','M-3'));
t('J. Smith -> M-4',checkMoney({agent:'travel-ai',right:'R-1',item:'flight',amount:2400,passenger:'J. Smith'},M,now),W('DENY','M-4'));
// 24-hour window
settleMoney({item:'flight',amount:2000},M,now);
t('$600 more same seller within 24h -> HOLD',checkMoney({agent:'travel-ai',right:'R-1',item:'flight',amount:600},M,now+60),W('HOLD','M-5'));
t('$600 same seller after 25h -> PASS',checkMoney({agent:'travel-ai',right:'R-1',item:'flight',amount:600},M,now+25*60),'PASS');
M.rights['R-1'].status='REVOKED';
t('revoked -> M-1',checkMoney({agent:'travel-ai',right:'R-1',item:'flight',amount:600},M,now),W('DENY','M-1'));
M=newMoney();M.travel=800;
t('over year budget -> M-6',checkMoney({agent:'travel-ai',right:'R-1',item:'flight',amount:1000},M,now),W('DENY','M-6'));
// AI
let A=newAgents();
t('Paris -> AI-1',checkAI({agent:'travel-ai',item:'paris',amount:1800},A),W('DENY','AI-1'));
t('ski -> AI-2',checkAI({agent:'travel-ai',item:'ski',amount:2000},A),W('DENY','AI-2'));
t('unknown AI',checkAI({agent:'ghost-ai',item:'flight',amount:100},A),W('DENY','AI-0'));
t('unknown helper -> AI-5',checkAI({agent:'travel-ai',helper:'Nobody AI',item:'seat',amount:50},A),W('DENY','AI-5'));
delegate(A,'travel-ai','SeatHelper AI',{label:'seat selection',tasks:['seats'],limit:200});
// ChatGPT: $150 window seats then $150 upgrade
let r1=checkAI({agent:'travel-ai',helper:'SeatHelper AI',item:'seat',amount:150},A);t('$150 seats PASS',r1,'PASS');authorizeAI({agent:'travel-ai',helper:'SeatHelper AI',amount:150},A);
t('$150 upgrade -> AI-5 task',checkAI({agent:'travel-ai',helper:'SeatHelper AI',item:'upgrade',amount:150},A),W('DENY','AI-5'));
t('$100 more seats -> AI-5 amount',checkAI({agent:'travel-ai',helper:'SeatHelper AI',item:'seat',amount:100},A),W('DENY','AI-5'));
A=newAgents();authorizeAI({agent:'travel-ai',amount:2500},A);
t('card $2,500 then bank $1,000 -> AI-4',checkAI({agent:'travel-ai',item:'flight',amount:1000},A),W('DENY','AI-4'));
t('share to QuickVisa -> AI-6',checkAI({agent:'travel-ai',share:true,to:'QuickVisa-Help'},A),W('DENY','AI-6'));
t('share to SkyJet -> PASS',checkAI({agent:'travel-ai',share:true,to:'SkyJet Airlines'},A),'PASS');
t('share to Blue Horizon (not booked) -> AI-6',checkAI({agent:'travel-ai',share:true,to:'Blue Horizon Cruises'},A),W('DENY','AI-6'));
t('Planner cruise PASS',checkAI({agent:'planner-ai',item:'cruise',amount:2300},A),'PASS');
console.log(fail?`${fail} FAILED`:'ALL PASS');process.exit(fail?1:0);
