
/* ============ 共用圖表：折線、堆疊長條、數字表、圓圈圖 ============
   每張圖都依「圖的寬度 W」重新排版，手機上不需要左右捲動 */
// 標出的年代：很淡的底色（淡到不影響線條與長條的對比），橫軸上再畫一條深色的線標出這幾年
const eraBandSvg = (xa,xb,y0,y1) => `<rect class="eband" x="${xa.toFixed(1)}" y="${y0}" width="${(xb-xa).toFixed(1)}" height="${y1-y0}"/><rect class="ecap" x="${xa.toFixed(1)}" y="${y1+1.5}" width="${(xb-xa).toFixed(1)}" height="3" rx="1.5"/>`;
function niceMax(v){ if(!(v>0)) return 1; const p = Math.pow(10,Math.floor(Math.log10(v))), m = v/p; return [1,1.2,1.6,2,2.4,2.8,3.2,4,4.8,6,8,10].find(k=>k>=m-1e-9)*p; }
const LC = {};
// 折線圖：xs 是橫軸的標籤，series 是 [{name,color,vals,bold}]，vals 裡沒有資料的位置放 null
function lineSvg(o){
  const W = Math.max(260, Math.round(o.W||860)), small = W<600, fs = small?11:12;
  const H = o.H||(small?236:300), ends = o.endLabels!==false && !small, fmt = o.fmt||fmtN;
  const maxV = o.max||niceMax(Math.max(...o.series.flatMap(s=>s.vals.filter(v=>v!=null))));
  const L = Math.ceil(textW(fmt(maxV),fs))+14, Rm = ends?140:(small?10:20), T = 16, B = 28, n = o.xs.length;
  const x = i => L+(n>1 ? i*(W-L-Rm)/(n-1) : 0), y = v => T+(H-T-B)*(1-v/maxV);
  let g = '';
  for(let k=0;k<=4;k++){ const v = maxV*k/4, yy = y(v);
    g += `<line x1="${L}" x2="${W-Rm}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-width="1"${k?' stroke-dasharray="2 5"':''}/><text x="${L-8}" y="${yy+4}" text-anchor="end" font-size="${fs}" fill="var(--muted)">${fmt(v)}</text>`; }
  // 橫軸：依寬度決定隔幾格寫一次，最後一格一定寫
  const lw = textW(String(o.xs[0]),fs)+12, every = Math.max(o.xEvery||1, Math.ceil(n*lw/(W-L-Rm)));
  o.xs.forEach((lab,i)=>{ const last = i===n-1; if(!last && (i%every || n-1-i<every*.62)) return;
    g += `<text x="${Math.min(x(i), W-lw/2+4).toFixed(1)}" y="${H-B+18}" text-anchor="middle" font-size="${fs}" fill="var(--muted)">${esc(lab)}</text>`; });
  if(o.band){ const half = n>1 ? (W-L-Rm)/(n-1)/2 : 0, xa = Math.max(L, x(o.band[0])-half), xb = Math.min(W-Rm, x(o.band[1])+half);
    g = eraBandSvg(xa, xb, T-6, H-B)+g; }
  g += `<line class="xh" visibility="hidden" x1="0" x2="0" y1="${T}" y2="${H-B}" stroke="var(--ink)" stroke-width="1" opacity=".5"/>`;
  const endsList = [];
  o.series.forEach(s=>{
    let d = '', pen = false, last = -1;
    s.vals.forEach((v,i)=>{ if(v==null){ pen = false; return; } d += (pen?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1); pen = true; last = i; });
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.bold?3.2:2}" stroke-linejoin="round" stroke-linecap="round"/>`;
    if(o.dots) s.vals.forEach((v,i)=>{ if(v!=null) g += `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="${small?3.5:4.5}" fill="${s.color}" stroke="var(--paper)" stroke-width="2"/>`; });
    if(last>=0){ if(!o.dots) g += `<circle cx="${x(last).toFixed(1)}" cy="${y(s.vals[last]).toFixed(1)}" r="${s.bold?5:4.5}" fill="${s.color}" stroke="var(--paper)" stroke-width="2"/>`;
      endsList.push({s, x:x(last), y:y(s.vals[last]), v:s.vals[last]}); }
  });
  // 交叉點：平常只畫一個圓圈；滑鼠移上去、點一下或用鍵盤聚焦時，才顯示年份與說明
  let marksSvg = '', lastMx = -999, lift = 0;
  (o.marks||[]).forEach((m,k)=>{ const mx = x(m.xi), my = y(m.v), tw = Math.max(textW(m.head,14), textW(m.text,12.5))+4;
    lift = mx-lastMx<tw+24 ? lift+40 : 0; lastMx = mx;          // 兩個交叉點靠得近時，後面那個的文字往上移，避免疊在一起
    let anchor = 'end', tx = mx-16, lx = mx-6;
    if(tx-tw<2){ if(mx+16+tw<=W-2){ anchor = 'start'; tx = mx+16; lx = mx+6; } else { anchor = 'middle'; tx = Math.min(Math.max(mx,tw/2+2), W-tw/2-2); lx = mx; } }
    const ty = Math.max(my-22-lift, 30);
    marksSvg += `<g class="xmark" data-xmark="${k}" tabindex="0" role="button" aria-label="${esc(m.head+' '+m.text)}">
      <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="18" fill="transparent"/>
      <circle class="ring" cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="8" fill="var(--paper)" fill-opacity=".35" stroke="var(--ink)" stroke-width="2"/>
      <g class="xlab"><line x1="${lx.toFixed(1)}" y1="${(my-7).toFixed(1)}" x2="${(anchor==='middle'?mx:tx+(anchor==='end'?2:-2)).toFixed(1)}" y2="${(ty+5).toFixed(1)}" stroke="var(--ink)" stroke-width="1.5"/>
      <text x="${tx.toFixed(1)}" y="${(ty-16).toFixed(1)}" text-anchor="${anchor}" font-size="14" font-weight="700" fill="var(--ink)" stroke="var(--paper)" stroke-width="4" paint-order="stroke">${esc(m.head)}</text>
      <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${anchor}" font-size="12.5" fill="var(--ink2)" stroke="var(--paper)" stroke-width="4" paint-order="stroke">${esc(m.text)}</text></g></g>`; });
  if(ends){
    endsList.sort((a,b)=>a.y-b.y); endsList.forEach((e,i)=>{ e.ly = e.y; if(i && e.ly<endsList[i-1].ly+17) e.ly = endsList[i-1].ly+17; });
    const over = endsList.length ? endsList[endsList.length-1].ly-(H-B) : 0; if(over>0) endsList.forEach(e=>e.ly -= over);
    endsList.forEach(e=>{ g += `<line x1="${e.x+7}" x2="${e.x+12}" y1="${e.y}" y2="${e.ly}" stroke="${e.s.color}" stroke-width="2"/>
      <text x="${e.x+16}" y="${e.ly+4.5}" font-size="13" fill="var(--ink)"${e.s.bold?' font-weight="700"':''}>${esc(e.s.name)} <tspan fill="var(--muted)" font-weight="400">${fmt(e.v)}</tspan></text>`; });
  }
  LC[o.id] = {W, x0:L, x1:W-Rm, n, tips:o.xs.map((lab,i)=>[(o.tipHead?o.tipHead(i):lab)].concat(o.series.filter(s=>s.vals[i]!=null).map(s=>s.name+'　'+fmt(s.vals[i])+(s.tipExtra?s.tipExtra(i):''))).join('\n'))};
  // 窄的時候線的右端寫不下名稱，改在圖的下方列出
  const legend = (!ends && o.series.length>1) ? `<ul class="lgd">${endsList.map(e=>`<li${e.s.bold?' class="bold"':''}><i class="ln" style="background:${e.s.color}"></i>${esc(e.s.name)}<b>${fmt(e.v)}</b></li>`).join('')}</ul>` : '';
  // 有交叉點（可以用鍵盤聚焦的按鈕）的圖，不能整張當成一張圖片：改成一組，線條的部分對報讀軟體隱藏（數字在「看數字表」），交叉點各自有名稱
  const draw = `${g}<rect x="${L}" y="${T}" width="${W-Rm-L}" height="${H-T-B}" fill="transparent"/>`;
  return `<svg class="lc" data-lc="${o.id}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="${marksSvg?'group':'img'}" aria-label="${esc(o.label||'')}">${marksSvg ? `<g aria-hidden="true">${draw}</g>` : draw}${marksSvg}</svg>${legend}`;
}
function lineHover(svg,e){
  const c = LC[svg.dataset.lc]; if(!c) return;
  const r = svg.getBoundingClientRect(), vx = (e.clientX-r.left)/r.width*c.W, step = (c.x1-c.x0)/Math.max(c.n-1,1);
  const i = Math.max(0, Math.min(c.n-1, Math.round((vx-c.x0)/step))), px = c.x0+i*step;
  $$('.xh').forEach(l=>l.setAttribute('visibility','hidden'));
  const xh = svg.querySelector('.xh'); xh.setAttribute('x1',px); xh.setAttribute('x2',px); xh.setAttribute('visibility','visible');
  tipAt(c.tips[i], e.clientX, e.clientY);
}
// 堆疊長條：每年一根，series 由下往上疊
function stackSvg(o){
  const W = Math.max(260, Math.round(o.W||860)), small = W<600, fs = small?11:12, H = o.H||(small?220:280);
  const n = o.years.length, tot = o.years.map((_,i)=>o.series.reduce((a,_,k)=>a+o.val(i,k),0)), maxV = niceMax(Math.max(...tot));
  const L = Math.ceil(textW(String(Math.round(maxV)),fs))+14, Rm = small?4:10, T = 12, B = 28, band = (W-L-Rm)/n, bw = Math.max(band-(band>9?3:band>5?1.5:.8), 1.2);
  const y = v => T+(H-T-B)*(1-v/maxV), every = band*5>=34 ? 5 : 10;
  let g = '';
  for(let k=0;k<=4;k++){ const v = maxV*k/4, yy = y(v);
    g += `<line x1="${L}" x2="${W-Rm}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-width="1"${k?' stroke-dasharray="2 5"':''}/><text x="${L-8}" y="${yy+4}" text-anchor="end" font-size="${fs}" fill="var(--muted)">${Math.round(v)}</text>`; }
  if(o.band) g = eraBandSvg(L+o.band[0]*band, L+(o.band[1]+1)*band, T-6, H-B)+g;
  o.years.forEach((yr,i)=>{
    const bx = L+i*band+(band-bw)/2; let acc = 0, segs = '';
    o.series.forEach((s,k)=>{ const v = o.val(i,k); if(!v) return; const y1 = y(acc+v), h = y(acc)-y1; acc += v;
      segs += `<rect x="${bx.toFixed(1)}" y="${y1.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(h-(h>3?1:0),1).toFixed(1)}" fill="${s.color}"/>`; });
    const tip = yr+' 年：共 '+tot[i]+' '+o.unit+(tot[i] ? '\n'+o.series.map((s,k)=>o.val(i,k)?s.name+'　'+o.val(i,k):null).filter(Boolean).join('\n') : '');
    g += `<g class="colbar" data-tip="${esc(tip)}">${segs}<rect x="${(L+i*band).toFixed(1)}" y="${T}" width="${band.toFixed(1)}" height="${H-T-B}" fill="transparent"/></g>`;
    if(yr%every===0) g += `<text x="${(bx+bw/2).toFixed(1)}" y="${H-B+18}" text-anchor="middle" font-size="${fs}" fill="var(--muted)">${yr}</text>`;
  });
  return `<svg class="sc" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||'')}">${g}</svg>
    <ul class="lgd">${o.series.map((s,k)=>`<li><i style="background:${s.color}"></i>${esc(s.name)}<b>${o.years.reduce((a,_,i)=>a+o.val(i,k),0)} ${o.unit}</b></li>`).join('')}</ul>`;
}
// 數字表：格子的底色越深，代表占那一欄的比例越高。手機上每一列拆成「名稱一行、數字一行」，不用左右捲動
function heatTable(o){
  let mx = 0; o.rows.forEach((_,ri)=>o.cols.forEach((c,ci)=>{ if(c.n) mx = Math.max(mx, o.get(ri,ci)/c.n); }));
  const cell = (ri,ci) => { const c = o.cols[ci], v = o.get(ri,ci), p = c.n ? v/c.n : 0;
    return `<td role="cell"${o.hl===ci?' class="hl"':''} data-h="${esc(c.short||c.name)}" style="--a:${(mx?p/mx*.5:0).toFixed(3)}" data-tip="${esc(o.rows[ri].name+'・'+c.name+'\n'+v+' '+o.unit+'，占這一欄的 '+pct(p))}">${o.asPct ? (v?pct(p):'–') : (v||'–')}${v ? `<span class="vh">（${o.asPct ? v+' '+o.unit : '占 '+pct(p)}）</span>` : ''}</td>`; };
  return `<table class="heat" role="table" style="--cols:${o.cols.length+(o.total?1:0)}"><thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col" class="corner">${esc(o.corner)}</th>${o.cols.map((c,ci)=>`<th role="columnheader" scope="col"${o.hl===ci?' class="hl"':''}>${esc(c.name)}<small>${c.n} ${o.unit}</small></th>`).join('')}${o.total?`<th role="columnheader" scope="col">合計</th>`:''}</tr></thead>
    <tbody role="rowgroup">${o.rows.map((r,ri)=>`<tr role="row"><th role="rowheader" scope="row">${esc(r.name)}${r.sub?`<small>${esc(r.sub)}</small>`:''}</th>${o.cols.map((_,ci)=>cell(ri,ci)).join('')}${o.total?`<td role="cell" data-h="合計" class="tot">${o.total(ri)}</td>`:''}</tr>`).join('')}</tbody></table>`;
}
function sparkSvg(vals){
  const W = 240, H = 64, mx = Math.max(...vals), x = i => 6+i*(W-12)/(vals.length-1), y = v => H-8-v/mx*(H-16);
  const pts = vals.map((v,i)=>x(i).toFixed(1)+','+y(v).toFixed(1));
  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false"><polygon points="6,${H-8} ${pts.join(' ')} ${W-6},${H-8}" fill="var(--rose)" opacity=".14"/><polyline points="${pts.join(' ')}" fill="none" stroke="var(--rose)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(0)}" cy="${y(vals[0])}" r="4" fill="var(--paper)" stroke="var(--rose)" stroke-width="2.5"/><circle cx="${x(vals.length-1)}" cy="${y(vals[vals.length-1])}" r="4" fill="var(--rose)"/></svg>`;
}

/* ============ 圓圈圖 ============
   中間一個圓，圓的外面平分成幾格；每一格從圓的邊緣往外凸，凸出的面積和比例成正比。
   圖上只寫類別名稱；數字只有一組，寫在圓的中間（平常是比例最高的一格，滑鼠移到哪一格就換成哪一格）。
   kind：big＝大圈（可以點每一格）　mini＝年代的小圈（中間寫年代）　glyph＝更小的示意圈 */
const DIM = {
  view:{name:'觀點', one:'一種觀點', short:RAW.viewShort},
  topic:{name:'主題', one:'一類主題', short:{'政策公告及回應':'政策公告','障礙者/家庭故事':'家庭故事','善心人士/志工經驗分享':'志工分享'}},
  term:{name:'用詞', one:'一個詞', short:{}}
};
const topicGroup = t => t.startsWith('專家學者') ? '專家學者' : t.startsWith('表揚') ? '表揚' : t.split('-')[0];
const codesOf = (a,dim,both) => dim==='view' ? (both?[a.v,a.v2]:[a.v]).filter(v=>v&&v!=='無') : dim==='topic' ? a.pg : a.wg;
// 每種編碼的類別，依「平均出現的年份」由早到晚排，圓圈上就照這個順序順時針排
const CATS = {};
Object.keys(DIM).forEach(dim=>{
  const sum = {}, cnt = {};
  NEWS.forEach(a=>codesOf(a,dim,false).forEach(c=>{ sum[c] = (sum[c]||0)+a.y; cnt[c] = (cnt[c]||0)+1; }));
  CATS[dim] = Object.keys(cnt).sort((p,q)=>(p==='其他用詞')-(q==='其他用詞') || sum[p]/cnt[p]-sum[q]/cnt[q]).map(k=>({k, short:DIM[dim].short[k]||k, mean:sum[k]/cnt[k]}));
});
function newsStats(dim,era,both){
  const A = era==null ? NEWS : NEWS.filter(a=>a.dec===era), count = {};
  CATS[dim].forEach(c=>count[c.k] = 0);
  A.forEach(a=>new Set(codesOf(a,dim,both)).forEach(c=>{ if(c in count) count[c]++; }));
  const n = A.length; let top = null;
  CATS[dim].forEach(c=>{ if(count[c.k] && (!top || count[c.k]>count[top])) top = c.k; });
  return {n, count, top, share:k=>n?count[k]/n:0, none:dim==='view' ? A.filter(a=>!codesOf(a,'view',both).length).length : 0};
}
// 刻度：所有圓圈裡最高的比例，往上取到 5% 的倍數；每個圓圈都用同一個刻度
function newsScale(dim,both){
  let m = 0; [null].concat(DECADES).forEach(e=>{ const s = newsStats(dim,e,both); CATS[dim].forEach(c=>{ m = Math.max(m, s.share(c.k)); }); });
  return Math.max(.2, Math.ceil(m*20-1e-9)/20);
}
const eraName = e => e==null ? '全部年代' : e+'年代';
function roseSvg(dim,st,max,o){
  o = o||{};
  const cats = CATS[dim], N = cats.length, kind = o.kind||'mini', big = kind==='big', glyph = kind==='glyph';
  const W = big ? Math.max(300, Math.round(o.W||560)) : glyph ? 56 : 160, narrow = big && W<460;
  const R = big ? Math.max(84, Math.min(150, (W-2*(narrow?76:134))/2)) : glyph ? 26 : 74;
  const H = big ? Math.round(2*R+(narrow?74:86)) : W;
  const r0 = big ? Math.round(R*(narrow?.385:.345)) : glyph ? 7 : 25, gap = big?2.6:glyph?1:1.7, q = big?7:glyph?2:4, cx = W/2, cy = H/2, fs = narrow?12:13.5;
  const step = 2*Math.PI/N, A0 = -Math.PI/2, f = v => v.toFixed(1);
  const P = (r,a) => f(cx+r*Math.cos(a))+' '+f(cy+r*Math.sin(a));
  const off = r => Math.asin(Math.min(1, gap/(2*r)));            // 格子之間留一樣寬的縫
  const sector = (ra,rb,a0,a1) => {
    const rho = Math.max(0, Math.min(q,(rb-ra)/2)), d = rho/rb, rm = Math.max(rb-rho,ra);
    return `M${P(ra,a0+off(ra))} L${P(rm,a0+off(rm))} Q${P(rb,a0+off(rb))} ${P(rb,a0+off(rb)+d)} A${f(rb)} ${f(rb)} 0 0 1 ${P(rb,a1-off(rb)-d)} Q${P(rb,a1-off(rb))} ${P(rm,a1-off(rm))} L${P(ra,a1-off(ra))} A${f(ra)} ${f(ra)} 0 0 0 ${P(ra,a0+off(ra))} Z`;
  };
  const wedge = (ra,rb,a0,a1) => `M${P(ra,a0)} L${P(rb,a0)} A${f(rb)} ${f(rb)} 0 0 1 ${P(rb,a1)} L${P(ra,a1)} A${f(ra)} ${f(ra)} 0 0 0 ${P(ra,a0)} Z`;
  const rOf = v => Math.sqrt(r0*r0+(R*R-r0*r0)*Math.min(v/max,1));
  const en = eraName(o.era), cur = o.sel||st.top;
  let g = '';
  cats.forEach((c,i)=>{
    const a0 = A0+i*step, a1 = a0+step, v = st.share(c.k), cnt = st.count[c.k];
    const on = o.sel ? o.sel===c.k : st.top===c.k, op = o.sel ? (on?1:.22) : (on?1:.72);
    const body = `<path class="trk" d="${sector(r0,R,a0,a1)}"/>`+(v>0 ? `<path class="pet" d="${sector(r0,Math.max(rOf(v),r0+(big?4:2)),a0,a1)}" opacity="${op}"/>` : '');
    if(!big){ g += body; return; }
    const am = a0+step/2, co = Math.cos(am), si = Math.sin(am), lx = cx+(R+11)*co, ly = cy+(R+11)*si;
    const anchor = co>.25?'start':co<-.25?'end':'middle', dy = si<-.6?-5:si>.6?fs+1:fs*.36;
    const tw = textW(c.short,fs), bx = anchor==='start' ? lx-7 : anchor==='end' ? lx-tw-7 : lx-tw/2-7;
    g += `<g class="slot${on?' cur':''}" data-cat="${esc(c.k)}" data-p="${pct(v)}" data-c="${cnt} 篇" tabindex="0" role="button" aria-pressed="${o.sel===c.k}" aria-label="${esc(en+'，'+c.short+(c.short!==c.k ? '（'+c.k+'）' : '')+'，'+cnt+' 篇，'+pct(v))}">${body}
      <rect class="rl-bg" x="${f(bx)}" y="${f(ly+dy-fs-1.5)}" width="${f(tw+14)}" height="${f(fs+8)}" rx="${f((fs+8)/2)}"/>
      <text class="rl${o.sel&&!on?' off':''}" x="${f(lx)}" y="${f(ly+dy)}" text-anchor="${anchor}" font-size="${fs}">${esc(c.short)}</text>
      <path class="hit" d="${wedge(r0,R+(narrow?30:42),a0,a1)}"/></g>`;
  });
  let center = '', defs = '';
  if(big){
    const k = r0/52, c = cur ? cats.find(x=>x.k===cur) : null, dp = c ? pct(st.share(cur)) : '', dc = c ? st.count[cur]+' 篇' : '沒有資料';
    defs = ` data-cur="${esc(cur||'')}" data-p="${dp}" data-c="${dc}"`;
    center = `<circle class="hub" cx="${cx}" cy="${cy}" r="${f(r0-gap)}"/><g aria-hidden="true">
      <text class="rc-v" x="${cx}" y="${f(cy+5*k)}" text-anchor="middle" font-size="${f(29*k)}">${dp}</text>
      <text class="rc-c" x="${cx}" y="${f(cy+24*k)}" text-anchor="middle" font-size="${f(Math.max(10.5,12*k))}">${dc}</text></g>`;
  } else if(glyph) center = `<circle class="dot" cx="${cx}" cy="${cy}" r="${r0-2}"/>`;
  else center = `<circle class="hub" cx="${cx}" cy="${cy}" r="${f(r0-gap)}"/>`+(o.era==null ? '' : `<text class="rc-y" x="${cx}" y="${cy+4.6}" text-anchor="middle" font-size="13">${o.era}</text>`);
  return `<svg class="rose ${kind}" viewBox="0 0 ${W} ${H}"${big?` width="${W}" height="${H}"`:''}${o.hidden ? ' aria-hidden="true" focusable="false"' : ` role="${big?'group':'img'}" aria-label="${esc(en+'的'+DIM[dim].name+'分布，共 '+st.n+' 篇')}"`}${defs}>${g}${center}</svg>`;
}
// 大圈中間的數字：滑鼠或鍵盤移到哪一格就寫哪一格，離開後回到原本那一格
function roseCenter(svg,slot){
  const d = slot ? slot.dataset : svg.dataset, set = (c,v) => { const el = svg.querySelector(c); if(el) el.textContent = v||''; };
  set('.rc-v',d.p); set('.rc-c',d.c);
  const key = slot ? d.cat : d.cur;                    // 外圈標成深色的名稱，跟著中間的數字換
  svg.querySelectorAll('.slot').forEach(s=>s.classList.toggle('cur', s.dataset.cat===key));
  if(typeof onRoseCur==='function') onRoseCur(svg, slot ? key : null);
}
(function(){
  const slotOf = t => t && t.closest ? t.closest('.rose.big .slot') : null;
  document.addEventListener('pointerover', e=>{ const s = slotOf(e.target); if(s) roseCenter(s.ownerSVGElement, s); });
  document.addEventListener('pointerout', e=>{ const s = slotOf(e.target); if(s && !slotOf(e.relatedTarget)) roseCenter(s.ownerSVGElement, null); });
  document.addEventListener('focusin', e=>{ const s = slotOf(e.target); if(s) roseCenter(s.ownerSVGElement, s); });
  document.addEventListener('focusout', e=>{ const s = slotOf(e.target); if(s && !slotOf(e.relatedTarget)) roseCenter(s.ownerSVGElement, null); });
})();
