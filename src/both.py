TITLE = 'GYA² Demo 3: Both Together'
BRAND = 'GYA² · Demo 3'
OUT = 'dist/demo3-both.html'
TABS = '''  <button type="button" data-s="ai">1 · TripMate AI</button>
  <button type="button" data-s="bank">2 · Maple bank app</button>
  <button type="button" data-s="log">TrustLogic log</button>'''
def GRID(TM, BANK, LOG):
    return [TM.format(cap='1 · TRIPMATE AI PLATFORM · checks the AI'),
            BANK.format(cap='2 · MAPLE DEMO BANK APP · checks the money'), LOG]
CSS = '''
.v.HOLD{background:#3a2e10;color:#f3c04a}.v.REPLAY{background:#252a27;color:#9fa9a2;border:1px dashed #556}
.logl li.rp{opacity:.85;border-left:2px dashed #556;padding-left:8px}
'''
