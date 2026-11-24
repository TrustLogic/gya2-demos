TITLE = 'GYA Demo 1: The Money'
BRAND = 'GYA · Demo 1 · The Money'
OUT = 'dist/demo1-money.html'
TABS = '''  <button type="button" data-s="ai">1 · TripMate AI</button>
  <button type="button" data-s="bank">2 · Maple bank app</button>
  <button type="button" data-s="log">TrustLogic log</button>'''
def GRID(TM, BANK, LOG):
    return [TM.format(cap='1 · TRIPMATE AI PLATFORM · where Travel AI asks to pay'),
            BANK.format(cap='2 · MAPLE DEMO BANK APP · checks the money'), LOG]
CSS = '''
.grid{grid-template-columns:minmax(0,1fr) 350px minmax(0,1fr)}
@media(max-width:1099px){.grid{grid-template-columns:minmax(0,1fr)}}
.phone{max-width:350px}
.app{min-height:680px}
.mrow{display:flex;justify-content:space-between;align-items:center;border:1px solid #eee;border-radius:12px;padding:9px 12px;margin-bottom:8px;font-size:13px}
.mrow small{display:block;color:#888;font-size:11px}
.mrow b{font-family:"Inter Tight",Inter,sans-serif;font-size:16px}
.macct.hl,.mrow.hl{border-color:#B3261E;box-shadow:0 0 0 2px #b3261e22}
.mrights{list-style:none;margin:0;padding:0}
.mrights li{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #f1f1f1;font-size:12.5px}
.mrights li small{display:block;color:#888;font-size:11px}
.st{font-size:11px;font-weight:700;border-radius:6px;padding:2px 7px;white-space:nowrap}
.st.on{background:#e7f4ec;color:#1d6b40}.st.off{background:#fde8e6;color:#b3261e}
.sheet{position:absolute;left:10px;right:10px;top:40px;background:#fff;border-radius:18px;box-shadow:0 12px 36px #0005;padding:16px 16px 14px;z-index:6;border:1px solid #eee}
.sheet .nt{display:flex;align-items:center;gap:6px;font-size:11px;color:#777;margin-bottom:6px}.sheet .nt svg{width:14px;height:14px;color:#B3261E}
.sheet h4{margin:0 0 4px;font-family:"Inter Tight",Inter,sans-serif;font-size:17px}
.sheet .sd{font-size:12.5px;color:#555;margin-bottom:10px}
.sheet .sbtn{display:flex;gap:8px}
.sheet .sbtn span{flex:1;text-align:center;border-radius:12px;padding:11px 0;font-weight:700;font-size:14px}
.sheet .ap{background:#B3261E;color:#fff}.sheet .de{border:1px solid #ddd;color:#333}
.sheet .note{font-size:11px;color:#888;margin-top:8px}
.ghost{border:1px dashed #3a4052;border-radius:10px;padding:10px;font-size:12px;color:#8b90a3;margin-bottom:12px}
.feed .think.hj{color:#ff9f8f;font-style:normal}
.v.HOLD{background:#3a2e10;color:#f3c04a}.v.APPROVED{background:#123826;color:#6ee0a0}.v.DECLINED,.v.REVOKED{background:#3d1a1a;color:#ff8f80}
'''
