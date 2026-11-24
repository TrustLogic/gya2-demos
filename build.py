import sys
base = open('src/base.css').read()
HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
<div class="bar">
  <span class="brand">{brand}</span><span class="sim">SIMULATED</span>
  <div class="pills" id="pills"></div>
  <span class="exn" id="exn"></span>
  <button class="rs" id="restart" type="button">Restart</button>
</div>
<div class="tabs" id="tabs">
{tabs}
</div>
<div class="grid">
{grid}
</div>
<div class="dir"><div class="in">
  <div class="txt"><div class="step" id="dStep"></div><div class="say" id="dSay"></div><div class="look" id="dLook"></div><div class="strip" id="dStrip"></div></div>
  <div class="btns" id="dBtns"></div>
</div></div>
<script>
{{
{js}
}}
</script>
</body>
</html>
'''
LOG = '''  <section class="screen" id="scr-log">
    <p class="cap">TRUSTLOGIC · DECISION LOG · every check, signed</p>
    <div class="tl"><div class="tlh"><span class="lg"><i></i>TrustLogic</span><div class="tlt"><button type="button" id="tLog" class="on">Decisions</button><button type="button" id="tDev">Developer</button></div></div><div id="tlBody"></div><div class="tlf">{foot}</div></div>
  </section>'''
TM = '''  <section class="screen" id="scr-ai">
    <p class="cap">{cap}</p>
    <div class="win"><div class="chrome"><i></i><i></i><i></i><span class="url">console.tripmate.example/agents/travel-ai</span></div><div class="tm" id="tmApp"></div></div>
  </section>'''
BANK = '''  <section class="screen" id="scr-bank">
    <p class="cap">{cap}</p>
    <div class="phone"><div class="app" id="bankApp"></div></div>
  </section>'''

COMMON = '''
.tlf{border-top:1px solid #232824;padding:9px 12px;font-size:11.5px;color:#aab4ad;background:#101311}
.strip:empty{display:none}.strip{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.strip span{font-size:11.5px;font-weight:600;border-radius:6px;padding:2px 8px;border:1px solid var(--line);color:var(--soft)}
.strip span.PASS{background:#e2f3e9;color:#1d6b40;border-color:#b9dfc8}.strip span.DENY{background:#fde8e6;color:#b3261e;border-color:#f3c2bd}
.strip span.HOLD{background:#fff3d6;color:#8a5a00;border-color:#efd79b}.strip span.SKIPPED{border-style:dashed}
@media(prefers-color-scheme:dark){.strip span.PASS{background:#123826;color:#6ee0a0;border-color:#1d5a3c}.strip span.DENY{background:#3d1a1a;color:#ff8f80;border-color:#5a2a2a}.strip span.HOLD{background:#3a2e10;color:#f3c04a;border-color:#5a4718}}
'''
def build(name):
    d = __import__(name)
    grid = '\n'.join(d.GRID(TM, BANK, LOG.replace('{foot}', getattr(d,'FOOT','TrustLogic holds $0. It only decides and signs. Maple Demo Bank holds and moves the money.'))))
    out = HEAD.format(title=d.TITLE, css=base + COMMON + d.CSS, brand=d.BRAND, tabs=d.TABS, grid=grid, js=open('src/engine.js').read()+'\n'+open(f'src/{name}.js').read())
    open(d.OUT, 'w').write(out)
    print('wrote', d.OUT, len(out))

sys.path.insert(0, 'src')
for n in (sys.argv[1:] or ['money', 'ai', 'both']):
    build(n)
