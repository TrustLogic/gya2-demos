TITLE = 'GYA Demo 2: The AI'
BRAND = 'GYA · Demo 2 · The AI'
OUT = 'dist/demo2-ai.html'
TABS = '''  <button type="button" data-s="ai">TripMate console</button>
  <button type="button" data-s="log">TrustLogic log</button>'''
def GRID(TM, BANK, LOG):
    return [TM.format(cap='TRIPMATE AI PLATFORM · checks the AI'), LOG]
CSS = '''
.grid{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);max-width:1300px}
@media(max-width:1099px){.grid{grid-template-columns:minmax(0,1fr)}}
.tm{grid-template-columns:150px minmax(0,1fr)}
@media(max-width:560px){.tm{grid-template-columns:minmax(0,1fr)}}
.rules{list-style:none;margin:0 0 12px;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px}
@media(max-width:700px){.rules{grid-template-columns:1fr}}
.rules li{background:#1b1f2b;border:1px solid #2c3346;border-radius:9px;padding:7px 9px;font-size:12.5px;color:#c9cde0;display:flex;gap:8px;align-items:baseline;transition:border-color .3s,background .3s}
.rules li b{color:#a99bff;font-size:11.5px;flex:none;min-width:30px}
.rules li.hit{border-color:#ff8f80;background:#2a1a1f}
.rules li.ok{border-color:#3f8f66}
.helpers{background:#1b1f2b;border-radius:10px;padding:10px;margin-bottom:12px;font-size:12px;color:#9aa0b4}
.helpers .tree{margin-top:6px;color:#e6e8ef;font-size:13px}
.helpers .tree .kid{margin:4px 0 0 14px;padding-left:10px;border-left:2px solid #3a3f52}
.helpers small{color:#8b90a3}
.next{font-size:12px;color:#8b90a3;border:1px dashed #3a4052;border-radius:10px;padding:9px 10px;margin-bottom:12px}
.v.ISSUED{background:#252040;color:#b7a9ff}
'''
FOOT = 'TrustLogic holds $0. It only decides and signs. Banks and card issuers hold and move the money.'
