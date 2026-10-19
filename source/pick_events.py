# 從剪報、研究與學生人數裡挑出事件，和「智能障礙重大事件表」的 18 件一起，排成時間軸版本比較頁用的 50 件事件
#
#   python3 pick_events.py
#       讀 data.json，寫出 events.json，並印出一份挑選報告（每一件為什麼被選進來）。
#       重大事件表的 18 件寫在 src/00-data.js，這裡不重複；比較頁會把兩邊合在一起。
#
# 想加入或拿掉某一件：改下面的 ADD_NEWS（用剪報的日期與標題指定）或 SKIP（用事件的 id），再執行一次。
# 只用到 Python 內建的功能，不需要另外安裝套件。
import io, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(io.open(os.path.join(HERE, 'data.json'), encoding='utf-8'))
NEWS, LIT, CNT = D['news'], D['lit'], D['counts']

# 人工指定：除了下面的規則，另外一定要放進來的剪報（日期, 標題）
ADD_NEWS = [
    # ('1968-02-05', '特教草案'),
]
# 人工排除：不要放進來的事件 id（看挑選報告裡的 id）
SKIP = set()

TERMS = ['白痴／低能', '智能不足', '智障', '智能障礙']
out, seen = [], set()

def add(ev):
    if ev['id'] in seen or ev['id'] in SKIP: return
    seen.add(ev['id']); out.append(ev)

def news_event(a, why, imp=1):
    i = NEWS.index(a)
    return {'id': 'n%d' % i, 'type': 'news', 'track': 'news', 'date': a['d'], 'precision': 'day', 'certainty': 'sure',
            'title': a['t'], 'importance': imp, 'why': why,
            'summary': '%s %s 的報導。用詞：%s；主要觀點：%s。' % (a['o'], a['d'].replace('-', '.'), '、'.join(a['wg']) or '沒有編碼', a['v'] or '沒有編碼'),
            'source': '%s，%s' % (a['o'], a['d']), 'news': i}

# ---------- 剪報 ----------
add(news_event(NEWS[0], '資料裡最早的一篇剪報', 2))
for w in TERMS:
    a = next(a for a in NEWS if w in a['wg'])
    add(news_event(a, '「%s」這個詞第一次出現在剪報裡' % w, 2))
# 立法、修法的報導。外電、社會案件與「沈重負擔」「優生保健」觀點的個案報導不算；同一部法的草案連續幾篇時，半年內只留第一篇
FOREIGN = ('美聯社', '紐時', '德州')
def is_law(a):
    if not any(p.endswith(('-立法', '-修法')) for p in a['p']): return False
    if '社會事件' in a['pg'] or a['o'] in FOREIGN or any(f in a['t'] for f in FOREIGN): return False
    return a['v'] not in ('沈重負擔/同情憐憫', '優生保健') or '法' in a['t']
last = None
for a in NEWS:
    if not is_law(a): continue
    y, m = int(a['d'][:4]), int(a['d'][5:7])
    if last and (y - last[0]) * 12 + m - last[1] < 6: continue
    last = (y, m)
    add(news_event(a, '分類為「政策公告及回應—%s」' % ('立法' if any(p.endswith('-立法') for p in a['p']) else '修法')))
for d, t in ADD_NEWS:
    a = next(a for a in NEWS if a['d'] == d and a['t'] == t)
    add(news_event(a, '人工指定'))
# 觀點第一次出現：倡議、家長拒絕標籤、肯定障礙者
for v, name in [('倡議', '倡議'), ('家長拒絕標籤', '家長拒絕標籤'), ('肯定障礙者(學習能力、成就)', '肯定障礙者')]:
    a = next(a for a in NEWS if a['v'] == v and '社會事件' not in a['pg'])
    add(news_event(a, '主要觀點「%s」第一次出現' % name))
# 家長陳情第一次見報；2010 年代第一篇招生、安置的報導（鑑定標準 2012 年修訂前後）
a = next(a for a in NEWS if '政策公告及回應-陳情' in a['p'])
add(news_event(a, '家長陳情第一次出現在剪報裡'))
a = next(a for a in NEWS if '政策公告及回應-招生' in a['p'] and a['d'] >= '2010')
add(news_event(a, '2010 年代第一篇招生、安置的報導'))
add(news_event(NEWS[-1], '資料裡最晚的一篇剪報'))

# ---------- 研究 ----------
DES, THM, RGT = D['litDesigns'], D['litThemes'], D['litRights']
def lit_event(k, y, title, why, summary, imp=1):
    return {'id': k, 'type': 'lit', 'track': 'lit', 'date': str(y), 'precision': 'year', 'certainty': 'sure',
            'title': title, 'importance': imp, 'why': why, 'summary': summary, 'source': '研究文獻編碼表'}
y0 = LIT[0][0]
add(lit_event('r0', y0, '第一篇研究', '資料裡最早的研究', '%d 篇研究文獻裡，最早的一篇發表於 %d 年，研究設計是%s。' % (len(LIT), y0, DES[LIT[0][1]]), 2))
for k in (2, 3, 4, 5):
    r = next(r for r in LIT if r[1] == k)
    add(lit_event('rd%d' % k, r[0], '第一篇%s' % DES[k], '研究設計「%s」第一次出現' % DES[k],
                  '%d 年出現第一篇%s。整份資料共有 %d 篇%s。' % (r[0], DES[k], sum(1 for x in LIT if x[1] == k), DES[k])))
r = next(r for r in LIT if r[2] == 5)
add(lit_event('rt5', r[0], '第一篇權利意識研究', '研究主題「權利意識」第一次出現', '%d 年出現第一篇以權利意識（包含性與自我倡議）為主題的研究。' % r[0], 2))
r = next(r for r in LIT if r[3] == 3)
add(lit_event('rr3', r[0], '第一篇性教育介入研究', '權利議題「性教育介入」第一次出現', '%d 年出現第一篇性教育介入的研究。' % r[0]))
r = next(r for r in LIT if r[3] == 2)
add(lit_event('rr2', r[0], '第一篇自我倡議研究', '權利議題「自我倡議/自我決策」第一次出現', '%d 年出現第一篇談自我倡議或自我決策的研究。' % r[0]))
by = {}
for x in LIT: by[x[0]] = by.get(x[0], 0) + 1
py = max(by, key=lambda y: (by[y], -y))
add(lit_event('rpk', py, '研究篇數最多的一年', '每年篇數的高峰', '%d 年有 %d 篇研究，是整份資料裡最多的一年。' % (py, by[py]), 2))

# ---------- 學生人數 ----------
def cnt_event(k, y, title, why, summary, src, imp=1):
    return {'id': k, 'type': 'people', 'track': 'people', 'date': str(y), 'precision': 'year', 'certainty': 'sure',
            'title': title, 'importance': imp, 'why': why, 'summary': summary, 'source': src}
fmt = lambda n: '{:,}'.format(n)
M = CNT['mohw']; my = sorted(M, key=int)
add(cnt_event('pm0', my[0], '衛福部統計起點', '衛福部數據的第一年', '%s 年底，全台領有身心障礙證明的智能障礙者 %s 人。' % (my[0], fmt(M[my[0]])), '衛福部全台數據'))
y10 = next(y for y in my if M[y] >= 100000)          # 第一次超過十萬人的那一年
add(cnt_event('pm1', y10, '智能障礙總人數破十萬', '衛福部數據第一次超過十萬人', '%s 年底 %s 人，第一次超過十萬人。到 %s 年底是 %s 人。' % (y10, fmt(M[y10]), my[-1], fmt(M[my[-1]])), '衛福部全台數據', 2))
N = CNT['nation']; ny = sorted(N['ID'], key=int)
add(cnt_event('pn0', ny[0], '通報網學生人數起點', '通報網數據的第一年', '%s 年，全台特教通報網的智能障礙學生 %s 人。' % (ny[0], fmt(N['ID'][ny[0]])), '通報網全台數據'))
pk = max(ny, key=lambda y: N['ID'][y])
add(cnt_event('pnk', pk, '智能障礙學生人數最多', '智能障礙學生人數的高峰', '%s 年 %s 人，之後逐年減少。' % (pk, fmt(N['ID'][pk])), '通報網全台數據', 2))
for key, name, k in [('LD', '學習障礙', 'pxl'), ('ASD', '自閉症', 'pxa')]:
    for a, b in zip(ny, ny[1:]):
        if N[key][a] <= N['ID'][a] and N[key][b] > N['ID'][b]:
            add(cnt_event(k, b, '%s學生人數超過智能障礙' % name, '%s與智能障礙的人數交叉' % name,
                          '%s 年起，%s學生（%s 人）多於智能障礙學生（%s 人）。' % (b, name, fmt(N[key][b]), fmt(N['ID'][b])), '通報網全台數據', 2)); break
add(cnt_event('pn1', ny[-1], '智能障礙學生人數', '通報網數據的最後一年', '%s 年 %s 人，比高峰的 %s 年減少 %d%%。' % (ny[-1], fmt(N['ID'][ny[-1]]), pk, round((N['ID'][pk] - N['ID'][ny[-1]]) / N['ID'][pk] * 100)), '通報網全台數據'))
T = CNT['taipei']['SCHOOL_ID']; ty = sorted(T, key=int)
add(cnt_event('pt', ty[-1], '台北市特教學校智障學生減少', '台北市特教學校數據的頭尾', '台北市四所特教學校的智能障礙學生，從 %s 年 %s 人減為 %s 年 %s 人。' % (ty[0], fmt(T[ty[0]]), ty[-1], fmt(T[ty[-1]])), '台北市年報', 1))

out.sort(key=lambda e: e['date'])
json.dump(out, io.open(os.path.join(HERE, 'events.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
print('從資料挑出 %d 件（加上重大事件表 18 件，共 %d 件）' % (len(out), len(out) + 18))
for t in ('news', 'lit', 'people'):
    print('\n[%s]' % {'news': '剪報', 'lit': '研究', 'people': '學生人數'}[t])
    for e in out:
        if e['type'] == t: print('  %-5s %-10s %s　← %s' % (e['id'], e['date'], e['title'], e['why']))
