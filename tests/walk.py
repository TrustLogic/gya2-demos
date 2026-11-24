"""Click through every example of a demo at desktop (1440px) and phone (360px) widths.
Prints each caption step at desktop width; exits 1 on any JS error or horizontal overflow.
Usage: python3 tests/walk.py dist/demo3-both.html 5
Needs: pip install playwright && playwright install chromium (or set CHROME=/path/to/chrome)"""
import os, sys
from playwright.sync_api import sync_playwright

f, n = sys.argv[1], int(sys.argv[2])
chrome = os.environ.get('CHROME')
bad = False
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome, args=['--no-sandbox']) if chrome else p.chromium.launch()
    for w in (1440, 360):
        pg = b.new_page(viewport={'width': w, 'height': 900})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + os.path.abspath(f))
        for ex in range(n):
            pg.click(f'#pills [data-t="{ex}"]')
            for i in range(30):
                say = pg.inner_text('#dSay'); look = pg.inner_text('#dLook')
                btns = pg.eval_on_selector_all('#dBtns button', 'bs=>bs.map(b=>b.dataset.a+":"+b.textContent)')
                if w == 1440:
                    print(f'[{ex+1}] {say} || {look} || {btns}')
                if 'Next example' in str(btns):
                    break
                pg.click('#dBtns button:first-child')
        sw = pg.evaluate('document.documentElement.scrollWidth')
        print('width', w, 'errors', errs, 'scrollWidth', sw)
        if errs or sw > w:
            bad = True
sys.exit(1 if bad else 0)
