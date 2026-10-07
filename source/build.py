# 把 src/ 底下的檔案組成一個可以直接上傳的網頁
#
#   python3 build.py
#       產生上一層資料夾的 index.html，並把 cover.png、icon.png、.nojekyll 放在它旁邊。
#       整個網站就是這幾個檔案，放到 GitHub Pages 或任何網頁空間都可以。
#
#   python3 build.py --site https://你的帳號.github.io/你的倉庫名稱/
#       同上，並把分享預覽圖的網址寫成完整的網址（有些社群與通訊軟體只認完整的網址）。
#
#   其他選項
#       --out 資料夾        網站檔案要放在哪裡（預設是上一層資料夾）
#       --gas 資料夾        另外產生 Google Apps Script 用的 Index.html 與 Code.gs
#       --artifact 檔名     另外產生 claude.ai 的 Artifact 用的頁面（沒有 <html><head><body> 外殼）
#
# 只用到 Python 內建的功能，不需要另外安裝套件。
import argparse, glob, io, json, os, shutil, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(description='組出智能障礙事件樹的網頁')
ap.add_argument('--site', default='', help='網站發布後的網址，例如 https://帳號.github.io/倉庫名稱/')
ap.add_argument('--out', default=os.path.join(HERE, '..'), help='網站檔案要放在哪個資料夾（預設是上一層）')
ap.add_argument('--gas', default='', help='另外產生 Google Apps Script 用的檔案，放在這個資料夾')
ap.add_argument('--artifact', default='', help='另外產生 claude.ai Artifact 用的頁面，寫到這個檔案')
args = ap.parse_args()

rd = lambda f: io.open(os.path.join(HERE, f), encoding='utf-8').read()
def wr(path, text):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    io.open(path, 'w', encoding='utf-8', newline='\n').write(text)
dump = lambda v: json.dumps(v, ensure_ascii=False, separators=(',', ':'))
att = lambda s: s.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')

D = json.loads(rd('data.json'))
src = ''.join(rd(os.path.relpath(f, HERE)) for f in sorted(glob.glob(os.path.join(HERE, 'src', '[0-9]*.js'))))
assert src.count('/*__DATA__*/') == 1
css, body = rd('src/style.css'), rd('src/body.html')

TITLE = '智能障礙事件樹'
DESC = '智能障礙的數位策展：重大事件時間軸、%d 篇剪報、%d 篇研究與學生人數，並設有照片與訪談展區。' % (len(D['news']), len(D['lit']))
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@600;700&family=Noto+Sans+TC:wght@400;500;700'
         '&family=LXGW+WenKai+TC:wght@400;700&display=swap" rel="stylesheet">\n')

# 資料改成一筆一行，避免單行太長（貼進編輯器或用 git 比對時比較順）；「</」拆開，才不會被當成 script 結束
parts = []
for k, v in D.items():
    if isinstance(v, list) and len(v) > 20:
        parts.append(dump(k) + ':[\n' + ',\n'.join(dump(x) for x in v) + '\n]')
    else:
        parts.append(dump(k) + ':' + dump(v))
data = ('{\n' + ',\n'.join(parts) + '\n}').replace('</', '<\\/')
assert json.loads(data.replace('<\\/', '</')) == D
js = src.replace('/*__DATA__*/', data)
assert '</script' not in js.lower()

# ---------- 網站（GitHub Pages 或任何網頁空間） ----------
site = args.site.strip()
if site and not site.endswith('/'): site += '/'
icon_svg = ' '.join(rd('assets/icon.svg').split())
icon_uri = 'data:image/svg+xml,' + urllib.parse.quote(icon_svg, safe='/:=,.-')
head = ('<!DOCTYPE html>\n<html lang="zh-Hant-TW">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<title>' + TITLE + '</title>\n'
        '<meta name="description" content="' + att(DESC) + '">\n'
        '<meta name="color-scheme" content="light dark">\n'
        '<meta name="theme-color" media="(prefers-color-scheme: light)" content="#F7F8F4">\n'
        '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#20272A">\n'
        '<!-- 分享到社群或通訊軟體時顯示的標題、說明與圖片。og:image 最好寫成完整的網址（https://…/cover.png），見 README -->\n'
        '<meta property="og:type" content="website">\n'
        '<meta property="og:site_name" content="' + TITLE + '">\n'
        '<meta property="og:title" content="' + TITLE + '">\n'
        '<meta property="og:description" content="' + att(DESC) + '">\n'
        '<meta property="og:locale" content="zh_TW">\n'
        + ('<meta property="og:url" content="' + att(site) + '">\n' if site else '') +
        '<meta property="og:image" content="' + att(site + 'cover.png') + '">\n'
        '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
        '<meta property="og:image:alt" content="深色背景上寫著「智能障礙事件樹」，右邊是一棵由下往上長的事件樹。">\n'
        '<meta name="twitter:card" content="summary_large_image">\n'
        '<link rel="icon" type="image/png" href="icon.png">\n'
        '<link rel="icon" type="image/svg+xml" href="' + icon_uri + '">\n'
        '<link rel="apple-touch-icon" href="icon.png">\n'
        + FONTS + '<style>' + css + '</style>\n</head>\n<body>\n'
        '<noscript><p style="margin:0;padding:24px;font:16px/1.8 sans-serif">這個網站需要開啟瀏覽器的 JavaScript 才能顯示內容。</p></noscript>\n')
doc = head + body + '\n<script>\n' + js + '</script>\n</body>\n</html>\n'
out = os.path.abspath(args.out)
wr(os.path.join(out, 'index.html'), doc)
for f in ('cover.png', 'icon.png'):
    shutil.copyfile(os.path.join(HERE, 'assets', f), os.path.join(out, f))
wr(os.path.join(out, '.nojekyll'), '')          # 告訴 GitHub Pages 不用另外處理，直接把檔案原樣送出
print('網站：%s（%d KB，%d 行）%s' % (os.path.join(out, 'index.html'), len(doc.encode('utf-8')) // 1024, doc.count('\n'),
                               '' if site else '　※ 沒有給 --site，分享預覽圖用的是相對網址'))

# ---------- Google Apps Script（選用） ----------
if args.gas:
    gdoc = ('<!DOCTYPE html>\n<html lang="zh-Hant-TW">\n<head>\n<base target="_top">\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<title>' + TITLE + '</title>\n' + FONTS + '<style>' + css + '</style>\n</head>\n<body>\n'
            + body + '\n<script>\n' + js + '</script>\n</body>\n</html>\n')
    wr(os.path.join(args.gas, 'Index.html'), gdoc)
    wr(os.path.join(args.gas, 'Code.gs'), rd('src/Code.gs'))
    print('Apps Script：%s（%d KB）' % (os.path.join(args.gas, 'Index.html'), len(gdoc.encode('utf-8')) // 1024))

# ---------- claude.ai 的 Artifact（選用） ----------
if args.artifact:
    html = ('<title>' + TITLE + '</title>\n' + FONTS + '<style>' + css + '</style>\n' + body
            + '\n<script>\n' + src.replace('/*__DATA__*/', dump(D).replace('</', '<\\/')) + '</script>\n')
    wr(args.artifact, html)
    print('Artifact：%s（%d 字）' % (args.artifact, len(html)))
