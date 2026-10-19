/* ============ 版本 7：概覽＋細節＋語意縮放 ============
   上方是全時段的概覽列（每年的剪報篇數＋事件刻痕），框起來的是主視窗目前的範圍。
   縮放不只是放大：全覽只寫出最重要的事件，二十年寫出重要度 2 以上，十年與五年寫出全部；放不下的合併成「＋N」。
   拖曳與滾輪都不需要：平移、縮放、年代都有按鈕或選單（2.5.7）。 */
const Z = {span:64, c:(AX0+AX1)/2};
const ZSPANS = [[64,'全覽（1962–2025）'],[20,'二十年'],[10,'十年'],[5,'五年']];
const zRange = () => { const a = Math.min(Math.max(Z.c-Z.span/2, AX0), AX1-Z.span); return [a, a+Z.span]; };
const zMin = () => Z.span>=20 ? (Z.span>=64 ? 3 : 2) : 1;          // 這個層級寫出名稱的重要度門檻
function zSet(span, c, msg){
  Z.span = span; if(c!=null) Z.c = c; Z.c = (zRange()[0]+zRange()[1])/2;
  render(); const [a,b] = zRange(), n = shown().filter(e=>e.t>=a && e.t<b).length;
  say((msg ? msg+'。' : '')+'顯示 '+Math.floor(a)+'–'+(Math.ceil(b)-1)+' 年，'+n+' 件事件');
}
const zStep = d => { const i = ZSPANS.findIndex(s=>s[0]===Z.span); return ZSPANS[Math.min(Math.max(i+d,0),ZSPANS.length-1)][0]; };
function zOverview(W){
  const H = 62, X = t => 8+(W-16)*(t-AX0)/(AX1-AX0), max = Math.max(...Object.values(NEWS_BY_Y)), [a,b] = zRange(); let g = '';
  Object.keys(NEWS_BY_Y).forEach(y=>{ const h = 30*NEWS_BY_Y[y]/max; g += `<rect x="${f1(X(+y)+.5)}" y="${f1(36-h)}" width="${f1(Math.max(1,X(+y+1)-X(+y)-1))}" height="${f1(h)}" fill="var(--ink)" fill-opacity=".28"/>`; });
  shown().forEach(e=>{ g += `<rect x="${f1(X(e.t)-1)}" y="40" width="2.4" height="10" fill="${colorOf(e.track)}"/>`; });
  DECADES.forEach(d=>{ const t = Math.max(d,AX0); g += `<text class="yr" x="${f1(X(t)+2)}" y="${H-1}" font-size="10.5">${t}</text>`; });
  g += `<rect class="zwin" x="${f1(X(a))}" y="2" width="${f1(X(b)-X(a))}" height="50" rx="4"/>`;
  return `<svg class="zov" id="zOv" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${g}</svg>`;
}
function zMain(W){
  const [a,b] = zRange(), X = t => 14+(W-28)*(t-a)/(b-a), AXY = 30, CH = 46, RG = 52, MAXR = 5;
  const ev = shown().filter(e=>e.t>=a && e.t<b), need = zMin();
  let g = '';
  // 刻度：依範圍決定間隔
  const step = Z.span>=64 ? 10 : Z.span>=20 ? 5 : 1;
  for(let y=Math.ceil(a/step)*step; y<b; y+=step){ const x = X(y), big = y%10===0;
    g += `<line x1="${f1(x)}" x2="${f1(x)}" y1="${AXY-6}" y2="${AXY}" stroke="var(--ink)" stroke-opacity=".5"/><line x1="${f1(x)}" x2="${f1(x)}" y1="${AXY}" y2="2000" stroke="var(--ink)" stroke-opacity="${big?.13:.06}"/>`;
    if(step>1 || Z.span<=5 || y%2===0) g += `<text class="yr" x="${f1(x+3)}" y="${AXY-9}" font-size="${big?12:11}"${big?' font-weight="700"':''}>${y}</text>`; }
  g += `<line x1="0" x2="${W}" y1="${AXY}" y2="${AXY}" stroke="var(--ink)" stroke-opacity=".5"/>`;
  // 寫出名稱的卡片：重要的先排，最多 5 列；排不下的併到下方的記號或「＋N」
  const rows = Array.from({length:MAXR}, ()=>[]), card = {}, loose = [];
  ev.slice().sort((p,q)=>(q.id===S.e)-(p.id===S.e) || q.importance-p.importance || p.t-q.t).forEach(e=>{
    if(e.importance<need && e.id!==S.e){ loose.push(e); return; }
    const w = Math.min(Math.max(textW(e.title,13), textW(whenShort(e),11.5))+24, 210), x = Math.min(Math.max(X(e.t)-w/2, 2), W-w-2);
    const r = rows.findIndex(R=>R.every(([p,q])=>x+w+6<p || x>q+6));
    if(r<0){ loose.push(e); return; } rows[r].push([x,x+w]); card[e.id] = {x, w, r};
  });
  const used = Math.max(0, ...Object.values(card).map(c=>c.r+1)), LY = AXY+18+used*RG+18;
  const items = [];
  ev.filter(e=>card[e.id]).forEach(e=>{ const c = card[e.id], x = X(e.t), y = AXY+14+c.r*RG, on = S.e===e.id, lim = Math.floor((c.w-22)/13);
    const title = textW(e.title,13)>c.w-22 ? [...e.title].slice(0, lim-1).join('')+'…' : e.title;
    items.push({x, html:`<g class="ev card${on?' on':''}" data-id="${e.id}" data-x="${f1(x)}" role="button" tabindex="-1" aria-pressed="${on}" aria-label="${esc(evLabel(e))}" style="--c:${colorOf(e.track)}">
      <line x1="${f1(x)}" x2="${f1(x)}" y1="${AXY}" y2="${y}" stroke="${colorOf(e.track)}" stroke-opacity=".7"/>${mark(TRACKS[e.track].shape, x, AXY, 5, 'class="mk"')}
      <rect class="lb" x="${f1(c.x)}" y="${y}" width="${f1(c.w)}" height="${CH}" rx="7"/><rect x="${f1(c.x)}" y="${y}" width="4" height="${CH}" rx="2" fill="${colorOf(e.track)}"/>
      <text class="yr" x="${f1(c.x+12)}" y="${y+17}" font-size="11.5">${esc(whenShort(e))}</text><text class="lt" x="${f1(c.x+12)}" y="${y+36}" font-size="13">${esc(title)}</text></g>`}); });
  // 沒寫名稱的：靠得很近的合併成「＋N」，按了放大到那一段
  const L = loose.sort((p,q)=>p.t-q.t), groups = [];
  L.forEach(e=>{ const g0 = groups[groups.length-1]; if(g0 && X(e.t)-X(g0[g0.length-1].t)<30) g0.push(e); else groups.push([e]); });
  groups.forEach(G=>{ const x = G.reduce((s,e)=>s+X(e.t),0)/G.length;
    if(G.length===1){ const e = G[0], on = S.e===e.id;
      items.push({x, html:`<g class="ev dot${on?' on':''}" data-id="${e.id}" data-x="${f1(x)}" role="button" tabindex="-1" aria-pressed="${on}" aria-label="${esc(evLabel(e))}" data-tip="${esc(e.title+'\n'+whenLong(e))}" style="--c:${colorOf(e.track)}"><rect class="hit" x="${f1(x-13)}" y="${LY-13}" width="26" height="26" rx="6"/>${mark(TRACKS[e.track].shape, x, LY, 6, 'class="mk"')}</g>`}); return; }
    const t0 = G[0].t, t1 = G[G.length-1].t, ya = Math.floor(t0), yb = Math.floor(t1);
    items.push({x, html:`<g class="clu" data-cluster="${f1(t0)}_${f1(t1)}" data-x="${f1(x)}" role="button" tabindex="-1" aria-label="${G.length} 件事件，${ya===yb ? ya+' 年' : ya+' 到 '+yb+' 年'}，按一下放大" data-tip="${esc(G.length+' 件事件（'+(ya===yb?ya:ya+'–'+yb)+'）\n'+G.slice(0,4).map(e=>e.title).join('\n')+(G.length>4?'\n…':'')+'\n按一下放大')}">
      <circle class="hit" cx="${f1(x)}" cy="${LY}" r="15"/><circle cx="${f1(x)}" cy="${LY}" r="13" class="cb"/><text x="${f1(x)}" y="${LY+4.5}" text-anchor="middle" font-size="12" font-weight="700">+${G.length}</text></g>`}); });
  // 十年以下：加一條剪報的刻痕，看出那幾年的報導多寡
  let NY = LY;
  if(Z.span<=10){ NY = LY+40; const A = NEWS.filter(n=>{ const t = n.y+((+n.d.slice(5,7)||1)-1)/12; return t>=a && t<b; });
    g += `<text class="lnm" x="14" y="${NY-12}" font-size="11.5">這段期間的剪報：${A.length} 篇</text>`;
    A.forEach(n=>{ const t = n.y+((+n.d.slice(5,7)||1)-1)/12+((+n.d.slice(8,10)||1)-1)/372; g += `<line x1="${f1(X(t))}" x2="${f1(X(t))}" y1="${NY-4}" y2="${NY+8}" stroke="var(--c-news)" stroke-width="1.4"/>`; }); }
  const H = NY+24;
  items.sort((p,q)=>p.x-q.x).forEach(it=>{ g += it.html; });
  return `<svg class="tsvg zoom" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" aria-roledescription="可縮放的時間軸" aria-describedby="zHelp" aria-label="${Math.floor(a)} 到 ${Math.ceil(b)-1} 年的事件，${ev.length} 件">${g}</svg>`;
}
VERS.push({id:'zoom', no:'版本 7', name:'概覽＋細節＋語意縮放',
  basis:'Shneiderman「先概覽、縮放與篩選、再按需求看細節」；第一部分 3.2 概覽＋細節、3.3 語意縮放、3.5 群集與重要度分級；第三部分 4.5 的 2.5.7 拖曳替代。',
  fit:'200 件以上、以探索為主；這裡加上 738 篇剪報的密度，示範資料量大時的做法。',
  tradeoff:'一次只看一段時間，要靠概覽列維持方位感；操作比其他版本多一層。',
  keys:'Tab 進入圖；左右鍵在事件與「＋N」之間移動，Enter 看說明或放大；圖有焦點時，＋／－ 縮放，PageUp／PageDown 往前或往後一段。',
  draw(root){
    if(S.e){ const e = byId[S.e], [a,b] = zRange(); if(e.t<a || e.t>=b) Z.c = e.t; }
    const [a,b] = zRange(), first = Z.span===64, last = Z.span===5;
    root.innerHTML = `<div class="plate zbox">
      <div class="zctl" role="group" aria-label="平移與縮放">
        <button class="btn" data-zoom="prev"${a<=AX0?' disabled':''}>‹ 往前</button>
        <button class="btn" data-zoom="out"${first?' disabled':''} aria-label="縮小">－</button>
        <label class="zsel"><span class="vh">縮放層級</span><select id="zLevel">${ZSPANS.map(s=>`<option value="${s[0]}"${s[0]===Z.span?' selected':''}>${s[1]}</option>`).join('')}</select></label>
        <button class="btn" data-zoom="in"${last?' disabled':''} aria-label="放大">＋</button>
        <button class="btn" data-zoom="next"${b>=AX1?' disabled':''}>往後 ›</button>
        <label class="zsel"><span class="lbl">年代</span><select id="zEra"><option value="">選一個年代</option>${DECADES.map(d=>`<option value="${d}">${d}年代</option>`).join('')}</select></label>
      </div>
      <p class="zrange"><b>${Math.floor(a)}–${Math.ceil(b)-1} 年</b>　${Z.span>=64 ? '只寫出最重要的事件' : Z.span>=20 ? '寫出重要度 2 以上的事件' : '寫出全部事件，下方加上剪報的刻痕'}；其他的合併成「＋N」，按了放大。</p>
      <div class="zovw"><span class="lbl">概覽：每年的剪報篇數與事件刻痕（按一下移到那一年）</span><div id="zOvFig"></div></div>
      <p class="vh" id="zHelp">左右鍵移動，Enter 看說明或放大，加號與減號縮放，PageUp 與 PageDown 往前或往後一段。</p>
      <div class="tl-fig" id="zFig"></div></div>`;
    const W = Math.floor($('#zFig').clientWidth);
    $('#zOvFig').innerHTML = zOverview(W); $('#zFig').innerHTML = zMain(W);
    const all = $$('#zFig [data-x]'), cur = all.find(x=>x.dataset.id===S.e) || all[0]; if(cur) cur.setAttribute('tabindex','0');
  },
  onJump(y){ Z.span = 10; Z.c = y+5; },
  onKey(e){
    const el = e.target.closest && e.target.closest('#zFig [data-x]'); if(!el) return;
    const all = $$('#zFig [data-x]'), i = all.indexOf(el);
    const go = j => { const to = all[Math.min(Math.max(j,0),all.length-1)]; all.forEach(x=>x.setAttribute('tabindex', x===to?'0':'-1')); to.focus(); };
    if(e.key==='ArrowRight' || e.key==='ArrowDown'){ go(i+1); return true; }
    if(e.key==='ArrowLeft' || e.key==='ArrowUp'){ go(i-1); return true; }
    if(e.key==='Home'){ go(0); return true; } if(e.key==='End'){ go(all.length-1); return true; }
    if(e.key==='+' || e.key==='='){ zSet(zStep(1), null, '放大'); zFocusFig(); return true; }
    if(e.key==='-' || e.key==='_'){ zSet(zStep(-1), null, '縮小'); zFocusFig(); return true; }
    if(e.key==='PageUp' || e.key==='PageDown'){ zSet(Z.span, Z.c+(e.key==='PageDown'?1:-1)*Z.span/2); zFocusFig(); return true; }
  }
});
const zFocusFig = () => { const t = $('#zFig [tabindex="0"]'); if(t) t.focus({preventScroll:true}); };
document.addEventListener('click', e=>{
  if(S.v!=='zoom') return; let el;
  if((el = e.target.closest('[data-zoom]'))){ const k = el.dataset.zoom;
    if(k==='in') zSet(zStep(1), null, '放大'); else if(k==='out') zSet(zStep(-1), null, '縮小');
    else zSet(Z.span, Z.c+(k==='next'?1:-1)*Z.span/2);
    const b = $('[data-zoom="'+k+'"]'); if(b && b.disabled){ const o = $('[data-zoom="'+({in:'out',out:'in',prev:'next',next:'prev'})[k]+'"]'); if(o) o.focus(); }
    return; }
  if((el = e.target.closest('[data-cluster]'))){ const [t0,t1] = el.dataset.cluster.split('_').map(Number);
    let s = zStep(1); while(s>5 && s>(t1-t0)*2.2) s = ZSPANS[ZSPANS.findIndex(x=>x[0]===s)+1][0];
    zSet(s, (t0+t1)/2, '放大到這幾件事'); zFocusFig(); return; }
  if(e.target.closest('#zOv')){ const r = $('#zOv').getBoundingClientRect(), t = AX0+(AX1-AX0)*(e.clientX-r.left-8)/(r.width-16); zSet(Z.span, t); }
});
document.addEventListener('change', e=>{
  if(e.target.id==='zLevel'){ zSet(+e.target.value, null); const s = $('#zLevel'); if(s) s.focus(); }
  if(e.target.id==='zEra' && e.target.value){ zSet(10, +e.target.value+5); const s = $('#zEra'); if(s) s.focus(); }
});
