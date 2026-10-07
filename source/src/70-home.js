
/* ============ 導覽（首頁）：一棵隨年代長出來的事件樹，下面是各展區的目錄 ============ */
function heroTreeSvg(){
  const big = vw()<720, k = big?1.45:1;                 // 手機上整張圖會縮小，字和節點先放大
  const W = 560, H = 470, L = big?58:44, Rm = 14, T = big?40:30, base = H-14, f = v => v.toFixed(1);
  const yOf = y => base-(y-Y0)/(Y1-Y0)*(base-T);
  const at = y => (Math.max(y-Y0,0)/(Y1-Y0)*2.6).toFixed(2);            // 動畫：年份越晚，越晚長出來
  const tl = L+50, tr = W-Rm-44, colW = (tr-tl)/Math.max(LEAFN-1,1), pos = {};
  EVENTS.forEach(e=>{ pos[e.id] = {x:tl+COL[e.id]*colW, y:e.id==='root' ? base : yOf(e.t)}; });
  const hue = t => ({iq:'var(--hero-a)', ab:'var(--hero-c)', law:'var(--hero-b)'})[t]||'var(--hero-fg)';
  let g = '';
  // 背景：報紙用詞的比例
  const samp = []; for(let k=0;k<=110;k++){ const yv = Y0+(DATA_END-Y0)*k/110; samp.push({y:yOf(yv), sh:shares(yv)}); }
  STACK.forEach((t,i)=>{ const l = samp.map(p=>f(L+p.sh[i][0]*(W-Rm-L))+','+f(p.y)), r = samp.map(p=>f(L+p.sh[i][1]*(W-Rm-L))+','+f(p.y)).reverse();
    g += `<polygon points="${l.concat(r).join(' ')}" fill="var(--hero-fg)" opacity="${[.05,.09,.14,.2][Math.min(i,3)]}"/>`; });
  g += `<line x1="${L}" x2="${W-Rm}" y1="${f(yOf(DATA_END))}" y2="${f(yOf(DATA_END))}" stroke="var(--hero-mut)" stroke-width="1" stroke-dasharray="5 4" opacity=".7"/>`;
  for(let d=1970; d<=2020; d+=10) g += `<line x1="${L}" x2="${W-Rm}" y1="${f(yOf(d))}" y2="${f(yOf(d))}" stroke="var(--hero-fg)" stroke-width="1" opacity=".14"/><text x="${L-8}" y="${f(yOf(d)+4)}" text-anchor="end" font-size="${f(11.5*k)}" fill="var(--hero-mut)">${d}</text>`;
  // 三個分支的枝條
  const {junc, segs} = treeSegments(EVENTS, pos, ks=>base-Math.max(10,(base-Math.max(...ks.map(e=>pos[e.id].y)))*.5));
  segs.forEach(s=>{ const fromRoot = s.from==='root', t0 = fromRoot ? Y0 : byId[s.from].t;
    const d = s.to ? (fromRoot ? '.3' : at(t0)) : '0', dur = s.to ? Math.max(at(byId[s.to].t)-at(t0), .25).toFixed(2) : '.35';
    g += `<path class="grow" pathLength="1" style="--d:${d}s;--t:${dur}s" d="${curveD(s.a,s.b)}" fill="none" stroke="${hue(s.theme)}" stroke-width="${f(Math.max(2.6,s.w*.92)*(big?1.25:1))}" stroke-linecap="round" opacity=".85"/>`; });
  Object.keys(junc).forEach(t=>{ g += `<circle cx="${f(junc[t].x)}" cy="${f(junc[t].y)}" r="4.5" fill="${hue(t)}"/>`; });
  g += `<circle cx="${f(pos.root.x)}" cy="${f(pos.root.y)}" r="5.5" fill="var(--hero-fg)"/>`;
  ORDER.forEach(id=>{ const e = byId[id], p = pos[id];
    g += `<g class="pop" style="--d:${at(e.t)}s" data-tip="${esc(e.title+'\n'+whenLong(e))}">${mark(shapeOf(e),p.x,p.y,big?8:6.2,`fill="var(--hero-bg)" stroke="${hue(e.theme)}" stroke-width="${big?3.4:2.6}"`)}<circle cx="${f(p.x)}" cy="${f(p.y)}" r="13" fill="transparent"/></g>`; });
  // 每一支的名稱
  const groups = TKEYS.map(t=>({name:THEMES[t].name, ev:EVENTS.filter(e=>e.theme===t)}));
  groups.forEach(gr=>{ if(!gr.ev.length) return; const lf = gr.ev.filter(e=>!kidsOf(e.id).length), xs = lf.map(e=>pos[e.id].x), top = Math.min(...gr.ev.map(e=>pos[e.id].y));
    g += `<text class="pop" style="--d:${at(Math.max(...gr.ev.map(e=>e.t)))}s" x="${f((Math.min(...xs)+Math.max(...xs))/2)}" y="${f(top-(big?18:15))}" text-anchor="middle" font-size="${f(12.5*k)}" font-weight="700" fill="var(--hero-fg)">${esc(gr.name)}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${g}</svg>`;
}
// 目錄裡的縮圖
function miniTimelineSvg(){        // 時間軸：事件依年份排在三條線上，一個分支一條
  const W = 300, H = 64, x = t => 12+(t-Y0)/(Y1-Y0)*(W-24), rows = {iq:16, ab:32, law:48};
  let g = '';
  for(let d=1970; d<=2020; d+=10) g += `<line x1="${x(d).toFixed(1)}" x2="${x(d).toFixed(1)}" y1="9" y2="${H-9}" stroke="var(--line)" stroke-width="1"/>`;
  Object.keys(rows).forEach(k=>{ g += `<line x1="12" x2="${W-12}" y1="${rows[k]}" y2="${rows[k]}" stroke="var(--c-${k})" stroke-width="2" opacity=".4"/>`; });
  ORDER.forEach(id=>{ const e = byId[id]; g += mark(shapeOf(e), x(e.t), rows[e.theme], 4.4, `fill="var(--paper)" stroke="var(--c-${e.theme})" stroke-width="2"`); });
  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${g}</svg>`;
}
function miniBarsSvg(){            // 研究：每年的研究篇數
  const y0 = LIT[0].y, y1 = LIT[LIT.length-1].y, n = y1-y0+1, c = new Array(n).fill(0); LIT.forEach(r=>c[r.y-y0]++);
  const W = 300, H = 64, mx = Math.max(...c), bw = (W-24)/n;
  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false"><line x1="12" x2="${W-12}" y1="${H-7.5}" y2="${H-7.5}" stroke="var(--line2)" stroke-width="1"/>${c.map((v,i)=>v ? `<rect x="${(12+i*bw+.7).toFixed(1)}" y="${(H-8-v/mx*(H-16)).toFixed(1)}" width="${(bw-1.4).toFixed(1)}" height="${(v/mx*(H-16)).toFixed(1)}" fill="var(--rose)" opacity=".85"/>` : '').join('')}</svg>`;
}
DRAW.home = function(){
  heroEl.innerHTML = `<div class="wrap hero-in">
    <div class="hero-txt">
      <h1 class="hero-title" id="heroTitle" tabindex="-1">${esc(byId.root.title)}<br>事件樹</h1>
      <p class="hero-facts">${NEWS[0].y} 年到 2024 年：${ORDER.length} 件重大事件，${NEWS.length} 篇剪報，${LIT.length} 篇研究。</p>
    </div>
    <a class="hero-art" href="#tree" data-go="tree"><span class="vh">進入時間軸：${ORDER.length} 件重大事件</span>${heroTreeSvg()}</a>
  </div>`;
  const P = PEOPLE.nation.ID, ys = Object.keys(P).map(Number).sort((a,b)=>a-b), max = newsScale('view',false), sampleP = PHOTOS.some(p=>p.sample), sampleA = INTERVIEWS.some(a=>a.sample);
  const rows = [
    ['tree','01','時間軸', `重大事件表的 ${ORDER.length} 件事，分成智力測驗、適應行為量表、法規與鑑定三個分支；背景是同一時間報紙用詞的比例。`,
      `<span class="th-line">${miniTimelineSvg()}</span><span class="th-cap"><span>${Y0}</span><span>2024</span></span>`],
    ['people','02','人數', '各障別的特教學生人數，以及衛福部的智能障礙總人數。',
      `<span class="th-line">${sparkSvg(ys.map(y=>P[y]))}</span><span class="th-cap"><span><b>${fmtN(P[ys[0]])}</b>${ys[0]} 年</span><span>全台智能障礙學生人數</span><span><b>${fmtN(P[ys[ys.length-1]])}</b>${ys[ys.length-1]} 年</span></span>`],
    ['research','03','研究', `${LIT.length} 篇學術文獻的編碼：研究設計、研究主題與使用的名詞。`,
      `<span class="th-line">${miniBarsSvg()}</span><span class="th-cap"><span>${LIT[0].y}</span><span>每年的研究篇數</span><span>${LIT[LIT.length-1].y}</span></span>`],
    ['news','04','剪報', `${NEWS.length} 篇報紙新聞，每個年代一圈。凸出越多，代表那種觀點的比例越高。`,
      `<span class="th-roses">${DECADES.map(d=>`<span>${roseSvg('view',newsStats('view',d,false),max,{era:d, kind:'glyph', hidden:true})}<i>${d}</i></span>`).join('')}</span>`],
    ['photos','05','照片', PHOTOS.length && !sampleP ? PHOTOS.length+' 張照片，以投影片播放。' : '一張一張播放的照片投影片。目前是版面示意。',
      `<span class="th-photos">${PHOTOS.slice(0,4).map(p=>`<img src="${esc(p.src)}" alt="">`).join('')}</span>`],
    ['audio','06','訪談', INTERVIEWS.length && !sampleA ? INTERVIEWS.length+' 段訪談錄音與逐字稿。' : '錄音與同步的逐字稿。目前是版面示意。',
      `<span class="th-wave">${wavePeaks(1,56).map(v=>`<i style="height:${Math.round(v*100)}%"></i>`).join('')}</span>`],
    ['about','','關於', '計畫資訊、資料來源與整理方式、圖表怎麼看、無障礙說明。', '']
  ];
  view.innerHTML = `<div class="wrap"><section class="dir" aria-labelledby="dirTitle">
    <h2 id="dirTitle">展區</h2>
    <ol>${rows.map(r=>`<li><a class="dir-row${r[4]?'':' plain'}" href="#${r[0]}" data-go="${r[0]}">
      <span class="dir-no" aria-hidden="true">${r[1]||'—'}</span>
      <span class="dir-txt"><b>${r[2]}</b><span>${esc(r[3])}</span></span>
      ${r[4] ? `<span class="dir-thumb" aria-hidden="true">${r[4]}</span>` : '<span></span>'}
      <span class="dir-go" aria-hidden="true">→</span></a></li>`).join('')}</ol>
  </section></div>`;
};

/* ============ 關於 ============ */
DRAW.about = function(){ view.innerHTML = `<div class="wrap">${pageHead('about')}${$('#aboutTpl').innerHTML}${routeHtml()}</div>`; };
view.addEventListener('click', e=>{
  const el = e.target.closest('[data-scroll]'); if(!el) return;
  const h = document.getElementById(el.dataset.scroll); if(h){ h.scrollIntoView({block:'start', behavior:calm()?'auto':'smooth'}); try{ h.focus({preventScroll:true}); }catch(err){} }
});
