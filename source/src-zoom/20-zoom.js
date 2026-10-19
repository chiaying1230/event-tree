/* ============ 可縮放時間軸：概覽＋細節＋語意縮放 ============
   上方是全時段的概覽列（每年的剪報篇數＋事件刻痕），框起來的是主視窗目前的範圍。
   縮放是連續的（全覽 64 年到最窄 3 年），換範圍時有短短的過渡，看得出是在放大或縮小。
   縮放不只是放大：跨度大時只寫出重要的事件，越放大寫出越多；放不下的合併成「＋N」。
   電腦上可以 Ctrl（Mac 為 ⌘）＋滾輪或觸控板兩指縮放、拖曳平移、雙擊放大；
   這些都另外有按鈕、滑桿或選單可以做到（2.5.7）。只滾滾輪不按 Ctrl 時照常捲動頁面，不攔截捲動。 */
const Z = {a:AX0, b:AX1};
const ZMAX = AX1-AX0, ZMINS = 3;
const zSpan = () => Z.b-Z.a;
// 把範圍限制在 1962–2025 之內，跨度在 3 到 64 年之間
function zClamp(a, b){
  let s = Math.min(Math.max(b-a, ZMINS), ZMAX); a = Math.min(Math.max(a, AX0), AX1-s); return [a, a+s];
}
const zNeed = (s) => (s=s||zSpan(), s>40 ? 3 : s>15 ? 2 : 1);          // 這個跨度寫出名稱的重要度門檻
const zNeedText = n => n===3 ? '只寫出最重要的事件' : n===2 ? '寫出重要度 2 以上的事件' : '寫出全部事件';
const zStep = s => s>40 ? 10 : s>15 ? 5 : s>7 ? 2 : 1;
// 滑桿：0＝全覽，100＝最窄。用對數，每推一格放大的感覺差不多
const zToSlider = s => Math.round(100*Math.log(ZMAX/s)/Math.log(ZMAX/ZMINS));
const zFromSlider = v => ZMAX*Math.pow(ZMINS/ZMAX, v/100);
const zLabel = () => { const A = Math.floor(Z.a+.001), B = Math.ceil(Z.b-.001)-1; return A+'–'+Math.max(A,B)+' 年'; };

/* ---------- 畫圖 ---------- */
function zOverview(W){
  const H = 62, X = t => 8+(W-16)*(t-AX0)/(AX1-AX0), max = Math.max(...Object.values(NEWS_BY_Y)); let g = '';
  Object.keys(NEWS_BY_Y).forEach(y=>{ const h = 30*NEWS_BY_Y[y]/max; g += `<rect x="${f1(X(+y)+.5)}" y="${f1(36-h)}" width="${f1(Math.max(1,X(+y+1)-X(+y)-1))}" height="${f1(h)}" fill="var(--ink)" fill-opacity=".28"/>`; });
  shown().forEach(e=>{ g += `<rect x="${f1(X(e.t)-1)}" y="40" width="2.4" height="10" fill="${colorOf(e.track)}"/>`; });
  DECADES.forEach(d=>{ const t = Math.max(d,AX0); g += `<text class="yr" x="${f1(X(t)+2)}" y="${H-1}" font-size="10.5">${t}</text>`; });
  g += `<rect class="zwin" x="${f1(X(Z.a))}" y="2" width="${f1(Math.max(4, X(Z.b)-X(Z.a)))}" height="50" rx="4"/>`;
  return `<svg class="zov" id="zOv" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${g}</svg>`;
}
// o.prev：過渡開始前寫出名稱的事件；o.p：過渡的進度（0–1），新出現的卡片跟著淡入
function zMain(W, o){
  o = o||{};
  const a = Z.a, b = Z.b, s = b-a, X = t => 14+(W-28)*(t-a)/s, AXY = 30, FS = big ? 16 : 13, FD = big ? 13.5 : 11.5, CH = big ? 56 : 46, RG = CH+6, MAXR = 5;
  const ev = shown().filter(e=>e.t>=a && e.t<b), need = zNeed(s);
  let g = '';
  // 背景：可以拖曳平移、雙擊放大的地方
  g += `<rect class="zbg" x="0" y="0" width="${W}" height="2000"/>`;
  const step = zStep(s), minGap = 34;
  let lastLab = -1e9;
  for(let y=Math.ceil(a/step)*step; y<b; y+=step){ const x = X(y), big = y%10===0;
    g += `<line x1="${f1(x)}" x2="${f1(x)}" y1="${AXY-6}" y2="${AXY}" stroke="var(--ink)" stroke-opacity=".5" pointer-events="none"/><line x1="${f1(x)}" x2="${f1(x)}" y1="${AXY}" y2="2000" stroke="var(--ink)" stroke-opacity="${big?.13:.06}" pointer-events="none"/>`;
    if(x-lastLab>=minGap){ g += `<text class="yr" x="${f1(x+3)}" y="${AXY-9}" font-size="${big?12:11}"${big?' font-weight="700"':''} pointer-events="none">${y}</text>`; lastLab = x; } }
  g += `<line x1="0" x2="${W}" y1="${AXY}" y2="${AXY}" stroke="var(--ink)" stroke-opacity=".5" pointer-events="none"/>`;
  // 寫出名稱的卡片：重要的先排，最多 5 列；排不下的併到下方的記號或「＋N」
  const rows = Array.from({length:MAXR}, ()=>[]), card = {}, loose = [];
  ev.slice().sort((p,q)=>(q.id===S.e)-(p.id===S.e) || q.importance-p.importance || p.t-q.t).forEach(e=>{
    if(e.importance<need && e.id!==S.e){ loose.push(e); return; }
    const w = Math.min(Math.max(textW(e.title,FS), textW(whenShort(e),FD))+24, big ? 260 : 210), x = Math.min(Math.max(X(e.t)-w/2, 2), W-w-2);
    const r = rows.findIndex(R=>R.every(([p,q])=>x+w+6<p || x>q+6));
    if(r<0){ loose.push(e); return; } rows[r].push([x,x+w]); card[e.id] = {x, w, r};
  });
  const used = Math.max(0, ...Object.values(card).map(c=>c.r+1)), LY = AXY+18+Math.max(used,1)*RG+18;
  const items = [];
  ev.filter(e=>card[e.id]).forEach(e=>{ const c = card[e.id], x = X(e.t), y = AXY+14+c.r*RG, on = S.e===e.id, lim = Math.floor((c.w-22)/FS);
    const title = textW(e.title,FS)>c.w-22 ? [...e.title].slice(0, lim-1).join('')+'…' : e.title;
    const fade = o.prev && !o.prev.has(e.id) ? ` opacity="${(o.p||0).toFixed(2)}"` : '';
    items.push({x, html:`<g class="ev card${on?' on':''}" data-id="${e.id}" data-x="${f1(x)}" role="button" tabindex="-1" aria-pressed="${on}" aria-label="${esc(evLabel(e))}" style="--c:${colorOf(e.track)}"${fade}>
      <line x1="${f1(x)}" x2="${f1(x)}" y1="${AXY}" y2="${y}" stroke="${colorOf(e.track)}" stroke-opacity=".7"/>${mark(TRACKS[e.track].shape, x, AXY, 5, 'class="mk"')}
      <rect class="lb" x="${f1(c.x)}" y="${y}" width="${f1(c.w)}" height="${CH}" rx="7"/><rect x="${f1(c.x)}" y="${y}" width="4" height="${CH}" rx="2" fill="${colorOf(e.track)}"/>
      <text class="yr" x="${f1(c.x+12)}" y="${y+(big?20:17)}" font-size="${FD}">${esc(whenShort(e))}</text><text class="lt" x="${f1(c.x+12)}" y="${y+(big?45:36)}" font-size="${FS}">${esc(title)}</text></g>`}); });
  // 沒寫名稱的：靠得很近的合併成「＋N」，按了放大到那一段
  const L = loose.sort((p,q)=>p.t-q.t), groups = [];
  L.forEach(e=>{ const g0 = groups[groups.length-1]; if(g0 && X(e.t)-X(g0[g0.length-1].t)<30) g0.push(e); else groups.push([e]); });
  groups.forEach(G=>{ const x = G.reduce((sum,e)=>sum+X(e.t),0)/G.length;
    if(G.length===1){ const e = G[0], on = S.e===e.id;
      items.push({x, html:`<g class="ev dot${on?' on':''}" data-id="${e.id}" data-x="${f1(x)}" role="button" tabindex="-1" aria-pressed="${on}" aria-label="${esc(evLabel(e))}" data-tip="${esc(e.title+'\n'+whenLong(e))}" style="--c:${colorOf(e.track)}"><rect class="hit" x="${f1(x-13)}" y="${LY-13}" width="26" height="26" rx="6"/>${mark(TRACKS[e.track].shape, x, LY, 6, 'class="mk"')}</g>`}); return; }
    const t0 = G[0].t, t1 = G[G.length-1].t, ya = Math.floor(t0), yb = Math.floor(t1);
    items.push({x, html:`<g class="clu" data-cluster="${f1(t0)}_${f1(t1)}" data-x="${f1(x)}" role="button" tabindex="-1" aria-label="${G.length} 件事件，${ya===yb ? ya+' 年' : ya+' 到 '+yb+' 年'}，按一下放大" data-tip="${esc(G.length+' 件事件（'+(ya===yb?ya:ya+'–'+yb)+'）\n'+G.slice(0,4).map(e=>e.title).join('\n')+(G.length>4?'\n…':'')+'\n按一下放大')}">
      <circle class="hit" cx="${f1(x)}" cy="${LY}" r="15"/><circle cx="${f1(x)}" cy="${LY}" r="13" class="cb"/><text x="${f1(x)}" y="${LY+4.5}" text-anchor="middle" font-size="12" font-weight="700">+${G.length}</text></g>`}); });
  // 跨度 12 年以下：加一條剪報的刻痕，看出那幾年的報導多寡
  let NY = LY;
  if(s<=12){ NY = LY+40; const tOf = n => n.y+((+n.d.slice(5,7)||1)-1)/12+((+n.d.slice(8,10)||1)-1)/372, A = NEWS.filter(n=>{ const t = tOf(n); return t>=a && t<b; });
    g += `<text class="lnm" x="14" y="${NY-12}" font-size="11.5" pointer-events="none">這段期間的剪報：${A.length} 篇</text>`;
    A.forEach(n=>{ const x = X(tOf(n)); g += `<line x1="${f1(x)}" x2="${f1(x)}" y1="${NY-4}" y2="${NY+8}" stroke="var(--c-news)" stroke-width="1.4" pointer-events="none"/>`; }); }
  const H = NY+24;
  items.sort((p,q)=>p.x-q.x).forEach(it=>{ g += it.html; });
  return {svg:`<svg class="tsvg zoom" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" aria-roledescription="可縮放的時間軸" aria-describedby="zHelp" aria-label="${zLabel()}的事件，${ev.length} 件">${g}</svg>`, labelled:new Set(Object.keys(card))};
}
// 只重畫兩張圖與範圍的文字（過渡、拖曳、滾輪的每一格都用這個，不重畫整頁）
let zLastLab = new Set();
function zPaint(o){
  const fig = $('#zFig'); if(!fig) return;
  const W = Math.floor(fig.clientWidth), m = zMain(W, o);
  fig.innerHTML = m.svg; $('#zOvFig').innerHTML = zOverview(W);
  const s = zSpan(), r = $('.zrange');
  if(r) r.innerHTML = `<b>${zLabel()}</b>　跨 ${Math.round(s)} 年・每格 ${zStep(s)} 年・${zNeedText(zNeed(s))}`;
  const sl = $('#zSlider'); if(sl && document.activeElement!==sl){ sl.value = zToSlider(s); }
  if(sl) sl.setAttribute('aria-valuetext', '跨 '+Math.round(s)+' 年，'+zLabel());
  [['prev',Z.a<=AX0+.001],['next',Z.b>=AX1-.001],['out',s>=ZMAX-.001],['in',s<=ZMINS+.001]].forEach(([k,d])=>{ const btn = $('[data-zoom="'+k+'"]'); if(btn) btn.disabled = d; });
  return m;
}

/* ---------- 換範圍：有過渡（減少動態時直接跳過去） ---------- */
let zAnim = null, zNeedWas = null;
// 正在過渡時，使用者又直接換了範圍：停掉過渡，免得它結束時把範圍蓋回去
const zStop = () => { if(zAnim){ cancelAnimationFrame(zAnim); zAnim = null; } };
function zTo(a, b, o){
  o = o||{};
  [a,b] = zClamp(a,b);
  zStop();
  const done = () => { Z.a = a; Z.b = b; zDone(o.msg); };
  if(calm() || o.instant || !$('#zFig')) return done();
  const a0 = Z.a, b0 = Z.b, T = 320, t0 = performance.now(), prev = zLastLab;
  const tick = now => { const p = Math.min(1, (now-t0)/T), k = 1-Math.pow(1-p,3);
    // 跨度用對數內插，放大與縮小的速度感才會一致
    const s0 = b0-a0, s1 = b-a, s = s0*Math.pow(s1/s0, k), c = (a0+b0)/2+((a+b)/2-(a0+b0)/2)*k;
    Z.a = c-s/2; Z.b = c+s/2; zPaint({prev, p:k});
    if(p<1) zAnim = requestAnimationFrame(tick); else { zAnim = null; done(); } };
  zAnim = requestAnimationFrame(tick);
}
// 換好範圍之後：整頁更新（按鈕狀態、網址），並唸出目前的範圍
function zDone(msg){
  writeUrl(false); render();
  const n = shown().filter(e=>e.t>=Z.a && e.t<Z.b).length, need = zNeed();
  say((msg ? msg+'。' : '')+'顯示 '+zLabel()+'，'+n+' 件事件'+(zNeedWas!=null && need!==zNeedWas ? '，現在'+zNeedText(need) : ''));
  zNeedWas = need;
}
// 以某一年為中心縮放：factor < 1 放大，> 1 縮小
function zZoomAt(t, factor, o){ const s = Math.min(Math.max(zSpan()*factor, ZMINS), ZMAX); zTo(t-(t-Z.a)*s/zSpan(), t-(t-Z.a)*s/zSpan()+s, o); }
const zCenter = () => (Z.a+Z.b)/2;
const zFocusFig = () => { const t = $('#zFig [tabindex="0"]'); if(t) t.focus({preventScroll:true}); };

// 網址記住目前的範圍：?from=1985&to=1995
function zUrlIn(q){ const a = parseFloat(q.get('from')), b = parseFloat(q.get('to')); if(a>=AX0 && b>=a){ [Z.a, Z.b] = zClamp(a, b+1); } }
const zUrlOut = () => zSpan()>=ZMAX-.001 ? {} : {from:Math.floor(Z.a+.001), to:Math.max(Math.floor(Z.a+.001), Math.ceil(Z.b-.001)-1)};
function zDraw(root){
  if(S.e){ const e = byId[S.e]; if(e.t<Z.a || e.t>=Z.b){ const s = zSpan(); [Z.a, Z.b] = zClamp(e.t-s/2, e.t+s/2); } }
  if(zNeedWas==null) zNeedWas = zNeed();
  const s = zSpan();
  root.innerHTML = `<div class="plate zbox">
    <div class="zctl" role="group" aria-label="平移與縮放">
      <button class="btn" data-zoom="prev">‹ 往前</button>
      <button class="btn" data-zoom="out" aria-label="縮小">－</button>
      <label class="zslide"><span class="lbl">全覽</span><input type="range" id="zSlider" min="0" max="100" step="1" value="${zToSlider(s)}" aria-label="縮放" aria-valuetext="跨 ${Math.round(s)} 年，${zLabel()}"><span class="lbl">三年</span></label>
      <button class="btn" data-zoom="in" aria-label="放大">＋</button>
      <button class="btn" data-zoom="next">往後 ›</button>
      <label class="zsel"><span class="lbl">年代</span><select id="zEra"><option value="">選一個年代</option>${DECADES.map(d=>`<option value="${d}">${d}年代</option>`).join('')}</select></label>
      <button class="btn" data-zoom="all">看全部</button>
    </div>
    <p class="zrange"></p>
    <div class="zovw"><span class="lbl">概覽：每年的剪報篇數與事件刻痕（按一下移到那一年，也可以拖曳框）</span><div id="zOvFig"></div></div>
    <p class="vh" id="zHelp">左右鍵移動，Enter 看介紹或放大，加號與減號縮放，PageUp 與 PageDown 往前或往後一段。</p>
    <div class="zfigw"><div class="tl-fig zfig" id="zFig"></div><p class="zhint" id="zHint" aria-hidden="true" hidden>按住 Ctrl（Mac 為 ⌘）再滾動滾輪即可縮放；拖曳可以左右移動</p></div></div>`;
  const m = zPaint();
  zLastLab = m ? m.labelled : new Set();
  const all = $$('#zFig [data-x]'), cur = all.find(x=>x.dataset.id===S.e) || all[0]; if(cur) cur.setAttribute('tabindex','0');
}
function zJump(y){ zStop(); [Z.a, Z.b] = zClamp(y-2, y+8); }
// 圖裡的方向鍵、＋／－、PageUp／PageDown。處理了就回傳 true
function zKey(e){
    const el = e.target.closest && e.target.closest('#zFig [data-x]'); if(!el) return;
    const all = $$('#zFig [data-x]'), i = all.indexOf(el);
    const go = j => { const to = all[Math.min(Math.max(j,0),all.length-1)]; all.forEach(x=>x.setAttribute('tabindex', x===to?'0':'-1')); to.focus(); };
    if(e.key==='ArrowRight' || e.key==='ArrowDown'){ go(i+1); return true; }
    if(e.key==='ArrowLeft' || e.key==='ArrowUp'){ go(i-1); return true; }
    if(e.key==='Home'){ go(0); return true; } if(e.key==='End'){ go(all.length-1); return true; }
    const at = el.dataset.id ? byId[el.dataset.id].t : zCenter();
    if(e.key==='+' || e.key==='='){ zZoomAt(at, .5, {msg:'放大'}); return true; }
    if(e.key==='-' || e.key==='_'){ zZoomAt(at, 2, {msg:'縮小'}); return true; }
    if(e.key==='PageUp' || e.key==='PageDown'){ const d = (e.key==='PageDown'?1:-1)*zSpan()/2; zTo(Z.a+d, Z.b+d); return true; }
}

/* ---------- 按鈕、滑桿、選單 ---------- */
document.addEventListener('click', e=>{
  let el;
  if((el = e.target.closest('[data-zoom]'))){ const k = el.dataset.zoom, s = zSpan();
    if(k==='in') zZoomAt(zCenter(), .5, {msg:'放大'}); else if(k==='out') zZoomAt(zCenter(), 2, {msg:'縮小'});
    else if(k==='all') zTo(AX0, AX1, {msg:'看全部'});
    else { const d = (k==='next'?1:-1)*s/2; zTo(Z.a+d, Z.b+d); }
    return; }
  if((el = e.target.closest('[data-cluster]'))){ const [t0,t1] = el.dataset.cluster.split('_').map(Number), s = Math.max(ZMINS, Math.min(zSpan()/2, (t1-t0)*2.4+1));
    zTo((t0+t1)/2-s/2, (t0+t1)/2+s/2, {msg:'放大到這幾件事'}); return; }
});
document.addEventListener('input', e=>{
  if(e.target.id!=='zSlider') return;
  zStop();
  const s = zFromSlider(+e.target.value), c = zCenter(); [Z.a, Z.b] = zClamp(c-s/2, c+s/2); zPaint();
});
document.addEventListener('change', e=>{
  if(e.target.id==='zSlider') return zDone();
  if(e.target.id==='zEra' && e.target.value){ const d = +e.target.value; zTo(Math.max(d,AX0), d+10, {msg:d+'年代'}); }
});

/* ---------- 滑鼠與觸控板：Ctrl＋滾輪縮放、拖曳平移、雙擊放大 ---------- */
const zYearAt = (clientX, svg, pad) => { const r = svg.getBoundingClientRect(); return Z.a+(Z.b-Z.a)*(clientX-r.left-pad)/(r.width-pad*2); };
let zWheelT = null, zHintT = null;
document.addEventListener('wheel', e=>{
  const fig = e.target.closest && e.target.closest('#zFig, #zOvFig'); if(!fig) return;
  if(!(e.ctrlKey || e.metaKey)){
    // 沒按 Ctrl：照常捲動頁面，只提示怎麼縮放
    const h = $('#zHint'); if(h){ h.hidden = false; clearTimeout(zHintT); zHintT = setTimeout(()=>{ h.hidden = true; }, 1600); }
    return; }
  e.preventDefault();
  zStop();
  const svg = $('#zFig svg'); if(!svg) return;
  const t = fig.id==='zOvFig' ? zCenter() : zYearAt(e.clientX, svg, 14), s = Math.min(Math.max(zSpan()*Math.exp(e.deltaY*.0022), ZMINS), ZMAX);
  [Z.a, Z.b] = zClamp(t-(t-Z.a)*s/zSpan(), t-(t-Z.a)*s/zSpan()+s);
  zPaint();
  clearTimeout(zWheelT); zWheelT = setTimeout(()=>zDone(), 260);
}, {passive:false});
let zDrag = null;
document.addEventListener('pointerdown', e=>{
  if(e.button!==0) return;
  const ov = e.target.closest && e.target.closest('#zOv'), bg = e.target.closest && e.target.closest('#zFig .zbg');
  if(!ov && !bg) return;
  zStop();
  const svg = ov || $('#zFig svg'), r = svg.getBoundingClientRect();
  if(ov){
    const pad = 8, t = AX0+(AX1-AX0)*(e.clientX-r.left-pad)/(r.width-pad*2);
    // 按在框外：先把框移過去，接著可以繼續拖
    if(t<Z.a || t>Z.b){ const s = zSpan(); [Z.a, Z.b] = zClamp(t-s/2, t+s/2); zPaint(); }
    zDrag = {x:e.clientX, a:Z.a, b:Z.b, per:(AX1-AX0)/(r.width-pad*2), sign:1, moved:true, el:svg};
  } else zDrag = {x:e.clientX, a:Z.a, b:Z.b, per:zSpan()/(r.width-28), sign:-1, moved:false, el:svg};
  try{ svg.setPointerCapture(e.pointerId); }catch(err){}
  document.body.classList.add('zdragging');
});
document.addEventListener('pointermove', e=>{
  if(!zDrag) return;
  const dx = e.clientX-zDrag.x; if(Math.abs(dx)>3) zDrag.moved = true;
  const d = zDrag.sign*dx*zDrag.per; [Z.a, Z.b] = zClamp(zDrag.a+d, zDrag.b+d); zPaint();
});
const zEndDrag = () => { if(!zDrag) return; const moved = zDrag.moved; zDrag = null; document.body.classList.remove('zdragging'); if(moved) zDone(); };
document.addEventListener('pointerup', zEndDrag);
document.addEventListener('pointercancel', zEndDrag);
document.addEventListener('dblclick', e=>{
  // 拖曳時用了 pointer capture，雙擊的目標會是整張圖，所以只排除事件與「＋N」
  if(!(e.target.closest && e.target.closest('#zFig')) || e.target.closest('[data-x]')) return;
  e.preventDefault(); zZoomAt(zYearAt(e.clientX, $('#zFig svg'), 14), .5, {msg:'放大'});
});
