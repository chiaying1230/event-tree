/* ============ 版本 6：多軌道比例時間軸 ============
   寬的畫面：橫向 1962–2025，一條軌道一列（三個分支、剪報、研究、學生人數），上方是報紙用詞的比例。
   窄的畫面：改成直向；可以一次看全部軌道（只有記號），或只看一條（寫出事件名稱）。 */
const SW = {lane:'all'};
// 同一條軌道裡的事件，依時間先後
const laneEvents = k => shown().filter(e=>e.track===k);
const lanes = () => TK.filter(k=>S.tracks.has(k));
function swimWide(W){
  const L = lanes(), LW = 124, R = 18, X = t => LW+(W-LW-R)*(t-AX0)/(AX1-AX0), LH = 70, TOP = 78, H = TOP+L.length*LH+8;
  let g = '';
  // 上方：報紙用詞的比例（疊起來的色帶），到有新聞資料的最後一年
  const sy0 = 30, sh = 30, xs = []; for(let i=0;i<=120;i++){ const t = AX0+(DATA_END-AX0)*i/120; xs.push({x:X(t), sh:shares(t)}); }
  STACK.forEach((k,i)=>{ const top = xs.map(p=>f1(p.x)+','+f1(sy0+p.sh[i][0]*sh)), bot = xs.map(p=>f1(p.x)+','+f1(sy0+p.sh[i][1]*sh)).reverse();
    g += `<polygon points="${top.concat(bot).join(' ')}" fill="${TERMS[k].color}" stroke="var(--line2)" stroke-width=".6"/>`; });
  g += `<text class="lnm" x="${LW-10}" y="${sy0+sh/2+4}" text-anchor="end" font-size="12">報紙用詞比例</text>`;
  // 年代：刻度與格線
  DECADES.forEach(d=>{ const t = Math.max(d,AX0), x = X(t);
    g += `<line x1="${f1(x)}" x2="${f1(x)}" y1="18" y2="${H-6}" stroke="var(--ink)" stroke-opacity=".14"/>`;
    g += `<text class="yr" x="${f1(x+4)}" y="14" font-size="12">${t===d ? d : t}</text>`; });
  L.forEach((k,li)=>{
    const y0 = TOP+li*LH, my = y0+20, ev = laneEvents(k);
    g += `<rect x="0" y="${y0}" width="${W}" height="${LH}" fill="${li%2?'transparent':'var(--trk)'}"/>`;
    g += `<g class="lnm">${mark(TRACKS[k].shape, 14, my, 5.2, `fill="${colorOf(k)}"`)}<text x="26" y="${my+4.5}" font-size="13">${esc(TRACKS[k].name)}</text><text class="cnt" x="26" y="${my+22}" font-size="11">${ev.length} 件</text></g>`;
    g += `<line x1="${LW}" x2="${W-R}" y1="${my}" y2="${my}" stroke="${colorOf(k)}" stroke-opacity=".45" stroke-width="2"/>`;
    // 名稱：重要的先排；兩列都排不下的，名稱留在提示框與說明裡
    const rows = [[],[]], lab = {};
    ev.slice().sort((a,b)=>b.importance-a.importance || a.t-b.t).forEach(e=>{ const w = Math.min(textW(e.title,11.5), 150), x = Math.min(Math.max(X(e.t)-w/2, LW+2), W-R-w);
      for(let r=0;r<2;r++){ if(rows[r].every(([a,b])=>x+w+8<a || x>b+8)){ rows[r].push([x,x+w]); lab[e.id] = {x, r, w}; break; } } });
    ev.forEach((e,i)=>{ const x = X(e.t), on = S.e===e.id, b = lab[e.id], txt = b ? (textW(e.title,11.5)>150 ? e.title.slice(0, Math.floor(150/11.5)-1)+'…' : e.title) : '';
      g += `<g class="ev${on?' on':''}" data-id="${e.id}" role="button" tabindex="-1" aria-pressed="${on}" aria-label="${esc(evLabel(e, '第 '+(i+1)+' / 共 '+ev.length+' 件'))}" data-tip="${esc(e.title+'\n'+whenLong(e))}" style="--c:${colorOf(k)}">
        <rect class="hit" x="${f1(x-13)}" y="${my-13}" width="26" height="26" rx="6"/>
        ${e.certainty==='approx' ? `<line x1="${f1(X(e.dec))}" x2="${f1(X(e.dec+10))}" y1="${my}" y2="${my}" stroke="${colorOf(k)}" stroke-width="7" stroke-opacity=".3" stroke-linecap="round" stroke-dasharray="2 4"/>` : ''}
        ${mark(TRACKS[k].shape, x, my, on?7.4:6, 'class="mk"')}
        ${b ? `<text class="lt" x="${f1(b.x+b.w/2)}" y="${my+(b.r?44:28)}" text-anchor="middle" font-size="11.5">${esc(txt)}</text>${b.r ? `<line x1="${f1(x)}" x2="${f1(x)}" y1="${my+8}" y2="${my+33}" stroke="${colorOf(k)}" stroke-opacity=".5"/>` : ''}` : ''}</g>`; });
  });
  return `<svg class="tsvg swim" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" data-rove aria-roledescription="多軌道時間軸" aria-describedby="swHelp" aria-label="多軌道時間軸，1962 到 2025 年，${L.length} 條軌道">${g}</svg>`;
}
function swimNarrow(W){
  const one = SW.lane!=='all' && S.tracks.has(SW.lane) ? SW.lane : null, L = one ? [one] : lanes();
  const YW = 46, PY = one ? 26 : 15, TOP = 16, Y = t => TOP+(t-AX0)*PY, H = Y(AX1)+12;
  const CW = one ? 34 : Math.max(30, Math.min(56, (W-YW-8)/L.length)), CX = i => YW+CW*i+CW/2;
  let g = '', maxY = 0;
  DECADES.forEach(d=>{ const t = Math.max(d,AX0), y = Y(t);
    g += `<line x1="0" x2="${W}" y1="${f1(y)}" y2="${f1(y)}" stroke="var(--ink)" stroke-opacity=".16"/><text class="yr" x="4" y="${f1(y+15)}" font-size="12">${t===d?d:t}</text>`; });
  L.forEach((k,li)=>{ const x = CX(li), ev = laneEvents(k), used = [];
    g += `<line x1="${f1(x)}" x2="${f1(x)}" y1="${TOP}" y2="${H-8}" stroke="${colorOf(k)}" stroke-opacity=".45" stroke-width="2"/>`;
    let lastLab = -1e9;
    ev.forEach((e,i)=>{ let y = Y(e.t); while(used.some(u=>Math.abs(u-y)<13)) y += 13; used.push(y);
      const on = S.e===e.id, ly = Math.max(y+4.5, lastLab+20); if(one) lastLab = ly; maxY = Math.max(maxY, one ? ly : y);
      g += `<g class="ev${on?' on':''}" data-id="${e.id}" role="button" tabindex="-1" aria-pressed="${on}" aria-label="${esc(evLabel(e, '第 '+(i+1)+' / 共 '+ev.length+' 件'))}" style="--c:${colorOf(k)}">
        <rect class="hit" x="${f1(one ? x-14 : x-CW/2+2)}" y="${f1(y-12)}" width="${one ? W-x+8 : CW-4}" height="24" rx="6"/>${mark(TRACKS[k].shape, x, y, on?7:5.6, 'class="mk"')}
        ${one ? `${ly-y>6 ? `<path d="M${f1(x+8)} ${f1(y)} L${f1(x+22)} ${f1(ly-4.5)}" stroke="${colorOf(k)}" stroke-opacity=".6" fill="none"/>` : ''}<text class="lt" x="${f1(x+24)}" y="${f1(ly)}" font-size="13.5"><tspan class="yr2">${esc(whenShort(e))}</tspan> ${esc(e.title)}</text>` : ''}</g>`; });
  });
  const H2 = Math.max(H, maxY+16);
  return `<svg class="tsvg swim narrow" width="${W}" height="${H2}" viewBox="0 0 ${W} ${H2}" role="group" data-rove aria-roledescription="多軌道時間軸" aria-describedby="swHelp" aria-label="直向的多軌道時間軸，由上往下越來越晚，${one ? '只看「'+TRACKS[one].name+'」' : L.length+' 條軌道'}">${g}</svg>`;
}
VERS.push({id:'swim', no:'版本 6', name:'多軌道比例時間軸',
  basis:'Brehmer 等人（2017）最常見的設計「線性＋編年刻度＋依類別分面」；第一部分 3.1 多軌道、3.4 分期色帶、3.10 手機一次一條軌道。',
  fit:'20–200 件、多條主線；要看出「同一時間各條線發生了什麼」。',
  tradeoff:'時間比例正確，看得出空白與密集，但密集的地方名稱放不下（名稱一律在提示框與說明裡）。手機上改成直向。',
  keys:'Tab 進入圖（只占一個停點）；左右鍵在同一條軌道裡前後移動，上下鍵換軌道；Home／End 到頭尾；Enter 看說明，Esc 關閉。手機的直向版是上下鍵前後、左右鍵換軌道。',
  draw(root){
    const narrow = vw()<720;
    root.innerHTML = `<p class="vh" id="swHelp">${narrow ? '上下鍵在同一條軌道裡前後移動，左右鍵換軌道' : '左右鍵在同一條軌道裡前後移動，上下鍵換軌道'}，Enter 看說明。</p>
      ${narrow ? `<div class="tl-filter seg-lanes" role="group" aria-label="手機上要看哪一條軌道"><span class="lbl" aria-hidden="true">一次看一條：</span><button class="bchip" data-lane="all" aria-pressed="${SW.lane==='all'||!S.tracks.has(SW.lane)}">全部（只有記號）</button>${lanes().map(k=>`<button class="bchip" data-lane="${k}" aria-pressed="${SW.lane===k}" style="--c:${colorOf(k)}">${icon(k)}${esc(TRACKS[k].name)}</button>`).join('')}</div>` : ''}
      <div class="plate tl-fig" id="swFig"></div>
      ${narrow ? '' : `<p class="tl-terms swlg"><span class="lbl">上方色帶：報紙用詞的比例（2023 年起沒有新聞資料）</span>${STACK.map(k=>`<span class="tchip sm" style="--c:${TERMS[k].color}"><i></i>${esc(TERMS[k].name)}</span>`).join('')}</p>`}
      <p class="lm swnote">記號旁邊沒寫名稱的事件，名稱在提示框與說明裡；虛線色帶表示只知道年代的事件。</p>`;
    const fig = $('#swFig'), W = Math.floor(fig.clientWidth);
    fig.innerHTML = narrow ? swimNarrow(W) : swimWide(W);
    const all = $$('#swFig [data-id]'), cur = all.find(x=>x.dataset.id===S.e) || all[0]; if(cur) cur.setAttribute('tabindex','0');
  },
  onKey(e){
    const el = e.target.closest && e.target.closest('#swFig [data-id]'); if(!el) return;
    const narrow = !!$('#swFig .narrow'), id = el.dataset.id, ev = byId[id];
    const along = narrow ? ['ArrowUp','ArrowDown'] : ['ArrowLeft','ArrowRight'], across = narrow ? ['ArrowLeft','ArrowRight'] : ['ArrowUp','ArrowDown'];
    const drawn = $$('#swFig [data-id]').map(x=>byId[x.dataset.id]), inLane = drawn.filter(x=>x.track===ev.track);
    let to = null;
    if(along.includes(e.key)){ const i = inLane.indexOf(ev); to = inLane[i+(e.key===along[1]?1:-1)]; }
    else if(across.includes(e.key)){ const L = TK.filter(k=>drawn.some(x=>x.track===k)), li = L.indexOf(ev.track), k = L[li+(e.key===across[1]?1:-1)];
      if(k){ const cand = drawn.filter(x=>x.track===k); to = cand.reduce((a,b)=>Math.abs(b.t-ev.t)<Math.abs(a.t-ev.t)?b:a, cand[0]); } }
    else if(e.key==='Home') to = drawn[0]; else if(e.key==='End') to = drawn[drawn.length-1];
    else return;
    if(to) roveTo($('#swFig [data-id="'+to.id+'"]'));
    return true;
  }
});
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-lane]'); if(!b) return;
  SW.lane = b.dataset.lane; render(); say(SW.lane==='all' ? '顯示全部軌道' : '只看「'+TRACKS[SW.lane].name+'」，'+laneEvents(SW.lane).length+' 件');
});
